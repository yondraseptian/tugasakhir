from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel
import pandas as pd
import io, os, json
try:
    import pmdarima as pm
except Exception:
    pm = None
from typing import List

app = FastAPI(title='ARIMA Forecast & Ingredients Planner')

# Simple in-memory store for uploaded/parsed sales
STORE = {'sales_df': None, 'recipes': None, 'inventory': None}

@app.post('/upload-sales')
async def upload_sales(file: UploadFile = File(...)):
    content = await file.read()
    try:
        df = pd.read_csv(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'Invalid CSV: {e}')
    # normalize expected columns
    df.columns = [c.lower().strip() for c in df.columns]
    if 'sales_date' not in df.columns or 'menu' not in df.columns or 'qty' not in df.columns:
        raise HTTPException(status_code=400, detail='CSV must include sales_date, menu, qty columns')
    df['sales_date'] = pd.to_datetime(df['sales_date'], errors='coerce')
    df = df.dropna(subset=['sales_date'])
    df['month'] = df['sales_date'].dt.to_period('M').dt.to_timestamp()
    agg = df.groupby(['menu','month']).agg({'qty':'sum'}).reset_index()
    STORE['sales_df'] = agg
    return {'status':'ok','preview': agg.head(10).to_dict(orient='records')}

@app.get('/menus')
def list_menus():
    if STORE['sales_df'] is None:
        raise HTTPException(status_code=404, detail='No sales uploaded')
    df = STORE['sales_df']
    rank = df.groupby('menu').agg({'qty':'sum'}).reset_index().sort_values('qty', ascending=False)
    return {'menus': rank.to_dict(orient='records')}

class ForecastRequest(BaseModel):
    menus: List[str]
    periods: int = 12
    freq: str = 'M'

@app.post('/forecast')
def forecast(req: ForecastRequest):
    if STORE['sales_df'] is None:
        raise HTTPException(status_code=404, detail='No sales uploaded')
    results = {}
    df = STORE['sales_df']
    for menu in req.menus:
        ts = df[df['menu']==menu].set_index('month').sort_index()['qty']
        ts = ts.asfreq('MS').fillna(0)
        if len(ts.dropna()) < 6:
            # fallback simple average
            forecast_values = [int(ts.mean())]*req.periods
            idx = pd.period_range(ts.index[-1] + pd.offsets.MonthBegin(1), periods=req.periods, freq='MS')
        else:
            if pm is not None:
                try:
                    model = pm.auto_arima(ts, seasonal=True, m=12, error_action='ignore', suppress_warnings=True)
                    f = model.predict(n_periods=req.periods)
                    forecast_values = [int(max(0, round(x))) for x in f]
                    idx = pd.period_range(ts.index[-1] + pd.offsets.MonthBegin(1), periods=req.periods, freq='MS')
                except Exception:
                    forecast_values = [int(ts.mean())]*req.periods
                    idx = pd.period_range(ts.index[-1] + pd.offsets.MonthBegin(1), periods=req.periods, freq='MS')
            else:
                # pmdarima not installed: use rolling mean as a naive fallback
                forecast_values = [int(ts.rolling(3,min_periods=1).mean().iloc[-1])]*req.periods
                idx = pd.period_range(ts.index[-1] + pd.offsets.MonthBegin(1), periods=req.periods, freq='MS')
        results[menu] = {'index': [d.strftime('%Y-%m-%d') for d in idx], 'forecast': forecast_values}
    return results

@app.post('/convert-to-ingredients')
def convert_to_ingredients(payload: dict):
    # payload expects {'forecasts': {...}, 'recipes': {...}}
    forecasts = payload.get('forecasts')
    recipes = payload.get('recipes') or STORE.get('recipes')
    if forecasts is None or recipes is None:
        raise HTTPException(status_code=400, detail='Provide forecasts and recipes (or upload recipes first)')
    rows = []
    for menu, data in forecasts.items():
        for date_str, units in zip(data['index'], data['forecast']):
            rec = recipes.get(menu, [])
            for r in rec:
                rows.append({'month': date_str, 'menu': menu, 'ingredient': r['ingredient'], 'qty_needed': units * r['qty_per_unit'], 'unit': r.get('unit','unit')})
    df = pd.DataFrame(rows)
    if df.empty:
        return {'ingredients': []}
    out = df.groupby(['month','ingredient','unit']).agg({'qty_needed':'sum'}).reset_index()
    return {'ingredients': out.to_dict(orient='records')}

@app.post('/upload-recipes')
async def upload_recipes(file: UploadFile = File(...)):
    content = await file.read()
    try:
        data = json.loads(content.decode()) if isinstance(content, (bytes,bytearray)) else file.file.read()
        STORE['recipes'] = data
        return {'status':'ok','recipes_count': len(data)}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f'invalid json: {e}')

@app.get('/sample-download')
def sample_download():
    path = os.path.join(os.path.dirname(__file__), '..', '..', 'sample_data', 'sample_sales_2024.csv')
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail='sample not found')
    return FileResponse(path, media_type='text/csv', filename='sample_sales_2024.csv')
