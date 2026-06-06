import { useCallback, useMemo, useRef } from "react";
import type { BalanceState, Block, Side } from "@math-wild/concept-core";
import { sideValue } from "@math-wild/concept-core";
import { useDragBlock } from "../interactions/useDragBlock";
import Pan from "./Pan";
import UnitBlock from "./UnitBlock";
import UnknownBlock from "./UnknownBlock";

type BalanceSvgProps = {
  state: BalanceState;
  onRemoveUnit: (side: Side, blockId: string) => void;
};

const REMOVE_ZONE_Y = 472;

function unitPosition(index: number, side: Side) {
  const baseX = side === "left" ? 278 : 594;
  const col = index % 4;
  const row = Math.floor(index / 4);
  return { x: baseX + col * 44, y: 304 - row * 42 };
}

function renderBlocks(blocks: Block[], side: Side, bindBlock: ReturnType<typeof useDragBlock>["bindBlock"]) {
  let unitIndex = 0;
  return blocks.map((block) => {
    if (block.kind === "unknown") {
      return <UnknownBlock key={block.id} x={side === "left" ? 230 : 546} y={304} />;
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
        <UnitBlock x={point.x} y={point.y} active={isDragging} />
      </g>
    );
  });
}

export default function BalanceSvg({ state, onRemoveUnit }: BalanceSvgProps) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const tilt = state.status === "unbalanced" ? (sideValue("left", state) > sideValue("right", state) ? -5 : 5) : 0;
  const statusClass = `balance-svg is-${state.status}`;

  const handleDrop = useCallback(
    ({ block, side, point }: { block: Block; side: Side; point: { x: number; y: number } }) => {
      if (point.y >= REMOVE_ZONE_Y && block.kind === "unit") {
        onRemoveUnit(side, block.id);
      }
    },
    [onRemoveUnit],
  );

  const { bindBlock } = useDragBlock(svgRef, handleDrop);
  const leftBlocks = useMemo(() => renderBlocks(state.left, "left", bindBlock), [bindBlock, state.left]);
  const rightBlocks = useMemo(() => renderBlocks(state.right, "right", bindBlock), [bindBlock, state.right]);

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
        x + 3 = 8
      </text>
      <text className="svg-side-label" x="304" y="388" textAnchor="middle">
        left: {sideValue("left", state)}
      </text>
      <text className="svg-side-label" x="596" y="388" textAnchor="middle">
        right: {sideValue("right", state)}
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
