"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { apiEndpoints } from "@/lib/api-config"

interface Ingredient {
  month: string
  ingredient: string
  menu: string
  final_qty: number
  final_unit?: string
}

export default function IngredientsPage() {
  const router = useRouter()
  const [ingredients, setIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedMonth, setSelectedMonth] = useState<string>("")

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const response = await fetch(apiEndpoints.calculateStock, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch ingredients from backend")
        }

        const result = await response.json()
        const ingredientData = result.ingredients || []

        setIngredients(ingredientData)
        if (ingredientData.length > 0) {
          const months = Array.from(new Set(ingredientData.map((ing: any) => ing.month))).sort()
          setSelectedMonth(months[0])
        }
        setIsLoading(false)
      } catch (err) {
        console.error("Error loading ingredients:", err)
        setError(err instanceof Error ? err.message : "Failed to fetch ingredients")
        setIsLoading(false)
      }
    }

    loadIngredients()
  }, [router])

  const filteredIngredients = selectedMonth ? ingredients.filter((ing) => ing.month === selectedMonth) : ingredients

  const months = Array.from(new Set(ingredients.map((ing) => ing.month))).sort()

  const handleExportCSV = () => {
    const csv = [
      ["Month", "Ingredient", "Menu", "Quantity Needed", "Unit"].join(","),
      ...filteredIngredients.map((ing) =>
        [ing.month, ing.ingredient, ing.menu, ing.final_qty, ing.final_unit || ""].join(","),
      ),
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `ingredients-${selectedMonth || "all"}.csv`
    a.click()
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <p>Loading ingredient requirements...</p>
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

  if (!ingredients.length) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-6xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No ingredient data available from backend.</AlertDescription>
          </Alert>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Ingredient Requirements</h1>
          <p className="text-muted-foreground">View ingredient needs calculated by backend</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {months.map((month) => (
                <button
                  key={month}
                  onClick={() => setSelectedMonth(month)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedMonth === month
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {new Date(month).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>
                Ingredient Requirements for{" "}
                {new Date(selectedMonth).toLocaleDateString("id-ID", { year: "numeric", month: "long" })}
              </CardTitle>
              <CardDescription>All ingredients needed for selected period</CardDescription>
            </div>
            <Button onClick={handleExportCSV} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Ingredient</th>
                    <th className="text-left py-3 px-4 font-semibold">Menu</th>
                    <th className="text-right py-3 px-4 font-semibold">Quantity Needed</th>
                    <th className="text-left py-3 px-4 font-semibold">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients
                    .sort((a, b) => a.ingredient.localeCompare(b.ingredient))
                    .map((ing, idx) => (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{ing.ingredient}</td>
                        <td className="py-3 px-4 text-muted-foreground">{ing.menu}</td>
                        <td className="py-3 px-4 text-right font-semibold text-primary">
                          {ing.final_qty.toLocaleString("id-ID", {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 2,
                          })}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{ing.final_unit || "-"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 mt-8">
          <Button asChild variant="outline">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </main>
  )
}
