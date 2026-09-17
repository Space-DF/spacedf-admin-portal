interface SvgAreaChartProps {
  title: string;
  labelsX: string[];
  labelsY: number[];
  minY: number;
  maxY: number;
  yAxisLabel?: string;
  series: {
    name: string;
    data: number[];
    color: string;
    gradientId: string;
  }[];
}

export const SvgAreaChart = ({
  title,
  labelsX,
  labelsY,
  minY,
  maxY,
  yAxisLabel,
  series,
}: SvgAreaChartProps) => {
  const width = 500;
  const height = 180;
  const paddingLeft = yAxisLabel ? 48 : 36;
  const paddingRight = 20;
  const paddingTop = 15;
  const paddingBottom = 25;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  return (
    <div className='border p-4 flex flex-col transition-all duration-300 w-full bg-[--widget-card-color] border-[--widget-border-color] rounded-[--card-border-radius]'>
      <div className='text-[11px] font-semibold mb-3 text-[--text-color]'>
        {title}
      </div>

      <div className='relative w-full h-[150px]'>
        <svg
          className='w-full h-full overflow-visible'
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio='none'
        >
          <defs>
            {series.map((s) => (
              <linearGradient
                key={s.gradientId}
                id={s.gradientId}
                x1='0'
                y1='0'
                x2='0'
                y2='1'
              >
                <stop offset='0%' stopColor={s.color} stopOpacity='0.35' />
                <stop offset='100%' stopColor={s.color} stopOpacity='0.0' />
              </linearGradient>
            ))}
          </defs>

          {/* Horizontal Gridlines and Y Labels */}
          {labelsY.map((val, idx) => {
            const pct = (val - minY) / (maxY - minY);
            const y = height - paddingBottom - pct * chartHeight;
            return (
              <g key={idx}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={width - paddingRight}
                  y2={y}
                  stroke='var(--widget-border-color)'
                  strokeWidth='0.75'
                  strokeDasharray='2 2'
                />
                <text
                  x={paddingLeft - 6}
                  y={y + 3}
                  textAnchor='end'
                  fontSize='8'
                  fontWeight='500'
                  className='fill-[--support-text-color]'
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Rotated Y-Axis Label */}
          {yAxisLabel && (
            <text
              transform='rotate(-90)'
              x={-(height - paddingBottom + paddingTop) / 2}
              y='12'
              textAnchor='middle'
              fontSize='7.5'
              fontWeight='500'
              className='fill-[--support-text-color]'
            >
              {yAxisLabel}
            </text>
          )}

          {/* X Labels */}
          {labelsX.map((label, idx) => {
            const pct = idx / (labelsX.length - 1);
            const x = paddingLeft + pct * chartWidth;
            return (
              <text
                key={idx}
                x={x}
                y={height - 8}
                textAnchor='middle'
                fontSize='8'
                fontWeight='500'
                className='fill-[--support-text-color]'
              >
                {label}
              </text>
            );
          })}

          {series.map((s) => {
            const points = s.data.map((val, idx) => {
              const xPct = idx / (s.data.length - 1);
              const yPct = (val - minY) / (maxY - minY);
              const x = paddingLeft + xPct * chartWidth;
              const y = height - paddingBottom - yPct * chartHeight;
              return { x, y };
            });

            const linePath = points
              .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
              .join(' ');
            const areaPath = `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

            return (
              <g key={s.name}>
                <path d={areaPath} fill={`url(#${s.gradientId})`} />
                <path
                  d={linePath}
                  fill='none'
                  stroke={s.color}
                  strokeWidth='1.25'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r='2'
                    fill={s.color}
                    className='stroke-[--widget-card-color]'
                    strokeWidth='0.75'
                  />
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className='flex justify-center items-center gap-3 mt-2'>
        {series.map((s) => (
          <div key={s.name} className='flex items-center gap-1'>
            <span
              className='w-2 h-2 rounded-full'
              style={{ backgroundColor: s.color }}
            />
            <span className='text-[8.5px] font-medium text-[--support-text-color]'>
              {s.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
