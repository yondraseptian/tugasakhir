export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export const apiEndpoints = {
  uploadSales: `${API_BASE_URL}/upload-sales`,
  menus: `${API_BASE_URL}/menus`,
  forecast: `${API_BASE_URL}/forecast`,
  calculateStock: `${API_BASE_URL}/calculate-stock`,
}
