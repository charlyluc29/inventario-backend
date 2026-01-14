import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

function InventarioSucursalSalidas({ sucursal }) {
  const [salidas, setSalidas] = useState([])

  useEffect(() => {
    if (!sucursal?._id) return

    const fetchSalidas = async () => {
      try {
        const token = localStorage.getItem("token")
        const allMovimientos = await apiFetch("/inventario/movimientos/all", {
          headers: { Authorization: `Bearer ${token}` }
        })

        const salidasSucursal = allMovimientos.filter(
          m =>
            m.tipo === "salida" &&
            m.sucursalOrigen?._id === sucursal._id
        )

        setSalidas(Array.isArray(salidasSucursal) ? salidasSucursal : [])
      } catch (err) {
        console.error("Error al cargar salidas:", err)
      }
    }

    fetchSalidas()
  }, [sucursal?._id])

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-700 text-left text-white">
        <thead className="bg-slate-700">
          <tr>
            <th className="p-2 border-r border-slate-600">Producto</th>
            <th className="p-2 border-r border-slate-600">Cantidad</th>
            <th className="p-2 border-r border-slate-600">Destino</th>
            <th className="p-2">Fecha</th>
          </tr>
        </thead>

        <tbody>
          {salidas.length === 0 && (
            <tr>
              <td colSpan="4" className="p-4 text-center text-slate-400">
                No hay salidas registradas
              </td>
            </tr>
          )}

          {salidas.map(m => (
            <tr key={m._id} className="border-b border-slate-700">
              <td className="p-2 border-r border-slate-600">
                {m.producto?.nombre || "N/A"}
              </td>

              <td className="p-2 border-r border-slate-600 font-bold">
                {m.cantidad ?? 0}
              </td>

              <td className="p-2 border-r border-slate-600">
                {m.sucursalDestino?.nombre || "-"}
              </td>

              <td className="p-2">
                {m.fecha ? new Date(m.fecha).toLocaleString() : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventarioSucursalSalidas
