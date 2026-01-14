import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"
import {
  Send,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"

function UserTransferenciasEnviadas() {
  const [transferencias, setTransferencias] = useState([])
  const [loading, setLoading] = useState(true)

  const cargarEnviadas = async () => {
    try {
      setLoading(true)
      const data = await apiFetch("/transferencias/enviadas")
      setTransferencias(data)
    } catch (err) {
      console.error(err)
      alert(err.message || "Error cargando transferencias enviadas")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEnviadas()
  }, [])

  if (loading) {
    return (
      <p className="text-slate-400">
        Cargando transferencias enviadas...
      </p>
    )
  }

  const estadoUI = {
    pendiente: {
      label: "Pendiente",
      icon: Clock,
      className:
        "text-yellow-700 bg-yellow-100 border-yellow-300"
    },
    aceptada: {
      label: "Aceptada",
      icon: CheckCircle,
      className:
        "text-green-700 bg-green-100 border-green-300"
    },
    rechazada: {
      label: "Rechazada",
      icon: XCircle,
      className:
        "text-red-700 bg-red-100 border-red-300"
    }
  }

  return (
    <div className="space-y-8">
      {/* TÍTULO */}
      <div className="mb-6 flex items-center gap-3">
        <Send size={28} className="text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-800">
          Transferencias enviadas
        </h1>
      </div>

      {transferencias.length === 0 && (
        <p className="text-slate-400">
          No has enviado transferencias
        </p>
      )}

      {transferencias.map(t => {
        const estado = estadoUI[t.estado]
        const Icon = estado.icon

        return (
          <div
            key={t._id}
            className="bg-slate-200 rounded-xl p-6 shadow-md space-y-4"
          >
            {/* CABECERA */}
            <div className="flex justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-slate-800">
                  Destino:
                  <span className="font-semibold ml-2 text-black">
                    {t.sucursalDestino?.nombre}
                  </span>
                </p>
              </div>

              {/* ESTADO */}
              <span
                className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold border ${estado.className}`}
              >
                <Icon size={16} />
                {estado.label}
              </span>
            </div>

            {/* TABLA */}
            <div className="overflow-x-auto">
              <table className="min-w-full border border-slate-600">
                <thead className="bg-amber-400/50">
                  <tr>
                    <th className="p-2 text-left">Producto</th>
                    <th className="p-2 text-left">Cantidad</th>
                  </tr>
                </thead>

                <tbody>
                  {t.items.map((i, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-slate-500"
                    >
                      <td className="p-2">
                        {i.producto?.nombre ||
                          "Producto eliminado"}
                      </td>
                      <td className="p-2 font-bold">
                        {i.cantidad}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default UserTransferenciasEnviadas
