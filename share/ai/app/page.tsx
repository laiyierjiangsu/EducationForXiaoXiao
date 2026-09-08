'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { scenes, chapters } from './scenes';
import Visual from './visuals';
import SlideNavigator from './slide-navigator';

export default function Home() {
  const [index, setIndex] = useState(0);
  const [steps, setSteps] = useState<Record<string, number>>({});
  const [menu, setMenu] = useState(false);
  const [message, setMessage] = useState('');
  const sceneRef = useRef<HTMLElement>(null);
  const scene = scenes[index];
  const step = steps[scene.id] ?? 0;
  const move = useCallback((destination: number) => {
    if (
      !Number.isInteger(destination) ||
      destination < 0 ||
      destination >= scenes.length
    )
      return;
    setIndex(destination);
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  function setStep(value: number) {
    if (Number.isInteger(value) && value >= 0 && value < scene.steps.length)
      setSteps((previous) => ({ ...previous, [scene.id]: value }));
  }
  async function fullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setMessage('');
    } catch {
      setMessage('当前浏览器未允许全屏，可以使用浏览器的全屏功能。');
    }
  }
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (menu || e.ctrlKey || e.metaKey || e.altKey || e.shiftKey) return;
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('input,textarea,select,[contenteditable="true"]')
      )
        return;
      if (
        e.target instanceof HTMLElement &&
        e.target.closest('a,button') &&
        [' ', 'Enter'].includes(e.key)
      )
        return;
      if (
        [
          'ArrowRight',
          'ArrowLeft',
          'PageDown',
          'PageUp',
          ' ',
          'Home',
          'End',
        ].includes(e.key)
      )
        e.preventDefault();
      if (e.key === 'ArrowRight') move(index + 1);
      if (e.key === 'ArrowLeft') move(index - 1);
      if (e.key === 'PageDown' || e.key === ' ') {
        if (
          window.scrollY + window.innerHeight <
          document.documentElement.scrollHeight - 4
        )
          window.scrollBy({
            top: window.innerHeight * 0.8,
            behavior: 'instant',
          });
        else move(index + 1);
      }
      if (e.key === 'PageUp') {
        if (window.scrollY > 4)
          window.scrollBy({
            top: -window.innerHeight * 0.8,
            behavior: 'instant',
          });
        else move(index - 1);
      }
      if (e.key === 'Home') move(0);
      if (e.key === 'End') move(scenes.length - 1);
      if (e.key.toLowerCase() === 'r') setStep(0);
      if (e.key.toLowerCase() === 'm') setMenu(true);
      if (e.key.toLowerCase() === 'f') void fullscreen();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });
  return (
    <main className="lecture">
      <div className="reading-progress" aria-hidden="true">
        <div style={{ width: `${((index + 1) / scenes.length) * 100}%` }} />
      </div>
      <section
        ref={sceneRef}
        tabIndex={-1}
        className={`scene scene-${scene.kind}`}
        aria-labelledby="scene-title"
      >
        <header className="scene-heading">
          <div className="section-label">
            <span>{String(scene.chapter + 1).padStart(2, '0')}</span>
            {chapters[scene.chapter]}
            <span className="lecture-series">数学，看得见的 AI</span>
          </div>
          <h1 id="scene-title">{scene.title}</h1>
          <p className="scene-intro">{scene.intro}</p>
        </header>
        <div className="lesson-body">
          <div className="evidence-panel">
            <Visual scene={scene} step={step} />
            {scene.steps.length > 1 && (
              <div className="experiment-control" aria-label="手动演示控制">
                <div className="experiment-buttons">
                  {scene.steps.map((_, i) => (
                    <button
                      key={i}
                      aria-pressed={step === i}
                      aria-label={`查看第 ${i + 1} 个演示状态：${scene.steps[i]}`}
                      onClick={() => setStep(i)}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="experiment-reset"
                    onClick={() => setStep(0)}
                  >
                    重置
                  </button>
                </div>
                <p aria-live="polite">{scene.steps[step]}</p>
              </div>
            )}
          </div>
          <div className="reasoning-panel">
            <span className="reasoning-label">这一页，理解三件事</span>
            <ol className="key-points">
              {scene.points.map(([title, body], i) => (
                <li key={title}>
                  <span className="point-index">{i + 1}</span>
                  <div>
                    <h2>{title}</h2>
                    <p>{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
        <div className="takeaway">
          <span>记住这一点</span>
          <p>{scene.takeaway}</p>
        </div>
        <footer className="slide-footer">
          <div className="footer-reference">
            {scene.source && !scene.kind.startsWith('demo-') ? (
              <a
                href={scene.source[1]}
                target="_blank"
                rel="noopener noreferrer"
              >
                资料：{scene.source[0]} ↗
              </a>
            ) : (
              <span>从一条直线到 Transformer</span>
            )}
          </div>
          <div className="slide-controls">
            <button
              aria-label="上一页"
              onClick={() => move(index - 1)}
              disabled={index === 0}
            >
              ← <span>上一页</span>
            </button>
            <span className="page-counter" aria-live="polite">
              {String(index + 1).padStart(2, '0')}{' '}
              <span>/ {scenes.length}</span>
            </span>
            <button
              aria-label="下一页"
              onClick={() => move(index + 1)}
              disabled={index === scenes.length - 1}
            >
              <span>下一页</span> →
            </button>
            <button
              onClick={() => void fullscreen()}
              aria-label="全屏演讲"
              title="全屏（F）"
            >
              ⛶
            </button>
          </div>
        </footer>
        {message && <output className="status-message">{message}</output>}
      </section>
      <SlideNavigator
        open={menu}
        index={index}
        step={step}
        sceneRef={sceneRef}
        onOpenChange={setMenu}
        onNavigate={(destination, destinationStep) => {
          const target = scenes[destination];
          if (
            !target ||
            !Number.isInteger(destinationStep) ||
            destinationStep < 0 ||
            destinationStep >= target.steps.length
          )
            return;
          setSteps((previous) => ({
            ...previous,
            [target.id]: destinationStep,
          }));
          move(destination);
        }}
      />
    </main>
  );
}
