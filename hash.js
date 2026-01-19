/*actualización de contraseña Admin*/
const bcrypt = require("bcrypt");

(async () => {
  const hash = await bcrypt.hash("Mand23#4", 10);
  console.log(hash);
})();
