// Pure, deterministic teaching calculations. No remote data, personal data or
// executable user input. Controls select bounded, predefined lesson states.
export const records = [
  { temperature: 22, x: -3, y: 15 },
  { temperature: 24, x: -1, y: 17 },
  { temperature: 26, x: 1, y: 21 },
  { temperature: 28, x: 3, y: 27 },
];
export const predict = (x: number, w: number, b: number) => w * x + b;
export const loss = (w: number, b = 20) =>
  records.reduce((sum, { x, y }) => sum + (predict(x, w, b) - y) ** 2, 0) /
  records.length;
export const gradient = (w: number, b = 20) => ({
  w:
    records.reduce((sum, { x, y }) => sum + 2 * x * (predict(x, w, b) - y), 0) /
    records.length,
  b:
    records.reduce((sum, { x, y }) => sum + 2 * (predict(x, w, b) - y), 0) /
    records.length,
});
export const parameterStates = [
  { w: 1, b: 20 },
  { w: 2, b: 20 },
  { w: 2, b: 22 },
];
export const trainingStates = [1, 1.5, 1.75, 1.875].map((w, iteration) => ({
  w,
  iteration,
  loss: loss(w),
  gradient: gradient(w).w,
}));
export const network = (x: number, threshold = 2) => {
  const a = Math.max(0, x - 1),
    b = Math.max(0, x - threshold);
  return { a, b, y: a + b };
};
export const normalize = (weights: number[]) => {
  const total = weights.reduce((sum, n) => sum + n, 0);
  if (
    !weights.length ||
    weights.some((n) => !Number.isFinite(n) || n < 0) ||
    !Number.isFinite(total) ||
    total <= 0
  )
    throw new Error('无效的概率权重');
  return weights.map((n) => n / total);
};
export const softmax = (scores: number[]) => {
  if (!scores.length || scores.some((n) => !Number.isFinite(n)))
    throw new Error('无效的分数');
  const maximum = Math.max(...scores);
  return normalize(scores.map((n) => Math.exp(n - maximum)));
};
export const attentionWeights = softmax([1, 0]);
export const attentionValue = attentionWeights[0] * 2 + attentionWeights[1] * 6;
export const formatNumber = (n: number, digits = 4) =>
  Number(n.toFixed(digits)).toString();
