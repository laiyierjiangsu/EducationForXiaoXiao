/* eslint-disable jsx-a11y/prefer-tag-over-role -- Inline SVG diagrams need an image role and accessible label; img cannot contain SVG nodes. */
'use client';
import { useState } from 'react';
import type { Scene } from './scenes';
import { records, predict, loss, network, reward, normalize } from './math';
const fmt = (n: number) => Number(n.toFixed(2)).toString();
function Tag({ children }: { children: React.ReactNode }) {
  return <div className="tag">{children}</div>;
}
function Formula({ children }: { children: React.ReactNode }) {
  return <div className="formula">{children}</div>;
}
function Flow({ items, step }: { items: string[]; step: number }) {
  return (
    <div className="flow">
      {items.map((item, i) => (
        <div key={item} className={`flow-node ${i <= step ? 'lit' : ''}`}>
          <span className="node-index">{String(i + 1).padStart(2, '0')}</span>
          {item}
          {i < items.length - 1 && <span className="arrow">→</span>}
        </div>
      ))}
    </div>
  );
}
function Range({
  label,
  value,
  min = 0,
  max = 8,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (n: number) => void;
}) {
  return (
    <label className="range-label">
      <span>
        {label}
        <strong>{value}</strong>
      </span>
      <input
        aria-label={label}
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => {
          const n = e.currentTarget.valueAsNumber;
          if (Number.isFinite(n) && n >= min && n <= max && Number.isInteger(n))
            onChange(n);
        }}
      />
    </label>
  );
}
export function Chart({
  points,
  xMax = 4,
  yMax = 24,
  xLabel = '队数',
  yLabel = '人数',
  line = true,
  reference = false,
  activeX,
}: {
  points: { x: number; y: number }[];
  xMax?: number;
  yMax?: number;
  xLabel?: string;
  yLabel?: string;
  line?: boolean;
  reference?: boolean;
  activeX?: number;
}) {
  const px = (x: number) => 70 + (x / xMax) * 480,
    py = (y: number) => 265 - (y / yMax) * 210;
  return (
    <svg
      className="chart"
      viewBox="0 0 640 330"
      role="img"
      aria-label={`${xLabel}与${yLabel}图，${points.map((p) => `${p.x}对应${fmt(p.y)}`).join('，')}`}
    >
      <text x="18" y="25">
        {yLabel}
      </text>
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <line
            className="gridline"
            x1="70"
            y1={55 + i * 52.5}
            x2="550"
            y2={55 + i * 52.5}
          />
          <text x="55" y={61 + i * 52.5} textAnchor="end">
            {fmt(yMax - (i * yMax) / 4)}
          </text>
        </g>
      ))}
      <path d="M70 40V265H575" className="axis" />
      {Array.from({ length: xMax + 1 }, (_, i) => (
        <text key={i} x={px(i)} y="290" textAnchor="middle">
          {i}
        </text>
      ))}
      <text x="570" y="320" textAnchor="end">
        {xLabel}
      </text>
      {reference &&
        records.map((p) => (
          <g key={p.x}>
            <line
              x1={px(p.x)}
              y1={py(p.y)}
              x2={px(p.x)}
              y2={py(points.find((q) => q.x === p.x)?.y ?? p.y)}
              className="error-line"
            />
            <circle cx={px(p.x)} cy={py(p.y)} r="8" className="actual" />
          </g>
        ))}
      {line && (
        <polyline
          points={points.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')}
          className="plot-line"
        />
      )}
      {points.map((p) => (
        <g key={p.x}>
          <circle
            cx={px(p.x)}
            cy={py(p.y)}
            r={p.x === activeX ? 11 : 6}
            className={p.x === activeX ? 'active-point' : 'predicted'}
          />
          <text x={px(p.x) + 12} y={py(p.y) - 12} className="point-label">
            {fmt(p.y)}
          </text>
        </g>
      ))}
    </svg>
  );
}
function Model({ kind, step }: { kind: string; step: number }) {
  const defaults =
    kind === 'training'
      ? [
          [4, 2],
          [5, 1],
          [5, 2],
        ][Math.min(step, 2)]
      : kind === 'parameters'
        ? [
            [4, 2],
            [5, 2],
            [5, 3],
          ][Math.min(step, 2)]
        : [4, 2];
  const [override, setOverride] = useState<[number, number] | null>(null);
  const [mode, setMode] = useState<'bars' | 'line'>('bars');
  const [a, b] = override ?? defaults;
  const interactive = kind === 'parameters';
  const points = records.map((p) => ({ x: p.x, y: predict(p.x, a, b) }));
  return (
    <>
      <Tag>自编数据 · 参赛人数小模型</Tag>
      <div className="math-layout">
        <div>
          <Formula>
            <span className="cyan">{a}</span> × 队数 +{' '}
            <span className="accent">{b}</span>
          </Formula>
          {interactive && (
            <>
              <Range
                label="参数 a：每增加一队，预测增加的人数"
                value={a}
                max={7}
                onChange={(n) => setOverride([n, b])}
              />
              <Range
                label="参数 b：固定增加的人数"
                value={b}
                max={5}
                onChange={(n) => setOverride([a, n])}
              />
              <button onClick={() => setOverride(null)}>恢复本步参数</button>
            </>
          )}
          <table>
            <thead>
              <tr>
                <th>队数</th>
                <th>预测计算</th>
                <th>实际</th>
              </tr>
            </thead>
            <tbody>
              {records.map(({ x, y }) => (
                <tr key={x}>
                  <td>{x} 队</td>
                  <td>
                    {a} × {x} + {b} = <strong>{predict(x, a, b)}</strong>
                  </td>
                  <td>{y}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {kind === 'training' && (
            <div className="score">
              误差分数 <b>{loss(a, b)}</b>
            </div>
          )}
          {kind === 'model' && (
            <p className="small">先选计算规则，再检查预测是否符合记录。</p>
          )}
        </div>
        <div>
          <div className="segments">
            <button
              aria-pressed={mode === 'bars'}
              onClick={() => setMode('bars')}
            >
              人数柱状图
            </button>
            <button
              aria-pressed={mode === 'line'}
              onClick={() => setMode('line')}
            >
              坐标图
            </button>
          </div>
          {mode === 'line' ? (
            <Chart points={points} yMax={28} reference />
          ) : (
            <div className="bars">
              {records.map(({ x, y }) => (
                <div className="bar-group" key={x}>
                  <div className="bar-pair">
                    <div
                      className="bar prediction"
                      style={{ height: `${(predict(x, a, b) / 28) * 200}px` }}
                    >
                      <b>{predict(x, a, b)}</b>
                    </div>
                    <div
                      className="bar real"
                      style={{ height: `${(y / 28) * 200}px` }}
                    >
                      <b>{y}</b>
                    </div>
                  </div>
                  <span>{x} 队</span>
                </div>
              ))}
            </div>
          )}
          <div className="legend">
            <span className="cyan">● 预测人数</span>
            <span className="accent">○ 实际人数</span>
          </div>
        </div>
      </div>
    </>
  );
}
export default function Visual({
  scene,
  step,
}: {
  scene: Scene;
  step: number;
}) {
  const [value, setValue] = useState<number | null>(null);
  const [choice, setChoice] = useState(false);
  const k = scene.kind;
  if (k === 'opening')
    return (
      <div className="opening">
        {[
          ['01', '棋盘上的选择', 'AlphaGo · 学习与搜索'],
          ['02', '团队中的配合', '王者荣耀 · 行动与反馈'],
          ['03', '身边的任务', '学校官网 · 模型与工具'],
        ].map(([n, t, d]) => (
          <div key={n}>
            <b>{n}</b>
            <h2>{t}</h2>
            <p>{d}</p>
          </div>
        ))}
      </div>
    );
  if (k === 'go')
    return (
      <>
        <Tag>棋盘与搜索分支 · 教学示意</Tag>
        <div className="two-col">
          <svg
            viewBox="0 0 380 320"
            className="board"
            role="img"
            aria-label="围棋候选落点示意图"
          >
            <rect
              x="40"
              y="15"
              width="290"
              height="290"
              rx="8"
              fill="#b69665"
            />
            {Array.from({ length: 9 }, (_, i) => (
              <g key={i}>
                <path
                  d={`M${60 + i * 31} 35V283M60 ${35 + i * 31}H308`}
                  stroke="#695438"
                />
              </g>
            ))}
            {[
              [3, 3],
              [3, 4],
              [4, 3],
              [4, 4],
              [5, 4],
              [2, 3],
            ].map(([x, y], i) => (
              <circle
                key={i}
                cx={60 + x * 31}
                cy={35 + y * 31}
                r="13"
                fill={i % 2 ? '#f1f6f7' : '#17202b'}
              />
            ))}
            {[
              [2, 4],
              [5, 3],
              [4, 5],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle
                  cx={60 + x * 31}
                  cy={35 + y * 31}
                  r="13"
                  fill={step >= 2 && i === 0 ? '#ccf870' : '#294455'}
                />
                <text
                  x={60 + x * 31}
                  y={41 + y * 31}
                  textAnchor="middle"
                  fill={step >= 2 && i === 0 ? '#101b29' : 'white'}
                >
                  {['A', 'B', 'C'][i]}
                </text>
              </g>
            ))}
          </svg>
          <div>
            <div className="tree-root">当前局面</div>
            <div className="branches">
              {['A', 'B', 'C'].map((s, i) => (
                <div className={step >= 2 && i === 0 ? 'selected' : ''} key={s}>
                  <strong>落点 {s}</strong>
                  {step >= 1 && (
                    <div className="twigs">
                      <span>回应 1</span>
                      <span>回应 2</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="small">
              {step >= 2
                ? '学到的判断 + 搜索，帮助决定下一步。'
                : '一次选择，会影响后面的局面。'}
            </p>
          </div>
        </div>
      </>
    );
  if (k === 'moba')
    return (
      <>
        <Tag>教学局面图 · 非游戏截图</Tag>
        <div className="two-col">
          <svg
            viewBox="0 0 440 320"
            className="map"
            role="img"
            aria-label="自己、队友与对手位置，以及追击和支援两个方向"
          >
            <rect
              x="20"
              y="20"
              width="390"
              height="280"
              rx="24"
              fill="#1c3944"
            />
            <path
              d="M60 265L60 65L370 65M60 265L370 265L370 65M60 265L370 65"
              stroke="#46636c"
              fill="none"
              strokeWidth="18"
            />
            <path d="M140 30L300 285" stroke="#2c697c" strokeWidth="24" />
            <circle cx="210" cy="170" r="23" fill="#ccf870" />
            <text x="210" y="175" textAnchor="middle" fill="#101b29">
              自己
            </text>
            <circle cx="110" cy="240" r="25" fill="#70dbea" />
            <text x="110" y="246" textAnchor="middle" fill="#101b29">
              队友
            </text>
            <circle cx="305" cy="90" r="24" fill="#fa9d83" />
            <text x="305" y="96" textAnchor="middle" fill="#101b29">
              对手
            </text>
            {step >= 1 && (
              <>
                <path
                  d="M230 150L280 111M193 190L135 222"
                  className="choice-line"
                />
                <text x="250" y="160">
                  追击？
                </text>
                <text x="105" y="184">
                  支援？
                </text>
              </>
            )}
            <text x="230" y="285" className="svg-small">
              视野之外的信息不完整
            </text>
          </svg>
          <Flow items={['观察局面', '选择行动', '结果反馈']} step={step} />
        </div>
      </>
    );
  if (k === 'website')
    return (
      <div className="demo-panel">
        <Tag>现场操作 · 请切换到 Codex</Tag>
        <blockquote>
          请打开这所学校的官方网站，找出两条近期校园活动，告诉我们活动名称、时间和主要内容，并打开对应原文。如果没有找到，就明确告诉我。
        </blockquote>
        <Flow
          items={['语音下达要求', '查看实际操作', '对照原文核实']}
          step={step}
        />
        <p className="small">
          现场前补充学校名称、官网与“近期”范围。本页不模拟完成结果。
        </p>
      </div>
    );
  if (k === 'flow' || k === 'tools')
    return (
      <>
        <Tag>
          {k === 'tools' ? '工具反馈循环 · 教学示意' : '系统路线 · 教学示意'}
        </Tag>
        <Flow
          items={
            k === 'tools'
              ? ['模型生成指令', '浏览器执行', '返回页面信息', '继续计算并核实']
              : ['声音 → 文字 → 数字', '模型计算', '生成回答 / 工具指令']
          }
          step={step}
        />
        {k === 'tools' ? (
          <div className="tool-exchange">
            <div className="machine">模型</div>
            <div className="packet" key={step}>
              {
                [
                  '打开官网 →',
                  '← 页面信息',
                  '打开活动通知 →',
                  '回答 + 原文核对',
                ][step]
              }
            </div>
            <div className="machine">浏览器工具</div>
          </div>
        ) : (
          <p className="big-thought">接下来，放大中间的“计算”。</p>
        )}
      </>
    );
  if (k === 'tokens')
    return (
      <>
        <Tag>教学片段和编号 · 非实际分词结果</Tag>
        <div className="token-row">
          {['请', '打开', '学校', '官网'].map((t, i) => (
            <div className="token" key={t}>
              <strong>{t}</strong>
              {step >= 1 && <span>片段 {i + 1}</span>}
              {step >= 2 && (
                <b>
                  {[18, 206, 57, 902][i]}
                  <small> → 一串数</small>
                </b>
              )}
            </div>
          ))}
        </div>
        <p className="big-thought">文字片段 → 编号 → 可计算的数字表示</p>
      </>
    );
  if (k === 'embedding')
    return (
      <>
        <Tag>坐标人为指定 · 只用于理解数字表示</Tag>
        <div className="two-col">
          <svg
            viewBox="0 0 600 330"
            className="chart"
            role="img"
            aria-label="运动会坐标1,1，接力赛2,1，图书馆5,4"
          >
            <path d="M60 30V280H560" className="axis" />
            {[1, 2, 3, 4, 5].map((n) => (
              <g key={n}>
                <line
                  x1={60 + n * 85}
                  x2={60 + n * 85}
                  y1="40"
                  y2="280"
                  className="gridline"
                />
                <text x={60 + n * 85} y="307">
                  {n}
                </text>
                <text x="30" y={280 - n * 48}>
                  {n}
                </text>
              </g>
            ))}
            {step >= 1 && (
              <>
                <path d="M145 232H230L485 88" className="plot-line" />
                {[
                  [145, 232, '运动会 (1,1)'],
                  [230, 232, '接力赛 (2,1)'],
                  [485, 88, '图书馆 (5,4)'],
                ].map(([x, y, t], i) => (
                  <g key={t}>
                    <circle cx={x} cy={y} r="8" className="predicted" />
                    <text
                      x={Number(x) - 50}
                      y={Number(y) + (i === 0 ? 27 : -20)}
                    >
                      {t}
                    </text>
                  </g>
                ))}
              </>
            )}
          </svg>
          <div>
            <Formula>
              12 ≈ 13
              <br />
              <span className="small">编号接近，不能推出兴趣相近</span>
            </Formula>
            {step >= 2 && <Formula>(1, 1) → [ …更多数… ]</Formula>}
          </div>
        </div>
      </>
    );
  if (['model', 'parameters', 'training'].includes(k))
    return <Model key={`${k}-${step}`} kind={k} step={step} />;
  if (k === 'error')
    return (
      <>
        <Tag>平方误差 · 自编例子</Tag>
        <div className="error-groups">
          {records.map(({ x, y }, i) => (
            <div key={x}>
              <p>
                {x} 队：预测 {4 * x + 2} / 实际 {y}
              </p>
              <strong className="difference">
                差 {step >= 1 ? i + 1 : '？'}
              </strong>
              {step >= 2 && (
                <div
                  className="squares"
                  style={{ gridTemplateColumns: `repeat(${i + 1},24px)` }}
                >
                  {Array.from({ length: (i + 1) ** 2 }, (_, j) => (
                    <span key={j} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {step >= 2 && (
          <Formula>
            1² + 2² + 3² = <span className="accent">14</span>
          </Formula>
        )}
        <p className="small">
          平方不会让正负偏差互相抵消；差得越多，惩罚越大。
        </p>
      </>
    );
  if (k === 'direction') {
    const a = value ?? [4, 6, 5][step];
    return (
      <>
        <Tag>固定 b = 2 · 注意横轴现在是参数 a</Tag>
        <div className="two-col">
          <Chart
            points={[3, 4, 5, 6, 7].map((x) => ({ x, y: loss(x, 2) }))}
            xMax={7}
            yMax={60}
            activeX={a}
            xLabel="参数 a"
            yLabel="误差"
          />
          <div>
            <Range
              label="参数 a"
              value={a}
              min={3}
              max={7}
              onChange={setValue}
            />
            <Formula>
              误差 = <span className="accent">{loss(a, 2)}</span>
            </Formula>
            <p className="small">
              当前预测：{records.map((p) => predict(p.x, a, 2)).join('、')} 人
            </p>
            <p>误差越小，在这三条记录上越合适。</p>
          </div>
        </div>
      </>
    );
  }
  if (k === 'derive')
    return (
      <div className="derivation">
        <Tag>固定 b = 2 · 自编例子的代数推导</Tag>
        {[
          '(a + 2) − 7 = a − 5',
          '(2a + 2) − 12 = 2(a − 5)',
          '(3a + 2) − 17 = 3(a − 5)',
        ].map((s) => (
          <div key={s}>{s}</div>
        ))}
        {step >= 1 && <Formula>(1 + 4 + 9) × (a − 5)²</Formula>}
        {step >= 2 && <p className="takeaway">a = 5 → 14 × 0² = 0</p>}
      </div>
    );
  if (k === 'reward')
    return (
      <>
        <Tag>十次模拟记录 · 不是真实测试或更新算法</Tag>
        {[4, 7].map((wins, i) => (
          <div className="reward-row" key={wins}>
            <h3>{i ? 'B · 回去支援' : 'A · 继续追击'}</h3>
            <div className="result-cells">
              {Array.from({ length: 10 }, (_, j) => (
                <span className={j < wins ? 'win' : 'lose'} key={j}>
                  {j < wins ? '胜' : '负'}
                </span>
              ))}
            </div>
            {step >= i + 1 && (
              <p className="reward-formula">
                ({wins} × 1 + {10 - wins} × −1) ÷ 10 = <b>{reward(wins)}</b>
              </p>
            )}
          </div>
        ))}
        <p className="small">
          一次输赢不够；十次也不足以证明某个策略普遍更好。
        </p>
      </>
    );
  if (k === 'generalization')
    return (
      <>
        <Tag>自编例子 · 参数保持 a = 5，b = 2</Tag>
        <div className="comparison">
          <div>
            <h3>原来的设定</h3>
            <Formula>5 × 4 + 2 = 22</Formula>
            <p>
              {step >= 1
                ? '新记录：4 队，实际 22 人 ✓'
                : '4 队，模型预测 22 人'}
            </p>
          </div>
          <div className={step >= 2 ? 'lit' : 'veiled'}>
            <h3>裁判改成 4 人</h3>
            <Formula>5 × 4 + 4 = 24</Formula>
            <p>算术没有错，旧规则少了新条件。</p>
          </div>
        </div>
      </>
    );
  if (k === 'weight') {
    const w = (value ?? 60) / 100;
    return (
      <>
        <Tag>加权评分类比 · 自编分数</Tag>
        <div className="weight-bars">
          <div style={{ flex: w || 0.01 }}>
            完成度 8 分<br />
            {fmt(w * 100)}%
          </div>
          <div style={{ flex: 1 - w || 0.01 }}>
            合作 6 分<br />
            {fmt((1 - w) * 100)}%
          </div>
        </div>
        <Formula>
          8 × {fmt(w)} + 6 × {fmt(1 - w)}
          <br />
          {step >= 1 && (
            <>
              = {fmt(8 * w)} + {fmt(6 * (1 - w))} ={' '}
              <span className="accent">{fmt(8 * w + 6 * (1 - w))}</span>
            </>
          )}
        </Formula>
        {step >= 2 && (
          <Range
            label="完成度所占百分比"
            value={w * 100}
            max={100}
            onChange={setValue}
          />
        )}
        <p className="small">网络中的权重还可以为负，也不一定加起来等于 1。</p>
      </>
    );
  }
  if (k === 'linear')
    return (
      <>
        <Formula>
          {step === 0
            ? '2 × (3x + 1) + 4'
            : step === 1
              ? '6x + 2 + 4 = 6x + 6'
              : '负数 → 0；非负数 → 保持原样'}
        </Formula>
        {step >= 2 ? (
          <Flow items={['−2 → 0', '0 → 0', '3 → 3']} step={2} />
        ) : (
          <Chart
            points={[0, 1, 2, 3].map((x) => ({ x, y: 6 * x + 6 }))}
            xMax={3}
            yMax={24}
            xLabel="输入 x"
            yLabel="输出 y"
          />
        )}
      </>
    );
  if (k === 'network') {
    const x = value ?? 3,
      t = step >= 3 ? 3 : 2,
      n = network(x, t);
    return (
      <>
        <Tag>微型网络 · 用来说明计算组合</Tag>
        <Range label="输入 x" value={x} max={4} onChange={setValue} />
        <div className="network">
          <div className="net-input">x = {x}</div>
          <div className="net-branches">
            {[
              [1, n.a, 'A'],
              [t, n.b, 'B'],
            ].map(([v, out, name]) => (
              <div key={name}>
                <h3>支路 {name}</h3>
                <p>
                  {x} − {v} = {x - Number(v)}
                </p>
                <span>负数变 0</span>
                <strong>{step >= 1 ? out : '？'}</strong>
              </div>
            ))}
          </div>
          <div className="net-output">
            相加<strong>{step >= 2 ? n.y : '？'}</strong>
          </div>
        </div>
        {step >= 2 && (
          <Formula>
            {n.a} + {n.b} = {n.y}
          </Formula>
        )}
      </>
    );
  }
  if (k === 'network-table')
    return (
      <>
        <Tag>A = 负数归零(x − 1)；B = 负数归零(x − 2)</Tag>
        <div className="two-col">
          <table>
            <thead>
              <tr>
                <th>x</th>
                <th>A</th>
                <th>B</th>
                <th>y</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4]
                .filter((x) => x <= [1, 2, 4][step])
                .map((x) => {
                  const n = network(x);
                  return (
                    <tr key={x}>
                      <td>{x}</td>
                      <td>{n.a}</td>
                      <td>{n.b}</td>
                      <td>{n.y}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          <Chart
            points={[0, 1, 2, 3, 4]
              .filter((x) => x <= [1, 2, 4][step])
              .map((x) => ({ x, y: network(x).y }))}
            xMax={4}
            yMax={6}
            xLabel="输入 x"
            yLabel="输出 y"
          />
        </div>
      </>
    );
  if (k === 'foundation')
    return (
      <>
        <div className="foundation-grid">
          {Array.from({ length: 9 }, (_, i) => (
            <div key={i} className={step === 0 && i !== 4 ? 'dim' : ''}>
              {i === 4 ? (
                <>
                  <span>放大一个计算节点</span>
                  <b>乘 → 加 → 函数</b>
                </>
              ) : (
                <span>×　+　ƒ</span>
              )}
            </div>
          ))}
        </div>
        <p className="big-thought">
          {step >= 2
            ? '基础数学 + 更深入的研究 + 数据与工程'
            : '复杂，来自有组织的组合与规模。'}
        </p>
      </>
    );
  if (k === 'attention')
    return (
      <>
        <Tag>虚构通知 · 高亮为阅读类比，比例非实测</Tag>
        <div className="question">
          {step === 0 ? '在哪里举行？' : '什么时候举行？'}
        </div>
        <blockquote className="notice">
          <mark className={step > 0 ? 'active' : ''}>本周五</mark>，初二年级将在
          <mark className={step === 0 ? 'active' : ''}>操场</mark>举行接力赛。
          <mark className={step > 0 ? 'active' : ''}>遇雨顺延到下周一。</mark>
        </blockquote>
        {step >= 2 && (
          <>
            <div className="weight-bars">
              <div style={{ flex: 6 }}>信息甲 · 60%</div>
              <div style={{ flex: 3 }}>信息乙 · 30%</div>
              <div style={{ flex: 1 }}>丙 · 10%</div>
            </div>
            <p className="small">
              组合的是数字表示；不是把“周五”和“周一”平均。
            </p>
          </>
        )}
      </>
    );
  if (k === 'probability') {
    const names = choice
      ? ['《歌唱祖国》', '《明天会更好》', '其他候选']
      : ['接力赛', '跳远', '其他候选'];
    const weights = choice ? [2, 5, 3] : [6, 3, 1];
    const probs = normalize(weights);
    return (
      <>
        <Tag>候选、片段、权重均为教学示意</Tag>
        <div className="question">
          {choice ? '合唱比赛曲目包括……' : '运动会项目包括……'}
        </div>
        <div className="probability">
          {names.map((name, i) => (
            <div className="prob-row" key={name}>
              <span>{name}</span>
              <div className="prob-track">
                <div
                  style={{
                    width: `${step >= 2 ? probs[i] * 100 : weights[i] * 10}%`,
                  }}
                />
              </div>
              <strong>
                {step >= 2
                  ? `${weights[i]} ÷ 10 = ${probs[i] * 100}%`
                  : step >= 1
                    ? `权重 ${weights[i]}`
                    : '分数 → 正数'}
              </strong>
            </div>
          ))}
        </div>
        {step >= 3 && (
          <div className="generated">
            选取一个候选示意：{names[choice ? 1 : 0]} → 接回上下文
          </div>
        )}
        <button onClick={() => setChoice(!choice)}>换一个上下文</button>
        <p className="takeaway">选词概率 ≠ 事实正确率</p>
      </>
    );
  }
  if (k === 'language-training')
    return (
      <>
        <Tag>教学片段 · 并非实际分词</Tag>
        <div className="sentence">
          运动会项目包括{' '}
          <span className="masked">{step === 1 ? '？' : '接力赛'}</span>
        </div>
        <Flow
          items={['遮住后续片段', '先预测', '对照原文、调整参数']}
          step={step}
        />
        <p className="small">大量不同的文字提供练习目标；材料质量也很重要。</p>
      </>
    );
  if (k === 'inference')
    return (
      <div className="comparison">
        <div>
          <Tag>训练</Tag>
          <h3>参数会调整</h3>
          <Flow items={['预测', '比较', '调整']} step={step} />
        </div>
        <div>
          <Tag>这次回答</Tag>
          <h3>参数通常保持不变</h3>
          <div className="sentence">
            {step >= 1 ? '本周五' : ''}
            {step >= 2 ? '；遇雨顺延到下周一。' : ''}
          </div>
          <p>变化的是上下文和当前资料。</p>
        </div>
      </div>
    );
  if (k === 'hallucination')
    return (
      <div className="comparison">
        <div className={step === 0 ? '' : 'dim'}>
          <Tag>有虚构通知</Tag>
          <h3>本周五；遇雨顺延到下周一</h3>
          <p>保留日期，也保留条件。</p>
        </div>
        <div className={step >= 1 ? 'lit' : 'veiled'}>
          <Tag>没有这次通知</Tag>
          <h3>{step >= 2 ? '需要查资料' : '真实日期：未知'}</h3>
          <p>“听起来合理”不能补上缺失的证据。</p>
        </div>
      </div>
    );
  if (k === 'learning')
    return (
      <div className="learning-grid">
        {[
          ['数与坐标', '表示信息'],
          ['代数与函数', '建立模型'],
          ['平方与误差', '检验预测'],
          ['权重与概率', '理解不确定性'],
          ['阅读与探究', '提问、查证'],
          ['实践与创造', '制作、验证、改进'],
        ].map(([t, d], i) => (
          <div className={i <= step * 2 + 1 ? 'lit' : ''} key={t}>
            <b>{t}</b>
            <p>{d}</p>
          </div>
        ))}
      </div>
    );
  if (k === 'fake')
    return (
      <>
        <div className="fake-message">
          <Tag>虚构情境 · 并非真实学校通知</Tag>
          <div className="video-symbol">▷</div>
          <h3>“老师说，明天停课？”</h3>
          <p>画面像、声音像，都不能单独证明是真的。</p>
        </div>
        {step >= 1 && (
          <Flow
            items={['查正式通知', '用已知联系方式确认', '未核实先不转发']}
            step={step === 1 ? 1 : 2}
          />
        )}
      </>
    );
  if (k === 'care')
    return (
      <div className="care-grid">
        {[
          ['01', '核实事实', '查来源、时间和依据'],
          ['02', '警惕合成', '有图有视频，也要查证'],
          ['03', '保护隐私', '自己与同学的信息都要保护'],
          ['04', '遵守规则', '按要求使用，说明 AI 协助'],
          ['05', '自己判断', '不放弃思考与练习'],
        ].map(([n, t, d], i) => (
          <div key={n} className={i <= [1, 2, 3, 4][step] ? 'lit' : 'dim'}>
            <b>{n}</b>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    );
  return (
    <>
      <Flow
        items={['数字表示', '计算与训练', '生成与工具', '核实与判断']}
        step={step + 1}
      />
      <div className="closing-words">
        <span>好奇心</span>
        <span>独立思考</span>
        <span>动手创造</span>
      </div>
    </>
  );
}
