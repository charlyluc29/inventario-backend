import { useState } from "react"
import jwtDecode from "jwt-decode"

export function useAuth() {
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [role, setRole] = useState(localStorage.getItem("role"))
  const [sucursal, setSucursal] = useState(localStorage.getItem("sucursal"))

  const loginSuccess = (token) => {
    const decoded = jwtDecode(token)
    const normalizedRole = decoded.role?.toLowerCase()

    localStorage.setItem("token", token)
    localStorage.setItem("role", normalizedRole)

    if (decoded.sucursal) {
      localStorage.setItem("sucursal", decoded.sucursal)
      setSucursal(decoded.sucursal)
    }

    setToken(token)
    setRole(normalizedRole)
  }

  const logout = () => {
    localStorage.clear()
    setToken(null)
    setRole(null)
    setSucursal(null)
  }

  return { token, role, sucursal, loginSuccess, logout }
}
