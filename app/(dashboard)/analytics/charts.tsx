"use client"

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts"

interface TopicStat {
  title: string
  minutes: number
  sessions: number
}

interface DayStat {
  date: string
  minutes: number
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#6366f1']

export function Last7DaysChart({ data }: { data: DayStat[] }) {
  return (
    <div className="h-[250px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <XAxis 
            dataKey="date" 
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            dy={10}
          />
          <YAxis 
            width={45}
            axisLine={false}
            tickLine={false}
            domain={[0, 600]}
            ticks={[0, 120, 240, 360, 480, 600]}
            tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
            tickFormatter={(val) => {
              if (val === 0) return '0'
              return `${Math.floor(val / 60)}h`
            }}
          />
          <Tooltip 
            cursor={false}
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
            formatter={(value: any) => {
              const h = Math.floor(value / 60)
              const m = value % 60
              return [h > 0 ? `${h}h ${m}m` : `${m}m`, 'Focus Time']
            }}
          />
          <Bar dataKey="minutes" radius={[4, 4, 4, 4]} maxBarSize={50}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={index === data.length - 1 ? COLORS[0] : COLORS[0]} 
                fillOpacity={index === data.length - 1 ? 1 : 0.3} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export function TopicsPieChart({ data }: { data: TopicStat[] }) {
  const activeData = data.filter(d => d.minutes > 0)
  
  if (activeData.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
        No topic data available.
      </div>
    )
  }

  const totalMinutes = activeData.reduce((sum, item) => sum + item.minutes, 0)
  const totalH = Math.floor(totalMinutes / 60)
  const totalM = totalMinutes % 60
  const totalText = totalH > 0 ? `${totalH}h ${totalM}m` : `${totalM}m`

  return (
    <div className="h-[250px] w-full mt-4 relative">
      {/* Center Label for Donut */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
        <span className="text-2xl font-bold text-foreground">{totalText}</span>
        <span className="text-xs text-muted-foreground">Total Logged</span>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeData}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={85}
            paddingAngle={4}
            dataKey="minutes"
            nameKey="title"
            stroke="none"
            cornerRadius={4}
          >
            {activeData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
            formatter={(value: any) => {
              const h = Math.floor(value / 60)
              const m = value % 60
              return [h > 0 ? `${h}h ${m}m` : `${m}m`, 'Studied']
            }}
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            formatter={(value) => <span className="text-muted-foreground text-xs font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
