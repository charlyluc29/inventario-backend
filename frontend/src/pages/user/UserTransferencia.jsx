import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"
import { Send } from "lucide-react"

function UserTransferencia({ sucursal }) {
  const [inventario, setInventario] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [destino, setDestino] = useState("")
  const [loading, setLoading] = useState(false)

  // selector
  const [query, setQuery] = useState("")
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [cantidad, setCantidad] = useState("")
  const [lista, setLista] = useState([])

  useEffect(() => {
    if (!sucursal?._id) return

    apiFetch(`/inventario/${sucursal._id}`).then(setInventario)
    apiFetch("/sucursales").then(data =>
      setSucursales(data.filter(s => s._id !== sucursal._id))
    )
  }, [sucursal])

  const productosFiltrados = inventario.filter(item =>
    item.producto.nombre.toLowerCase().includes(query.toLowerCase()) ||
    item.producto.codigo?.toLowerCase().includes(query.toLowerCase())
  )

  const agregarProducto = () => {
    if (!productoSeleccionado || cantidad <= 0) return
    if (cantidad > productoSeleccionado.cantidad) {
      alert("Cantidad supera el stock disponible")
      return
    }
    if (lista.some(i => i.producto._id === productoSeleccionado.producto._id)) {
      alert("Producto ya agregado")
      return
    }

    setLista(prev => [
      ...prev,
      {
        producto: productoSeleccionado.producto,
        cantidad: Number(cantidad)
      }
    ])
    setQuery("")
    setCantidad("")
    setProductoSeleccionado(null)
  }

  const quitarProducto = index => {
    setLista(prev => prev.filter((_, i) => i !== index))
  }

  const enviarTransferencia = async () => {
    if (!destino) return alert("Selecciona sucursal destino")
    if (lista.length === 0) return alert("Agrega productos")

    try {
      setLoading(true)
      await apiFetch("/transferencias", {
        method: "POST",
        body: JSON.stringify({
          sucursalDestino: destino,
          items: lista.map(i => ({
            producto: i.producto._id,
            cantidad: i.cantidad
          }))
        })
      })
      alert("Transferencia enviada (pendiente de aceptación)")
      setLista([])
      setDestino("")
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-slate-800 p-6 rounded-xl shadow space-y-6 text-white">
      {/* HEADER CON ICONO */}
      <div className="mb-6 flex items-center gap-3">
        <Send size={28} className="text-blue-500" />
        <h2 className="text-2xl font-bold text-white">
          Transferir desde {sucursal?.nombre}
        </h2>
      </div>

      {/* DESTINO */}
      <div>
        <label className="block mb-1 font-semibold">Sucursal destino</label>
        <select
          value={destino}
          onChange={e => setDestino(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Selecciona sucursal destino</option>
          {sucursales.map(s => (
            <option key={s._id} value={s._id}>
              {s.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* BUSCADOR */}
      <div className="relative">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar por código o nombre"
          className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        {query && (
          <ul className="absolute w-full bg-white text-black max-h-48 overflow-y-auto rounded shadow z-10">
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

      {/* CANTIDAD */}
      {productoSeleccionado && (
        <div className="flex gap-2 items-center">
          <input
            type="number"
            min={1}
            max={productoSeleccionado.cantidad}
            value={cantidad}
            onChange={e => setCantidad(e.target.value)}
            className="w-32 p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={agregarProducto}
            className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded font-semibold transition"
          >
            Agregar
          </button>
        </div>
      )}

      {/* TABLA */}
      {lista.length > 0 && (
        <div className="overflow-x-auto mt-4">
  <table className="min-w-full border border-gray-600">
    <thead className="bg-amber-300/90 text-black">
      <tr>
        <th className="p-2 text-left">Producto</th>
        <th className="p-2 text-left">Cantidad</th>
        <th className="p-2"></th>
      </tr>
    </thead>

    <tbody className="bg-white text-black">
      {lista.map((i, idx) => (
        <tr
          key={idx}
          className="border-b border-gray-300 hover:bg-gray-100 transition"
        >
          <td className="p-2">{i.producto.nombre}</td>
          <td className="p-2">{i.cantidad}</td>
          <td className="p-2">
            <button
              onClick={() => quitarProducto(idx)}
              className="text-red-500 hover:text-red-700 transition"
            >
              Quitar
            </button>
          </td>
        </tr>
      ))}
    </tbody>
  </table>

  <button
    onClick={enviarTransferencia}
    disabled={loading}
    className={`mt-4 w-full py-2 rounded font-semibold transition ${
      loading
        ? "bg-gray-600 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }`}
  >
    {loading ? "Enviando..." : "Enviar transferencia"}
  </button>
</div>

      )}
    </div>
  )
}

export default UserTransferencia
