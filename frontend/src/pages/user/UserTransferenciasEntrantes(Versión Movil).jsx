import { useEffect, useState } from "react"
import { apiFetch } from "../../services/api"
import {
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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        📥 Transferencias entrantes
      </h1>

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
            className="bg-slate-200 rounded-xl p-4 shadow space-y-4"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start gap-2">
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-semibold">
                    Desde:
                  </span>{" "}
                  {t.sucursalOrigen?.nombre}
                </p>

                <p className="text-sm text-slate-700">
                  {t.usuarioOrigen?.username}
                </p>
              </div>

              {/* ESTADO */}
              <span
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border ${estado.className}`}
              >
                <Icon size={14} />
                {estado.label}
              </span>
            </div>

            {/* PRODUCTOS – MÓVIL */}
            <div className="space-y-2">
              {t.items.map((i, idx) => (
                <div
                  key={idx}
                  className="flex justify-between bg-slate-300 rounded-lg p-2 text-sm"
                >
                  <div>
                    <p className="font-semibold">
                      {i.producto?.nombre ||
                        "Producto eliminado"}
                    </p>
                    <p className="text-xs text-slate-600">
                      {i.producto?.codigo || "—"}
                    </p>
                  </div>

                  <span className="font-bold">
                    × {i.cantidad}
                  </span>
                </div>
              ))}
            </div>

            {/* BOTONES – MÓVIL */}
            {t.estado === "pendiente" && (
              <div className="flex flex-col gap-2">
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
                  className="w-full py-2 rounded-lg bg-green-600 text-white font-semibold"
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
                  className="w-full py-2 rounded-lg bg-red-600 text-white font-semibold"
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
