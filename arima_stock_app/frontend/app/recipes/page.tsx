"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Plus, Trash2, Zap } from "lucide-react"
import {
Dialog,
DialogContent,
DialogDescription,
DialogHeader,
DialogTitle,
DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { API_BASE_URL } from "@/lib/api-config"
import { useAuth } from "@/lib/auth-context"

interface RecipeItem {
id?: number
name: string
type: "ingredient" | "recipe"
ingredient_name?: string
sub_recipe_name?: string
qty: number
unit: string
}

interface Recipe {
id: number
name: string
type: string
yield_qty: number
yield_unit: string
items?: RecipeItem[]
}

export default function RecipesPage() {
const { user, loading: authLoading, isAuthenticated } = useAuth()
const router = useRouter()
const [recipes, setRecipes] = useState<Recipe[]>([])
    const [ingredients, setIngredients] = useState<Array<{ id: number; name: string; default_unit: string }>>([])
        const [loading, setLoading] = useState(true)
        const [error, setError] = useState("")
        const [openDialog, setOpenDialog] = useState(false)
        const [openIngredientDialog, setOpenIngredientDialog] = useState(false)
        const [expandedRecipe, setExpandedRecipe] = useState<number | null>(null)

            const [formData, setFormData] = useState({
            name: "",
            type: "base",
            yield_qty: 1,
            yield_unit: "pcs",
            })

            const [ingredientForm, setIngredientForm] = useState({
            name: "",
            default_unit: "g",
            })

            const [itemForm, setItemForm] = useState({
            recipe_id: "",
            item_type: "ingredient",
            ingredient_id: "",
            sub_recipe_id: "",
            qty_per_unit: 1,
            unit: "g",
            })

            useEffect(() => {
            if (!authLoading) {
            if (!isAuthenticated) {
            router.push("/login")
            } else {
            fetchRecipes()
            fetchIngredients()
            }
            }
            }, [authLoading, isAuthenticated, router])

            const fetchIngredients = async () => {
            try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_BASE_URL}/recipes/ingredients`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            })
            if (!response.ok) throw new Error("Failed to fetch ingredients")
            const data = await response.json()
            setIngredients(data || [])
            } catch (err) {
            console.log("[v0] Failed to fetch ingredients:", err)
            }
            }

            const fetchRecipes = async () => {
            try {
            setLoading(true)
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_BASE_URL}/recipes`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
            })
            if (!response.ok) throw new Error("Failed to fetch recipes")
            const data = await response.json()
            setRecipes(data || [])
            } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
            } finally {
            setLoading(false)
            }
            }

            const handleCreateRecipe = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_BASE_URL}/recipes`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            name: formData.name,
            type: formData.type,
            yield_qty: formData.yield_qty,
            yield_unit: formData.yield_unit,
            }),
            })

            if (!response.ok) throw new Error("Failed to create recipe")

            setFormData({ name: "", type: "base", yield_qty: 1, yield_unit: "pcs" })
            setOpenDialog(false)
            fetchRecipes()
            } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create recipe")
            }
            }

            const handleCreateIngredient = async (e: React.FormEvent) => {
            e.preventDefault()
            try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_BASE_URL}/recipes/ingredients`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            name: ingredientForm.name,
            default_unit: ingredientForm.default_unit,
            }),
            })

            if (!response.ok) throw new Error("Failed to create ingredient")

            setIngredientForm({ name: "", default_unit: "g" })
            setOpenIngredientDialog(false)
            } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create ingredient")
            }
            }

            const handleAddItem = async (e: React.FormEvent) => {
            e.preventDefault()
            if (!itemForm.recipe_id) {
            setError("Please select a recipe")
            return
            }

            try {
            const token = localStorage.getItem("token")
            const response = await fetch(`${API_BASE_URL}/recipes/${itemForm.recipe_id}/items`, {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
            item_type: itemForm.item_type,
            ingredient_id:
            itemForm.item_type === "ingredient" ? Number.parseInt(itemForm.ingredient_id) : null,
            sub_recipe_id: itemForm.item_type === "recipe" ? Number.parseInt(itemForm.sub_recipe_id) : null,
            qty_per_unit: itemForm.qty_per_unit,
            unit: itemForm.unit,
            }),
            })

            if (!response.ok) throw new Error("Failed to add item")

            setItemForm({
            recipe_id: "",
            item_type: "ingredient",
            ingredient_id: "",
            sub_recipe_id: "",
            qty_per_unit: 1,
            unit: "g",
            })
            fetchRecipes()
            } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to add item")
            }
            }

            const handleDeleteItem = async (itemId: number) => {
            try {
            const token = localStorage.getItem("token")
            const res = await fetch(
            `${API_BASE_URL}/recipes/items/${itemId}`,
            {
            method: "DELETE",
            headers: {
            Authorization: `Bearer ${token}`,
            },
            }
            )

            if (!res.ok) throw new Error("Failed to delete item")
            fetchRecipes()
            } catch (err) {
            setError("Failed to delete item")
            }
            }


            if (authLoading) {
            return (
            <main className="min-h-screen bg-gradient from-slate-50 to-slate-100 p-8 flex items-center justify-center">
                <Card>
                    <CardContent className="pt-6">Loading...</CardContent>
                </Card>
            </main>
            )
            }

            if (!isAuthenticated) {
            return null
            }

            return (
            <main
                className="min-h-screen bg-gradient from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-8">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <Link href="/">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                            </Link>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">Recipe Management</h1>
                                {user && <p className="text-sm text-muted-foreground">for {user.name}</p>}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Dialog open={openIngredientDialog} onOpenChange={setOpenIngredientDialog}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="gap-2 bg-transparent">
                                        <Zap className="w-4 h-4" />
                                        Manage Ingredients
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Ingredient</DialogTitle>
                                        <DialogDescription>Add a new ingredient to your database</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateIngredient} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Ingredient Name</label>
                                            <Input value={ingredientForm.name} onChange={(e)=> setIngredientForm({
                                            ...ingredientForm, name: e.target.value })}
                                            placeholder="e.g., Flour, Sugar, Salt"
                                            required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Default Unit</label>
                                            <Input value={ingredientForm.default_unit} onChange={(e)=>
                                            setIngredientForm({ ...ingredientForm, default_unit: e.target.value })
                                            }
                                            placeholder="e.g., g, ml, kg"
                                            required
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" onClick={()=>
                                                setOpenIngredientDialog(false)}
                                                >
                                                Cancel
                                            </Button>
                                            <Button type="submit">Create Ingredient</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                                <DialogTrigger asChild>
                                    <Button className="gap-2">
                                        <Plus className="w-4 h-4" />
                                        New Recipe
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Create New Recipe</DialogTitle>
                                        <DialogDescription>Add a new recipe to your menu database</DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleCreateRecipe} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Recipe Name</label>
                                            <Input value={formData.name} onChange={(e)=> setFormData({ ...formData,
                                            name: e.target.value })}
                                            placeholder="e.g., Kopi Susu Batavia"
                                            required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Type</label>
                                            <Select value={formData.type} onValueChange={(value)=> setFormData({
                                                ...formData, type: value })}
                                                >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="base">Base</SelectItem>
                                                    <SelectItem value="menu">Menu</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        {formData.type === "base" && (
                                        <>
                                            <div>
                                                <label className="text-sm font-medium">Yield Quantity</label>
                                                <Input type="number" value={formData.yield_qty} onChange={(e)=>
                                                setFormData({
                                                ...formData,
                                                yield_qty: Number.parseFloat(e.target.value),
                                                })
                                                }
                                                step="0.1"
                                                min="0"
                                                required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Yield Unit</label>
                                                <Input value={formData.yield_unit} onChange={(e)=> setFormData({
                                                ...formData, yield_unit: e.target.value })}
                                                placeholder="e.g., pcs, ml, g"
                                                required
                                                />
                                            </div>
                                        </>
                                        )}
                                        <div className="flex gap-2">
                                            <Button type="button" variant="outline" onClick={()=>
                                                setOpenDialog(false)}>
                                                Cancel
                                            </Button>
                                            <Button type="submit">Create Recipe</Button>
                                        </div>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {error && (
                    <Card className="mb-6 border-red-200 bg-red-50">
                        <CardContent className="pt-6 text-red-700">{error}</CardContent>
                    </Card>
                    )}

                    {loading ? (
                    <Card>
                        <CardContent className="pt-6">Loading recipes...</CardContent>
                    </Card>
                    ) : recipes.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                            No recipes found. Create your first recipe to get started.
                        </CardContent>
                    </Card>
                    ) : (
                    <div className="space-y-4">
                        {recipes.map((recipe) => (
                        <Card key={recipe.id}>
                            <CardHeader className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700"
                                onClick={()=>
                                setExpandedRecipe(expandedRecipe === recipe.id ? null : recipe.id)
                                }
                                >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <CardTitle>{recipe.name}</CardTitle>
                                        <CardDescription>
                                            Type: {recipe.type} | Yield: {recipe.yield_qty} {recipe.yield_unit}
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            {expandedRecipe === recipe.id && (
                            <CardContent className="space-y-4">
                                <div>
                                    <h4 className="font-semibold mb-2">Recipe Items</h4>
                                    {recipe.items && recipe.items.length > 0 ? (
                                    <div className="space-y-2">
                                        {recipe.items.map((item) => (
                                        <div key={item.id}
                                            className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700 rounded">
                                            <span className="text-sm">
                                                {item.type === "ingredient"
                                                ? `[ING] ${item.ingredient_name}`
                                                : `[RECIPE] ${item.sub_recipe_name}`}{" "}
                                                - {item.qty} {item.unit}
                                            </span>
                                            <Button variant="ghost" size="sm"
                                                className="text-red-600 hover:text-red-700" onClick={()=>
                                                handleDeleteItem(item.id)}
                                                >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>

                                        </div>
                                        ))}
                                    </div>
                                    ) : (
                                    <p className="text-sm text-muted-foreground">No items added yet</p>
                                    )}
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="font-semibold mb-2">Add Item to Recipe</h4>
                                    <form onSubmit={handleAddItem} className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium">Item Type</label>
                                            <Select value={itemForm.item_type} onValueChange={(value)=>
                                                setItemForm({
                                                ...itemForm,
                                                item_type: value as "ingredient" | "recipe",
                                                })
                                                }
                                                >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ingredient">Ingredient</SelectItem>
                                                    <SelectItem value="recipe">Recipe</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {itemForm.item_type === "ingredient" && (
                                        <Select value={itemForm.ingredient_id} onValueChange={(value)=> {
                                            const ing = ingredients.find((i) => i.id === Number(value))
                                            setItemForm({
                                            ...itemForm,
                                            ingredient_id: value,
                                            unit: ing?.default_unit || "g",
                                            })
                                            }}
                                            >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose ingredient" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {ingredients.map((ing) => (
                                                <SelectItem key={ing.id} value={ing.id.toString()}>
                                                    {ing.name}
                                                </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        )}

                                        {itemForm.item_type === "recipe" && (
                                        <Select value={itemForm.sub_recipe_id} onValueChange={(value)=> {
                                            const r = recipes.find((r) => r.id === Number(value))
                                            setItemForm({
                                            ...itemForm,
                                            sub_recipe_id: value,
                                            unit: r?.yield_unit || "pcs",
                                            })
                                            }}
                                            >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Choose base recipe" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {recipes
                                                .filter((r) => r.type === "base")
                                                .map((r) => (
                                                <SelectItem key={r.id} value={r.id.toString()}>
                                                    {r.name} ({r.yield_unit})
                                                </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        )}


                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-sm font-medium">Quantity</label>
                                                <Input type="number" value={itemForm.qty_per_unit} onChange={(e)=>
                                                setItemForm({
                                                ...itemForm,
                                                qty_per_unit: Number.parseFloat(e.target.value),
                                                })
                                                }
                                                step="0.1"
                                                min="0"
                                                required
                                                />
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium">Unit</label>
                                                <Input value={itemForm.unit} onChange={(e)=> setItemForm({ ...itemForm,
                                                unit: e.target.value })}
                                                placeholder="e.g., g, ml, pcs"
                                                required
                                                />
                                            </div>
                                        </div>

                                        <Button type="submit" className="w-full" onClick={()=>
                                            setItemForm({
                                            ...itemForm,
                                            recipe_id: recipe.id.toString(),
                                            })
                                            }
                                            >
                                            Add Item
                                        </Button>
                                    </form>
                                </div>
                            </CardContent>
                            )}
                        </Card>
                        ))}
                    </div>
                    )}
                </div>
            </main>
            )
            }
