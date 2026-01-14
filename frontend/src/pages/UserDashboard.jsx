import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { apiFetch } from "../services/api"
import {
  Package,
  ArrowUpRight,
  Inbox,
  ArrowUp,
  LogOut,
  Menu,
  Users
} from "lucide-react"

import UserInventario from "./user/UserInventario"
import UserTransferencia from "./user/UserTransferencia"
import UserTransferenciasEntrantes from "./user/UserTransferenciasEntrantes"
import UserTransferenciasEnviadas from "./user/UserTransferenciasEnviadas"

export default function UserDashboard({ logout }) {
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true)
  const [seccion, setSeccion] = useState("inventario")
  const [sucursal, setSucursal] = useState(null)
  const [loadingSucursal, setLoadingSucursal] = useState(true)

  const sucursalId = localStorage.getItem("sucursal")

  // ===============================
  // Cargar sucursal del usuario
  // ===============================
  useEffect(() => {
    if (!sucursalId) {
      alert("Usuario sin sucursal asignada")
      logout()
      navigate("/")
      return
    }

    apiFetch(`/sucursales/${sucursalId}`)
      .then(data => setSucursal(data))
      .catch(err => {
        console.error(err)
        alert("Error cargando sucursal")
        logout()
        navigate("/")
      })
      .finally(() => setLoadingSucursal(false))
  }, [sucursalId])

  const itemClass = (active) =>
    `flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition
     ${
       active
         ? "bg-gray-800 text-white border-l-4 border-amber-400"
         : "text-gray-400 hover:bg-gray-800 hover:text-white"
     }`

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="min-h-screen flex bg-zinc-50 text-zinc-900">

      {/* SIDEBAR */}
      <aside
        className={`${
          isOpen ? "w-64" : "w-16"
        } bg-zinc-900 p-3 flex flex-col border-r border-zinc-800 transition-all duration-300`}
      >
        {/* LOGO + NOMBRE */}
        <div
          className={`flex items-center gap-3 px-3 py-4 mb-6 ${
            isOpen ? "justify-start" : "justify-center"
          }`}
        >
          <img
            src="/logo-mandala 3.png"
            alt="Mandala Group"
            className="h-11 w-auto object-contain bg-amber-400/80 p-1.5 rounded-md ring-1 ring-zinc-600"
          />
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

        {/* USUARIO + SUCURSAL */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Users size={22} className="text-purple-500" />
            {isOpen && <span className="text-white font-semibold">Usuario</span>}
          </div>
          {!loadingSucursal && isOpen && (
            <p className="text-sm text-gray-200 mt-1">
              Sucursal: <span className="font-semibold text-white">{sucursal?.nombre}</span>
            </p>
          )}
        </div>

        {/* TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-400 hover:text-white mb-6 flex items-center gap-2 px-2"
        >
          <Menu size={22} />
          {isOpen && <span className="text-white font-semibold">Menu</span>}
        </button>

        {/* MENU */}
        <nav className="flex-1 space-y-1">
          <div
            className={itemClass(seccion === "inventario")}
            onClick={() => setSeccion("inventario")}
          >
            <Package size={18} />
            {isOpen && "Mi inventario"}
          </div>

          <div
            className={itemClass(seccion === "transferir")}
            onClick={() => setSeccion("transferir")}
          >
            <ArrowUpRight size={18} />
            {isOpen && "Enviar transferencia"}
          </div>

          <div
            className={itemClass(seccion === "entrantes")}
            onClick={() => setSeccion("entrantes")}
          >
            <Inbox size={18} />
            {isOpen && "Transferencias entrantes"}
          </div>

          <div
            className={itemClass(seccion === "enviadas")}
            onClick={() => setSeccion("enviadas")}
          >
            <ArrowUp size={18} />
            {isOpen && "Transferencias enviadas"}
          </div>
        </nav>

        {/* LOGOUT */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-400 hover:text-red-400 transition mt-6 justify-center md:justify-start px-2"
        >
          <LogOut size={18} />
          {isOpen && "Cerrar sesión"}
        </button>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-10 overflow-y-auto">
        {loadingSucursal && (
          <div className="bg-slate-800 p-6 rounded-xl shadow text-gray-400">
            Cargando información de la sucursal...
          </div>
        )}

        {!loadingSucursal && (
          <div className="space-y-8">
            {seccion === "inventario" && <UserInventario sucursal={sucursal} />}
            {seccion === "transferir" && <UserTransferencia sucursal={sucursal} />}
            {seccion === "entrantes" && <UserTransferenciasEntrantes />}
            {seccion === "enviadas" && <UserTransferenciasEnviadas />}
          </div>
        )}
      </main>
    </div>
  )
}
