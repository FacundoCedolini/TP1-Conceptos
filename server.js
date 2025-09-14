// server.js
const http = require('http');
const url = require('url');
const fs = require('fs');

const servidor = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);

  // Ruta principal
  if (req.method === 'GET' && parsedUrl.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Servidor funcionando</h1>');
    res.end();
  }

  // Ruta para mostrar el formulario
  else if (req.method === 'GET' && parsedUrl.pathname === '/agregar-registros') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    fs.readFile('form.html', (err, data) => {
      if (err) {
        res.writeHead(500);
        return res.end('Error cargando el formulario.');
      }
      res.end(data);
    });
  }
  
});

const PORT = 3000;
servidor.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
