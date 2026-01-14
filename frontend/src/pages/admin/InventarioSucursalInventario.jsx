import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

function InventarioSucursalInventario({ sucursal }) {
  const [inventario, setInventario] = useState([])
  const [productos, setProductos] = useState([])
  const [producto, setProducto] = useState("")
  const [cantidad, setCantidad] = useState("")

  // Cargar inventario de la sucursal
  useEffect(() => {
    if (!sucursal?._id) return

    const fetchInventario = async () => {
      try {
        const data = await apiFetch(`/inventario/${sucursal._id}`)
        setInventario(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error al cargar inventario:", err)
      }
    }

    fetchInventario()
  }, [sucursal?._id])

  // Cargar productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const data = await apiFetch("/productos")
        setProductos(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error("Error al cargar productos:", err)
      }
    }

    fetchProductos()
  }, [])

  const handleAgregar = async (e) => {
    e.preventDefault()
    if (!producto || !cantidad) return

    try {
      await apiFetch("/inventario/entrada", {
        method: "POST",
        body: JSON.stringify({
          producto,
          sucursal: sucursal._id,
          cantidad: Number(cantidad),
        }),
      })

      setProducto("")
      setCantidad("")

      const data = await apiFetch(`/inventario/${sucursal._id}`)
      setInventario(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error al agregar producto:", err)
      alert("No se pudo agregar el producto")
    }
  }

  return (
    <div>
      {/* FORMULARIO */}
      <form
        onSubmit={handleAgregar}
        className="bg-slate-800 p-4 rounded-xl mb-6"
      >
        <h2 className="text-white font-bold mb-2">
          Agregar producto a {sucursal.nombre}
        </h2>

        <select
          className="w-full mb-2 p-2 rounded bg-white text-slate-700 border border-slate-300"
          value={producto}
          onChange={(e) => setProducto(e.target.value)}
          required
        >
          <option value="">Selecciona un producto</option>
          {productos.map((p) => (
            <option key={p._id} value={p._id}>
              {p.nombre} ({p.codigo})
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Cantidad"
          className="
            w-full mb-2 p-2 rounded
            bg-white text-slate-800
            border border-slate-300
            placeholder-slate-400
            focus:outline-none
            focus:ring-2 focus:ring-blue-500
          "
          value={cantidad}
          onChange={(e) => setCantidad(e.target.value)}
          required
          min={1}
        />

        <button className="w-full bg-blue-500/40 text-white py-2 rounded">
          Agregar Producto
        </button>
      </form>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-700 text-left text-black">
          <thead className="bg-slate-700 text-white">
            <tr>
              <th className="p-2 border-r border-slate-600">Código</th>
              <th className="p-2 border-r border-slate-600">Producto</th>
              <th className="p-2 border-r border-slate-600">Características</th>
              <th className="p-2 border-r border-slate-600">Modelo</th>
              <th className="p-2">Cantidad</th>
            </tr>
          </thead>

          <tbody>
            {inventario.map((item) => (
              <tr
                key={item._id}
                className={`border-b border-slate-700 ${
                  item.cantidad === 0
                    ? "bg-red-900/40 text-red-900"
                    : ""
                }`}
              >
                <td className="p-2 border-r border-slate-600">
                  {item.producto?.codigo || "—"}
                </td>

                <td className="p-2 border-r border-slate-600">
                  {item.producto?.nombre || "N/A"}
                </td>

                <td className="p-2 border-r border-slate-600">
                  {item.producto?.caracteristicas || "—"}
                </td>

                <td className="p-2 border-r border-slate-600">
                  {item.producto?.modelo || "N/A"}
                </td>

                <td className="p-2 font-bold">
                  {item.cantidad === 0 ? "SIN STOCK" : item.cantidad}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default InventarioSucursalInventario
