"use client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, AlertCircle, ChefHat } from "lucide-react"

interface RecipeMissingPageProps {
  noRecipeMenus?: string[]
  emptyRecipeMenus?: string[]
}

export function RecipeMissingPage({ noRecipeMenus = [], emptyRecipeMenus = [] }: RecipeMissingPageProps) {
  const router = useRouter()

  const hasNoRecipe = noRecipeMenus.length > 0
  const hasEmptyRecipe = emptyRecipeMenus.length > 0

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted/30 p-6">
      <div className="max-w-2xl mx-auto pt-12">
        <div className="text-center mb-8">
          <Link href="/" className="text-primary hover:underline text-sm mb-6 inline-block">
            ← Back to Home
          </Link>
        </div>

        <Card className="border-2">
          <CardContent className="pt-12 pb-12 text-center">
            <div className="mb-6 flex justify-center">
              {hasNoRecipe && (
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
                  <AlertTriangle className="w-24 h-24 text-red-500 relative" />
                </div>
              )}
              {hasEmptyRecipe && !hasNoRecipe && (
                <div className="relative">
                  <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-2xl"></div>
                  <AlertCircle className="w-24 h-24 text-amber-500 relative" />
                </div>
              )}
              {hasNoRecipe && hasEmptyRecipe && (
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl"></div>
                  <AlertTriangle className="w-24 h-24 text-red-500 relative" />
                </div>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">
              {hasNoRecipe && hasEmptyRecipe && "Data Resep Tidak Valid"}
              {hasNoRecipe && !hasEmptyRecipe && "Menu Tidak Ditemukan"}
              {hasEmptyRecipe && !hasNoRecipe && "Resep Belum Lengkap"}
            </h1>

            <p className="text-lg text-muted-foreground mb-8">
              Kami tidak dapat membuat perencanaan kebutuhan bahan baku karena beberapa masalah dengan data resep Anda.
            </p>

            <div className="space-y-6 mb-8 text-left">
              {hasNoRecipe && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></span>
                    <h3 className="font-semibold text-foreground">Menu tidak ditemukan di recipes</h3>
                  </div>
                  <ul className="space-y-2 ml-6">
                    {noRecipeMenus.map((menu) => (
                      <li key={menu} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
                        {menu}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Menu-menu di atas belum dibuat di halaman Kelola Resep. Silakan buat resep terlebih dahulu.
                  </p>
                </div>
              )}

              {hasEmptyRecipe && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="inline-block w-3 h-3 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></span>
                    <h3 className="font-semibold text-foreground">Resep belum tersedia atau belum ada bahan</h3>
                  </div>
                  <ul className="space-y-2 ml-6">
                    {emptyRecipeMenus.map((menu) => (
                      <li key={menu} className="text-sm text-muted-foreground flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                        {menu}
                      </li>
                    ))}
                  </ul>
                  <p className="text-xs text-muted-foreground mt-3">
                    Resep untuk menu-menu di atas sudah dibuat namun belum memiliki daftar bahan. Silakan tambahkan bahan
                    ke dalam resep.
                  </p>
                </div>
              )}
            </div>

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <ChefHat className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-foreground text-sm mb-1">Langkah selanjutnya</h4>
                  <p className="text-sm text-muted-foreground">
                    Buka halaman Kelola Resep dan lengkapi semua resep dengan daftar bahan yang diperlukan, kemudian coba
                    lagi.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/menus">pilih menu lain</Link>
              </Button>
              <Button onClick={() => router.push("/recipes")} className="bg-blue-600 hover:bg-blue-700">
                Kelola Resep
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
