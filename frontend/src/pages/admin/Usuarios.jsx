import { useEffect, useState, useMemo } from "react"
import { apiFetch } from "../../services/api"
import { Users, PlusCircle } from "lucide-react"

function Usuarios() {
  const [seccion, setSeccion] = useState("lista") // lista | nuevo | editar
  const [usuarios, setUsuarios] = useState([])
  const [sucursales, setSucursales] = useState([])
  const [loading, setLoading] = useState(true)

  const [usuarioEditando, setUsuarioEditando] = useState(null)

  // Filtros
  const [filtroUsuario, setFiltroUsuario] = useState("")
  const [filtroSucursal, setFiltroSucursal] = useState("")

  // Formulario
  const [form, setForm] = useState({
    username: "",
    password: "",
    sucursal: ""
  })

  // ===============================
  // Cargar usuarios
  // ===============================
  const cargarUsuarios = async () => {
    try {
      const data = await apiFetch("/usuarios")
      setUsuarios(data.filter(u => u.role === "user"))
    } catch (err) {
      alert(err.message)
    } finally {
      setLoading(false)
    }
  }

  // ===============================
  // Cargar sucursales
  // ===============================
  const cargarSucursales = async () => {
    try {
      const data = await apiFetch("/sucursales")
      setSucursales(data)
    } catch (err) {
      alert(err.message)
    }
  }

  useEffect(() => {
    cargarUsuarios()
    cargarSucursales()
  }, [])

  // ===============================
  // Usuarios filtrados
  // ===============================
  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter(u => {
      const coincideUsuario =
        !filtroUsuario ||
        u.username.toLowerCase().includes(filtroUsuario.toLowerCase())

      const coincideSucursal =
        !filtroSucursal || u.sucursal?._id === filtroSucursal

      return coincideUsuario && coincideSucursal
    })
  }, [usuarios, filtroUsuario, filtroSucursal])

  // ===============================
  // Manejar formulario
  // ===============================
  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  // ===============================
  // Crear usuario
  // ===============================
  const crearUsuario = async e => {
    e.preventDefault()

    try {
      await apiFetch("/usuarios", {
        method: "POST",
        body: JSON.stringify(form)
      })

      alert("Usuario creado correctamente")

      setForm({ username: "", password: "", sucursal: "" })
      setSeccion("lista")
      cargarUsuarios()
    } catch (err) {
      alert(err.message)
    }
  }

  // ===============================
  // Iniciar edición
  // ===============================
  const iniciarEdicion = usuario => {
    setUsuarioEditando(usuario)
    setForm({
      username: usuario.username,
      password: "",
      sucursal: usuario.sucursal?._id || ""
    })
    setSeccion("editar")
  }

  // ===============================
  // Guardar cambios
  // ===============================
  const actualizarUsuario = async e => {
    e.preventDefault()

    const payload = {
      username: form.username,
      sucursal: form.sucursal
    }

    if (form.password.trim()) {
      payload.password = form.password
    }

    try {
      await apiFetch(`/usuarios/${usuarioEditando._id}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      })

      alert("Usuario actualizado correctamente")

      setUsuarioEditando(null)
      setForm({ username: "", password: "", sucursal: "" })
      setSeccion("lista")
      cargarUsuarios()
    } catch (err) {
      alert(err.message)
    }
  }

  // ===============================
  // Activar / Desactivar
  // ===============================
  const desactivarUsuario = async id => {
    if (!confirm("¿Desactivar este usuario?")) return

    await apiFetch(`/usuarios/${id}/desactivar`, { method: "PUT" })
    setUsuarios(prev =>
      prev.map(u => (u._id === id ? { ...u, activo: false } : u))
    )
  }

  const reactivarUsuario = async id => {
    if (!confirm("¿Reactivar este usuario?")) return

    await apiFetch(`/usuarios/${id}/reactivar`, { method: "PUT" })
    setUsuarios(prev =>
      prev.map(u => (u._id === id ? { ...u, activo: true } : u))
    )
  }

  if (loading) {
    return <p className="text-slate-500">Cargando usuarios...</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de usuarios</h1>

      {/* MENÚ */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => setSeccion("lista")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition
            ${
              seccion === "lista"
                ? "bg-blue-600/80 text-white shadow"
                : "bg-slate-700 hover:bg-slate-600 text-slate-200"
            }`}
        >
          <Users size={18} />
          Usuarios
        </button>

        <button
          onClick={() => setSeccion("nuevo")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl font-semibold transition
            ${
              seccion === "nuevo"
                ? "bg-green-600/80 text-white shadow"
                : "bg-slate-700 hover:bg-slate-600 text-slate-200"
            }`}
        >
          <PlusCircle size={18} />
          Nuevo usuario
        </button>
      </div>

      {/* LISTA */}
      {seccion === "lista" && (
        <>
          {/* FILTROS */}
          <div className="flex gap-4 mb-6 p-4 rounded-xl">
            <input
              list="usuarios-activos"
              placeholder="Buscar usuario"
              value={filtroUsuario}
              onChange={e => setFiltroUsuario(e.target.value)}
              className="
                p-2 rounded
                bg-slate-800
                text-slate-100
                placeholder-slate-400
                border border-slate-600
                focus:outline-none
                focus:ring-2 focus:ring-blue-500
                min-w-[220px]
              "
            />

            <datalist id="usuarios-activos">
              {usuarios.filter(u => u.activo).map(u => (
                <option key={u._id} value={u.username} />
              ))}
            </datalist>

            <select
              value={filtroSucursal}
              onChange={e => setFiltroSucursal(e.target.value)}
              className="
                p-2 rounded
                bg-slate-800
                text-slate-100
                border border-slate-600
                focus:outline-none
                focus:ring-2 focus:ring-blue-500
                min-w-[220px]
              "
            >
              <option value="">Todas las sucursales</option>
              {sucursales.map(s => (
                <option key={s._id} value={s._id}>
                  {s.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* TABLA */}
          <table className="min-w-full border border-slate-700 text-center">
            <thead className="bg-amber-400/40">
              <tr>
                <th className="p-2">Usuario</th>
                <th className="p-2">Sucursal</th>
                <th className="p-2">Estado</th>
                <th className="p-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(u => (
                <tr key={u._id} className="border-b border-slate-700">
                  <td className="p-2">{u.username}</td>
                  <td className="p-2">{u.sucursal?.nombre || "—"}</td>
                  <td className="p-2">
                    {u.activo ? "Activo" : "Inactivo"}
                  </td>
                  <td className="p-2 flex justify-center gap-2">
                    <button
                      onClick={() => iniciarEdicion(u)}
                      className="bg-blue-600 px-3 py-1 rounded hover:shadow"
                    >
                      Editar
                    </button>

                    {u.activo ? (
                      <button
                        onClick={() => desactivarUsuario(u._id)}
                        className="bg-red-600 px-3 py-1 rounded hover:shadow"
                      >
                        Desactivar
                      </button>
                    ) : (
                      <button
                        onClick={() => reactivarUsuario(u._id)}
                        className="bg-green-600 px-3 py-1 rounded hover:shadow"
                      >
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* NUEVO */}
      {seccion === "nuevo" && (
        <div className="flex justify-center items-center py-1">
        <form
          onSubmit={crearUsuario}
          className="bg-slate-800 p-6 rounded-xl max-w-xl"
        >
          <h2 className="text-xl font-bold mb-4 text-white">Nuevo usuario</h2>

          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Usuario"
            className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
            required
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Contraseña"
            className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
            required
          />

          <select
            name="sucursal"
            value={form.sucursal}
            onChange={handleChange}
            className="w-full mb-4 p-2 rounded bg-slate-700 text-white"
            required
          >
            <option value="">Selecciona sucursal</option>
            {sucursales.map(s => (
              <option key={s._id} value={s._id}>
                {s.nombre}
              </option>
            ))}
          </select>

          <button className="w-full bg-green-600 py-2 rounded">
            Crear usuario
          </button>
        </form>
        </div>
      )}

      {/* EDITAR */}
      {seccion === "editar" && (
        <form
          onSubmit={actualizarUsuario}
          className="bg-slate-800 p-6 rounded-xl max-w-xl"
        >
          <h2 className="text-xl font-bold mb-4">Editar usuario</h2>

          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
            required
          />

          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Nueva contraseña (opcional)"
            className="w-full mb-3 p-2 rounded bg-slate-700 text-white"
          />

          <select
            name="sucursal"
            value={form.sucursal}
            onChange={handleChange}
            className="w-full mb-4 p-2 rounded bg-slate-700 text-white"
            required
          >
            {sucursales.map(s => (
              <option key={s._id} value={s._id}>
                {s.nombre}
              </option>
            ))}
          </select>

          <button className="w-full bg-blue-600 py-2 rounded">
            Guardar cambios
          </button>
        </form>
      )}
    </div>
  )
}

export default Usuarios
