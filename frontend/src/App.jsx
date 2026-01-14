import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./hooks/useAuth"

import Login from "./pages/Login"
import AdminDashboard from "./pages/AdminDashboard"
import UserDashboard from "./pages/UserDashboard"
import Sucursales from "./pages/admin/Sucursales"
import InventarioSucursal from "./pages/admin/InventarioSucursal"

function App() {
  const { token, role, sucursal, loginSuccess, logout } = useAuth()

  return (
    <BrowserRouter>
      <Routes>

        {/* ===============================
            LOGIN
        =============================== */}
        <Route
          path="/"
          element={<Login onLoginSuccess={loginSuccess} />} 
          />


        {/* ===============================
            ADMIN DASHBOARD
        =============================== */}
        <Route
          path="/admin"
          element={
            token && role === "admin"
              ? <AdminDashboard logout={logout} />
              : <Navigate to="/" />
          }
        />

        {/* ===============================
            ADMIN - SUCURSALES
        =============================== */}
        <Route
          path="/admin/sucursales"
          element={
            token && role === "admin"
              ? <Sucursales />
              : <Navigate to="/" />
          }
        />

        {/* ===============================
            ADMIN - INVENTARIO POR SUCURSAL
        =============================== */}
        <Route
          path="/admin/sucursales/:id"
          element={
            token && role === "admin"
              ? <InventarioSucursal />
              : <Navigate to="/" />
          }
        />

        {/* ===============================
            USER DASHBOARD
        =============================== */}
        <Route
          path="/user"
          element={
            token && role === "user"
              ? (
                <UserDashboard
                  logout={logout}
                  sucursal={sucursal}
                />
              )
              : <Navigate to="/" />
          }
        />

        {/* ===============================
            FALLBACK
        =============================== */}
        <Route path="*" element={<Navigate to="/" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
