import type { ReactNode } from 'react';
import type { Scene } from './scenes';
import {
  records,
  predict,
  loss,
  parameterStates,
  trainingStates,
  attentionWeights,
  attentionValue,
  formatNumber as fmt,
} from './math';

function Formula({
  children,
  small = false,
}: {
  children: ReactNode;
  small?: boolean;
}) {
  return (
    <div className={`formula${small ? ' formula-small' : ''}`}>{children}</div>
  );
}
function Note({ children }: { children: ReactNode }) {
  return <p className="figure-note">{children}</p>;
}
function Table({
  headers,
  rows,
  compact = false,
}: {
  headers: string[];
  rows: ReactNode[][];
  compact?: boolean;
}) {
  return (
    <div className="table-scroll">
      <table className={`data-table${compact ? ' compact' : ''}`}>
        <thead>
          <tr>
            {headers.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) =>
                j === 0 ? (
                  <th key={j} scope="row">
                    {cell}
                  </th>
                ) : (
                  <td key={j}>{cell}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
function Flow({
  items,
  vertical = false,
}: {
  items: [string, string][];
  vertical?: boolean;
}) {
  return (
    <ol className={`flow${vertical ? ' vertical-flow' : ''}`}>
      {items.map(([a, b], i) => (
        <li key={a}>
          <span className="flow-order">{String(i + 1).padStart(2, '0')}</span>
          <div>
            <strong>{a}</strong>
            <p>{b}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
function TrainingLoop({
  mode = 'linear',
  compact = false,
}: {
  mode?: 'linear' | 'game' | 'text';
  compact?: boolean;
}) {
  const data =
    mode === 'linear'
      ? '气温与销量 (x, y)'
      : mode === 'game'
        ? '局面、行动与反馈'
        : '前文与目标 Token';
  const model =
    mode === 'linear'
      ? 'ŷ = wx + b'
      : mode === 'game'
        ? '策略 / 价值网络'
        : 'Transformer';
  const target =
    mode === 'linear'
      ? '均方误差 MSE'
      : mode === 'game'
        ? '示范 / 回报构造的损失'
        : '交叉熵 −ln p(目标)';
  return (
    <div className={`training-loop${compact ? ' compact-loop' : ''}`}>
      <Flow
        vertical
        items={[
          ['取一批数据', data],
          ['前向计算', model],
          ['计算损失', target],
          ['计算梯度', '反向传播 / 链式法则'],
          ['更新参数', '梯度下降等优化器'],
        ]}
      />
      <div className="loop-return">↥　继续取下一批训练数据</div>
    </div>
  );
}

type Series = { values: [number, number][]; tone?: string; dashed?: boolean };
function Plot({
  xMin,
  xMax,
  yMin,
  yMax,
  xLabel,
  yLabel,
  xTicks,
  yTicks,
  series = [],
  dots = [],
  children,
  short = false,
}: {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  xLabel: string;
  yLabel: string;
  xTicks: number[];
  yTicks: number[];
  series?: Series[];
  dots?: { x: number; y: number; label?: string; tone?: string }[];
  children?: ReactNode;
  short?: boolean;
}) {
  const X = (x: number) => 52 + ((x - xMin) / (xMax - xMin)) * 450;
  const Y = (y: number) => 254 - ((y - yMin) / (yMax - yMin)) * 216;
  return (
    <svg
      className={`plot${short ? ' short-plot' : ''}`}
      viewBox="0 0 550 304"
      role="img"
      aria-label={`${xLabel}与${yLabel}关系图`}
    >
      {yTicks.map((y) => (
        <g key={y}>
          <line x1="52" x2="502" y1={Y(y)} y2={Y(y)} className="plot-grid" />
          <text x="40" y={Y(y) + 5} textAnchor="end">
            {y}
          </text>
        </g>
      ))}
      <path d="M52 28V254H510" className="plot-axis" />
      {xTicks.map((x) => (
        <g key={x}>
          <line x1={X(x)} x2={X(x)} y1="254" y2="260" className="plot-axis" />
          <text x={X(x)} y="280" textAnchor="middle">
            {x}
          </text>
        </g>
      ))}
      <text x="52" y="18" className="axis-label">
        {yLabel}
      </text>
      <text x="502" y="301" textAnchor="end" className="axis-label">
        {xLabel}
      </text>
      {series.map((s, i) => (
        <polyline
          key={i}
          points={s.values.map(([x, y]) => `${X(x)},${Y(y)}`).join(' ')}
          fill="none"
          stroke={s.tone ?? 'var(--blue)'}
          strokeWidth="3.5"
          strokeDasharray={s.dashed ? '6 5' : undefined}
          strokeLinejoin="round"
        />
      ))}
      {dots.map((p, i) => (
        <g key={i}>
          <circle
            cx={X(p.x)}
            cy={Y(p.y)}
            r="6"
            fill={p.tone ?? 'var(--orange)'}
            stroke="var(--white)"
            strokeWidth="2"
          />
          {p.label && (
            <text x={X(p.x) + 9} y={Y(p.y) - 10} className="point-label">
              {p.label}
            </text>
          )}
        </g>
      ))}
      {children}
    </svg>
  );
}
function SalesChart({
  w,
  b = 20,
  labels = false,
}: {
  w?: number;
  b?: number;
  labels?: boolean;
}) {
  return (
    <Plot
      xMin={20}
      xMax={30}
      yMin={8}
      yMax={34}
      xLabel="气温 T / ℃"
      yLabel="销量 / 杯"
      xTicks={[20, 22, 24, 26, 28, 30]}
      yTicks={[10, 15, 20, 25, 30]}
      series={
        w === undefined
          ? []
          : [
              {
                values: [
                  [20, predict(-5, w, b)],
                  [30, predict(5, w, b)],
                ],
              },
            ]
      }
      dots={records.map((r) => ({
        x: r.temperature,
        y: r.y,
        label: labels ? `${r.y} 杯` : undefined,
      }))}
    />
  );
}
function Valley({ step }: { step?: number }) {
  return (
    <Plot
      xMin={0.5}
      xMax={3.5}
      yMin={0}
      yMax={13}
      xLabel="参数 w"
      yLabel="损失 L"
      xTicks={[1, 1.5, 2, 2.5, 3]}
      yTicks={[1, 6, 11]}
      series={[
        {
          values: Array.from({ length: 61 }, (_, i) => {
            const w = 0.5 + i / 20;
            return [w, loss(w)];
          }),
        },
      ]}
      dots={
        step === undefined
          ? [{ x: 2, y: 1, label: '最小值 1' }]
          : trainingStates.slice(0, step + 1).map((s, i) => ({
              x: s.w,
              y: s.loss,
              label: i === step ? `w = ${fmt(s.w)}` : undefined,
              tone: i === step ? 'var(--orange)' : 'var(--muted)',
            }))
      }
    />
  );
}
const roadmap = [
  ['线性回归', '怎样从数据学习？', 'ŷ = wx + b'],
  ['神经网络', '怎样表达复杂关系？', 'h = g(Wx + b)'],
  ['大模型', '怎样联系上下文？', 'Attention → 概率'],
  ['现实应用', '怎样解决实际问题？', '数据 → 结果 → 验证'],
  ['学生的选择', '怎样理解和用好 AI？', '学习 · 查证 · 创造'],
  ['回到主题', '“聪明”从哪里来？', '数学 · 训练 · 判断'],
];
function Roadmap({ final = false }: { final?: boolean }) {
  return (
    <div className="roadmap-grid">
      {roadmap.map(([title, question, math], i) => (
        <div className="roadmap-item" key={title}>
          <span className="big-index">0{i + 1}</span>
          <div>
            <h2>{title}</h2>
            <p>{final ? math : question}</p>
            <span className="roadmap-math">
              {final
                ? [
                    '数据、损失、梯度、更新',
                    '线性组合、激活、多层连接',
                    '表示、注意力、后续预测',
                    '在真实任务中检验',
                    '独立思考，保留责任',
                    '三个例子，一条主线',
                  ][i]
                : math}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
function GoBoard() {
  const stones = [
    [2, 2, 0],
    [3, 2, 1],
    [4, 2, 0],
    [2, 3, 1],
    [3, 3, 0],
    [4, 3, 1],
    [5, 3, 0],
    [3, 4, 1],
    [4, 4, 0],
    [5, 4, 1],
    [4, 5, 0],
    [5, 5, 1],
    [6, 5, 0],
    [2, 6, 0],
  ];
  return (
    <div className="go-panel">
      <svg viewBox="0 0 380 310" role="img" aria-label="教学棋盘与三个候选落点">
        <rect
          x="39"
          y="12"
          width="300"
          height="282"
          rx="3"
          fill="var(--blue-tint)"
        />
        {Array.from({ length: 9 }, (_, i) => (
          <g key={i}>
            <line
              x1="63"
              x2="315"
              y1={27 + i * 31.5}
              y2={27 + i * 31.5}
              className="board-line"
            />
            <line
              y1="27"
              y2="279"
              x1={63 + i * 31.5}
              x2={63 + i * 31.5}
              className="board-line"
            />
          </g>
        ))}
        {stones.map(([x, y, white], i) => (
          <circle
            key={i}
            cx={63 + x * 31.5}
            cy={27 + y * 31.5}
            r="13"
            fill={white ? '#fff' : '#213449'}
            stroke="#213449"
            strokeWidth="1.5"
          />
        ))}
        {[
          [2, 4, 'A'],
          [6, 4, 'B'],
          [5, 6, 'C'],
        ].map(([x, y, label]) => (
          <g key={label}>
            <circle
              cx={63 + Number(x) * 31.5}
              cy={27 + Number(y) * 31.5}
              r="13"
              fill="var(--blue)"
            />
            <text
              x={63 + Number(x) * 31.5}
              y={32 + Number(y) * 31.5}
              textAnchor="middle"
              fill="white"
              fontSize="16"
            >
              {label}
            </text>
          </g>
        ))}
      </svg>
      <div className="go-options">
        <span>候选 A → 对手回应 → 新局面</span>
        <span>候选 B → 对手回应 → 新局面</span>
        <span>候选 C → 对手回应 → 新局面</span>
      </div>
      <Note>棋盘与候选位置均为教学示意，非历史棋谱。</Note>
    </div>
  );
}
function Nonlinear({ type = 'compare' }: { type?: 'compare' | 'relu' }) {
  if (type === 'relu')
    return (
      <>
        <Formula>ReLU(z) = max(0, z)</Formula>
        <Plot
          xMin={-3}
          xMax={3}
          yMin={-0.5}
          yMax={3.5}
          xLabel="输入 z"
          yLabel="输出"
          xTicks={[-3, -2, -1, 0, 1, 2, 3]}
          yTicks={[0, 1, 2, 3]}
          series={[
            {
              values: [
                [-3, 0],
                [0, 0],
                [3, 3],
              ],
            },
          ]}
          dots={[
            { x: -2, y: 0, label: '负数归零' },
            { x: 2, y: 2, label: '正数保留' },
          ]}
        />
      </>
    );
  return (
    <div className="circle-demo">
      <svg
        viewBox="0 0 440 255"
        role="img"
        aria-label="圆环数据无法用直线完全分开"
      >
        <path d="M25 225H420M220 18V240" className="plot-grid" />
        {[0, 1].map((r) =>
          Array.from({ length: r ? 24 : 10 }, (_, i) => {
            const a = (i / (r ? 24 : 10)) * Math.PI * 2,
              radius = r ? 96 : 34;
            return (
              <circle
                key={`${r}-${i}`}
                cx={220 + Math.cos(a) * radius}
                cy={124 + Math.sin(a) * radius}
                r="6"
                fill={r ? 'var(--blue)' : 'var(--orange)'}
              />
            );
          }),
        )}
        <line
          x1="65"
          y1="228"
          x2="372"
          y2="20"
          stroke="var(--teal)"
          strokeWidth="3"
          strokeDasharray="7 5"
        />
      </svg>
      <Note>任意直线都无法把内圈与外圈完全分开。示意数据。</Note>
    </div>
  );
}
function NetworkFigure() {
  return (
    <>
      <svg
        viewBox="0 0 560 220"
        className="network-figure"
        role="img"
        aria-label="输入3经过两个ReLU支路输出3"
      >
        <path
          d="M80 110L230 60M80 110L230 165M305 60L455 110M305 165L455 110"
          className="network-edge"
        />
        <circle cx="70" cy="110" r="30" className="node" />
        <text x="70" y="117" textAnchor="middle">
          3
        </text>
        <rect x="190" y="30" width="135" height="60" rx="8" className="node" />
        <rect x="190" y="135" width="135" height="60" rx="8" className="node" />
        <text x="257" y="55" textAnchor="middle">
          ReLU(3 − 1)
        </text>
        <text x="257" y="80" textAnchor="middle" className="node-result">
          2
        </text>
        <text x="257" y="160" textAnchor="middle">
          ReLU(3 − 2)
        </text>
        <text x="257" y="185" textAnchor="middle" className="node-result">
          1
        </text>
        <circle cx="470" cy="110" r="34" className="node output-node" />
        <text x="470" y="117" textAnchor="middle">
          3
        </text>
        <text x="410" y="82">
          相加
        </text>
      </svg>
      <Formula small>一层的批量记法：h = g(Wx + b)</Formula>
      <div className="math-ledger">
        <span>另一个例子：全连接 3 → 4 → 2</span>
        <strong>(3 × 4 + 4) + (4 × 2 + 2) = 26 个参数</strong>
      </div>
    </>
  );
}
function Demo({ type }: { type: 'network' | 'llm' }) {
  return (
    <div className="demo-panel">
      <div className="demo-label">
        现场体验 <span>↗</span>
      </div>
      <h2>{type === 'network' ? '神经网络实验室' : '走进 Transformer'}</h2>
      <p>
        {type === 'network'
          ? '同一组点，观察模型怎样学出不同的分界线。'
          : '从一个 Token 出发，沿着真实的数值计算走向输出。'}
      </p>
      {type === 'network' ? (
        <Nonlinear />
      ) : (
        <div className="mini-stack">
          {[
            '输出概率',
            '线性输出层',
            'Attention + MLP　× N',
            'Token + 位置表示',
          ].map((t, i) => (
            <div key={t} style={{ marginInline: `${i * 9}px` }}>
              {t}
            </div>
          ))}
        </div>
      )}
      <a
        className="demo-link"
        href={
          type === 'network'
            ? 'https://playground.tensorflow.org/'
            : 'https://bbycroft.net/llm/'
        }
        target="_blank"
        rel="noopener noreferrer"
      >
        {type === 'network'
          ? '打开 TensorFlow Playground'
          : '打开 LLM Visualization'}{' '}
        <span aria-hidden="true">↗</span>
      </a>
      <Note>在新标签页打开；返回后继续当前页面。</Note>
    </div>
  );
}
function ProbabilityBars({ rows }: { rows: [string, number][] }) {
  return (
    <div className="probability-bars">
      {rows.map(([label, p]) => (
        <div key={label}>
          <span>{label}</span>
          <div className="bar-track">
            <div style={{ width: `${p * 100}%` }} />
          </div>
          <strong>{fmt(p * 100, 1)}%</strong>
        </div>
      ))}
    </div>
  );
}
function FitComparison() {
  return (
    <div className="fit-comparison">
      {['欠拟合', '较合适', '过拟合'].map((t, i) => (
        <div key={t}>
          <svg viewBox="0 0 180 170" role="img" aria-label={`${t}的定性示意`}>
            <path d="M15 10V150H172" className="plot-axis" />
            {[
              [30, 126],
              [50, 112],
              [70, 78],
              [91, 90],
              [115, 53],
              [140, 40],
              [156, 44],
            ].map(([x, y]) => (
              <circle key={x} cx={x} cy={y} r="4" fill="var(--orange)" />
            ))}
            <path
              d={
                i === 0
                  ? 'M20 90H165'
                  : i === 1
                    ? 'M20 140L165 25'
                    : 'M20 145Q25 110 30 126T50 112T70 78Q80 150 91 90T115 53Q125 -15 140 40T156 44L168 15'
              }
              stroke={i === 1 ? 'var(--teal)' : 'var(--blue)'}
              strokeWidth="3"
              fill="none"
            />
          </svg>
          <h3>{t}</h3>
          <p>{['两边都差', '新数据也较好', '训练好，验证差'][i]}</p>
        </div>
      ))}
    </div>
  );
}

export default function Visual({
  scene,
  step = 0,
}: {
  scene: Scene;
  step?: number;
}) {
  const bounded = Math.max(
    0,
    Math.min(scene.steps.length - 1, Math.trunc(step) || 0),
  );
  switch (scene.kind) {
    case 'roadmap':
      return <Roadmap />;
    case 'go':
      return <GoBoard />;
    case 'moba':
      return (
        <>
          <div className="situation-label">
            教学局面：对手残血，队友正在防守
          </div>
          <Table
            headers={['已知信息', '当前状态']}
            rows={[
              ['自己', '血量充足，距离队友较远'],
              ['对手', '残血撤退，位置还在变化'],
              ['队友', '防御目标受到压力'],
            ]}
          />
          <div className="choice-pair">
            <div>
              <span>A</span>
              <h3>继续追击</h3>
              <p>
                可能获得击败
                <br />
                也可能错过防守
              </p>
            </div>
            <div>
              <span>B</span>
              <h3>返回支援</h3>
              <p>
                放弃眼前机会
                <br />
                守住团队目标
              </p>
            </div>
          </div>
          <Note>信息与选择为教学示意，不代表真实对局的最优决策。</Note>
        </>
      );
    case 'website':
      return (
        <>
          <div className="task-brief">
            <span>现场任务</span>
            <blockquote>
              请查找学校官网的两条近期活动，整理名称、时间和主要内容，并附上原文链接。
            </blockquote>
            <p>讲前准备：学校名称 · 官方网址 · “近期”的范围</p>
          </div>
          <Flow
            items={[
              ['找到原文', '打开官网与通知'],
              ['整理结果', '保留日期与条件'],
              ['核对证据', '回到原始页面'],
            ]}
          />
          <Note>此页是演示任务说明，真实操作在 AI 工具中完成。</Note>
        </>
      );
    case 'data':
      return (
        <>
          <SalesChart labels />
          <Table
            compact
            headers={['气温 / ℃', '22', '24', '26', '28']}
            rows={[['销量 / 杯', 15, 17, 21, 27]]}
          />
          <Note>自编手算样本。气温与销量存在波动，完整预测需要更多记录。</Note>
        </>
      );
    case 'datasets':
      return (
        <>
          <div className="timeline-title">
            <span>较早的记录</span>
            <span>时间向后 →</span>
          </div>
          <div
            className="dataset-bar"
            aria-label="90天按时间划分：前60天训练，接着15天验证，最后15天测试"
          >
            <div>
              <strong>训练</strong>
              <span>60 天</span>
            </div>
            <div>
              <strong>验证</strong>
              <span>15 天</span>
            </div>
            <div>
              <strong>测试</strong>
              <span>15 天</span>
            </div>
          </div>
          <Table
            headers={['数据', '允许影响什么？']}
            rows={[
              ['训练集', '权重 w、偏置 b'],
              ['验证集', '方案、超参数、停止时机'],
              ['测试集', '最终评估，不再据此反复改方案'],
            ]}
          />
          <div className="annotation">
            先划分，再处理：标准化等统计量只从训练集获得。
          </div>
          <Note>90 天与划分比例为教学示意；预测未来时按时间留出数据。</Note>
        </>
      );
    case 'parameters': {
      const s = parameterStates[bounded];
      return (
        <>
          <Formula>
            ŷ = <em>{s.w}</em> × (T − 25) + <em>{s.b}</em>
          </Formula>
          <SalesChart w={s.w} b={s.b} />
          <div className="chart-legend">
            <span>━ 当前模型</span>
            <span>● 实际记录</span>
          </div>
          <Table
            compact
            headers={['T / ℃', ...records.map((r) => String(r.temperature))]}
            rows={[
              ['预测 / 杯', ...records.map((r) => predict(r.x, s.w, s.b))],
            ]}
          />
        </>
      );
    }
    case 'loss':
      return (
        <>
          <Formula small>L = 1/n × Σᵢ (ŷᵢ − yᵢ)²</Formula>
          <Table
            headers={['T / ℃', '实际 y', '预测 ŷ', '误差', '平方']}
            rows={records.map((r) => [
              r.temperature,
              r.y,
              predict(r.x, 1, 20),
              predict(r.x, 1, 20) - r.y,
              (predict(r.x, 1, 20) - r.y) ** 2,
            ])}
          />
          <div className="answer-strip">
            <span>均方误差</span>
            <strong>(4 + 4 + 0 + 16) ÷ 4 = 6</strong>
          </div>
          <Note>当前参数 w = 1、b = 20；MSE 单位为杯²。</Note>
        </>
      );
    case 'minimum':
      return (
        <>
          <div className="derivation">
            <p>L(w) = ¼ [(5 − 3w)² + (3 − w)²</p>
            <p className="indent">+ (w − 1)² + (3w − 7)²]</p>
            <p>= 5w² − 20w + 21</p>
            <p className="derivation-result">= 5(w − 2)² + 1 ≥ 1</p>
          </div>
          <Valley />
          <Note>固定 b = 20。w = 2 时，平方项等于 0，损失仍为 1。</Note>
        </>
      );
    case 'gradient': {
      const s = trainingStates[bounded];
      return (
        <>
          <Formula small>w新 = w旧 − η · L′(w旧)</Formula>
          <Valley step={bounded} />
          <div className="number-trio">
            <div>
              <span>更新次数</span>
              <strong>{s.iteration}</strong>
            </div>
            <div>
              <span>参数 w</span>
              <strong>{fmt(s.w)}</strong>
            </div>
            <div>
              <span>损失 L</span>
              <strong>{fmt(s.loss)}</strong>
            </div>
          </div>
          <Note>学习率固定为 0.05；每一步按公式计算，非预设的移动动画。</Note>
        </>
      );
    }
    case 'batches':
      return (
        <>
          <div className="big-equation">
            <strong>60</strong>
            <span>条训练记录</span>
            <b>÷</b>
            <strong>20</strong>
            <span>条 / 批</span>
            <b>=</b>
            <strong>3</strong>
            <span>批 / 轮</span>
          </div>
          <Flow
            items={[
              ['第 1 批', '记录 1—20 → 更新'],
              ['第 2 批', '记录 21—40 → 更新'],
              ['第 3 批', '记录 41—60 → 更新'],
            ]}
          />
          <Formula small>10 轮训练 × 3 次 / 轮 = 30 次更新</Formula>
          <Table
            compact
            headers={['参数', '超参数']}
            rows={[['权重 w、偏置 b', '学习率 η、批大小、轮数、层数']]}
          />
          <Note>无梯度累积的教学设置，每批更新一次。</Note>
        </>
      );
    case 'loop':
      return (
        <>
          <TrainingLoop />
          <div className="outside-loop">
            <strong>循环之外</strong>
            <span>验证选方案 → 测试评估 → 新数据推理</span>
          </div>
        </>
      );
    case 'generalization':
      return (
        <>
          <FitComparison />
          <Table
            headers={['观察到的表现', '需要检查']}
            rows={[
              ['训练、验证都差', '特征、模型容量、训练是否充分'],
              ['训练好，验证差', '过拟合、数据差异、评估方式'],
              ['新环境突然失准', '输入分布或真实规律是否变化'],
            ]}
          />
          <Note>曲线为三种拟合情形的定性示意，非实验测量结果。</Note>
        </>
      );
    case 'regularization':
      return (
        <>
          <Formula small>总损失 = 数据误差 + λ × 权重惩罚</Formula>
          <div className="formula-pair">
            <div>
              <span>L1 正则化</span>
              <strong>λ Σⱼ |wⱼ|</strong>
              <p>倾向使部分权重变成 0</p>
            </div>
            <div>
              <span>L2 正则化</span>
              <strong>λ Σⱼ wⱼ²</strong>
              <p>较重地惩罚大权重</p>
            </div>
          </div>
          <div className="early-stop">
            <span>训练继续 →</span>
            <div className="loss-trends">
              <p>训练损失　持续下降 ↘</p>
              <p>验证损失　先降后升 ↘ ↗</p>
            </div>
            <strong>保留验证表现较好的参数</strong>
          </div>
          <Note>λ 由验证结果选择；更强的约束不保证更好的预测。</Note>
        </>
      );
    case 'optimizers':
      return (
        <>
          <Table
            headers={['方法', '更新时参考什么？']}
            rows={[
              ['梯度下降', '当前梯度'],
              ['动量法', '当前 + 平滑累积的历史梯度'],
              ['RMSProp', '历史梯度平方的平均'],
              ['Adam', '梯度平均 + 梯度平方平均'],
            ]}
          />
          <Formula small>x标准化 = (x − μ训练) / σ训练</Formula>
          <div className="annotation">
            用训练集得到 μ、σ，再同样变换验证集、测试集与新输入。
          </div>
          <Note>
            优化器影响更新；改变模型容量、数据与训练目标仍需分别考虑。
          </Note>
        </>
      );
    case 'features':
      return (
        <>
          <Formula>ŷ = w₁x₁ + w₂x₂ + w₃x₃ + b</Formula>
          <Table
            headers={['特征', '数值表示', '作用']}
            rows={[
              ['气温', 'x₁ = T − 25', '连续变化'],
              ['降雨', 'x₂ = 0 或 1', '是否降雨'],
              ['促销', 'x₃ = 0 或 1', '是否促销'],
            ]}
          />
          <div className="annotation">
            更多特征 → 更多权重
            <br />
            阈值、饱和、条件之间的交互 → 还需要更灵活的结构
          </div>
          <Note>
            是否降雨、是否促销为特征设计示意；相关关系不等于因果关系。
          </Note>
        </>
      );
    case 'game-inputs':
      return (
        <>
          <Table
            headers={['任务', '输入 x', '输出 fθ(x)']}
            rows={[
              ['销量预测', '气温、降雨、促销', '预测销量'],
              ['围棋', '棋盘状态、轮次', '着法倾向、局面价值'],
              ['团队游戏', '位置、血量、队友等', '行动倾向、预期回报'],
            ]}
          />
          <Formula>输入 x → fθ(x) → 输出</Formula>
          <div className="annotation">θ 表示模型里全部可学习参数的集合。</div>
        </>
      );
    case 'linear-compose':
      return (
        <>
          <div className="derivation">
            <p>h = w₁x + b₁</p>
            <p>ŷ = w₂h + b₂</p>
            <p>= w₂(w₁x + b₁) + b₂</p>
            <p className="derivation-result">= (w₂w₁)x + (w₂b₁ + b₂)</p>
          </div>
          <Nonlinear />
        </>
      );
    case 'relu':
      return <Nonlinear type="relu" />;
    case 'network':
      return <NetworkFigure />;
    case 'backprop':
      return (
        <>
          <div className="backprop-values">
            <span>x = 2</span>
            <span>w₁ = 1</span>
            <span>w₂ = 3</span>
            <span>目标 y = 8</span>
          </div>
          <Flow
            items={[
              ['h = 2', '1 × 2'],
              ['ŷ = 6', '3 × 2'],
              ['L = 4', '(6 − 8)²'],
            ]}
          />
          <div className="derivation">
            <p>∂L/∂w₁ = (∂L/∂ŷ) × (∂ŷ/∂h) × (∂h/∂w₁)</p>
            <p className="derivation-result">= (−4) × 3 × 2 = −24</p>
            <p>∂L/∂w₂ = (−4) × 2 = −8</p>
          </div>
          <Note>
            先用没有偏置的两层算例说明链式法则；有激活时继续乘上对应的局部变化率。
          </Note>
        </>
      );
    case 'game-training':
      return (
        <>
          <TrainingLoop mode="game" compact />
          <div className="formula-pair">
            <div>
              <span>监督示范</span>
              <strong>局面 → 高手动作</strong>
            </div>
            <div>
              <span>强化学习</span>
              <strong>互动 → 长期回报</strong>
            </div>
          </div>
          <Note>搜索与网络配合；一局获胜，不表示每个动作都是最优。</Note>
        </>
      );
    case 'demo-network':
      return <Demo type="network" />;
    case 'transformer-map':
      return (
        <>
          <Flow
            vertical
            items={[
              ['Token 与数字表示', '文本片段 → 编号 → 向量 + 位置'],
              ['多层 Transformer', '注意力 → 前馈网络；残差与归一化'],
              ['输出层', '向量 → 词表分数 → Softmax'],
              ['接上后续', '选择一个 Token，再继续生成'],
            ]}
          />
          <div className="architecture-compare">
            <span>
              经典 Transformer
              <br />
              <strong>编码器 + 解码器</strong>
            </span>
            <span>
              GPT 类模型
              <br />
              <strong>解码器式因果结构</strong>
            </span>
          </div>
        </>
      );
    case 'embedding':
      return (
        <>
          <Table
            headers={['片段', '编号', '向量示意']}
            rows={[
              ['春天', '17', '[0.2, −0.4, 0.8]'],
              ['到了', '42', '[0.7, 0.1, −0.3]'],
              ['，', '5', '[−0.2, 0.5, 0.1]'],
            ]}
          />
          <div className="word-order">
            <p>
              <b>狗</b>
              <b>咬</b>
              <b>人</b>
              <span>谁发起动作？</span>
            </p>
            <p>
              <b>人</b>
              <b>咬</b>
              <b>狗</b>
              <span>词相同，含义不同</span>
            </p>
          </div>
          <Note>片段、编号和三维向量均为自编；实际分词与维度因模型而异。</Note>
        </>
      );
    case 'qkv':
      return (
        <>
          <div className="token-context">
            小明把 <mark>书</mark> 放进 <mark>书包</mark>，因为{' '}
            <mark className="query-mark">它</mark> 太重了。
          </div>
          <div className="qkv-grid">
            {[
              ['Q', '用于查询'],
              ['K', '用于匹配'],
              ['V', '用于汇集'],
            ].map(([a, c]) => (
              <div key={a}>
                <strong>{a}</strong>
                <span>
                  {a} = XW<sub>{a}</sub>
                </span>
                <p>{c}</p>
              </div>
            ))}
          </div>
          <Formula small>匹配 Q · K → 权重 → 加权组合 V</Formula>
          <Note>句子存在指代歧义；此图只解释计算角色，不是实测注意力。</Note>
        </>
      );
    case 'attention':
      return (
        <>
          <Table
            headers={['位置', 'K', 'V', 'Q·K', '权重']}
            rows={[
              ['位置 1', '[1]', '[2]', 1, fmt(attentionWeights[0], 3)],
              ['位置 2', '[0]', '[6]', 0, fmt(attentionWeights[1], 3)],
            ]}
          />
          <Formula small>
            Softmax(s)<sub>i</sub> ={' '}
            <span className="fraction">
              <span>
                e
                <sup>
                  s<sub>i</sub>
                </sup>
              </span>
              <span>
                Σ<sub>j</sub> e
                <sup>
                  s<sub>j</sub>
                </sup>
              </span>
            </span>
          </Formula>
          <ProbabilityBars
            rows={[
              ['位置 1', attentionWeights[0]],
              ['位置 2', attentionWeights[1]],
            ]}
          />
          <div className="answer-strip">
            <span>加权输出</span>
            <strong>0.731 × 2 + 0.269 × 6 ≈ {fmt(attentionValue, 3)}</strong>
          </div>
          <Note>
            一般形式：Attention(Q, K, V) = softmax(QKᵀ / √dₖ)V。本例 dₖ = 1。
          </Note>
        </>
      );
    case 'blocks':
      return (
        <>
          <div className="transformer-block">
            <span className="block-title">一个常见的解码器层 · 重复 N 次</span>
            <div className="residual-row">
              <span>输入 x</span>
              <div>
                <p>归一化 → 多头因果注意力</p>
                <strong>输出 + x</strong>
              </div>
              <span className="skip-label">残差 ↗</span>
            </div>
            <div className="residual-row">
              <span>中间值 h</span>
              <div>
                <p>归一化 → 前馈网络</p>
                <strong>输出 + h</strong>
              </div>
              <span className="skip-label">残差 ↗</span>
            </div>
          </div>
          <Formula small>前馈网络：FFN(h) = W₂ g(W₁h + b₁) + b₂</Formula>
          <Note>
            Pre-Norm 结构示意；不同模型的归一化位置与激活函数可以不同。
          </Note>
        </>
      );
    case 'generation': {
      const words = [
        '春天到了，',
        '春天到了，花',
        '春天到了，花开',
        '春天到了，花开了',
      ];
      const candidates: [string, number][][] = [
        [
          ['花', 0.6],
          ['天气', 0.25],
          ['我们', 0.15],
        ],
        [
          ['开', 0.7],
          ['香', 0.2],
          ['落', 0.1],
        ],
        [
          ['了', 0.65],
          ['满', 0.25],
          ['得', 0.1],
        ],
        [
          ['。', 0.8],
          ['，', 0.15],
          ['！', 0.05],
        ],
      ];
      return (
        <>
          <div className="generation-text">
            {words[bounded]}
            <span className="token-placeholder">下一个</span>
          </div>
          <ProbabilityBars rows={candidates[bounded]} />
          <Formula small>
            分数 z → p<sub>i</sub> ={' '}
            <span className="fraction">
              <span>
                e
                <sup>
                  z<sub>i</sub>
                </sup>
              </span>
              <span>
                Σ<sub>j</sub> e
                <sup>
                  z<sub>j</sub>
                </sup>
              </span>
            </span>{' '}
            → 选择
          </Formula>
          <div className="architecture-compare">
            <span>
              经典模型
              <br />
              <strong>编码器 → 解码器</strong>
            </span>
            <span>
              GPT 类续写
              <br />
              <strong>因果解码器 → 下一个</strong>
            </span>
          </div>
          <Note>候选概率与片段均为自编；按按钮逐步观察，非真实模型输出。</Note>
        </>
      );
    }
    case 'demo-llm':
      return <Demo type="llm" />;
    case 'pretrain':
      return (
        <>
          <Table
            compact
            headers={['训练前文', '目标 Token']}
            rows={[
              ['春天到了，', '花'],
              ['春天到了，花', '开'],
              ['春天到了，花开', '了'],
            ]}
          />
          <div className="pretrain-lower">
            <div>
              <Formula small>L = −ln p(目标)</Formula>
              <Table
                compact
                headers={['目标概率', '损失']}
                rows={[0.1, 0.5, 0.9].map((p) => [p, fmt(-Math.log(p), 3)])}
              />
            </div>
            <TrainingLoop mode="text" compact />
          </div>
          <Note>
            对批次与有效位置取平均；生成流畅程度与事实正确性仍需分别评估。
          </Note>
        </>
      );
    case 'posttrain':
      return (
        <>
          <Table
            headers={['训练阶段', '材料 / 信号', '学习目标']}
            rows={[
              ['预训练', '大量文本', '预测后续'],
              ['指令微调', '要求 + 示范回答', '学习回答示范'],
              ['偏好训练', '回答比较 / 奖励', '更符合偏好'],
              ['蒸馏', '教师文本 / 分布', '学习教师输出'],
            ]}
          />
          <div className="annotation">
            训练：数据影响参数
            <br />
            使用：当前问题与资料影响上下文
          </div>
          <Note>
            这是不同训练方式的对照，不表示每个模型都依次采用全部方式。
          </Note>
        </>
      );
    case 'tools':
      return (
        <>
          <Flow
            vertical
            items={[
              ['人提出任务', '查学校官网的近期活动'],
              ['模型生成指令', '系统检查能力与权限'],
              ['浏览器执行', '打开页面，返回原始资料'],
              ['模型整理回答', '名称、日期、条件、来源'],
              ['人核对原文', '结果是否完成，内容是否有依据'],
            ]}
          />
          <Note>流程示意，回扣开场的真实演示；不代表本页已经执行了任务。</Note>
        </>
      );
    case 'applications':
      return (
        <>
          <Table
            headers={['领域', '模型的任务', '结果的检验']}
            rows={[
              ['军事', '影像识别辅助', '误报、漏报、人工核查'],
              ['经济', '需求与活动预测', '未来误差、业务成本'],
              ['制药', '结构与候选预测', '实验与研究验证'],
              ['数学', '构造与证明探索', '条件、规则、逻辑验证'],
            ]}
          />
          <Formula small>数据 → 模型输出 → 领域验证 → 实际使用</Formula>
        </>
      );
    case 'military':
      return (
        <>
          <div className="situation-label">如何读懂识别结果？</div>
          <Table
            headers={['模型判断', '实际存在', '实际不存在']}
            rows={[
              [
                '发现对象',
                <span className="good-value" key="tp">
                  识别正确
                </span>,
                <span className="bad-value" key="fp">
                  误报
                </span>,
              ],
              [
                '未发现',
                <span className="bad-value" key="fn">
                  漏报
                </span>,
                <span className="good-value" key="tn">
                  判断正确
                </span>,
              ],
            ]}
          />
          <Flow
            items={[
              ['影像输入', '机器辅助筛选'],
              ['候选结果', '核查其他证据'],
              ['人的判断', '承担实际责任'],
            ]}
          />
          <Note>分类概念表，不是 Project Maven 实测性能或作战流程。</Note>
        </>
      );
    case 'economy':
      return (
        <>
          <div className="situation-label">同样差 5 杯，代价可能不同</div>
          <Table
            headers={['备货量', '实际需求', '结果', '假设成本']}
            rows={[
              ['25 杯', '30 杯', '缺 5 杯', '5 × 3 = 15 元'],
              ['35 杯', '30 杯', '剩 5 杯', '5 × 1 = 5 元'],
            ]}
          />
          <Formula small>决策 = 预测 + 成本 + 约束 + 不确定性</Formula>
          <div className="annotation">
            从饮品店备货，到供应链和经济活动估计，都需要在新数据上评估。
          </div>
          <Note>
            成本为教学假设：缺货机会成本 3 元 / 杯，剩余浪费 1 元 / 杯。
          </Note>
        </>
      );
    case 'medicine':
      return (
        <>
          <Flow
            vertical
            items={[
              ['提出科学问题', '研究分子与疾病机制'],
              ['模型预测结构与关系', '提供可研究的候选或线索'],
              ['开展实验与研究', '验证预测，检查有效性与安全性'],
              ['根据证据继续', '修正假设，再推进研究'],
            ]}
          />
          <div className="annotation">结构预测 ≠ 已经得到有效药物</div>
          <Note>
            药物研发有更复杂的研究与验证流程；此图只展示预测与实验的关系。
          </Note>
        </>
      );
    case 'mathematics':
      return (
        <>
          <div className="geometry-proof">
            <svg
              viewBox="0 0 290 190"
              role="img"
              aria-label="等腰三角形中添加顶角平分线的教学示意"
            >
              <path
                d="M145 20L30 165H260Z"
                fill="var(--blue-tint)"
                stroke="var(--blue)"
                strokeWidth="2.5"
              />
              <path
                d="M145 20V165"
                stroke="var(--orange)"
                strokeWidth="2.5"
                strokeDasharray="6 4"
              />
              <text x="139" y="15">
                A
              </text>
              <text x="14" y="181">
                B
              </text>
              <text x="266" y="181">
                C
              </text>
              <text x="145" y="185">
                D
              </text>
            </svg>
            <div>
              <p>已知 AB = AC</p>
              <p>作 AD 平分 ∠BAC</p>
              <p>AD = AD（公共边）</p>
              <strong>由 SAS 得两三角形全等</strong>
            </div>
          </div>
          <Flow
            items={[
              ['提出构造', '添加辅助线'],
              ['检查条件', '用规则推导'],
              ['形成证明', '逐步可验证'],
            ]}
          />
          <Note>
            基础几何例子为自编，用于类比构造与检验，不是 AlphaGeometry 的输出。
          </Note>
        </>
      );
    case 'verify':
      return (
        <>
          <div className="notice-example">
            <span>虚构情境</span>
            <h3>“老师发来语音：明天活动取消了。”</h3>
            <p>声音很熟悉，是否就能直接相信并转发？</p>
          </div>
          <Table
            headers={['需要核查', '具体动作']}
            rows={[
              ['发布者', '从熟悉渠道联系老师或家长'],
              ['原始来源', '查看学校正式通知'],
              ['时间与条件', '确认适用班级、日期和完整要求'],
            ]}
          />
          <div className="annotation">没有核实 → 先不传播</div>
        </>
      );
    case 'learn':
      return (
        <>
          <div className="learning-cycle">
            <span>独立尝试</span>
            <b>→</b>
            <span>获取反馈</span>
            <b>→</b>
            <span>检查依据</span>
            <b>→</b>
            <span>自己解释</span>
          </div>
          <Table
            headers={['今天学到的数学', '它帮助我们理解']}
            rows={[
              ['一次函数与参数', '模型怎样表示关系'],
              ['平方、平均与最小值', '训练怎样衡量和改进'],
              ['概率与加权组合', '大模型怎样联系与生成'],
            ]}
          />
          <div className="annotation">合上答案后，能不能说明“为什么”？</div>
        </>
      );
    case 'boundaries':
      return (
        <>
          <Table
            headers={['使用情境', '保留的判断与责任']}
            rows={[
              ['整理资料', '核实原文，检查条件'],
              ['辅助作业', '遵守老师要求，说明 AI 协助'],
              ['上传材料', '检查隐私与授权'],
              ['制作或分享内容', '不冒充、不造谣，说明合成'],
            ]}
          />
          <div className="responsibility-line">
            <span>能力</span>
            <b>＋</b>
            <span>判断</span>
            <b>＋</b>
            <span>责任</span>
          </div>
        </>
      );
    case 'finale':
      return (
        <>
          <Roadmap final />
          <div className="final-examples">
            <span>围棋：局面 → 判断与搜索</span>
            <span>游戏：状态 → 策略与回报</span>
            <span>官网：要求 → 工具与证据</span>
          </div>
        </>
      );
    default:
      throw new Error(`未定义的教学画面：${scene.kind}`);
  }
}
