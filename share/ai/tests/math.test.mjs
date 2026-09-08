import test from 'node:test';
import assert from 'node:assert/strict';
import {
  records,
  predict,
  loss,
  gradient,
  trainingStates,
  parameterStates,
  network,
  normalize,
  softmax,
  attentionValue,
} from '../app/math.ts';
import { scenes, chapters } from '../app/scenes.ts';
const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
test('销量算例：误差不抵消，最佳拟合仍有噪声', () => {
  assert.deepEqual(
    records.map((r) => predict(r.x, 1, 20)),
    [17, 19, 21, 23],
  );
  assert.equal(loss(1, 20), 6);
  assert.equal(loss(2, 20), 1);
  assert.equal(loss(3, 20), 6);
  assert.deepEqual(
    records.map((r) => predict(r.x, 2, 20)),
    [14, 18, 22, 26],
  );
  for (let w = -2; w <= 6; w += 0.25)
    for (let b = 17; b <= 23; b++)
      close(loss(w, b), 5 * (w - 2) ** 2 + (b - 20) ** 2 + 1);
});
test('梯度与有限差分一致，演示更新是真实梯度下降', () => {
  const epsilon = 1e-5;
  for (const [w, b] of [
    [1, 20],
    [2, 20],
    [-1, 18],
    [4, 23],
  ]) {
    const g = gradient(w, b);
    close(
      g.w,
      (loss(w + epsilon, b) - loss(w - epsilon, b)) / (2 * epsilon),
      1e-7,
    );
    close(
      g.b,
      (loss(w, b + epsilon) - loss(w, b - epsilon)) / (2 * epsilon),
      1e-7,
    );
  }
  for (let i = 1; i < trainingStates.length; i++) {
    close(
      trainingStates[i].w,
      trainingStates[i - 1].w - 0.05 * trainingStates[i - 1].gradient,
    );
    assert.ok(trainingStates[i].loss < trainingStates[i - 1].loss);
  }
  assert.deepEqual(
    trainingStates.map((s) => s.loss),
    [6, 2.25, 1.3125, 1.078125],
  );
});
test('微型网络具有折线形状，参数与输入的变化可以分别计算', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((x) => network(x).y),
    [0, 0, 1, 3, 5],
  );
  assert.deepEqual(network(3, 3), { a: 2, b: 0, y: 2 });
  assert.equal(network(-3).y, 0);
});
test('Softmax稳定且平移不变；注意力组合与概率不同', () => {
  const p = softmax([1, 0]);
  close(p[0] + p[1], 1);
  close(p[0], Math.E / (Math.E + 1));
  softmax([1001, 1000]).forEach((v, i) => close(v, p[i]));
  close(attentionValue, p[0] * 2 + p[1] * 6);
  assert.ok(attentionValue > 2 && attentionValue < 6);
  for (const bad of [[], [NaN, 0], [Infinity, 0]])
    assert.throws(() => softmax(bad));
  for (const bad of [
    [],
    [0, 0],
    [-1, 2],
    [NaN, 1],
    [Infinity, 1],
    [Number.MAX_VALUE, Number.MAX_VALUE],
  ])
    assert.throws(() => normalize(bad));
});
test('42页章节闭合、三个例子回扣、仅必要页面有演示状态', () => {
  assert.equal(scenes.length, 42);
  assert.equal(new Set(scenes.map((s) => s.id)).size, 42);
  assert.equal(scenes[0].kind, 'roadmap');
  assert.equal(scenes.at(-1).kind, 'finale');
  assert.deepEqual(
    scenes.filter((s) => s.steps.length > 1).map((s) => s.id),
    ['parameters', 'gradient', 'generation'],
  );
  assert.equal(
    scenes.find((s) => s.id === 'parameters').steps.length,
    parameterStates.length,
  );
  assert.equal(
    scenes.find((s) => s.id === 'gradient').steps.length,
    trainingStates.length,
  );
  for (const s of scenes) {
    assert.ok(chapters[s.chapter]);
    assert.equal(s.points.length, 3);
    assert.ok(s.intro && s.takeaway && s.note);
    assert.ok(s.points.every(([heading, body]) => heading && body));
    if (s.source) assert.equal(new URL(s.source[1]).protocol, 'https:');
  }
});
