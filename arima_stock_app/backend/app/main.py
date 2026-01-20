from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from sqlalchemy.orm import Session
from app.dependencies.db import get_db
from app.utils.recipe import expand_recipe_db
from pydantic import BaseModel
from app.recipes import  UNIT_CONVERSIONS
import pandas as pd
import io
from fastapi.middleware.cors import CORSMiddleware
from app.router.recipes import router as recipe_router
from app.router.auth_routes import router as auth_router


app = FastAPI(title="Forecast & Ingredients Planner")   

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(recipe_router, prefix="/recipes", tags=["Recipes"])



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

        # 1️⃣ coba seasonal
        try:
            model = try_fit_seasonal(ts)
        except:
            pass

        # 2️⃣ fallback non-seasonal
        if model is None:
            try:
                model = try_fit_nonseasonal(ts)
            except:
                pass

        # 3️⃣ fallback terakhir → moving average
        if model is None:
            window = min(len(ts), 3)
            avg = int(ts.rolling(window).mean().iloc[-1])
            forecast_values = [int(max(0, avg))] * req.periods

            # 🔴 PRINT KE TERMINAL
            print("=" * 50)
            print(f"MENU  : {menu}")
            print("MODEL : MOVING AVERAGE (fallback)")
            print("=" * 50)

        else:
            f = model.predict(req.periods)
            forecast_values = [int(max(0, round(x))) for x in f]

            # 🟢 PRINT ARIMA PARAMETER
            print("=" * 50)
            print(f"MENU           : {menu}")
            print(f"ARIMA (p,d,q)  : {model.order}")
            print(f"SEASONAL      : {model.seasonal_order}")
            print(f"AIC           : {model.aic()}")
            print("=" * 50)

        # index forecast
        start = ts.index[-1] + pd.offsets.MonthBegin(1)
        idx = pd.date_range(start=start, periods=req.periods, freq="MS")

        results[menu] = {
            "index": [x.strftime("%Y-%m-%d") for x in idx],
            "forecast": forecast_values,
        }

    STORE["forecasts"] = results
    return {"status": "ok", "forecasts": results}


# ========== CALCULATE STOCK NEED ==========
@app.post("/calculate-stock")
def calculate_stock_db(db: Session = Depends(get_db)):
    forecasts = STORE.get("forecasts")
    if not forecasts:
        raise HTTPException(400, "No forecast found.")

    rows = []
    no_recipe_menus = set()
    empty_recipe_menus = set()

    for menu_name, fdata in forecasts.items():
        for date, units in zip(fdata["index"], fdata["forecast"]):
            expanded = {}

            try:
                expand_recipe_db(db, menu_name, units, expanded)

            except ValueError as e:
                code, menu = str(e).split(":")
                if code == "RECIPE_NOT_FOUND":
                    no_recipe_menus.add(menu)
                elif code == "RECIPE_EMPTY":
                    empty_recipe_menus.add(menu)
                continue

            for ing, data in expanded.items():
                rows.append({
                    "month": date,
                    "menu": menu_name,
                    "ingredient": ing,
                    "qty": round(data["qty"], 4),
                    "unit": data["unit"]
                })

    if no_recipe_menus or empty_recipe_menus:
        raise HTTPException(
            status_code=409,
            detail={
                "code": "RECIPE_MISSING",
                "message": "Data resep minuman tidak valid",
                "noRecipeMenus": list(no_recipe_menus),
                "emptyRecipeMenus": list(empty_recipe_menus),
            }
        )

    df = pd.DataFrame(rows)

    df = df.groupby(["month", "ingredient", "unit"], as_index=False).agg({
        "qty": "sum",
        "menu": lambda x: ", ".join(sorted(set(x)))
    })

    STORE["ingredients"] = df.to_dict(orient="records")

    return {"status": "ok", "ingredients": STORE["ingredients"]}
