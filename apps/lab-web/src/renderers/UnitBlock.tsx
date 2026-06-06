type UnitBlockProps = {
  x: number;
  y: number;
  active?: boolean;
};

export default function UnitBlock({ x, y, active = false }: UnitBlockProps) {
  return (
    <g className={active ? "svg-block is-active" : "svg-block"} transform={`translate(${x}, ${y})`}>
      <rect x={-18} y={-18} width={36} height={36} rx={7} />
      <path d="M -11 -8 H 11" />
    </g>
  );
}
