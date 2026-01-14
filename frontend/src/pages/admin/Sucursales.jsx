import { useEffect, useState } from "react"
import { useAuth } from "../../hooks/useAuth"

function Sucursales({ onSelectSucursal }) {
  const [sucursales, setSucursales] = useState([])
  const { token } = useAuth()

  useEffect(() => {
    fetch("http://localhost:3000/api/sucursales", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setSucursales(data))
      .catch(err => {
        console.error("Error al cargar sucursales:", err)
      })
  }, [token])

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-slate-800">
        Sucursales
      </h1>

      {sucursales.map(sucursal => (
        <div
          key={sucursal._id}
          onClick={() => onSelectSucursal(sucursal)}
          className="
            border border-slate-200
            p-4 mb-4 rounded-lg
            cursor-pointer
            bg-white
            hover:bg-blue-100
            hover:shadow-sm
            transition
          "
        >
          <h3 className="text-xl font-semibold text-slate-800">
            {sucursal.nombre}
          </h3>

          <p className="text-slate-600">
            {sucursal.direccion}
          </p>
        </div>
      ))}
    </div>
  )
}

export default Sucursales
