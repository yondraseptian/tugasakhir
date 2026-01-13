UNIT_CONVERSIONS = {
    "g":  ("kg", 0.001),
    "kg": ("kg", 1),

    "ml": ("l", 0.001),
    "l":  ("l", 1),

    "pcs": ("pcs", 1)
}


# app/recipes.py

RECIPES = {

    # ===== BASE =====

    "Simple Syrup": [
        {"ingredient": "Gula Pasir", "qty_per_unit": 1000, "unit": "g"},
        {"ingredient": "Air", "qty_per_unit": 1000, "unit": "ml"},
    ],

    "Salt Liquid": [
        {"ingredient": "Garam", "qty_per_unit": 5, "unit": "g"},
        {"ingredient": "Air", "qty_per_unit": 100, "unit": "ml"},
    ],

    "Half & Half": [
        {"ingredient": "Milac Gold Whip Cream", "qty_per_unit": 1000, "unit": "ml"},
        {"ingredient": "Fresh Milk", "qty_per_unit": 3000, "unit": "ml"},
    ],

    "Chocolate Ganache": [
        {"ingredient": "Fresh Milk", "qty_per_unit": 500, "unit": "ml"},
        {"ingredient": "Chocolate Couverture 70%", "qty_per_unit": 500, "unit": "g"},
    ],

    "Ice Tea Base": [
        {"ingredient": "Djournal Tea Bag", "qty_per_unit": 1, "unit": "pcs"},
        {"ingredient": "Air Panas", "qty_per_unit": 500, "unit": "ml"},
        {"ingredient": "Air", "qty_per_unit": 500, "unit": "ml"},
    ],

    "Gula Nusantara": [
        {"ingredient": "Gula Aren", "qty_per_unit": 100, "unit": "g"},
        {"ingredient": "Gula Kelapa", "qty_per_unit": 100, "unit": "g"},
        {"ingredient": "Air", "qty_per_unit": 200, "unit": "ml"},
    ],

    "Green Tea Paste": [
        {"ingredient": "Powder Green Tea", "qty_per_unit": 300, "unit": "g"},
        {"ingredient": "Gula Palem", "qty_per_unit": 150, "unit": "g"},
        {"ingredient": "Air Panas", "qty_per_unit": 600, "unit": "ml"},
    ],

    "Blend B Espresso": [
        {"ingredient": "Coffee Blend O", "qty_per_unit": 20, "unit": "g"},
    ],

    "Thai Tea Prepared": [
        {"ingredient": "Thai Tea Leaves", "qty_per_unit": 10, "unit": "g"},
        {"ingredient": "Air", "qty_per_unit": 250, "unit": "ml"},
    ],

    # ===== MENU =====

    "Cappuccino": [
        {"ingredient": "Coffee Blend O", "qty_per_unit": 20, "unit": "g"},
        {"ingredient": "Fresh Milk", "qty_per_unit": 210, "unit": "ml"},
    ],

    "Hot Latte": [
        {"ingredient": "Coffee Blend O", "qty_per_unit": 20, "unit": "g"},
        {"ingredient": "Fresh Milk", "qty_per_unit": 240, "unit": "ml"},
    ],

    "Iced Latte": [
        {"ingredient": "Coffee Blend O", "qty_per_unit": 20, "unit": "g"},
        {"ingredient": "Fresh Milk", "qty_per_unit": 120, "unit": "ml"},
    ],

    "Long Black": [
        {"ingredient": "Coffee Blend O", "qty_per_unit": 20, "unit": "g"},
        {"ingredient": "Air Panas", "qty_per_unit": 150, "unit": "ml"},
    ],

    "Kopi Susu Batavia": [
        {"ingredient": "Gula Nusantara", "qty_per_unit": 30, "unit": "ml"},
        {"ingredient": "Blend B Espresso", "qty_per_unit": 40, "unit": "ml"},
        {"ingredient": "Half & Half", "qty_per_unit": 150, "unit": "ml"},
    ],

    "Thai Tea": [
        {"ingredient": "Thai Tea Prepared", "qty_per_unit": 90, "unit": "ml"},
        {"ingredient": "Condensed Milk", "qty_per_unit": 40, "unit": "ml"},
        {"ingredient": "Evaporated Milk", "qty_per_unit": 10, "unit": "ml"},
        {"ingredient": "Fresh Milk", "qty_per_unit": 60, "unit": "ml"},
    ],

    "Green Tea Latte": [
        {"ingredient": "Green Tea Paste", "qty_per_unit": 45, "unit": "ml"},
        {"ingredient": "Fresh Milk", "qty_per_unit": 240, "unit": "ml"},
    ],

    "Chocolate": [
        {"ingredient": "Chocolate Ganache", "qty_per_unit": 60, "unit": "ml"},
        {"ingredient": "Fresh Milk", "qty_per_unit": 90, "unit": "ml"},
        {"ingredient": "Simple Syrup", "qty_per_unit": 15, "unit": "ml"},
    ],
}

