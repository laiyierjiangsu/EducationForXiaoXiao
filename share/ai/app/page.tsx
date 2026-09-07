'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { scenes, chapters } from './scenes';
import Visual from './visuals';
export default function Home() {
  const [index, setIndex] = useState(0),
    [steps, setSteps] = useState<Record<string, number>>({}),
    [playing, setPlaying] = useState(false),
    [notes, setNotes] = useState(false),
    [menu, setMenu] = useState(false),
    [reset, setReset] = useState(0),
    [message, setMessage] = useState('');
  const dialog = useRef<HTMLDialogElement>(null);
  const scene = scenes[index],
    step = steps[scene.id] ?? 0,
    last = step === scene.steps.length - 1;
  const move = useCallback((n: number) => {
    setPlaying(false);
    setIndex(Math.max(0, Math.min(scenes.length - 1, n)));
  }, []);
  const next = useCallback(() => {
    setPlaying(false);
    if (!last) setSteps((s) => ({ ...s, [scene.id]: step + 1 }));
    else if (index < scenes.length - 1) move(index + 1);
  }, [index, last, move, scene.id, step]);
  const back = useCallback(() => {
    setPlaying(false);
    if (step > 0) setSteps((s) => ({ ...s, [scene.id]: step - 1 }));
    else move(index - 1);
  }, [index, move, scene.id, step]);
  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => {
      if (last) {
        setPlaying(false);
        return;
      }
      setSteps((s) => ({ ...s, [scene.id]: step + 1 }));
    }, 3500);
    return () => clearTimeout(timer);
  }, [playing, last, scene.id, step]);
  useEffect(() => {
    if (menu) dialog.current?.showModal();
    else dialog.current?.close();
  }, [menu]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (menu) return;
      const target = e.target as HTMLElement;
      if (target.closest('input,textarea,select,button,a')) return;
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        next();
      }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        back();
      }
      if (e.key.toLowerCase() === 'n') setNotes((n) => !n);
      if (e.key.toLowerCase() === 'm') {
        setPlaying(false);
        setMenu(true);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [next, back, menu]);
  const replay = () => {
    setPlaying(false);
    setSteps((s) => ({ ...s, [scene.id]: 0 }));
    setReset((n) => n + 1);
  };
  const full = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setMessage('');
    } catch {
      setMessage('当前浏览器未允许全屏，可以使用浏览器的全屏菜单。');
    }
  };
  return (
    <main className="lecture">
      <header>
        <button
          className="brand"
          onClick={() => move(0)}
          aria-label="返回讲座首页"
        >
          <span className="brand-icon">∑</span> AI 探索课
        </button>
        <nav className="chapter-nav" aria-label="章节">
          {chapters.map((c, i) => (
            <button
              className={scene.chapter === i ? 'current' : ''}
              key={c}
              onClick={() => move(scenes.findIndex((s) => s.chapter === i))}
            >
              <span>0{i + 1}</span>
              {c}
            </button>
          ))}
        </nav>
        <div className="header-actions">
          <button
            aria-expanded={menu}
            onClick={() => {
              setPlaying(false);
              setMenu(true);
            }}
          >
            目录
          </button>
          <button aria-pressed={notes} onClick={() => setNotes((n) => !n)}>
            讲者备注
          </button>
          <button onClick={full}>全屏</button>
        </div>
      </header>
      <section
        className={`scene ${index === 0 || index === scenes.length - 1 ? 'cover' : ''}`}
        aria-label={scene.title}
      >
        <div className="scene-heading">
          <div>
            <div className="eyebrow">
              {String(scene.chapter + 1).padStart(2, '0')} /{' '}
              {chapters[scene.chapter]}
            </div>
            <h1>{scene.title}</h1>
            <p className="lead">{scene.intro}</p>
          </div>
          <div className="page-number" aria-hidden="true">
            {String(index + 1).padStart(2, '0')}
          </div>
        </div>
        <div className="visual-stage" key={`${scene.id}-${reset}`}>
          <Visual scene={scene} step={step} />
        </div>
        <div className="step-caption" aria-live="polite" aria-atomic="true">
          <span className="step-number">
            {step + 1}
            <small> / {scene.steps.length}</small>
          </span>
          <p key={`${scene.id}-${step}`}>{scene.steps[step]}</p>
        </div>
        {notes && (
          <aside className="speaker-notes">
            <h2>讲者备注</h2>
            <p>{scene.note}</p>
            {scene.source && (
              <a
                href={scene.source[1]}
                target="_blank"
                rel="noopener noreferrer"
              >
                参考资料：{scene.source[0]} ↗
              </a>
            )}
          </aside>
        )}
        {message && <output>{message}</output>}
      </section>
      <footer>
        <div className="position">
          <span>
            {String(index + 1).padStart(2, '0')} / {scenes.length}
          </span>
          <span className="keyboard-tip">← → / 空格 · 逐步讲解</span>
        </div>
        <div className="playback">
          <button onClick={replay}>↺ 重播</button>
          <button
            disabled={last}
            aria-pressed={playing}
            onClick={() => setPlaying((p) => !p)}
          >
            {playing ? 'Ⅱ 暂停' : '▷ 自动演示本屏'}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setSteps((s) => ({ ...s, [scene.id]: scene.steps.length - 1 }));
            }}
          >
            显示完整
          </button>
        </div>
        <div className="navigation">
          <button disabled={index === 0 && step === 0} onClick={back}>
            ← 上一步
          </button>
          <button
            className="primary"
            disabled={last && index === scenes.length - 1}
            onClick={next}
          >
            {last ? '下一屏 →' : '下一步 →'}
          </button>
        </div>
      </footer>
      <div className="progress-track">
        <div style={{ width: `${((index + 1) / scenes.length) * 100}%` }} />
      </div>
      <dialog
        ref={dialog}
        className="contents"
        onCancel={() => setMenu(false)}
        onClose={() => setMenu(false)}
      >
        <div className="dialog-heading">
          <h2>讲座目录</h2>
          <button onClick={() => setMenu(false)}>关闭 ✕</button>
        </div>
        <p>跳转后保留上次讲到的步骤；“重播”恢复本屏初始状态。</p>
        {chapters.map((c, chapter) => (
          <section key={c}>
            <h3>
              0{chapter + 1} / {c}
            </h3>
            <div className="contents-links">
              {scenes.map(
                (s, i) =>
                  s.chapter === chapter && (
                    <button
                      key={s.id}
                      aria-current={i === index ? 'page' : undefined}
                      onClick={() => {
                        move(i);
                        setMenu(false);
                      }}
                    >
                      <span>{String(i + 1).padStart(2, '0')}</span>
                      {s.title.replace('\n', '')}
                    </button>
                  ),
              )}
            </div>
          </section>
        ))}
      </dialog>
    </main>
  );
}
