"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, AlertCircle } from "lucide-react"
import Papa from "papaparse"
import { apiEndpoints } from "@/lib/api-config"

interface UploadFormProps {
  onDataLoaded: (data: any[]) => void
  onMenusDetected: (menus: string[]) => void
}

export function UploadForm({ onDataLoaded, onMenusDetected }: UploadFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [preview, setPreview] = useState<any[]>([])
  const [menus, setMenus] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  setIsLoading(true)
  setError("")

  try {
    const formData = new FormData()
    formData.append("file", file)

    // Upload ke backend FastAPI
    const response = await fetch(apiEndpoints.uploadSales, {
      method: "POST",
      body: formData, // ⬅️ penting
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.detail || "Upload failed")
    }

    const res = await response.json()

    // simpan menu dari backend
    const menus = res.menus_detected || res.menus || []
    onMenusDetected(menus)

    // simpan preview
    onDataLoaded(res.preview)

    setPreview(res.preview)
    setMenus(menus)
  } catch (err: any) {
    setError(err.message || "Upload failed")
  }

  setIsLoading(false)
}


  return (
    <div className="space-y-6">
      <Card className="border-2 border-dashed border-primary/30">
        <CardHeader>
          <CardTitle>Upload Sales Data</CardTitle>
          <CardDescription>Import your CSV or Excel file with sales records</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">Click to upload or drag and drop</p>
            <p className="text-sm text-muted-foreground mb-4">CSV or Excel files up to 10MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              Select File
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {menus.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Detected Menus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {menus.map((menu) => (
                <div key={menu} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                  {menu}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {preview?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Preview</CardTitle>
            <CardDescription>First 10 rows of your data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {Object.keys(preview[0]).map((key) => (
                      <th key={key} className="text-left py-2 px-3 font-semibold">
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, idx) => (
                    <tr key={idx} className="border-b hover:bg-muted/50">
                      {Object.values(row).map((val, i) => (
                        <td key={i} className="py-2 px-3">
                          {String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
