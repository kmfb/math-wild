type UnknownBlockProps = {
  x: number;
  y: number;
  reveal?: boolean;
};

export default function UnknownBlock({ x, y, reveal = false }: UnknownBlockProps) {
  return (
    <g className={reveal ? "svg-unknown is-reveal" : "svg-unknown"} transform={`translate(${x}, ${y})`}>
      <rect x={-32} y={-24} width={64} height={48} rx={8} />
      <text textAnchor="middle" dominantBaseline="central">
        x
      </text>
    </g>
  );
}
