/* eslint-disable jsx-a11y/prefer-tag-over-role -- SVG diagrams contain labelled vector elements. */
import type { ReactNode } from 'react';
import type { Scene } from './scenes';
import { records, predict, loss, network, reward, normalize } from './math';

const fmt = (n: number) => Number(n.toFixed(2)).toString();
function Note({ children }: { children: ReactNode }) {
  return <div className="figure-note">{children}</div>;
}
function Equation({ children }: { children: ReactNode }) {
  return <div className="equation">{children}</div>;
}
function Flow({ items, active }: { items: string[]; active: number }) {
  return (
    <div className="process">
      {items.map((item, i) => (
        <div
          key={item}
          className={`process-item ${i === active ? 'is-active' : ''} ${i > active ? 'is-pending' : ''}`}
        >
          <span className="process-number">0{i + 1}</span>
          <strong>{item}</strong>
          {i < items.length - 1 && <span className="process-arrow">→</span>}
        </div>
      ))}
    </div>
  );
}
function Compare({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="diagram-pair">
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

export function Chart({
  points,
  reference = false,
  xLabel = '队数',
  yLabel = '人数',
  xMax = 4,
  yMax = 24,
  activeX,
}: {
  points: { x: number; y: number }[];
  reference?: boolean;
  xLabel?: string;
  yLabel?: string;
  xMax?: number;
  yMax?: number;
  activeX?: number;
}) {
  const px = (x: number) => 70 + (x / xMax) * 470,
    py = (y: number) => 275 - (y / yMax) * 220;
  return (
    <svg
      className="lesson-chart"
      viewBox="0 0 620 340"
      role="img"
      aria-label={`${xLabel}与${yLabel}：${points.map((p) => `${p.x}对应${fmt(p.y)}`).join('，')}`}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <path d={`M70 ${55 + i * 55}H550`} className="grid-line" />
          <text x="52" y={61 + i * 55} textAnchor="end">
            {fmt(yMax - (i * yMax) / 4)}
          </text>
        </g>
      ))}
      <path d="M70 38V275H560" className="chart-axis" />
      {Array.from({ length: xMax + 1 }, (_, x) => (
        <text key={x} x={px(x)} y="306" textAnchor="middle">
          {x}
        </text>
      ))}
      <text x="14" y="26">
        {yLabel}
      </text>
      <text x="555" y="335" textAnchor="end">
        {xLabel}
      </text>
      {reference &&
        records.map((p) => (
          <g key={p.x}>
            <path
              d={`M${px(p.x)} ${py(p.y)}V${py(points.find((q) => q.x === p.x)?.y ?? p.y)}`}
              className="error-stroke"
            />
            <circle cx={px(p.x)} cy={py(p.y)} r="9" className="reference-dot" />
          </g>
        ))}
      <polyline
        points={points.map((p) => `${px(p.x)},${py(p.y)}`).join(' ')}
        className="chart-line"
      />
      {points.map((p) => (
        <g key={p.x}>
          <circle
            cx={px(p.x)}
            cy={py(p.y)}
            r={p.x === activeX ? 10 : 6}
            className={p.x === activeX ? 'highlight-dot' : 'chart-dot'}
          />
          <text x={px(p.x) + 13} y={py(p.y) - 13} className="chart-value">
            {fmt(p.y)}
          </text>
        </g>
      ))}
    </svg>
  );
}

