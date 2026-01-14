import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"
import { Pencil, Trash2, Boxes } from "lucide-react"

function InventarioGeneral() {
  const [inventario, setInventario] = useState([])
  const [productos, setProductos] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)

  // filtros
  const [productoTexto, setProductoTexto] = useState("")
  const [productoId, setProductoId] = useState("")
  const [sucursalSeleccionada, setSucursalSeleccionada] = useState("")

  // edición
  const [editando, setEditando] = useState(null)
  const [formEdit, setFormEdit] = useState({
    caracteristicas: "",
    precio: "",
    cantidad: ""
  })

  const cargarInventario = async () => {
    setLoading(true)
    const data = await apiFetch("/inventario")

    const prod = []
    const suc = []

    data.forEach(i => {
      if (i.producto && !prod.find(p => p._id === i.producto._id)) {
        prod.push(i.producto)
      }
      if (i.sucursal && !suc.find(s => s._id === i.sucursal._id)) {
        suc.push(i.sucursal)
      }
    })

    setInventario(data)
    setProductos(prod)
    setSucursales(suc)
    setLoading(false)
  }

  useEffect(() => {
    cargarInventario()
  }, [])

  const handleProductoChange = value => {
    setProductoTexto(value)

    const encontrado = productos.find(
      p => `${p.nombre} (${p.codigo})` === value
    )

    setProductoId(encontrado ? encontrado._id : "")
  }

  const inventarioFiltrado = () => {
    let data = [...inventario]

    if (productoId) {
      data = data.filter(i => i.producto._id === productoId)
    }

    if (sucursalSeleccionada) {
      data = data.filter(i => i.sucursal._id === sucursalSeleccionada)
    }

    return data
  }

  const guardarCambios = async () => {
    try {
      await apiFetch(`/productos/codigo/${editando.producto.codigo}`, {
        method: "PUT",
        body: JSON.stringify({
          caracteristicas: formEdit.caracteristicas,
          precio: formEdit.precio
        })
      })

      const diferencia = formEdit.cantidad - editando.cantidad

      if (diferencia > 0) {
        await apiFetch("/inventario/entrada", {
          method: "POST",
          body: JSON.stringify({
            sucursal: editando.sucursal._id,
            producto: editando.producto._id,
            cantidad: diferencia
          })
        })
      }

      if (diferencia < 0) {
        await apiFetch("/inventario/salida", {
          method: "POST",
          body: JSON.stringify({
            sucursal: editando.sucursal._id,
            producto: editando.producto._id,
            cantidad: Math.abs(diferencia)
          })
        })
      }

      setEditando(null)
      cargarInventario()
    } catch (err) {
      alert(err.message || "Error al guardar cambios")
    }
  }

  const eliminarProducto = async item => {
    if (!confirm("¿Eliminar este producto de todo el sistema?")) return

    try {
      await apiFetch(`/productos/codigo/${item.producto.codigo}`, {
        method: "DELETE"
      })

      setInventario(
        inventario.filter(
          i => i.producto.codigo !== item.producto.codigo
        )
      )
    } catch (err) {
      alert(err.message || "Error al eliminar producto")
    }
  }

  if (loading) {
    return <p className="text-slate-500">Cargando inventario...</p>
  }

  return (
    <div>
      {/* TÍTULO */}
      <div className="mb-6 flex items-center gap-3">
        <Boxes size={30} className="text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-800">
          Inventario General
        </h1>
      </div>

      {/* FILTROS */}
      <div className="flex flex-wrap gap-4 mb-6">
        <input
          list="productos"
          placeholder="Buscar producto por nombre o código"
          value={productoTexto}
          onChange={e => handleProductoChange(e.target.value)}
          className="p-2 rounded bg-slate-800 text-white min-w-[280px]"
        />

        <datalist id="productos">
          {productos.map(p => (
            <option key={p._id} value={`${p.nombre} (${p.codigo})`} />
          ))}
        </datalist>

        <select
          value={sucursalSeleccionada}
          onChange={e => setSucursalSeleccionada(e.target.value)}
          className="p-2 rounded bg-slate-800 text-white min-w-[220px]"
        >
          <option value="">Todas las sucursales</option>
          {sucursales.map(s => (
            <option key={s._id} value={s._id}>
              {s.nombre}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setProductoTexto("")
            setProductoId("")
            setSucursalSeleccionada("")
          }}
          className="px-4 py-2 bg-slate-600 rounded text-white hover:bg-slate-500 transition"
        >
          Limpiar filtros
        </button>
      </div>

      {/* TABLA */}
      <table className="min-w-full border border-slate-700 text-center">
        <thead className="bg-amber-400/40 text-slate-900">
          <tr>
            <th className="p-2">Código</th>
            <th className="p-2">Nombre</th>
            <th className="p-2">Características</th>
            <th className="p-2">Cantidad</th>
            <th className="p-2">Sucursal</th>
            <th className="p-2">Precio</th>
            <th className="p-2">Acciones</th>
          </tr>
        </thead>

        <tbody>
          {inventarioFiltrado().length === 0 && (
            <tr>
              <td colSpan="7" className="p-4 text-slate-400">
                No hay resultados
              </td>
            </tr>
          )}

          {inventarioFiltrado().map(i => (
            <tr
              key={i._id}
              className={`border-b transition hover:bg-slate-100 ${
                i.cantidad === 0
                  ? "bg-red-900/30 text-red-900 font-semibold"
                  : "border-slate-700 text-slate-800"
              }`}
            >
              <td className="p-2">{i.producto.codigo}</td>
              <td className="p-2">{i.producto.nombre}</td>
              <td className="p-2">{i.producto.caracteristicas}</td>

              <td className="p-2 font-bold">
                {i.cantidad === 0 ? "SIN STOCK" : i.cantidad}
              </td>

              <td className="p-2">{i.sucursal.nombre}</td>
              <td className="p-2">${i.producto.precio}</td>

              <td className="p-2 flex justify-center gap-2">
                {/* EDITAR */}
                <button
                  onClick={() => {
                    setEditando(i)
                    setFormEdit({
                      caracteristicas: i.producto.caracteristicas,
                      precio: i.producto.precio,
                      cantidad: i.cantidad
                    })
                  }}
                  title="Editar"
                  className="
                    p-2 rounded-lg
                    bg-blue-600/90 hover:bg-blue-600
                    text-white
                    shadow hover:shadow-lg
                    transition
                    flex items-center justify-center
                  "
                >
                  <Pencil size={18} />
                </button>

                {/* ELIMINAR */}
                <button
                  onClick={() => eliminarProducto(i)}
                  title="Eliminar"
                  className="
                    p-2 rounded-lg
                    bg-red-600/90 hover:bg-red-500
                    text-white
                    shadow hover:shadow-lg
                    transition
                    flex items-center justify-center
                  "
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* MODAL */}
      {editando && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-4">Editar producto</h2>

            <input
              className="w-full p-2 border mb-2"
              placeholder="Características"
              value={formEdit.caracteristicas}
              onChange={e =>
                setFormEdit({
                  ...formEdit,
                  caracteristicas: e.target.value
                })
              }
            />

            <input
              className="w-full p-2 border mb-2"
              type="number"
              placeholder="Precio"
              value={formEdit.precio}
              onChange={e =>
                setFormEdit({
                  ...formEdit,
                  precio: e.target.value
                })
              }
            />

            <input
              className="w-full p-2 border mb-4"
              type="number"
              placeholder="Cantidad"
              value={formEdit.cantidad}
              onChange={e =>
                setFormEdit({
                  ...formEdit,
                  cantidad: Number(e.target.value)
                })
              }
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setEditando(null)}
                className="px-4 py-2 bg-gray-400 rounded"
              >
                Cancelar
              </button>
              <button
                onClick={guardarCambios}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InventarioGeneral
