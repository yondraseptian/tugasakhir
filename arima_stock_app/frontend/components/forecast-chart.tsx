"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ForecastChartProps {
  data: Array<{
    month: string
    menus: Record<string, number>
    total: number
  }>
}

export function ForecastChart({ data }: ForecastChartProps) {
  if (!data.length) return null

  // Prepare data for line chart
  const chartData = data.map((item) => ({
    month: item.month,
    total: item.total,
    ...item.menus,
  }))

  // Get unique menu names
  const menuNames = Array.from(new Set(data.flatMap((item) => Object.keys(item.menus)))).sort()

  const colors = [
    "hsl(var(--color-chart-1))",
    "hsl(var(--color-chart-2))",
    "hsl(var(--color-chart-3))",
    "hsl(var(--color-chart-4))",
    "hsl(var(--color-chart-5))",
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales Forecast - Line Chart</CardTitle>
          <CardDescription>Monthly sales trends for selected menus</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              {menuNames.map((menu, idx) => (
                <Line
                  key={menu}
                  type="monotone"
                  dataKey={menu}
                  stroke={colors[idx % colors.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Total Sales Per Month</CardTitle>
          <CardDescription>Combined sales across all selected menus</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--color-border))" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="hsl(var(--color-chart-1))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