function GoBoard({ step }: { step: number }) {
  return (
    <svg
      className="go-board"
      viewBox="0 0 360 360"
      role="img"
      aria-label="围棋局面，候选落点 A、B、C"
    >
      <rect x="10" y="10" width="340" height="340" rx="8" fill="#e2c397" />
      {Array.from({ length: 9 }, (_, i) => (
        <path
          key={i}
          d={`M${44 + i * 34} 44V316M44 ${44 + i * 34}H316`}
          stroke="#a08057"
        />
      ))}
      {[
        [3, 3],
        [4, 3],
        [3, 4],
        [4, 4],
        [5, 3],
        [2, 4],
        [4, 5],
        [5, 4],
      ].map(([x, y], i) => (
        <circle
          key={i}
          cx={44 + x * 34}
          cy={44 + y * 34}
          r="14"
          fill={i % 2 ? '#fffcf5' : '#233444'}
          stroke={i % 2 ? '#c7b99f' : '#233444'}
        />
      ))}
      {[
        [2, 3],
        [5, 5],
        [3, 5],
      ].map(([x, y], i) => (
        <g key={i}>
          <circle
            cx={44 + x * 34}
            cy={44 + y * 34}
            r="15"
            fill={step === 2 && i === 0 ? '#087f78' : '#fcf8ef'}
            stroke="#087f78"
            strokeWidth="2"
          />
          <text
            x={44 + x * 34}
            y={50 + y * 34}
            textAnchor="middle"
            fill={step === 2 && i === 0 ? 'white' : '#087f78'}
            fontSize="17"
          >
            {['A', 'B', 'C'][i]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function Model({ kind, step }: { kind: string; step: number }) {
  const [a, b] =
    kind === 'training'
      ? [
          [4, 2],
          [5, 1],
          [5, 2],
        ][step]
      : kind === 'parameters'
        ? [
            [4, 2],
            [5, 2],
            [5, 3],
          ][step]
        : [4, 2];
  if (kind === 'model')
    return (
      <>
        <Note>校园活动 · 自编教学数据</Note>
        <div className="records-row">
          {records.map(({ x, y }) => (
            <div key={x}>
              <span>{x} 队</span>
              <strong>
                {y}
                <small>人</small>
              </strong>
            </div>
          ))}
        </div>
        <div className="model-rule">
          {step === 0 ? (
            <p>
              队数 → <span className="unknown">？</span> → 总人数
            </p>
          ) : step === 1 ? (
            <Equation>
              人数 = <em>a</em> × 队数 + <em>b</em>
            </Equation>
          ) : (
            <Equation>
              2 队：4 × 2 + 2 = <em>10</em>
              <span className="equation-aside">实际 12 人</span>
            </Equation>
          )}
        </div>
      </>
    );
  return (
    <>
      <Note>
        同一组活动记录 ·{' '}
        {kind === 'training' ? '参数调整为教学示意' : '一次只改一个参数'}
      </Note>
      <Compare
        left={
          <>
            <div className="parameter-values">
              <span>
                a <b>{a}</b>
              </span>
              <span>
                b <b>{b}</b>
              </span>
            </div>
            <Equation>
              人数 = {a} × 队数 + {b}
            </Equation>
            <table>
              <thead>
                <tr>
                  <th>队数</th>
                  <th>预测人数</th>
                  <th>实际人数</th>
                </tr>
              </thead>
              <tbody>
                {records.map(({ x, y }) => (
                  <tr key={x}>
                    <td>{x}</td>
                    <td className="teal">{predict(x, a, b)}</td>
                    <td>{y}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {kind === 'training' && (
              <div className="loss-score">
                误差 <strong>{loss(a, b)}</strong>
              </div>
            )}
          </>
        }
        right={
          <>
            <Chart
              points={records.map((p) => ({ x: p.x, y: predict(p.x, a, b) }))}
              reference
            />
            <div className="chart-legend">
              <span>● 预测</span>
              <span>○ 实际</span>
            </div>
          </>
        }
      />
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
  const k = scene.kind;
  if (k === 'chapter')
    return (
      <div className="chapter-bridge">
        <span className="chapter-rule" />
        <p>{scene.intro}</p>
      </div>
    );
  if (k === 'opening')
    return (
      <div className="opening-route">
        {[
          ['01', '下好一步棋'],
          ['02', '打好一次配合'],
          ['03', '查好一条信息'],
        ].map(([n, t]) => (
          <div key={n}>
            <span>{n}</span>
            <h2>{t}</h2>
          </div>
        ))}
      </div>
    );
  if (k === 'go')
    return (
      <>
        <Note>AlphaGo · 棋盘与搜索分支为教学示意</Note>
        <Compare
          left={<GoBoard step={step} />}
          right={
            <div className="search-tree">
              <div className="tree-origin">当前局面</div>
              <div className="tree-options">
                {['A', 'B', 'C'].map((s, i) => (
                  <div
                    key={s}
                    className={step === 2 && i === 0 ? 'chosen' : ''}
                  >
                    <strong>{s}</strong>
                    {step >= 1 && (
                      <div className="responses">
                        <span>回应 1</span>
                        <span>回应 2</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {step === 2 && <div className="tree-decision">优先探索 A →</div>}
            </div>
          }
        />
      </>
    );
  if (k === 'moba')
    return (
      <>
        <Note>《王者荣耀》研究 AI · 局面为教学示意</Note>
        <Compare
          left={
            <svg
              className="game-map"
              viewBox="0 0 500 350"
              role="img"
              aria-label="自己位于中间，队友在左下，对手在右上"
            >
              <rect
                x="20"
                y="20"
                width="460"
                height="310"
                rx="20"
                fill="#e5eae1"
              />
              <path
                d="M75 270V80H415M75 270H415V80M75 270L415 80"
                fill="none"
                stroke="#bdcfc5"
                strokeWidth="24"
              />
              <path d="M175 30L335 325" stroke="#a9ccda" strokeWidth="28" />
              {[
                [250, 178, '自己', '#087f78'],
                [108, 260, '队友', '#315b84'],
                [400, 85, '对手', '#bc5a37'],
              ].map(([x, y, t, c]) => (
                <g key={t}>
                  <circle cx={x} cy={y} r="31" fill={String(c)} />
                  <text
                    x={x}
                    y={Number(y) + 7}
                    fill="white"
                    textAnchor="middle"
                    fontSize="20"
                  >
                    {t}
                  </text>
                </g>
              ))}
              {step >= 1 && (
                <g
                  stroke="#087f78"
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray="7 5"
                >
                  <path d="M272 157L365 108M222 193L140 240" />
                </g>
              )}
            </svg>
          }
          right={
            <div className="decision-stack">
              <div className={step === 0 ? 'decision-focus' : ''}>
                <span>观察</span>
                <strong>位置 · 队友 · 视野</strong>
              </div>
              <div className={step === 1 ? 'decision-focus' : ''}>
                <span>选择</span>
                <strong>{step >= 1 ? '追击 / 支援' : '下一步行动'}</strong>
              </div>
              <div className={step === 2 ? 'decision-focus' : ''}>
                <span>反馈</span>
                <strong>
                  {step >= 2 ? '结果 → 训练时调整' : '行动之后的结果'}
                </strong>
              </div>
            </div>
          }
        />
      </>
    );
  if (k === 'website')
    return (
      <div className="task-scene">
        <Note>现场演示 · 学校官网</Note>
        <div className="task-number">
          2<span>条近期校园活动</span>
        </div>
        <div className="task-fields">
          {['活动名称', '活动时间', '主要内容'].map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>
        <Flow items={['提出要求', '查找通知', '核对原文']} active={step} />
      </div>
    );
  if (k === 'flow')
    return (
      <>
        <div className="four-concepts">
          {[
            ['表示', '文字 → 数字'],
            ['训练', '反馈 → 参数'],
            ['生成', '上下文 → 后续'],
            ['行动', '指令 → 工具'],
          ].map(([t, d], i) => (
            <div key={t} className={i === step ? 'concept-active' : ''}>
              <span>0{i + 1}</span>
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <Note>系统流程示意；训练发生在使用之前</Note>
      </>
    );
  if (['model', 'parameters', 'training'].includes(k))
    return <Model kind={k} step={step} />;
  if (k === 'error')
    return (
      <>
        <Note>沿用 a = 4、b = 2 的三次预测</Note>
        <div className="errors-row">
          {records.map(({ x, y }, i) => (
            <div key={x}>
              <span>{x} 队</span>
              <div className="error-pair">
                {predict(x, 4, 2)} <small>/ 实际 {y}</small>
              </div>
              <strong>{step >= 1 ? `差 ${i + 1}` : '？'}</strong>
              {step >= 2 && (
                <div className="square-units">
                  {Array.from({ length: (i + 1) ** 2 }, (_, j) => (
                    <i key={j} />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        {step >= 2 && (
          <Equation>
            1² + 2² + 3² = <em>14</em>
          </Equation>
        )}
      </>
    );
  if (k === 'direction') {
    const a = [4, 6, 5][step];
    return (
      <>
        <Note>固定 b = 2 · 横轴改为参数 a</Note>
        <Compare
          left={
            <Chart
              points={[3, 4, 5, 6, 7].map((x) => ({ x, y: loss(x, 2) }))}
              xMax={7}
              yMax={60}
              xLabel="参数 a"
              yLabel="误差"
              activeX={a}
            />
          }
          right={
            <div className="big-metric">
              <span>a = {a}</span>
              <strong>{loss(a, 2)}</strong>
              <p>三条记录的总误差</p>
            </div>
          }
        />
      </>
    );
  }
  if (k === 'derive')
    return (
      <>
        <Note>进一步看算式 · 固定 b = 2</Note>
        <div className="algebra-lines">
          {[
            '(a + 2) − 7 = a − 5',
            '(2a + 2) − 12 = 2(a − 5)',
            '(3a + 2) − 17 = 3(a − 5)',
          ].map((t) => (
            <div key={t}>{t}</div>
          ))}
        </div>
        {step === 1 && (
          <Equation>(a − 5)² + [2(a − 5)]² + [3(a − 5)]²</Equation>
        )}
        {step >= 2 && <Equation>误差 = (1 + 4 + 9)(a − 5)²</Equation>}
        {step >= 2 && (
          <div className="answer-strip">
            a = 5 <span>→</span> 14 × 0² = <b>0</b>
          </div>
        )}
      </>
    );
  if (k === 'generalization')
    return (
      <>
        <Note>旧模型保持：人数 = 5 × 队数 + 2</Note>
        <Compare
          left={
            <div className="case-panel">
              <span className="case-label">新数据 · 原条件</span>
              <h2>4 队参赛</h2>
              <Equation>
                5 × 4 + 2 = <em>22</em>
              </Equation>
              <p>{step >= 1 ? '新记录：实际 22 人 ✓' : '实际人数，待验证'}</p>
            </div>
          }
          right={
            <div className={`case-panel ${step < 2 ? 'unrevealed' : ''}`}>
              <span className="case-label">新条件 · 裁判变多</span>
              <h2>裁判从 2 人变成 4 人</h2>
              <Equation>
                实际人数 = <em>24</em>
              </Equation>
              <p>旧模型仍预测 22 人</p>
            </div>
          }
        />
      </>
    );
  if (k === 'reward')
    return (
      <>
        <Note>自编的两组模拟结果 · 并非策略优劣的实际证据</Note>
        <div className="reward-key">
          <span>
            胜利 <b>+1</b>
          </span>
          <span>
            失败 <b>−1</b>
          </span>
        </div>
        {[4, 7].map((wins, i) => (
          <div className="reward-line" key={wins}>
            <strong>{i ? '回去支援' : '继续追击'}</strong>
            <div className="game-results">
              {Array.from({ length: 10 }, (_, j) => (
                <span key={j} className={j < wins ? 'win' : 'lose'}>
                  {j < wins ? '胜' : '负'}
                </span>
              ))}
            </div>
            <span className="reward-value">
              {step >= 1 ? `${reward(wins)}` : '？'}
            </span>
          </div>
        ))}
        {step >= 1 && <Equation>平均回报 = (胜场 − 负场) ÷ 总场数</Equation>}
        {step >= 2 && (
          <div className="answer-strip">更多局面 · 更多练习 · 更长期的结果</div>
        )}
      </>
    );
  if (k === 'tokens')
    return (
      <>
        <Note>教学片段与编号 · 非真实分词器输出</Note>
        {step === 0 ? (
          <div className="hero-sentence">“请打开学校官网”</div>
        ) : (
          <div className="tokens">
            {['请', '打开', '学校', '官网'].map((t, i) => (
              <div key={t}>
                <strong>{t}</strong>
                {step >= 2 && (
                  <>
                    <span>↓</span>
                    <b>{[18, 206, 57, 902][i]}</b>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {step >= 2 && (
          <div className="answer-strip">
            编号 <span>→</span> [ 一串可计算的数 ]
          </div>
        )}
      </>
    );
  if (k === 'embedding')
    return (
      <>
        <Note>二维坐标人为指定 · 仅用于类比数字表示</Note>
        <Compare
          left={
            <svg
              className="lesson-chart"
              viewBox="0 0 600 340"
              role="img"
              aria-label="运动会坐标1,1，接力赛2,1，图书馆5,4"
            >
              <path d="M65 35V275H560" className="chart-axis" />
              {[1, 2, 3, 4, 5].map((n) => (
                <g key={n}>
                  <path d={`M${65 + n * 87} 40V275`} className="grid-line" />
                  <text x={60 + n * 87} y="305">
                    {n}
                  </text>
                  <text x="35" y={280 - n * 47}>
                    {n}
                  </text>
                </g>
              ))}
              {step >= 1 &&
                [
                  [152, 228, '运动会 (1,1)'],
                  [239, 228, '接力赛 (2,1)'],
                  [500, 87, '图书馆 (5,4)'],
                ].map(([x, y, t], i) => (
                  <g key={t}>
                    <circle cx={x} cy={y} r="8" className="chart-dot" />
                    <text
                      x={Number(x) - 60}
                      y={Number(y) + (i === 0 ? 28 : -20)}
                    >
                      {t}
                    </text>
                  </g>
                ))}
            </svg>
          }
          right={
            <div className="representation">
              <span>学号 12、13</span>
              <h2>
                编号相邻
                <br />≠ 兴趣相似
              </h2>
              {step >= 2 && <Equation>(1, 1) → [ …更多数… ]</Equation>}
            </div>
          }
        />
      </>
    );
  if (k === 'weight') {
    const w = step === 2 ? 0.3 : 0.6;
    return (
      <>
        <Note>活动评分类比 · 网络权重不必为正或加起来等于 1</Note>
        <div className="weighted-inputs">
          <div>
            <span>完成度</span>
            <strong>8</strong>
            <b>× {w}</b>
          </div>
          <span className="plus-sign">+</span>
          <div>
            <span>合作表现</span>
            <strong>6</strong>
            <b>× {fmt(1 - w)}</b>
          </div>
        </div>
        <div className="weight-ribbon">
          <div style={{ flex: w }}>完成度 {w * 100}%</div>
          <div style={{ flex: 1 - w }}>合作 {fmt((1 - w) * 100)}%</div>
        </div>
        {step >= 1 && (
          <Equation>
            {fmt(8 * w)} + {fmt(6 * (1 - w))} ={' '}
            <em>{fmt(8 * w + 6 * (1 - w))}</em>
          </Equation>
        )}
      </>
    );
  }
  if (k === 'linear')
    return (
      <>
        <Compare
          left={
            <div className="linear-rule">
              <Note>{step < 2 ? '两个直线规则叠加' : '加入新的函数规则'}</Note>
              <Equation>
                {step === 0
                  ? '2 × (3x + 1) + 4'
                  : step === 1
                    ? '6x + 6'
                    : 'y = max(0, x)'}
              </Equation>
              {step === 2 && (
                <p>
                  负数 → 0<br />
                  非负数 → 保持原样
                </p>
              )}
            </div>
          }
          right={
            step < 2 ? (
              <Chart
                points={[0, 1, 2, 3].map((x) => ({ x, y: 6 * x + 6 }))}
                xMax={3}
                yMax={24}
                xLabel="输入 x"
                yLabel="输出 y"
              />
            ) : (
              <svg
                className="lesson-chart"
                viewBox="0 0 600 340"
                role="img"
                aria-label="负数归零函数图：负数部分为水平线，正数部分向上倾斜"
              >
                <path d="M60 270H550M280 300V40" className="chart-axis" />
                <path d="M65 270H280L510 65" className="chart-line" />
                <text x="70" y="305">
                  负数
                </text>
                <text x="275" y="305">
                  0
                </text>
                <text x="460" y="305">
                  正数
                </text>
              </svg>
            )
          }
        />
      </>
    );
  if (k === 'network') {
    const t = step === 3 ? 3 : 2,
      n = network(3, t);
    return (
      <>
        <Note>微型教学网络 · 输入固定 x = 3</Note>
        <div className="mini-network">
          <div className="network-circle">
            <span>输入</span>
            <strong>3</strong>
          </div>
          <div className="network-branches">
            {[
              [1, n.a, 'A'],
              [t, n.b, 'B'],
            ].map(([v, out, name]) => (
              <div key={name}>
                <span>支路 {name}</span>
                <b>3 − {v}</b>
                <small>负数归零</small>
                <strong>{step >= 1 ? out : '？'}</strong>
              </div>
            ))}
          </div>
          <div className="network-circle output">
            <span>相加</span>
            <strong>{step >= 2 ? n.y : '？'}</strong>
          </div>
        </div>
        {step >= 2 && (
          <Equation>
            {n.a} + {n.b} = <em>{n.y}</em>
          </Equation>
        )}
      </>
    );
  }
  if (k === 'network-table') {
    const xs = [0, 1, 2, 3, 4].filter((x) => x <= [1, 2, 4][step]);
    return (
      <>
        <Note>A：x − 1 后归零；B：x − 2 后归零；最后相加</Note>
        <Compare
          left={
            <table className="network-table">
              <thead>
                <tr>
                  <th>输入 x</th>
                  <th>支路 A</th>
                  <th>支路 B</th>
                  <th>输出 y</th>
                </tr>
              </thead>
              <tbody>
                {xs.map((x) => {
                  const n = network(x);
                  return (
                    <tr key={x}>
                      <td>{x}</td>
                      <td>{n.a}</td>
                      <td>{n.b}</td>
                      <td className="teal">{n.y}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          }
          right={
            <Chart
              points={xs.map((x) => ({ x, y: network(x).y }))}
              yMax={6}
              xLabel="输入 x"
              yLabel="输出 y"
            />
          }
        />
      </>
    );
  }
  if (k === 'foundation')
    return (
      <div className="foundation-scene">
        <div className={`computation-web ${step === 0 ? 'single-node' : ''}`}>
          {Array.from({ length: 15 }, (_, i) => (
            <div key={i} className={i === 7 ? 'core-node' : ''}>
              {i === 7 ? '乘 → 加 → 函数' : '× + ƒ'}
            </div>
          ))}
        </div>
        {step >= 2 && (
          <div className="answer-strip">
            数学 <span>＋</span> 数据 <span>＋</span> 训练方法 <span>＋</span>{' '}
            工程
          </div>
        )}
      </div>
    );
  if (k === 'language-training')
    return (
      <>
        <Note>文字练习示意 · 不代表一次练习就能形成能力</Note>
        <div className="hero-sentence">
          运动会项目包括 <mark>{step === 1 ? '？' : '接力赛'}</mark>
        </div>
        <Flow
          items={['取一段文字', '预测后续', '对照原文、调整']}
          active={step}
        />
      </>
    );
  if (k === 'attention')
    return (
      <>
        <Note>虚构通知 · 高亮为阅读类比，权重非实测</Note>
        <div className="question-label">
          {step === 0 ? '在哪里举行？' : '什么时候举行？'}
        </div>
        <blockquote className="school-notice">
          <mark className={step > 0 ? 'selected' : ''}>本周五</mark>
          ，初二年级将在
          <mark className={step === 0 ? 'selected' : ''}>操场</mark>举行接力赛。
          <br />
          <mark className={step > 0 ? 'selected' : ''}>遇雨顺延到下周一。</mark>
        </blockquote>
        {step === 2 && (
          <div className="attention-weights">
            <span>信息甲 · 60%</span>
            <span>信息乙 · 30%</span>
            <span>丙 · 10%</span>
          </div>
        )}
        {step === 2 && <Note>加权组合的是数字表示，不是把两个日期平均。</Note>}
      </>
    );
  if (k === 'probability') {
    const weights = [6, 3, 1],
      probs = normalize(weights);
    return (
      <>
        <Note>候选与数值为教学示意 · 选择概率不等于事实正确率</Note>
        <div className="question-label">运动会项目包括……</div>
        <div className="probabilities">
          {['接力赛', '跳远', '其他'].map((t, i) => (
            <div key={t}>
              <strong>{t}</strong>
              <div className="probability-track">
                <span
                  style={{ width: step === 0 ? '0%' : `${probs[i] * 100}%` }}
                />
              </div>
              <b>
                {step === 0
                  ? '分数'
                  : step === 1
                    ? `权重 ${weights[i]}`
                    : `${weights[i]} ÷ 10 = ${probs[i] * 100}%`}
              </b>
            </div>
          ))}
        </div>
        {step >= 3 && (
          <div className="answer-strip">
            运动会项目包括 <b>接力赛</b> <span>→ 继续生成</span>
          </div>
        )}
      </>
    );
  }
  if (k === 'inference')
    return (
      <Compare
        left={
          <div className={`case-panel ${step > 0 ? 'softened' : ''}`}>
            <span className="case-label">训练时</span>
            <h2>参数会调整</h2>
            <div className="training-loop">预测 → 比较 → 调整 ↻</div>
          </div>
        }
        right={
          <div className={`case-panel ${step === 0 ? 'unrevealed' : ''}`}>
            <span className="case-label">这次回答时</span>
            <h2>参数通常保持不变</h2>
            <p>
              {step === 1 ? '读入问题和当前通知' : '本周五；遇雨顺延到下周一。'}
            </p>
            {step === 2 && (
              <div className="answer-strip">生成内容 → 接回上下文 ↻</div>
            )}
          </div>
        }
      />
    );
  if (k === 'tools')
    return (
      <>
        <Note>工具反馈循环 · 教学示意</Note>
        <div className="tool-loop">
          <div className="tool-node">
            <span>生成与判断</span>
            <strong>模型</strong>
          </div>
          <div className="tool-message" key={step}>
            {
              ['打开官网 →', '← 网页信息', '打开活动通知 →', '回答 + 原文来源'][
                step
              ]
            }
          </div>
          <div className="tool-node">
            <span>执行与返回</span>
            <strong>浏览器</strong>
          </div>
        </div>
        <Flow
          items={['生成指令', '执行操作', '返回资料', '继续处理']}
          active={step}
        />
      </>
    );
  if (k === 'hallucination')
    return (
      <>
        <Note>沿用前面的虚构通知</Note>
        <Compare
          left={
            <div className={`case-panel ${step > 0 ? 'softened' : ''}`}>
              <span className="case-label">有通知</span>
              <h2>本周五</h2>
              <p>遇雨顺延到下周一</p>
            </div>
          }
          right={
            <div className={`case-panel ${step === 0 ? 'unrevealed' : ''}`}>
              <span className="case-label">没有通知</span>
              <h2>{step === 1 ? '真实日期：未知' : '先查资料'}</h2>
              <p>
                {step === 1
                  ? '“听起来像”不能证明日期'
                  : '找原文，核对条件与时间'}
              </p>
            </div>
          }
        />
      </>
    );
  if (k === 'recap')
    return (
      <>
        <Note>回到开场的学校官网任务 · 流程示意</Note>
        <div className="recap-path">
          {[
            ['你的要求', '查两条校园活动'],
            ['模型与工具', '读通知，整理信息'],
            ['你的核实', '打开原文，检查时间'],
          ].map(([t, d], i) => (
            <div className={i === step ? 'recap-current' : ''} key={t}>
              <span>0{i + 1}</span>
              <h2>{t}</h2>
              <p>{d}</p>
            </div>
          ))}
        </div>
        <div className="answer-strip">
          数字表示 <span>→</span> 模型计算 <span>→</span> 工具执行{' '}
          <span>→</span> 人来核实
        </div>
      </>
    );
  if (k === 'fake')
    return (
      <>
        <Note>虚构情境 · 并非真实学校通知</Note>
        <div className="rumor">
          <span className="rumor-icon">▷</span>
          <div>
            <span>群里转来一段视频</span>
            <h2>“老师说，明天停课？”</h2>
          </div>
        </div>
        {step >= 1 && (
          <Flow
            items={['查正式通知', '联系熟悉的人', '未核实，不转发']}
            active={step === 1 ? 1 : 2}
          />
        )}
      </>
    );
  if (k === 'care')
    return (
      <div className="principles">
        {[
          ['判断', '核实事实', '查来源、看条件，保留自己的思考'],
          ['隐私', '保护信息', '自己和同学的信息，都需要保护'],
          ['规则', '说明协助', '按要求使用，注明 AI 的参与'],
        ].map(([tag, t, d], i) => (
          <div className={step === i ? 'principle-active' : ''} key={t}>
            <span>{tag}</span>
            <h2>{t}</h2>
            <p>{d}</p>
          </div>
        ))}
      </div>
    );
  if (k === 'learning')
    return (
      <div className="learning-pillars">
        {[
          ['数学', '看懂计算', '变量 · 误差 · 概率'],
          ['阅读与探究', '问清问题', '条件 · 假设 · 证据'],
          ['实践与创造', '做出作品', '制作 · 验证 · 改进'],
        ].map(([t, d, small], i) => (
          <div className={step === i ? 'pillar-active' : ''} key={t}>
            <span>0{i + 1}</span>
            <h2>{t}</h2>
            <strong>{d}</strong>
            <p>{small}</p>
          </div>
        ))}
      </div>
    );
  return (
    <div className="closing-line">
      <span>理解原理</span>
      <i>／</i>
      <span>核实结果</span>
      <i>／</i>
      <span>动手创造</span>
    </div>
  );
}
