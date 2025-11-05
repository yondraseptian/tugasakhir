
# ARIMA Stock Planner - Starter Repo

Repo ini adalah implementasi penuh starter untuk aplikasi prediksi kebutuhan bahan baku.

## Struktur
- backend/: FastAPI app (upload, forecast, convert-to-ingredients)
- frontend/: Vite + React minimal UI (upload, select menu, run forecast - proxy ke backend)
- docker-compose.yml - menjalankan backend & frontend (dev)
- sample_data/sample_sales_2024.csv - contoh data
- recipes.json - contoh recipe per menu

## Menjalankan dengan Docker Compose
1. Pastikan Docker & docker-compose terpasang
2. Jalankan:
   ```bash
   docker-compose up --build
   ```
3. Backend akan tersedia di http://localhost:8000
   Frontend di http://localhost:5173

## Jalankan lokal (non-docker)
- Backend:
  ```bash
  cd backend
  python -m venv .venv
  source .venv/bin/activate   # atau .\.venv\Scripts\activate di Windows
  pip install -r requirements.txt
  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
  ```
- Frontend:
  ```bash
  cd frontend
  npm install
  npm run dev -- --host
  ```

## Catatan
- Model ARIMA menggunakan `pmdarima`. Jika tidak terpasang, backend akan fallback ke metode rolling mean.
- Endpoint utama:
  - POST /upload-sales (file csv)
  - GET /menus
  - POST /forecast {menus:[], periods:12}
  - POST /convert-to-ingredients {forecasts, recipes}
