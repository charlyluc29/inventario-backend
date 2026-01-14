export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token")

  const res = await fetch(`http://localhost:3000/api${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json", // 👈 CLAVE
      Authorization: token ? `Bearer ${token}` : "",
      ...options.headers,
    },
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || "Error en la petición")
  }

  return data
}
