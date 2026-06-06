type UnitBlockProps = {
  x: number;
  y: number;
  active?: boolean;
  reveal?: boolean;
};

export default function UnitBlock({ x, y, active = false, reveal = false }: UnitBlockProps) {
  const className = ["svg-block", active ? "is-active" : "", reveal ? "is-reveal" : ""].filter(Boolean).join(" ");
  return (
    <g className={className} transform={`translate(${x}, ${y})`}>
      <rect x={-18} y={-18} width={36} height={36} rx={7} />
      <path d="M -11 -8 H 11" />
    </g>
  );
}
