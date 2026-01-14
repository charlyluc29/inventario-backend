import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../services/api";
import jwtDecode from "jwt-decode";

function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });

      console.log("LOGIN RESPONSE:", data);

      if (!data.token) {
        throw new Error("Token no recibido");
      }

      // ✅ Decodificar token
      const decoded = jwtDecode(data.token);

      // Guardar en localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", decoded.role);

      if (decoded.sucursal) {
        localStorage.setItem("sucursal", decoded.sucursal);
      }

      // Actualizar estado global
      onLoginSuccess(data.token);

      // ✅ Redirección correcta
      if (decoded.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/user");
      }

    } catch (err) {
      console.error("Error de login:", err);
      alert(err.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center p-12 bg-gray-100 rounded-lg shadow-lg w-80"
      >
        <h1 className="text-gray-900 text-2xl font-bold mb-6">
          Login
        </h1>

        {/* Username */}
        <div className="relative w-full mb-4">
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder=" "
            className="peer w-full px-3 pt-5 pb-2 border-b border-gray-700 focus:outline-none"
          />
          <label className="absolute left-3 top-2.5 text-sm text-gray-700 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm">
            Username
          </label>
        </div>

        {/* Password */}
        <div className="relative w-full mb-6">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder=" "
            className="peer w-full px-3 pt-5 pb-2 border-b border-gray-700 focus:outline-none"
          />
          <label className="absolute left-3 top-2.5 text-sm text-gray-700 peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-2.5 peer-focus:text-sm">
            Password
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 border border-blue-500 rounded ${
            loading ? "opacity-50" : "hover:bg-blue-500 hover:text-white"
          }`}
        >
          {loading ? "Ingresando..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
