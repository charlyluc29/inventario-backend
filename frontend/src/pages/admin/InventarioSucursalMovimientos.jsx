import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

function InventarioSucursalMovimientos({ sucursal }) {
  const [movimientos, setMovimientos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sucursal?._id) return

    const fetchMovimientos = async () => {
      try {
        const data = await apiFetch("/inventario/movimientos/all")

        // Solo movimientos relacionados con esta sucursal
        const filtrados = data.filter(
          m =>
            m.sucursalOrigen?._id === sucursal._id ||
            m.sucursalDestino?._id === sucursal._id
        )

        setMovimientos(filtrados)
      } catch (err) {
        console.error("Error cargando movimientos:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchMovimientos()
  }, [sucursal?._id])

  // ===============================
  // Determinar tipo visible
  // ===============================
  const getTipoMovimiento = (m) => {
    if (m.tipo === "transferencia") {
      if (m.sucursalDestino?._id === sucursal._id) {
        return "Transferencia (Ingreso)"
      }
      if (m.sucursalOrigen?._id === sucursal._id) {
        return "Transferencia (Salida)"
      }
    }

    if (m.tipo === "entrada") return "Entrada"
    if (m.tipo === "salida") return "Salida"

    return m.tipo
  }

  if (loading) {
    return <p className="text-white">Cargando movimientos...</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-slate-700 text-black">
        <thead className="bg-slate-700 text-white">
          <tr>
            <th className="p-2">Fecha</th>
            <th className="p-2">Producto</th>
            <th className="p-2">Tipo</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Origen</th>
            <th className="p-2">Destino</th>
            <th className="p-2">Usuario</th>
          </tr>
        </thead>

        <tbody>
          {movimientos.length === 0 && (
            <tr>
              <td colSpan="7" className="p-4 text-center text-slate-400">
                No hay movimientos en esta sucursal
              </td>
            </tr>
          )}

          {movimientos.map((m) => (
            <tr key={m._id} className="border-b border-slate-700">
              <td className="p-2">
                {new Date(m.fecha).toLocaleString()}
              </td>

              <td className="p-2">
                {m.producto?.nombre || "—"}
              </td>

              <td className="p-2 font-semibold capitalize">
                {getTipoMovimiento(m)}
              </td>

              <td className="p-2 font-bold">
                {m.cantidad}
              </td>

              <td className="p-2">
                {m.sucursalOrigen?.nombre || "—"}
              </td>

              <td className="p-2">
                {m.sucursalDestino?.nombre || "—"}
              </td>

              <td className="p-2">
                {m.usuario
                  ? `${m.usuario.username} (${m.usuario.role})`
                  : "Sistema"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default InventarioSucursalMovimientos
