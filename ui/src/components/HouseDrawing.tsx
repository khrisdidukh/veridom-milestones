// Copyright (C) 2026 Veridom (Khrystyna Didukh)
// SPDX-License-Identifier: Apache-2.0
//
// An elevation drawing of the house that is drawn in as stages are proven:
// dashed while planned, inked when an inspector-backed proof is on chain,
// hatched when the tranche is requested, toned when it is paid.

import { StageStatus } from '@veridom/milestones-contract';
import type { ReactNode } from 'react';

type Props = {
  stageCount: number;
  statuses: Map<number, StageStatus>;
  names: readonly string[];
  justProven: number | null;
};

// `pl` is set only while a stage is being inked in: pathLength=1 lets the CSS
// animate any shape's stroke from 0 to 1, but it would also rescale the dash
// pattern of planned stages, so it is left off otherwise.
const PARTS: { label: [number, number]; anchor: [number, number]; draw: (pl?: number) => ReactNode }[] = [
  {
    // Foundation: slab and strip footings, partly below ground.
    anchor: [120, 318],
    label: [36, 372],
    draw: (pl) => (
      <>
        <rect x="110" y="298" width="420" height="22" pathLength={pl} />
        <rect x="118" y="320" width="34" height="34" pathLength={pl} />
        <rect x="303" y="320" width="34" height="34" pathLength={pl} />
        <rect x="488" y="320" width="34" height="34" pathLength={pl} />
      </>
    ),
  },
  {
    // Shell: load-bearing walls and the slab between floors.
    anchor: [140, 200],
    label: [36, 214],
    draw: (pl) => (
      <>
        <rect x="130" y="152" width="380" height="146" pathLength={pl} />
        <line x1="130" y1="226" x2="510" y2="226" pathLength={pl} />
      </>
    ),
  },
  {
    // Roof: rafters, ridge and eaves.
    anchor: [200, 112],
    label: [36, 96],
    draw: (pl) => (
      <>
        <polygon points="104,154 320,44 536,154" pathLength={pl} />
        <line x1="150" y1="154" x2="320" y2="66" pathLength={pl} />
      </>
    ),
  },
  {
    // Windows, door and the gable window: the building envelope closes.
    anchor: [470, 190],
    label: [574, 176],
    draw: (pl) => (
      <>
        <rect x="166" y="170" width="58" height="42" pathLength={pl} />
        <rect x="416" y="170" width="58" height="42" pathLength={pl} />
        <rect x="166" y="242" width="58" height="42" pathLength={pl} />
        <rect x="416" y="242" width="58" height="42" pathLength={pl} />
        <rect x="296" y="232" width="48" height="66" pathLength={pl} />
        <rect x="302" y="104" width="36" height="30" pathLength={pl} />
      </>
    ),
  },
  {
    // Building services: risers, distribution and the flue.
    anchor: [262, 260],
    label: [574, 268],
    draw: (pl) => (
      <>
        <line x1="262" y1="296" x2="262" y2="160" pathLength={pl} />
        <line x1="378" y1="296" x2="378" y2="160" pathLength={pl} />
        <line x1="262" y1="270" x2="378" y2="270" pathLength={pl} />
        <rect x="430" y="62" width="22" height="56" pathLength={pl} />
      </>
    ),
  },
  {
    // Finishes and handover: plinth, render line, entrance steps, gutter.
    anchor: [470, 304],
    label: [574, 340],
    draw: (pl) => (
      <>
        <rect x="130" y="286" width="380" height="12" pathLength={pl} />
        <rect x="282" y="298" width="76" height="10" pathLength={pl} />
        <line x1="98" y1="160" x2="542" y2="160" pathLength={pl} />
      </>
    ),
  },
];

const className = (inPlan: boolean, status: StageStatus | undefined, justProven: boolean): string => {
  if (!inPlan) return 'part part-out';
  if (status === undefined || status === StageStatus.Pending) return 'part part-planned';
  const base =
    status === StageStatus.TrancheReleased ? 'part part-paid' : status === StageStatus.TrancheRequested ? 'part part-requested' : 'part part-proven';
  return justProven ? `${base} part-drawing` : base;
};

export function HouseDrawing({ stageCount, statuses, names, justProven }: Props) {
  const proven = [...statuses.values()].filter((s) => s !== StageStatus.Pending).length;
  return (
    <figure className="drawing" aria-label={`Elevation drawing: ${proven} of ${stageCount} stages proven`}>
      <svg viewBox="0 0 760 400" role="img">
        <defs>
          <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="7" className="hatch-line" />
          </pattern>
          <pattern id="earth" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(-45)">
            <line x1="0" y1="0" x2="0" y2="10" className="earth-line" />
          </pattern>
        </defs>
        <rect x="20" y="320" width="560" height="44" fill="url(#earth)" className="earth" />
        <line x1="20" y1="320" x2="580" y2="320" className="ground" />
        {PARTS.map((part, i) => {
          const inPlan = i < stageCount;
          const status = statuses.get(i);
          const cls = className(inPlan, status, justProven === i);
          return (
            <g key={`${i}-${status ?? 'p'}`} className={cls}>
              {part.draw(justProven === i ? 1 : undefined)}
              {inPlan && (
                <g className="callout">
                  <line x1={part.anchor[0]} y1={part.anchor[1]} x2={part.label[0] + (part.label[0] < 300 ? 16 : -8)} y2={part.label[1] - 4} />
                  <circle cx={part.label[0]} cy={part.label[1] - 5} r="10" />
                  <text x={part.label[0]} y={part.label[1] - 1} textAnchor="middle" className="callout-num">
                    {i + 1}
                  </text>
                  <text x={part.label[0] + (part.label[0] < 300 ? 0 : 16)} y={part.label[1] + 19} textAnchor={part.label[0] < 300 ? 'start' : 'start'} className="callout-text">
                    {names[i]}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <figcaption>
        <span className="legend legend-planned">Planned</span>
        <span className="legend legend-proven">Proven on chain</span>
        <span className="legend legend-requested">Tranche requested</span>
        <span className="legend legend-paid">Paid out</span>
      </figcaption>
    </figure>
  );
}
