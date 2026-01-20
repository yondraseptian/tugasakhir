"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { apiEndpoints } from "@/lib/api-config";
import { withProtectedRoute } from "@/components/protected-auth";

interface Menu {
  menu: string;
  qty: number;
}

function MenusPage() {
  const router = useRouter();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [selectedMenus, setSelectedMenus] = useState<Set<string>>(new Set());
  const [periods, setPeriods] = useState(12);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMenus = async () => {
      try {
        const uploadedData = sessionStorage.getItem("uploadedData");
        if (!uploadedData) {
          router.push("/upload");
          return;
        }

        const response = await fetch(apiEndpoints.menus, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch menus");
        }

        const result = await response.json();
        const menuList = result.menus || [];

        setMenus(menuList);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading menus:", err);
        setError(err instanceof Error ? err.message : "Failed to load menus");
        setIsLoading(false);
      }
    };

    loadMenus();
  }, [router]);

  const toggleMenu = (menuName: string) => {
    const newSelected = new Set(selectedMenus);
    if (newSelected.has(menuName)) {
      newSelected.delete(menuName);
    } else {
      newSelected.add(menuName);
    }
    setSelectedMenus(newSelected);
  };

  const handleForecast = async () => {
    if (selectedMenus.size === 0) return;

    try {
      const uploadedData = sessionStorage.getItem("uploadedData");

      sessionStorage.setItem(
        "selectedMenus",
        JSON.stringify(Array.from(selectedMenus))
      );
       sessionStorage.setItem("periods", JSON.stringify(periods))

      router.push("/forecast");
    } catch (error) {
      console.error("Error:", error);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto">
          <p>Loading menus...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/upload" className="text-primary hover:underline text-sm mb-4 inline-block">
            ← Back to Upload
          </Link>
          <h1 className="text-3xl font-bold mb-2">Select Menus</h1>
          <p className="text-muted-foreground">Step 2 of 4: Choose which items to forecast</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {menus.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>No menus found in your data. Please upload data first.</AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              {menus.map((menu) => (
                <Card
                  key={menu.menu}
                  className={`cursor-pointer transition-all ${
                    selectedMenus.has(menu.menu) ? "border-primary border-2 bg-primary/5" : ""
                  }`}
                  onClick={() => toggleMenu(menu.menu)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedMenus.has(menu.menu)}
                        onChange={() => toggleMenu(menu.menu)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <CardTitle className="text-lg">{menu.menu}</CardTitle>
                        <CardDescription>
                          Total orders: <span className="font-semibold text-foreground">{menu.qty}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="mb-8 bg-muted/50">
              <CardHeader>
                <CardTitle className="text-lg">Forecast Period</CardTitle>
                <CardDescription>Select how many months ahead to forecast</CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="flex flex-wrap gap-2">
                  {[3, 6, 12, 24].map((month) => (
                    <Button
                      key={month}
                      variant={periods === month ? "default" : "outline"}
                      onClick={() => setPeriods(month)}
                      className="min-w-[100px]"
                    >
                      {month} Months
                    </Button>
                  ))}
                </div>
              </div>
            </Card>

            {selectedMenus.size === 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please select at least one menu to continue</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-4">
              <Button asChild variant="outline">
                <Link href="/upload">Back</Link>
              </Button>
              <Button onClick={handleForecast} size="lg" disabled={selectedMenus.size === 0} className="ml-auto">
                Generate Forecast <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </main>
  )
}

export default withProtectedRoute(MenusPage)
