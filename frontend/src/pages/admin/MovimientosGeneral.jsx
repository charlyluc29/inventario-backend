import { useEffect, useMemo, useState } from "react"
import { apiFetch } from "../../services/api"

function MovimientosGeneral() {
  const [movimientos, setMovimientos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [sucursalFiltro, setSucursalFiltro] = useState("")

  // ===============================
  // Cargar datos
  // ===============================
  useEffect(() => {
    const cargarTodo = async () => {
      try {
        const movs = await apiFetch("/inventario/movimientos/all")
        const sucs = await apiFetch("/sucursales")

        setMovimientos(Array.isArray(movs) ? movs : [])
        setSucursales(Array.isArray(sucs) ? sucs : [])
      } catch (err) {
        console.error("Error cargando movimientos:", err)
      }
    }

    cargarTodo()
  }, [])

  // ===============================
  // Filtrado por sucursal
  // ===============================
  const movimientosFiltrados = useMemo(() => {
    if (!sucursalFiltro) return movimientos

    return movimientos.filter(
      m =>
        m.sucursalOrigen?._id === sucursalFiltro ||
        m.sucursalDestino?._id === sucursalFiltro
    )
  }, [movimientos, sucursalFiltro])

  // ===============================
  // Helpers
  // ===============================
  const getTipo = m => {
    if (m.tipo === "transferencia") return "Transferencia"
    if (m.tipo === "entrada") return "Entrada"
    if (m.tipo === "salida") return "Salida"
    return m.tipo
  }

  const getUsuario = m => {
    if (m.tipo === "transferencia") {
      const envia = m.usuario?.username || "Sistema"
      const acepta = m.usuarioAcepta?.username || "—"
      return `${envia} → ${acepta}`
    }

    return m.usuario?.username || "Sistema"
  }

  // ===============================
  // Exportar CSV
  // ===============================
  const exportarCSV = () => {
    const headers = [
      "Fecha",
      "Producto",
      "Tipo",
      "Cantidad",
      "Origen",
      "Destino",
      "Usuario"
    ]

    const rows = movimientosFiltrados.map(m => [
      new Date(m.fecha).toLocaleString(),
      m.producto?.nombre || "",
      getTipo(m),
      m.cantidad,
      m.sucursalOrigen?.nombre || "",
      m.sucursalDestino?.nombre || "",
      getUsuario(m)
    ])

    let csv = headers.join(",") + "\n"
    csv += rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = "movimientos.csv"
    link.click()
  }

  return (
    <div>
      <h2 className="text-3xl font-bold mb-4">
        Movimientos de Inventario
      </h2>

      {/* FILTROS */}
      <div className="flex gap-4 mb-4 items-center">
        <select
          value={sucursalFiltro}
          onChange={e => setSucursalFiltro(e.target.value)}
          className="p-2 rounded bg-slate-800 text-white"
        >
          <option value="">Todas las sucursales</option>
          {sucursales.map(s => (
            <option key={s._id} value={s._id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={exportarCSV}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded font-semibold"
        >
          Exportar CSV
        </button>
      </div>

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-slate-700 text-black text-center">
          <thead className="bg-amber-400/40 text-slate">
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
            {movimientosFiltrados.map(m => (
              <tr key={m._id} className="border-b border-slate-700">
                <td className="p-2">
                  {new Date(m.fecha).toLocaleString()}
                </td>
                <td className="p-2">
                  {m.producto?.nombre || "—"}
                </td>
                <td className="p-2 font-semibold">
                  {getTipo(m)}
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
                  {getUsuario(m)}
                </td>
              </tr>
            ))}

            {movimientosFiltrados.length === 0 && (
              <tr>
                <td colSpan="7" className="p-4 text-center text-slate-500">
                  No hay movimientos
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default MovimientosGeneral
