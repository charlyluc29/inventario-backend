import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

function InventarioSucursalEntradas({ sucursal }) {
  const [entradas, setEntradas] = useState([])

  useEffect(() => {
    if (!sucursal?._id) return

    const fetchEntradas = async () => {
      try {
        const token = localStorage.getItem("token")
        const allMovimientos = await apiFetch("/inventario/movimientos/all", {
          headers: { Authorization: `Bearer ${token}` }
        })

        const entradasSucursal = allMovimientos.filter(
          m => m.tipo === "entrada" && m.sucursalDestino?._id === sucursal._id
        )
        setEntradas(Array.isArray(entradasSucursal) ? entradasSucursal : [])
      } catch (err) {
        console.error("Error al cargar entradas:", err)
      }
    }

    fetchEntradas()
  }, [sucursal?._id])

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-700 text-left text-white">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-2 border-r border-slate-600">Producto</th>
            <th className="p-2 border-r border-slate-600">Cantidad</th>
            <th className="p-2 border-r border-slate-600">Origen</th>
            <th className="p-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {entradas.map(m => (
            <tr key={m._id} className="border-b border-slate-700">
              <td className="p-2 border-r border-slate-600">{m.producto?.nombre || "N/A"}</td>
              <td className="p-2 border-r border-slate-600">{m.cantidad ?? 0}</td>
              <td className="p-2 border-r border-slate-600">{m.sucursalOrigen?.nombre || "-"}</td>
              <td className="p-2">{m.fecha ? new Date(m.fecha).toLocaleString() : "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventarioSucursalEntradas
