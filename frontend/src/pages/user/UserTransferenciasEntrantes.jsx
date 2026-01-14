import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"
import {
  Inbox,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react"

function UserTransferenciasEntrantes() {
  const [transferencias, setTransferencias] = useState([])
  const [loading, setLoading] = useState(true)

  const cargarEntrantes = async () => {
    try {
      setLoading(true)
      const data = await apiFetch("/transferencias/entrantes")
      setTransferencias(data)
    } catch (err) {
      console.error(err)
      alert(err.message || "Error cargando transferencias entrantes")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    cargarEntrantes()
  }, [])

  if (loading) {
    return (
      <p className="text-slate-400">
        Cargando transferencias entrantes...
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
        <Inbox size={28} className="text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-800">
          Transferencias entrantes
        </h1>
      </div>

      {transferencias.length === 0 && (
        <p className="text-slate-400">
          No tienes transferencias entrantes
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
                  Desde:
                  <span className="font-semibold ml-2 text-black">
                    {t.sucursalOrigen?.nombre}
                  </span>
                </p>

                <p className="text-sm text-slate-800">
                  Enviado por:
                  <span className="ml-2 text-black">
                    {t.usuarioOrigen?.username}
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
                    <th className="p-2 text-left">Código</th>
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
                        {i.producto?.codigo || "—"}
                      </td>
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

            {/* ACCIONES */}
            {t.estado === "pendiente" && (
              <div className="flex gap-4">
                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        "¿Aceptar esta transferencia?"
                      )
                    )
                      return

                    await apiFetch(
                      `/transferencias/${t._id}/aceptar`,
                      { method: "PUT" }
                    )

                    cargarEntrantes()
                  }}
                  className="px-6 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition"
                >
                  Aceptar
                </button>

                <button
                  onClick={async () => {
                    if (
                      !confirm(
                        "¿Rechazar esta transferencia?"
                      )
                    )
                      return

                    await apiFetch(
                      `/transferencias/${t._id}/rechazar`,
                      { method: "PUT" }
                    )

                    cargarEntrantes()
                  }}
                  className="px-6 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
                >
                  Rechazar
                </button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export default UserTransferenciasEntrantes
