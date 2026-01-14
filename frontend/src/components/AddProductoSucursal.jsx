import { useEffect, useState } from "react"
import { apiFetch } from "../services/api"

function AddProductoSucursal({ sucursalId, onAdded }) {
  const [productos, setProductos] = useState([])
  const [producto, setProducto] = useState("")
  const [cantidad, setCantidad] = useState("")

  useEffect(() => {
    apiFetch("/productos")
      .then(setProductos)
      .catch(console.error)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()

    await apiFetch("/inventario", {
      method: "POST",
      body: JSON.stringify({
        producto,
        sucursal: sucursalId,
        cantidad: Number(cantidad),
      }),
    })

    setCantidad("")
    onAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 p-4 rounded-xl mb-4">
      <h2 className="text-white mb-2 font-bold">Agregar producto</h2>

      <select
        className="w-full mb-2 p-2 rounded"
        value={producto}
        onChange={(e) => setProducto(e.target.value)}
        required
      >
        <option value="">Selecciona producto</option>
        {productos.map((p) => (
          <option key={p._id} value={p._id}>
            {p.nombre} ({p.codigo})
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Cantidad"
        className="w-full p-2 rounded mb-2"
        value={cantidad}
        onChange={(e) => setCantidad(e.target.value)}
        required
      />

      <button className="w-full bg-blue-600 text-white py-2 rounded">
        Agregar
      </button>
    </form>
  )
}

export default AddProductoSucursal
