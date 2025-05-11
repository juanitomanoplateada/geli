const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;

// ✅ Ruta correcta al browser build
const DIST_FOLDER = path.join(__dirname, 'dist/geli/browser/browser');

app.use(express.static(DIST_FOLDER));

// ✅ Servir index.html desde la carpeta browser
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_FOLDER, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
