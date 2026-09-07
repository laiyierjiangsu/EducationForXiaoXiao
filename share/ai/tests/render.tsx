import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { scenes } from '../app/scenes';
import Visual from '../app/visuals';
let count = 0;
for (const scene of scenes)
  for (let step = 0; step < scene.steps.length; step++) {
    const html = renderToStaticMarkup(<Visual scene={scene} step={step} />);
    if (!html || html.includes('NaN') || html.includes('undefined'))
      throw new Error(`分镜渲染异常：${scene.id}/${step}`);
    count++;
  }
console.log(`${scenes.length} 个场景、${count} 个步骤均可渲染。`);
