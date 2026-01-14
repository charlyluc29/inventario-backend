import { useState } from "react"

import InventarioSucursalInventario from "./InventarioSucursalInventario"
import InventarioSucursalEntradas from "./InventarioSucursalEntradas"
import InventarioSucursalSalidas from "./InventarioSucursalSalidas"
import InventarioSucursalTransferencia from "./InventarioSucursalTransferencia"
import InventarioSucursalMovimientos from "./InventarioSucursalMovimientos"

function SucursalDetalle({ sucursal, volver }) {
  const [vista, setVista] = useState("inventario")

  return (
    <div>
      {/* Volver */}
      <button
        onClick={volver}
        className="mb-6 text-blue-800 hover:underline"
      >
        ← Volver a sucursales
      </button>

      {/* Título */}
      <h1 className="text-3xl font-bold mb-6">
        {sucursal.nombre}
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          ["inventario", "Inventario"],
          ["entradas", "Entradas"],
          ["salidas", "Salidas"],
          ["transferencias", "Transferencias"],
          ["movimientos", "Movimientos"]
        ].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setVista(key)}
            className={`px-4 py-2 rounded font-semibold ${
              vista === key
                ? "bg-blue-600 text-white"
                : "bg-slate-700 text-slate-300 hover:bg-slate-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="bg-slate-800 p-4 rounded-xl">
        {vista === "inventario" && (
          <InventarioSucursalInventario sucursal={sucursal} />
        )}

        {vista === "entradas" && (
          <InventarioSucursalEntradas sucursal={sucursal} />
        )}

        {vista === "salidas" && (
          <InventarioSucursalSalidas sucursal={sucursal} />
        )}

        {vista === "transferencias" && (
          <InventarioSucursalTransferencia sucursal={sucursal} />
        )}

        {vista === "movimientos" && (
          <InventarioSucursalMovimientos sucursal={sucursal} />
        )}
      </div>
    </div>
  )
}

export default SucursalDetalle
