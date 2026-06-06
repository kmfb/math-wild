import { useCallback, useMemo, useRef } from "react";
import type { BalanceState, Block, Side } from "@math-wild/concept-core";
import type { Feedback } from "@math-wild/math-kernel";
import type { EquationMeasurements } from "@math-wild/math-worlds/equation-balance";
import { useDragBlock } from "../interactions/useDragBlock";
import Pan from "./Pan";
import UnitBlock from "./UnitBlock";
import UnknownBlock from "./UnknownBlock";

type BalanceSvgProps = {
  state: BalanceState;
  equation: string;
  feedback: Feedback;
  measurements: EquationMeasurements;
  onRemoveUnit: (side: Side, blockId: string) => void;
};

const REMOVE_ZONE_Y = 472;

function unitPosition(index: number, side: Side) {
  const baseX = side === "left" ? 278 : 594;
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { x: baseX + col * 44, y: 304 - row * 42 };
}

function renderBlocks(
  blocks: Block[],
  side: Side,
  bindBlock: ReturnType<typeof useDragBlock>["bindBlock"],
  reveal: boolean,
) {
  let unitIndex = 0;
  return blocks.map((block) => {
    if (block.kind === "unknown") {
      return <UnknownBlock key={block.id} x={side === "left" ? 230 : 546} y={304} reveal={reveal} />;
    }
    const point = unitPosition(unitIndex, side);
    unitIndex += 1;
    const { transform, isDragging, origin: _origin, ...events } = bindBlock(block, side, point);
    return (
      <g
        key={block.id}
        className="draggable-block"
        transform={transform}
        style={{ touchAction: "none" }}
        {...events}
      >
        <UnitBlock x={point.x} y={point.y} active={isDragging} reveal={reveal && side === "right"} />
      </g>
    );
  });
}

function svgStatus(feedback: Feedback) {
  if (feedback.kind === "reveal" || feedback.kind === "celebration") {
    return "solved";
  }
  if (feedback.kind === "broken-equality" || feedback.kind === "unbalanced") {
    return "unbalanced";
  }
  return "balanced";
}

export default function BalanceSvg({ state, equation, feedback, measurements, onRemoveUnit }: BalanceSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const isBroken = feedback.kind === "broken-equality" || feedback.kind === "unbalanced";
  const isReveal = feedback.kind === "reveal" || feedback.kind === "celebration";
  const tilt = isBroken ? (measurements.delta > 0 ? -5 : 5) : 0;
  const statusClass = `balance-svg is-${svgStatus(feedback)}`;

  const handleDrop = useCallback(
    ({ block, side, point }: { block: Block; side: Side; point: { x: number; y: number } }) => {
      if (point.y >= REMOVE_ZONE_Y && block.kind === "unit") {
        onRemoveUnit(side, block.id);
      }
    },
    [onRemoveUnit],
  );

  const { bindBlock } = useDragBlock(svgRef, handleDrop);
  const leftBlocks = useMemo(() => renderBlocks(state.left, "left", bindBlock, isReveal), [bindBlock, isReveal, state.left]);
  const rightBlocks = useMemo(() => renderBlocks(state.right, "right", bindBlock, isReveal), [bindBlock, isReveal, state.right]);

  return (
    <svg ref={svgRef} className={statusClass} viewBox="0 0 900 560" role="img" aria-label="x plus 3 equals 8 balance lab">
      <rect className="svg-bg" x="0" y="0" width="900" height="560" rx="0" />
      <g transform={`rotate(${tilt} 450 252)`}>
        <line className="svg-beam" x1="226" y1="214" x2="674" y2="214" />
        <line className="svg-cable" x1="274" y1="214" x2="206" y2="330" />
        <line className="svg-cable" x1="352" y1="214" x2="402" y2="330" />
        <line className="svg-cable" x1="548" y1="214" x2="498" y2="330" />
        <line className="svg-cable" x1="626" y1="214" x2="694" y2="330" />
        <Pan x={304} y={330} />
        <Pan x={596} y={330} />
        {leftBlocks}
        {rightBlocks}
      </g>
      <circle className="svg-pivot" cx="450" cy="214" r="18" />
      <line className="svg-stand" x1="450" y1="226" x2="450" y2="402" />
      <ellipse className="svg-base" cx="450" cy="424" rx="72" ry="14" />
      <text className="svg-equation" x="450" y="104" textAnchor="middle">
        {equation}
      </text>
      <g className="svg-equality-core" aria-label="Visible equality invariant">
        <line className="svg-equality-line left" x1="370" y1="138" x2="430" y2="138" />
        <line className="svg-equality-line right" x1="470" y1="138" x2="530" y2="138" />
        <text x="450" y="145" textAnchor="middle">
          {isBroken ? "?" : "="}
        </text>
      </g>
      {isBroken && (
        <g className={`svg-ghost-repair is-${measurements.delta < 0 ? "right" : "left"}`}>
          <line x1={measurements.delta < 0 ? 330 : 570} y1="432" x2={measurements.delta < 0 ? 604 : 296} y2="304" />
          <rect x={measurements.delta < 0 ? 624 : 252} y="286" width="36" height="36" rx="7" />
        </g>
      )}
      {isReveal && (
        <g className="svg-reveal-links">
          {[0, 1, 2, 3, 4].map((index) => (
            <line key={index} x1="230" y1="304" x2={550 + index * 34} y2={274 + (index % 2) * 34} />
          ))}
          <text x="450" y="168" textAnchor="middle">
            x = 5
          </text>
        </g>
      )}
      <text className="svg-side-label" x="304" y="388" textAnchor="middle">
        left: {measurements.leftTotal}
      </text>
      <text className="svg-side-label" x="596" y="388" textAnchor="middle">
        right: {measurements.rightTotal}
      </text>
      <g className="svg-remove-zone">
        <rect x="124" y={REMOVE_ZONE_Y} width="652" height="64" rx="8" />
        <text x="450" y="511" textAnchor="middle">
          移除区
        </text>
      </g>
    </svg>
  );
}
