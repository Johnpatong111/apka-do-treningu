'use client'

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const axis = { stroke: 'var(--muted-foreground)', fontSize: 12, tickLine: false, axisLine: false } as const
const tooltipStyle = {
  contentStyle: { background: 'var(--popover)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12 },
  labelStyle: { color: 'var(--muted-foreground)' },
  itemStyle: { color: 'var(--foreground)' },
  cursor: { stroke: 'var(--border)', fill: 'var(--secondary)' },
}

export type Series = { key: string; label: string; color: string; dashed?: boolean }

export function TrendChart({
  data,
  series,
  unit,
  height = 240,
}: {
  data: Record<string, string | number | null>[]
  series: Series[]
  unit?: string
  height?: number
}) {
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="label" {...axis} minTickGap={16} />
          <YAxis {...axis} domain={['auto', 'auto']} width={48} />
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit ? ` ${unit}` : ''}`]} />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? '5 5' : undefined}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5 }}
              connectNulls
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export function BarsChart({
  data,
  dataKey,
  color = 'var(--primary)',
  unit,
  height = 220,
  layout = 'horizontal',
}: {
  data: Record<string, string | number>[]
  dataKey: string
  color?: string
  unit?: string
  height?: number
  layout?: 'horizontal' | 'vertical'
}) {
  const vertical = layout === 'vertical'
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout={vertical ? 'vertical' : 'horizontal'} margin={{ top: 8, right: 8, left: vertical ? 8 : -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" horizontal={!vertical} vertical={vertical} />
          {vertical ? (
            <>
              <XAxis type="number" {...axis} />
              <YAxis type="category" dataKey="label" {...axis} width={96} />
            </>
          ) : (
            <>
              <XAxis dataKey="label" {...axis} />
              <YAxis {...axis} width={48} />
            </>
          )}
          <Tooltip {...tooltipStyle} formatter={(v) => [`${v}${unit ? ` ${unit}` : ''}`]} />
          <Bar dataKey={dataKey} fill={color} radius={vertical ? [0, 6, 6, 0] : [6, 6, 0, 0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
