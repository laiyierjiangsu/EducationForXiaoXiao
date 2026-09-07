export const records = [
  { x: 1, y: 7 },
  { x: 2, y: 12 },
  { x: 3, y: 17 },
];
export const predict = (x: number, a: number, b: number) => a * x + b;
export const loss = (a: number, b: number) =>
  records.reduce((sum, { x, y }) => sum + (predict(x, a, b) - y) ** 2, 0);
export const network = (x: number, threshold = 2) => {
  const a = Math.max(0, x - 1),
    b = Math.max(0, x - threshold);
  return { a, b, y: a + b };
};
export const reward = (wins: number, total = 10) =>
  (wins - (total - wins)) / total;
export const normalize = (weights: number[]) => {
  const total = weights.reduce((a, b) => a + b, 0);
  if (
    !weights.length ||
    weights.some((n) => !Number.isFinite(n) || n < 0) ||
    total <= 0
  )
    throw new Error('无效的概率权重');
  return weights.map((n) => n / total);
};
