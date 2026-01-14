import { useEffect, useState, useMemo } from "react"
import { apiFetch } from "../../services/api"
import { Boxes } from "lucide-react"

/*
  - Muestra SOLO el inventario de la sucursal del USER
  - Autocomplete con datalist (guarda SOLO el código)
  - Búsqueda por código o nombre
  - Estilo limpio y moderno
*/

function UserInventario() {
  const [inventario, setInventario] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState("")
  const sucursalId = localStorage.getItem("sucursal")

  // ===============================
  // Cargar inventario
  // ===============================
  const cargarInventario = async () => {
    try {
      if (!sucursalId) {
        alert("No se encontró la sucursal del usuario")
        return
      }
      const data = await apiFetch(`/inventario/${sucursalId}`)
      setInventario(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error("Error cargando inventario:", err)
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarInventario()
  }, [])

  // ===============================
  // Filtro por código o nombre
  // ===============================
  const inventarioFiltrado = useMemo(() => {
    if (!busqueda) return inventario

    const texto = busqueda.toLowerCase()

    return inventario.filter((item) => {
      const codigo = item.producto.codigo.toLowerCase()
      const nombre = item.producto.nombre.toLowerCase()

      return codigo.includes(texto) || nombre.includes(texto)
    })
  }, [inventario, busqueda])

  if (loading) {
    return <p className="text-gray-700">Cargando inventario...</p>
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md max-w-5xl mx-auto">
      {/* TÍTULO */}
      <div className="mb-6 flex items-center gap-3">
        <Boxes size={28} className="text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-800">
          Inventario de mi sucursal
        </h1>
      </div>

      {/* BUSCADOR CON AUTOCOMPLETE */}
      <div className="mb-6">
        <input
          list="productos"
          placeholder="Buscar por código o nombre"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="w-full p-2 mb-3 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <datalist id="productos">
          {inventario.map((item) => (
            <option
              key={item._id}
              value={item.producto.codigo}
              label={item.producto.nombre}
            />
          ))}
        </datalist>
      </div>

      {/* TABLA INVENTARIO */}
      <div className="overflow-x-auto rounded-xl shadow-md">
        <table className="min-w-full border border-gray-200 text-left text-gray-800">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border-r border-gray-300">Código</th>
              <th className="p-2 border-r border-gray-300">Producto</th>
              <th className="p-2 border-r border-gray-300">Modelo</th>
              <th className="p-2 border-r border-gray-300">Estado</th>
              <th className="p-2">Disponible</th>
            </tr>
          </thead>

          <tbody>
            {inventarioFiltrado.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-400">
                  No hay productos que coincidan con la búsqueda
                </td>
              </tr>
            )}

            {inventarioFiltrado.map((item, index) => (
              <tr
                key={item._id}
                className={`border-b border-gray-200 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } ${item.cantidad === 0 ? "bg-red-50 text-red-600" : ""}`}
              >
                <td className="p-2 border-r border-gray-300">
                  {item.producto.codigo}
                </td>
                <td className="p-2 border-r border-gray-300">
                  {item.producto.nombre}
                </td>
                <td className="p-2 border-r border-gray-300">
                  {item.producto.modelo}
                </td>
                <td className="p-2 border-r border-gray-300 capitalize">
                  {item.producto.estado}
                </td>
                <td className="p-2 font-semibold">
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

export default UserInventario
