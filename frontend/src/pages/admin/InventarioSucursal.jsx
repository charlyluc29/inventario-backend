import { useState } from "react"
import InventarioSucursalInventario from "./InventarioSucursalInventario"
import InventarioSucursalTransferencia from "./InventarioSucursalTransferencia"
import { apiFetch } from "../../services/api"
import { Package, ArrowUpRight, PlusCircle } from "lucide-react"

function InventarioSucursal({ sucursal, volver }) {
  const [seccion, setSeccion] = useState("inventario")

  const [form, setForm] = useState({
    codigo: "",
    nombre: "",
    caracteristicas: "",
    modelo: "",
    estado: "",
    precio: "",
    cantidad: "",
  })

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleCrearProducto = async (e) => {
    e.preventDefault()

    try {
      await apiFetch("/inventario/nuevo", {
        method: "POST",
        body: JSON.stringify({
          codigo: form.codigo,
          nombre: form.nombre,
          caracteristicas: form.caracteristicas,
          modelo: form.modelo,
          estado: form.estado,
          precio: Number(form.precio),
          cantidad: Number(form.cantidad),
          sucursal: sucursal._id,
        }),
      })

      alert("Producto creado y agregado al inventario")

      setForm({
        codigo: "",
        nombre: "",
        caracteristicas: "",
        modelo: "",
        estado: "",
        precio: "",
        cantidad: "",
      })

      setSeccion("inventario")
    } catch (err) {
      console.error(err)
      alert(err.message)
    }
  }

  return (
    <div className="px-4">
      {/* Volver */}
      <button
        onClick={volver}
        className="mb-4 text-blue-900/90 hover:underline"
      >
        ← Volver a sucursales
      </button>

      <h1 className="text-3xl font-bold mb-6">{sucursal.nombre}</h1>

      {/* MENÚ */}
      <div className="flex flex-wrap gap-4 mb-8">
        <button
          onClick={() => setSeccion("inventario")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition 
            ${seccion === "inventario"
              ? "bg-gradient-to-r from-blue-600/60 to-blue-600/60 shadow-lg text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
        >
          <Package size={18} />
          Inventario
        </button>

        <button
          onClick={() => setSeccion("transferir")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition 
            ${seccion === "transferir"
              ? "bg-gradient-to-r from-purple-600/60 to-purple-600/60 shadow-lg text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
        >
          <ArrowUpRight size={18} />
          Transferir productos
        </button>

        <button
          onClick={() => setSeccion("nuevo")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition 
            ${seccion === "nuevo"
              ? "bg-gradient-to-r from-green-800/90 to-green-800/90 shadow-lg text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
            }`}
        >
          <PlusCircle size={18} />
          Nuevo producto
        </button>
      </div>

      {/* CONTENIDO */}
      {seccion === "inventario" && (
        <InventarioSucursalInventario sucursal={sucursal} />
      )}

      {seccion === "transferir" && (
        <InventarioSucursalTransferencia sucursal={sucursal} />
      )}

      {seccion === "nuevo" && (
        <div className="flex justify-center items-center py-1">
          <form
            onSubmit={handleCrearProducto}
            className="bg-blue-900/40 p-6 rounded-xl max-w-xl w-full shadow-lg"
          >
            <h2 className="text-xl font-bold mb-4 text-center">
              Nuevo producto
            </h2>

            <input
              name="codigo"
              placeholder="Código"
              value={form.codigo}
              onChange={handleChange}
              className="w-full mb-3 p-2 rounded text-black bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-700/50"
              required
            />

            <input
              name="nombre"
              placeholder="Nombre"
              value={form.nombre}
              onChange={handleChange}
              className="w-full mb-3 p-2 rounded text-black bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-700/50"
              required
            />

            <input
              name="caracteristicas"
              placeholder="Características"
              value={form.caracteristicas}
              onChange={handleChange}
              className="w-full mb-3 p-2 rounded text-black bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-700/50"
              required
            />

            <input
              name="modelo"
              placeholder="Modelo"
              value={form.modelo}
              onChange={handleChange}
              className="w-full mb-3 p-2 rounded text-black bg-white border border-slate-300 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-700/50"
              required
            />

            <select
              name="estado"
              value={form.estado}
              onChange={handleChange}
              className="w-full mb-3 p-2 rounded text-black bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-700/50"
              required
            >
              <option value="">Selecciona estado</option>
              <option value="funciona">Funciona</option>
              <option value="no funciona">No funciona</option>
            </select>

            <input
              name="precio"
              type="number"
              placeholder="Precio"
              value={form.precio}
              onChange={handleChange}
              className="w-full mb-3 p-2 rounded text-black bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-700/50"
              required
            />

            <input
              name="cantidad"
              type="number"
              placeholder="Cantidad inicial"
              value={form.cantidad}
              onChange={handleChange}
              className="w-full mb-3 p-2 rounded text-black bg-white border border-slate-300 focus:outline-none focus:ring-2 focus:ring-orange-700/50"
              min={1}
              required
            />

            <button className="w-full bg-green-800 py-2 rounded text-white font-semibold hover:bg-green-700 transition">
              Crear producto
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default InventarioSucursal
