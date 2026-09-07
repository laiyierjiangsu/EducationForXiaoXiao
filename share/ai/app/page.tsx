'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { scenes, chapters } from './scenes';
import Visual from './visuals';
import SlideNavigator from './slide-navigator';
export default function Home() {
  const [index, setIndex] = useState(0),
    [steps, setSteps] = useState<Record<string, number>>({}),
    [menu, setMenu] = useState(false),
    [reset, setReset] = useState(0),
    [message, setMessage] = useState('');
  const sceneRef = useRef<HTMLElement>(null);
  const scene = scenes[index],
    step = steps[scene.id] ?? 0,
    last = step === scene.steps.length - 1;
  const move = useCallback((n: number) => {
    setIndex(Math.max(0, Math.min(scenes.length - 1, n)));
  }, []);
  const next = useCallback(() => {
    if (!last) setSteps((s) => ({ ...s, [scene.id]: step + 1 }));
    else if (index < scenes.length - 1) move(index + 1);
  }, [index, last, move, scene.id, step]);
  const back = useCallback(() => {
    if (step > 0) setSteps((s) => ({ ...s, [scene.id]: step - 1 }));
    else move(index - 1);
  }, [index, move, scene.id, step]);
  function replay() {
    setSteps((s) => ({ ...s, [scene.id]: 0 }));
    setReset((n) => n + 1);
  }
  async function full() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setMessage('');
    } catch {
      setMessage('当前浏览器未允许全屏，可以使用浏览器的全屏菜单。');
    }
  }
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (menu || e.ctrlKey || e.metaKey || e.altKey) return;
      const target = e.target as HTMLElement;
      if (target.closest('input,textarea,select,a')) return;
      if (target.closest('button') && [' ', 'Enter'].includes(e.key)) return;
      if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) {
        e.preventDefault();
        next();
      }
      if (['ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault();
        back();
      }
      if (e.key.toLowerCase() === 'r') replay();
      if (e.key.toLowerCase() === 'f') void full();
      if (e.key === 'End') {
        e.preventDefault();
        setSteps((s) => ({ ...s, [scene.id]: scene.steps.length - 1 }));
      }
      if (e.key.toLowerCase() === 'm') {
        setMenu(true);
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });
  return (
    <main className="lecture projection">
      <section
        ref={sceneRef}
        tabIndex={-1}
        className={`scene ${index === 0 || index === scenes.length - 1 ? 'cover' : ''} ${scene.kind === 'chapter' ? 'chapter-slide' : ''}`}
        aria-label={scene.title}
      >
        <div className="scene-heading">
          <div>
            <div className="section-label">
              {String(scene.chapter + 1).padStart(2, '0')} ·{' '}
              {chapters[scene.chapter]}
            </div>
            <h1>{scene.title}</h1>
          </div>
        </div>
        <div className="visual-stage" key={`${scene.id}-${reset}`}>
          <Visual scene={scene} step={step} />
        </div>
        {scene.kind !== 'chapter' && (
          <div className="lesson-caption" aria-live="polite" aria-atomic="true">
            <span className="caption-marker" aria-hidden="true" />
            <p>{scene.steps[step]}</p>
          </div>
        )}
        {message && <output>{message}</output>}
      </section>
      <SlideNavigator
        open={menu}
        index={index}
        step={step}
        sceneRef={sceneRef}
        onOpenChange={setMenu}
        onNavigate={(destination, destinationStep) => {
          setSteps((previous) => ({
            ...previous,
            [scenes[destination].id]: destinationStep,
          }));
          move(destination);
          setReset((value) => value + 1);
        }}
      />
    </main>
  );
}
