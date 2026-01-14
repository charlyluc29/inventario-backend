import { useState } from "react"
import {
  LayoutDashboard,
  Building2,
  Package,
  BarChart3,
  Users,
  LogOut,
  Menu
} from "lucide-react"

import Home from "./admin/Dashboard"
import Sucursales from "./admin/Sucursales"
import InventarioSucursal from "./admin/InventarioSucursal"
import InventarioGeneral from "./admin/InventarioGeneral"
import MovimientosGeneral from "./admin/MovimientosGeneral"
import Usuarios from "./admin/Usuarios"

function AdminDashboard({ logout }) {
  const [isOpen, setIsOpen] = useState(true)
  const [section, setSection] = useState("home")
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState(null)

  const itemClass = (name) =>
    `flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition
     ${
       section === name
         ? "bg-gray-800 text-white border-l-4 border-amber-400"
         : "text-gray-400 hover:bg-gray-800 hover:text-white"
     }`

  return (
    <div className="min-h-screen flex bg-zinc-50 text-zinc-900">

      {/* SIDEBAR */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-16"
        } bg-zinc-900 p-3 flex flex-col border-r border-zinc-800 transition-all duration-300`}
      >

        {/* LOGO */}
       
          {/* LOGO + NOMBRE */}
<div
  className={`flex items-center gap-3 px-3 py-4 mb-6 ${
    isOpen ? "justify-start" : "justify-center"
  }`}
>
  {/* LOGO */}
 <img
  src="/logo-mandala 3.png"
  alt="Mandala Group"
  className="
    h-11 w-auto object-contain
    bg-amber-400/80
    p-1.5
    rounded-md
    ring-1 ring-zinc-600
  "
/>



  {/* TEXTO */}
  {isOpen && (
    <div className="leading-tight">
      <h1 className="text-white font-semibold text-lg">
        Mandala Group
      </h1>
      <span className="text-xs tracking-widest text-amber-400">
        HOSPITALITY
      </span>
    </div>
  )}
</div>


        {/* TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 px-2"
        >
          <Menu size={22} />
          {isOpen && (
            <span className="text-white font-semibold">
              User: Admin
            </span>
          )}
        </button>

        {/* MENU */}
        <nav className="flex-1 space-y-1">

          <div
            className={itemClass("home")}
            onClick={() => {
              setSection("home")
              setSucursalSeleccionada(null)
            }}
          >
            <LayoutDashboard size={18} />
            {isOpen && "Dashboard"}
          </div>

          <div
            className={itemClass("sucursales")}
            onClick={() => {
              setSection("sucursales")
              setSucursalSeleccionada(null)
            }}
          >
            <Building2 size={18} />
            {isOpen && "Sucursales"}
          </div>

          <div
            className={itemClass("inventarioGeneral")}
            onClick={() => {
              setSection("inventarioGeneral")
              setSucursalSeleccionada(null)
            }}
          >
            <Package size={18} />
            {isOpen && "Inventario General"}
          </div>

          <div
            className={itemClass("movimientos")}
            onClick={() => {
              setSection("movimientos")
              setSucursalSeleccionada(null)
            }}
          >
            <BarChart3 size={18} />
            {isOpen && "Movimientos"}
          </div>

          <div
            className={itemClass("usuarios")}
            onClick={() => {
              setSection("usuarios")
              setSucursalSeleccionada(null)
            }}
          >
            <Users size={18} />
            {isOpen && "Usuarios"}
          </div>

        </nav>

        {/* LOGOUT */}
        <button
          onClick={logout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition mt-6 justify-center md:justify-start px-2"
        >
          <LogOut size={18} />
          {isOpen && "Cerrar sesión"}
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10">
        {section === "home" && <Home />}

        {section === "sucursales" && !sucursalSeleccionada && (
          <Sucursales onSelectSucursal={(s) => setSucursalSeleccionada(s)} />
        )}

        {sucursalSeleccionada && (
          <InventarioSucursal
            sucursal={sucursalSeleccionada}
            volver={() => setSucursalSeleccionada(null)}
          />
        )}

        {section === "inventarioGeneral" && <InventarioGeneral />}

        {section === "movimientos" && <MovimientosGeneral />}

        {section === "usuarios" && <Usuarios />}
      </main>
    </div>
  )
}

export default AdminDashboard
