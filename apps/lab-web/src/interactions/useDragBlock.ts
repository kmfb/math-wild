import { useCallback, useMemo, useState, type PointerEvent, type RefObject } from "react";
import type { Block, Side } from "@math-wild/concept-core";

export type DragPoint = {
  x: number;
  y: number;
};

type DragState = {
  block: Block;
  side: Side;
  start: DragPoint;
  current: DragPoint;
};

type DropPayload = {
  block: Block;
  side: Side;
  point: DragPoint;
};

export function useDragBlock(
  svgRef: RefObject<SVGSVGElement | null>,
  onDrop: (payload: DropPayload) => void,
) {
  const [drag, setDrag] = useState<DragState | null>(null);

  const svgPoint = useCallback(
    (event: PointerEvent<SVGElement>): DragPoint => {
      const svg = svgRef.current;
      if (!svg) {
        return { x: event.clientX, y: event.clientY };
      }
      const point = svg.createSVGPoint();
      point.x = event.clientX;
      point.y = event.clientY;
      const matrix = svg.getScreenCTM();
      if (!matrix) {
        return { x: event.clientX, y: event.clientY };
      }
      const transformed = point.matrixTransform(matrix.inverse());
      return { x: transformed.x, y: transformed.y };
    },
    [svgRef],
  );

  const bindBlock = useCallback(
    (block: Block, side: Side, origin: DragPoint) => ({
      onPointerDown: (event: PointerEvent<SVGElement>) => {
        if (block.kind !== "unit") {
          return;
        }
        event.preventDefault();
        event.currentTarget.setPointerCapture(event.pointerId);
        const point = svgPoint(event);
        setDrag({ block, side, start: point, current: point });
      },
      onPointerMove: (event: PointerEvent<SVGElement>) => {
        setDrag((current) => {
          if (!current || current.block.id !== block.id) {
            return current;
          }
          return { ...current, current: svgPoint(event) };
        });
      },
      onPointerUp: (event: PointerEvent<SVGElement>) => {
        event.preventDefault();
        setDrag((current) => {
          if (current && current.block.id === block.id) {
            onDrop({ block: current.block, side: current.side, point: svgPoint(event) });
          }
          return null;
        });
      },
      transform: drag?.block.id === block.id
        ? `translate(${drag.current.x - drag.start.x}, ${drag.current.y - drag.start.y})`
        : undefined,
      isDragging: drag?.block.id === block.id,
      origin,
    }),
    [drag, onDrop, svgPoint],
  );

  return useMemo(() => ({ drag, bindBlock }), [bindBlock, drag]);
}
