const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 10000;

// ⚠️ Asegúrate de que esta ruta coincida con donde Angular deja el `index.html`
const DIST_FOLDER = path.join(__dirname, "dist/geli/browser");

app.use(express.static(DIST_FOLDER));

app.get("*", (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
