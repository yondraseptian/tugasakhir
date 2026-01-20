"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ForecastChart } from "@/components/forecast-chart"
import { ChevronRight, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiEndpoints } from "@/lib/api-config"
import { withProtectedRoute } from "@/components/protected-auth"

interface ForecastData {
  month: string
  menus: Record<string, number>
  total: number
}

 function ForecastPage() {
  const router = useRouter()
  const [forecast, setForecast] = useState<ForecastData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

useEffect(() => {
  const loadForecast = async () => {
    try {
      const selectedMenus = sessionStorage.getItem("selectedMenus")

      if (!selectedMenus) {
        router.push("/menus")
        return
      }

      const storedPeriods = Number(sessionStorage.getItem("periods") || "12")

      const response = await fetch(apiEndpoints.forecast, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          menus: JSON.parse(selectedMenus),
          periods: storedPeriods,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate forecast")

      const result = await response.json()
      const rawForecast = result.forecasts || {}

      const transformForecast = (data: any) => {
        const menuNames = Object.keys(data)
        const months = data[menuNames[0]].index

        return months.map((month: string, i: number) => {
          const menus: Record<string, number> = {}

          menuNames.forEach((menu) => {
            menus[menu] = data[menu].forecast[i]
          })

          const total = Object.values(menus).reduce((a, b) => a + b, 0)

          return { month, menus, total }
        })
      }

      const converted = transformForecast(rawForecast)

      setForecast(converted)
      sessionStorage.setItem("forecast", JSON.stringify(converted))
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate forecast")
      setIsLoading(false)
    }
  }

  loadForecast()
}, [])


  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <p>Generating forecast...</p>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  if (!forecast.length) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No forecast data available. Please start over.</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/menus" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Menu Selection
          </Link>
          <h1 className="text-3xl font-bold mb-2">Sales Forecast</h1>
          <p className="text-muted-foreground">Step 3 of 4: Review your sales predictions</p>
        </div>

        <ForecastChart data={forecast} />

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Forecast Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Month</th>
                    <th className="text-left py-3 px-4 font-semibold">Total Sales</th>
                    <th className="text-left py-3 px-4 font-semibold">Breakdown</th>
                  </tr>
                </thead>
                <tbody>
                  {forecast.map((item) => (
                    <tr key={item.month} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{item.month}</td>
                      <td className="py-3 px-4 font-semibold text-primary">{item.total} units</td>
                      <td className="py-3 px-4 text-sm">
                        {Object.entries(item.menus)
                          .map(([menu, qty]) => `${menu}: ${qty}`)
                          .join(" | ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/menus">Back</Link>
          </Button>
          <Button asChild size="lg" className="ml-auto">
            <Link href="/ingredients">
              Plan Ingredients <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  )
}

export default withProtectedRoute(ForecastPage)
