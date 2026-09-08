import React from 'react';
import assert from 'node:assert/strict';
import { renderToStaticMarkup } from 'react-dom/server';
import { scenes } from '../app/scenes';
import Visual from '../app/visuals';
import Home from '../app/page';
import SlideNavigator from '../app/slide-navigator';
let count = 0;
for (const scene of scenes) {
  for (let step = 0; step < scene.steps.length; step++) {
    const html = renderToStaticMarkup(<Visual scene={scene} step={step} />);
    assert.ok(html.length > 150, `页面缺少实质内容：${scene.id}/${step}`);
    assert.ok(
      !html.includes('NaN') && !html.includes('undefined'),
      `画面数值异常：${scene.id}/${step}`,
    );
    assert.ok(!html.includes('<script'), `画面不应注入脚本：${scene.id}`);
    count++;
  }
}
const home = renderToStaticMarkup(<Home />);
assert.ok(home.includes(scenes[0].title));
assert.ok(
  home.includes('线性回归') &&
    home.includes('神经网络') &&
    home.includes('大模型'),
);
assert.ok(home.includes(scenes[0].points[0][1]));
// Each initially expanded chapter must include the current page's title link,
// even when a static page has no multi-state demonstration.
for (let i = 0; i < scenes.length; i++) {
  const menu = renderToStaticMarkup(
    <SlideNavigator
      open
      index={i}
      step={0}
      onOpenChange={() => {}}
      onNavigate={() => {}}
      sceneRef={{ current: null }}
    />,
  );
  assert.ok(
    menu.includes(`aria-label="第 ${i + 1} 页：${scenes[i].title}"`),
    `目录缺少页面入口：${i + 1}`,
  );
}
console.log(
  `${scenes.length} 页、${count} 个画面状态、首页与所有目录入口均可渲染。`,
);
