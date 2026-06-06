type PanProps = {
  x: number;
  y: number;
};

export default function Pan({ x, y }: PanProps) {
  return (
    <g className="svg-pan" transform={`translate(${x}, ${y})`}>
      <path d="M -88 24 Q 0 52 88 24" />
      <path d="M -98 21 H 98" />
    </g>
  );
}
