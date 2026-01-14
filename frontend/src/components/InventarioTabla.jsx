function InventarioTabla({ inventario }) {
  return (
    <table className="w-full text-white border-collapse">
      <thead>
        <tr className="bg-slate-700">
          <th className="p-2">Producto</th>
          <th className="p-2">Modelo</th>
          <th className="p-2">Cantidad</th>
        </tr>
      </thead>
      <tbody>
        {inventario.map((item) => (
          <tr key={item._id} className="border-b border-slate-700">
            <td className="p-2">{item.producto?.nombre}</td>
            <td className="p-2">{item.producto?.modelo}</td>
            <td className="p-2">{item.cantidad}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default InventarioTabla
