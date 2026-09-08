/* eslint-disable jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- Native dialog backdrop clicks dismiss it; Escape provides the keyboard equivalent. */
'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { chapters, scenes } from './scenes';

type Props = {
  open: boolean;
  index: number;
  step: number;
  onOpenChange: (open: boolean) => void;
  onNavigate: (index: number, step: number) => void;
  sceneRef: RefObject<HTMLElement | null>;
};

function DirectoryContents({
  index,
  step,
  onNavigate,
}: Pick<Props, 'index' | 'step' | 'onNavigate'>) {
  const [query, setQuery] = useState('');
  const [expandedChapters, setExpandedChapters] = useState(
    () => new Set([scenes[index].chapter]),
  );
  const [expandedSlide, setExpandedSlide] = useState<number | null>(index);
  const current = useRef<HTMLDivElement>(null);
  const needle = query.trim().toLocaleLowerCase();
  const matching = scenes
    .map((scene, i) => ({ scene, i }))
    .filter(({ scene, i }) => {
      if (!needle) return true;
      if (/^\d+$/.test(needle)) return i + 1 === Number(needle);
      return [
        scene.title,
        scene.intro,
        scene.takeaway,
        chapters[scene.chapter],
        ...scene.points.flat(),
        ...scene.steps,
      ]
        .join(' ')
        .toLocaleLowerCase()
        .includes(needle);
    });
  useEffect(() => {
    const frame = requestAnimationFrame(() =>
      current.current?.scrollIntoView({ block: 'nearest' }),
    );
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <>
      <div className="directory-search">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="10" cy="10" r="6" />
          <path d="m15 15 5 5" />
        </svg>
        <input
          type="search"
          maxLength={180}
          aria-label="搜索目录"
          placeholder="搜索标题、内容或页码"
          value={query}
          onChange={(e) => {
            const value = e.target.value;
            setQuery(value);
            setExpandedChapters(
              new Set(
                value.trim()
                  ? chapters.map((_, i) => i)
                  : [scenes[index].chapter],
              ),
            );
            setExpandedSlide(
              /^\d+$/.test(value.trim()) ? Number(value) - 1 : null,
            );
          }}
        />
      </div>
      <nav className="directory-scroll" aria-label="章节、页面与步骤">
        {matching.length === 0 && (
          <output className="directory-empty">
            没有匹配的页面，试试其他关键词。
          </output>
        )}
        {chapters.map((chapter, chapterIndex) => {
          const entries = matching.filter(
            ({ scene }) => scene.chapter === chapterIndex,
          );
          if (!entries.length) return null;
          const expanded = expandedChapters.has(chapterIndex);
          return (
            <section className="directory-chapter" key={chapter}>
              <button
                className="directory-chapter-toggle"
                aria-expanded={expanded}
                aria-controls={`directory-chapter-${chapterIndex}`}
                onClick={() =>
                  setExpandedChapters((previous) => {
                    const next = new Set(previous);
                    if (next.has(chapterIndex)) next.delete(chapterIndex);
                    else next.add(chapterIndex);
                    return next;
                  })
                }
              >
                <span className="directory-chapter-number">
                  0{chapterIndex + 1}
                </span>
                <strong>{chapter}</strong>
                <span className="directory-count">{entries.length} 页</span>
                <span className="directory-chevron" aria-hidden="true">
                  {expanded ? '−' : '+'}
                </span>
              </button>
              <div id={`directory-chapter-${chapterIndex}`} hidden={!expanded}>
                {entries.map(({ scene, i }) => {
                  const isCurrent = i === index;
                  const stepsOpen = expandedSlide === i;
                  const title = scene.title.replaceAll('\n', '');
                  return (
                    <div
                      key={scene.id}
                      className={`directory-slide ${isCurrent ? 'is-current' : ''}`}
                      ref={isCurrent ? current : undefined}
                    >
                      <div className="directory-slide-heading">
                        <button
                          className="directory-slide-link"
                          aria-current={isCurrent ? 'page' : undefined}
                          aria-label={`第 ${i + 1} 页：${title}`}
                          onClick={() => onNavigate(i, 0)}
                        >
                          <span className="directory-page-number">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span>{title}</span>
                        </button>
                        {scene.steps.length > 1 && (
                          <button
                            className="directory-steps-toggle"
                            aria-label={`${stepsOpen ? '收起' : '展开'}第 ${i + 1} 页的步骤`}
                            aria-expanded={stepsOpen}
                            aria-controls={`directory-steps-${scene.id}`}
                            onClick={() =>
                              setExpandedSlide(stepsOpen ? null : i)
                            }
                          >
                            {scene.steps.length}
                            <span aria-hidden="true">
                              {stepsOpen ? '⌃' : '⌄'}
                            </span>
                          </button>
                        )}
                      </div>
                      <ol
                        className="directory-steps"
                        id={`directory-steps-${scene.id}`}
                        hidden={!stepsOpen || scene.steps.length <= 1}
                      >
                        {scene.steps.map((caption, j) => (
                          <li key={j}>
                            <button
                              aria-current={
                                isCurrent && step === j ? 'step' : undefined
                              }
                              aria-label={`第 ${i + 1} 页，第 ${j + 1} 步：${caption}`}
                              onClick={() => onNavigate(i, j)}
                            >
                              <span>{j + 1}</span>
                              <span>{caption}</span>
                            </button>
                          </li>
                        ))}
                      </ol>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </nav>
      <div className="directory-help">
        ← → 翻页 · M 目录 · F 全屏 · Home / End 首尾页
        <br />
        只有手动演示页提供状态选择；R 重置演示。
      </div>
    </>
  );
}

export default function SlideNavigator({
  open,
  index,
  step,
  onOpenChange,
  onNavigate,
  sceneRef,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const jumping = useRef(false);
  useEffect(() => {
    if (open) dialog.current?.showModal();
    else if (dialog.current?.open) {
      dialog.current.close();
      if (jumping.current) sceneRef.current?.focus({ preventScroll: true });
      else trigger.current?.focus({ preventScroll: true });
      jumping.current = false;
    }
  }, [open, sceneRef]);
  const navigate = (destination: number, destinationStep: number) => {
    jumping.current = true;
    onNavigate(destination, destinationStep);
    onOpenChange(false);
  };
  return (
    <>
      <button
        ref={trigger}
        className="directory-handle"
        aria-label="打开目录导航"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="slide-directory"
        onClick={() => onOpenChange(true)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M9 6h12M9 12h12M9 18h12M3 6h1M3 12h1M3 18h1" />
        </svg>
        <span>目录</span>
      </button>
      <dialog
        ref={dialog}
        id="slide-directory"
        className="slide-directory"
        aria-labelledby="directory-title"
        onCancel={(e) => {
          e.preventDefault();
          onOpenChange(false);
        }}
        onClick={(e) => {
          if (e.target !== e.currentTarget) return;
          const box = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < box.left ||
            e.clientX > box.right ||
            e.clientY < box.top ||
            e.clientY > box.bottom
          )
            onOpenChange(false);
        }}
      >
        <div className="directory-header">
          <div>
            <h2 id="directory-title">讲座目录</h2>
            <p>
              {scenes.length} 页 · 当前第 {index + 1} 页
              {scenes[index].steps.length > 1 ? ` / 演示 ${step + 1}` : ''}
            </p>
          </div>
          <button
            className="directory-close"
            aria-label="收起目录"
            onClick={() => onOpenChange(false)}
          >
            ×
          </button>
        </div>
        {open && (
          <DirectoryContents index={index} step={step} onNavigate={navigate} />
        )}
      </dialog>
    </>
  );
}
