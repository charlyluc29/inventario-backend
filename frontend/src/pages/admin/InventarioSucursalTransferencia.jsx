import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"

function UserTransferencia({ sucursal }) {
  const [inventario, setInventario] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [destino, setDestino] = useState("")
  const [loading, setLoading] = useState(false)

  // NUEVOS ESTADOS (IGUAL QUE ADMIN)
  const [query, setQuery] = useState("")
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState("")
  const [lista, setLista] = useState([])

  // ===============================
  // Cargar inventario del USER
  // ===============================
  const cargarInventario = async () => {
    const data = await apiFetch(`/inventario/${sucursal._id}`)
    setInventario(data)
  }

  // ===============================
  // Cargar sucursales destino
  // ===============================
  const cargarSucursales = async () => {
    const data = await apiFetch("/sucursales")
    setSucursales(data.filter(s => s._id !== sucursal._id))
  }

  useEffect(() => {
    cargarInventario()
    cargarSucursales()
  }, [sucursal._id])

  // ===============================
  // Autocomplete (MISMO QUE ADMIN)
  // ===============================
  const productosFiltrados = inventario.filter(item =>
    item.producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
    item.producto.codigo?.toLowerCase().includes(query.toLowerCase())
  )

  // ===============================
  // Agregar producto
  // ===============================
  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return

    const existe = lista.find(
      i => i.producto._id === productoSeleccionado.producto._id
    )

    if (existe) {
      alert("Este producto ya fue agregado")
      return
    }

    setLista(prev => [
      ...prev,
      {
        producto: productoSeleccionado.producto,
        cantidad: Number(cantidad)
      }
    ])

    setProductoSeleccionado(null)
    setQuery("")
    setCantidad("")
  }

  // ===============================
  // Quitar producto
  // ===============================
  const quitarProducto = index => {
    setLista(prev => prev.filter((_, i) => i !== index))
  }

  // ===============================
  // Transferir TODO (LOTE)
  // ===============================
  const transferirTodo = async () => {
    if (!destino) {
      alert("Selecciona una sucursal destino")
      return
    }

    if (lista.length === 0) {
      alert("Agrega al menos un producto")
      return
    }

    try {
      setLoading(true)

      await apiFetch("/inventario/transferir-lote", {
        method: "POST",
        body: JSON.stringify({
          sucursalOrigen: sucursal._id,
          sucursalDestino: destino,
          items: lista.map(i => ({
            producto: i.producto._id,
            cantidad: i.cantidad
          }))
        })
      })

      alert("Transferencia enviada correctamente")

      setLista([])
      setDestino("")
      await cargarInventario()
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">
        Transferir productos desde {sucursal.nombre}
      </h2>

      {/* Sucursal destino */}
      <select
        value={destino}
        onChange={e => setDestino(e.target.value)}
        className="mb-4 p-2 rounded bg-slate-800 text-white"
      >
        <option value="">Selecciona sucursal destino</option>
        {sucursales.map(s => (
          <option key={s._id} value={s._id}>
            {s.nombre}
          </option>
        ))}
      </select>

      {/* Selector producto */}
      <div className="mb-4 relative">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por código o nombre"
          className="w-full p-2 rounded bg-slate-800 text-white"
        />

        {query && (
          <ul className="absolute z-10 w-full bg-white text-black max-h-48 overflow-y-auto rounded shadow">
            {productosFiltrados.map(item => (
              <li
                key={item._id}
                className={`p-2 ${
                  item.cantidad === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "cursor-pointer hover:bg-gray-200"
                }`}
                onClick={() => {
                  if (item.cantidad === 0) return
                  setProductoSeleccionado(item)
                  setQuery(`${item.producto.codigo} - ${item.producto.nombre}`)
                }}
              >
                {item.producto.codigo} — {item.producto.nombre} ({item.cantidad})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Cantidad */}
      {productoSeleccionado && (
        <div className="mb-4 flex gap-2 items-center">
          <input
            type="number"
            min={1}
            max={productoSeleccionado.cantidad}
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            className="p-2 rounded bg-slate-800 text-white w-32"
          />
          <button
            onClick={agregarProducto}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded"
          >
            Agregar
          </button>
        </div>
      )}

      {/* Tabla resumen */}
      {lista.length > 0 && (
        <div className="overflow-x-auto mt-6">
          <table className="min-w-full border border-slate-700 text-black">
            <thead className="bg-slate-700">
              <tr>
                <th className="p-2 text-slate-50">Producto</th>
                <th className="p-2 text-slate-50">Cantidad</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {lista.map((item, i) => (
                <tr key={i} className="border-b border-slate-700">
                  <td className="p-2 text-center">{item.producto.nombre}</td>
                  <td className="p-2 font-bold text-center">{item.cantidad}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => quitarProducto(i)}
                      className="text-red-400 hover:text-red-600"
                    >
                      Quitar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button
            onClick={transferirTodo}
            disabled={loading}
            className={`mt-4 px-6 py-2 rounded ${
              loading ? "bg-slate-600" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Transfiriendo..." : "Transferir todo"}
          </button>
        </div>
      )}
    </div>
  )
}

export default UserTransferencia
