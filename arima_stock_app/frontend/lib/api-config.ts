export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 

export const apiEndpoints = {
  uploadSales: `${API_BASE_URL}/upload-sales`,
  menus: `${API_BASE_URL}/menus`,
  forecast: `${API_BASE_URL}/forecast`,
  calculateStock: `${API_BASE_URL}/calculate-stock`,
}


export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")
  console.log(token)
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail || "API Error")
  }

  return res.json()
}
