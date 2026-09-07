import test from 'node:test';
import assert from 'node:assert/strict';
import { predict, loss, network, reward, normalize } from '../app/math.ts';
import { scenes } from '../app/scenes.ts';
test('人数模型：训练状态和未见过的第四队', () => {
  assert.equal(loss(4, 2), 14);
  assert.equal(loss(5, 1), 3);
  assert.equal(loss(5, 2), 0);
  assert.equal(predict(4, 5, 2), 22);
  assert.equal(predict(4, 5, 4), 24);
});
test('误差曲线在最优参数两侧对称', () => {
  assert.deepEqual(
    [3, 4, 5, 6, 7].map((a) => loss(a, 2)),
    [56, 14, 0, 14, 56],
  );
  for (let a = 0; a <= 10; a++) assert.equal(loss(a, 2), 14 * (a - 5) ** 2);
});
test('微型网络：非线性、参数变化和输入边界', () => {
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((x) => network(x).y),
    [0, 0, 1, 3, 5],
  );
  assert.deepEqual(network(3, 3), { a: 2, b: 0, y: 2 });
  assert.equal(network(-3).y, 0);
});
test('回报与概率不混为同一指标', () => {
  assert.equal(reward(4), -0.2);
  assert.equal(reward(7), 0.4);
  assert.deepEqual(normalize([6, 3, 1]), [0.6, 0.3, 0.1]);
  assert.deepEqual(normalize([2, 5, 3]), [0.2, 0.5, 0.3]);
  for (const w of [[], [0, 0], [-1, 2], [NaN, 1], [Infinity, 1]])
    assert.throws(() => normalize(w));
});
test('场景目录唯一、每屏均有步骤、来源使用HTTPS', () => {
  assert.equal(scenes.length, 30);
  assert.equal(new Set(scenes.map((s) => s.id)).size, scenes.length);
  for (const s of scenes) {
    assert.ok(s.steps.length >= 2);
    assert.ok(s.note);
    if (s.source) assert.equal(new URL(s.source[1]).protocol, 'https:');
  }
});
