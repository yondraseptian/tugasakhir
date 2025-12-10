from fastapi import FastAPI, File, UploadFile, HTTPException
from pydantic import BaseModel
from app.recipes import RECIPES, UNIT_CONVERSIONS
import pandas as pd
import io
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Forecast & Ingredients Planner")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ARIMA
try:
    import pmdarima as pm
except:
    pm = None



STORE = {"sales_df": None}


# ========== UPLOAD SALES ==========
@app.post("/upload-sales")
async def upload_sales(file: UploadFile = File(...)):
    content = await file.read()

    try:
        df = pd.read_csv(io.BytesIO(content))
    except:
        raise HTTPException(status_code=400, detail="Invalid CSV")

    df.columns = [c.lower().strip() for c in df.columns]

    required = ["sales_date", "menu", "qty"]
    for col in required:
        if col not in df.columns:
            raise HTTPException(400, f"Missing column: {col}")

    df["sales_date"] = pd.to_datetime(df["sales_date"], errors="coerce")
    df = df.dropna(subset=["sales_date"])
    df["qty"] = pd.to_numeric(df["qty"], errors="coerce").fillna(0).astype(int)

    df["month"] = df["sales_date"].dt.to_period("M").dt.to_timestamp()

    agg = df.groupby(["menu", "month"]).agg({"qty": "sum"}).reset_index()

    STORE["sales_df"] = agg

    return {
        "status": "ok",
        "menus": agg["menu"].unique().tolist(),
        "records": len(agg)
    }


# ========== LIST MENUS ==========
@app.get("/menus")
def menus():
    df = STORE["sales_df"]
    rank = df.groupby("menu").qty.sum().reset_index()
    return {"menus": rank.sort_values("qty", ascending=False).to_dict(orient="records")}


# ========== FORECAST ==========
class ForecastRequest(BaseModel):
    menus: list
    periods: int = 12


@app.post("/forecast")
def forecast(req: ForecastRequest):
    if STORE["sales_df"] is None:
        raise HTTPException(404, "Upload sales first")

    df = STORE["sales_df"]
    results = {}

    for menu in req.menus:
        ts = df[df["menu"] == menu].set_index("month")["qty"].sort_index()
        ts.index = pd.to_datetime(ts.index)

        if len(ts) < 3:
            raise HTTPException(400, f"Too little data for {menu}")

        def try_fit_seasonal(ts):
            return pm.auto_arima(
                ts,
                seasonal=True,
                m=12,
                stepwise=True,
                suppress_warnings=True,
                error_action="ignore",
            )

        def try_fit_nonseasonal(ts):
            return pm.auto_arima(
                ts,
                seasonal=False,
                stepwise=True,
                suppress_warnings=True,
                error_action="ignore",
            )

        model = None

        # 1️⃣ Coba ARIMA seasonal
        try:
            model = try_fit_seasonal(ts)
        except:
            pass

        # 2️⃣ Jika gagal, coba non-seasonal
        if model is None:
            try:
                model = try_fit_nonseasonal(ts)
            except:
                pass

        # 3️⃣ Jika dua-duanya gagal → fallback moving average
        if model is None:
            # moving average: lebih dinamis dibanding mean
            window = min(len(ts), 3)
            avg = int(ts.rolling(window).mean().iloc[-1])
            forecast_values = [int(max(0, avg))] * req.periods
        else:
            f = model.predict(req.periods)
            forecast_values = [int(max(0, round(x))) for x in f]

        # forecast index
        start = ts.index[-1] + pd.offsets.MonthBegin(1)
        idx = pd.date_range(start=start, periods=req.periods, freq="MS")

        results[menu] = {
            "index": [x.strftime("%Y-%m-%d") for x in idx],
            "forecast": forecast_values,
        }

    STORE["forecasts"] = results
    return {"status": "ok", "forecasts": results}


# ========== EXPAND NESTED RECIPE ==========
def expand_recipe(item, qty, unit, result):
    # Jika item adalah bahan mentah
    if item not in RECIPES:
        if item not in result:
            result[item] = {"qty": 0, "unit": unit}

        result[item]["qty"] += qty
        return

    # Jika item adalah recipe → pecah lagi
    for sub in RECIPES[item]:
        ingredient = sub["ingredient"]
        qty_per_unit = sub["qty_per_unit"]
        sub_unit = sub.get("unit", "pcs")

        total_qty = qty_per_unit * qty
        expand_recipe(ingredient, total_qty, sub_unit, result)


# ========== CALCULATE STOCK NEED ==========
@app.post("/calculate-stock")
def calculate_stock():
    forecasts = STORE.get("forecasts")

    if forecasts is None:
        raise HTTPException(400, "No forecast found. Calculate forecast first.")

    rows = []

    for menu, fdata in forecasts.items():
        for date, units in zip(fdata["index"], fdata["forecast"]):
            expanded = {}
            expand_recipe(menu, units, "pcs", expanded)

            for ingredient, data in expanded.items():
                qty = data["qty"]
                unit = data["unit"].lower()

                if unit not in UNIT_CONVERSIONS:
                    raise HTTPException(400, f"Unknown unit: {unit}")

                final_unit, factor = UNIT_CONVERSIONS[unit]
                final_qty = qty * factor

                rows.append({
                    "month": date,
                    "menu": menu,
                    "ingredient": ingredient,

                    "raw_qty": qty,
                    "raw_unit": unit,

                    "final_qty": round(final_qty, 4),
                    "final_unit": final_unit
                })

    df = pd.DataFrame(rows)

    # ✅ DIGABUNG TOTAL PER BULAN + INGREDIENT
    df = df.groupby(
        ["month", "ingredient", "final_unit"],
        as_index=False
    ).agg({
        "raw_qty": "sum",
        "final_qty": "sum",
        "menu": lambda x: ", ".join(sorted(set(x)))
    })

    STORE["ingredients"] = df.to_dict(orient="records")

    return {
        "status": "ok",
        "ingredients": df.to_dict(orient="records")
    }
