"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, TrendingUp, UtensilsCrossed, Upload, BookOpen } from "lucide-react"

export default function Home() {
  const steps = [
    {
      icon: Upload,
      title: "Upload Sales Data",
      description: "Import your CSV or Excel file with sales records",
      href: "/upload",
      color: "text-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Select Menus",
      description: "Choose which menu items to forecast",
      href: "/menus",
      color: "text-purple-600",
    },
    {
      icon: BarChart3,
      title: "View Forecast",
      description: "See sales predictions and trends",
      href: "/forecast",
      color: "text-orange-600",
    },
    {
      icon: UtensilsCrossed,
      title: "Plan Ingredients",
      description: "Calculate ingredient requirements",
      href: "/ingredients",
      color: "text-green-600",
    },
    {
      icon: BookOpen,
      title: "Manage Recipes",
      description: "Create and configure menu recipes with ingredients",
      href: "/recipes",
      color: "text-red-600",
    },
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3 text-foreground">Sales Forecasting Dashboard</h1>
          <p className="text-lg text-muted-foreground">Predict sales trends and plan your ingredient needs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <Link key={step.href} href={step.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 hover:border-primary">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      <Icon className={`w-8 h-8 ${step.color}`} />
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            )
          })}
        </div>

        <Card className="bg-primary text-primary-foreground border-0">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Start by uploading your sales data in CSV or Excel format</li>
              <li>The system will detect all menu items in your data</li>
              <li>Select which items you want to forecast</li>
              <li>View the forecast charts and predictions</li>
              <li>Generate ingredient requirements based on forecasted sales</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
