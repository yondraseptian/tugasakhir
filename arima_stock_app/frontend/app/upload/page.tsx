"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UploadForm } from "@/components/upload-form"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"

export default function UploadPage() {
  const router = useRouter()
  const [isReady, setIsReady] = useState(false)
  const [uploadedData, setUploadedData] = useState<any[]>([])

  const handleDataLoaded = (data: any[]) => {
    setUploadedData(data)
    setIsReady(true)

    // Store in session storage for next page
    if (typeof window !== "undefined") {
      sessionStorage.setItem("uploadedData", JSON.stringify(data))
    }
  }

  const handleMenusDetected = (menus: string[]) => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("detectedMenus", JSON.stringify(menus))
    }
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-3xl font-bold mb-2">Upload Sales Data</h1>
          <p className="text-muted-foreground">Step 1 of 4: Import your sales records</p>
        </div>

        <UploadForm onDataLoaded={handleDataLoaded} onMenusDetected={handleMenusDetected} />

        {isReady && (
          <div className="mt-8 flex gap-4">
            <Button asChild size="lg" className="ml-auto">
              <Link href="/menus">
                Next: Select Menus <ChevronRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
