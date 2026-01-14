import { useEffect, useState } from "react";
import { Package, Building2, ArrowUpRight } from "lucide-react";
import { apiFetch } from "../../services/api";
import { getUserRole } from "../../utils/auth"; // <-- ruta correcta

function Dashboard() {
  const [productos, setProductos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [transferenciasPendientes, setTransferenciasPendientes] = useState(0);

  useEffect(() => {
    // Productos
    apiFetch("/productos")
      .then((res) => setProductos(res))
      .catch((err) => console.error(err));

    // Sucursales
    apiFetch("/sucursales")
      .then((res) => setSucursales(res))
      .catch((err) => console.error(err));

    // Transferencias entrantes → solo pendientes
    apiFetch("/transferencias/entrantes?estado=pendiente")
      .then((res) => setTransferenciasPendientes(res.length))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-6">
      {/* Título */}
      <div>
        <h1 className="text-4xl font-bold text-slate-800">Dashboard</h1>
        <p className="text-slate-600">Resumen general del sistema</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Productos */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Productos</p>
              <p className="text-3xl font-bold text-slate-800">{productos.length}</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 text-blue-600">
              <Package size={24} />
            </div>
          </div>
        </div>

        {/* Sucursales */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Sucursales</p>
              <p className="text-3xl font-bold text-slate-800">{sucursales.length}</p>
            </div>
            <div className="p-3 rounded-full bg-emerald-50 text-emerald-600">
              <Building2 size={24} />
            </div>
          </div>
        </div>

        {/* Transferencias pendientes */}
        <div className="bg-white border border-slate-200 rounded-lg p-6 hover:shadow-sm transition">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm">Transferencias pendientes</p>
              <p className="text-3xl font-bold text-slate-800">{transferenciasPendientes}</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50 text-yellow-600">
              <ArrowUpRight size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
