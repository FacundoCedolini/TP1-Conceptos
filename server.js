// server.js
const http = require('http');
const url = require('url');
const fs = require('fs');

// Arreglo en memoria para guardar conceptos
let conceptos = [];

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

  // Procesar formulario (POST)
  else if (req.method === 'POST' && parsedUrl.pathname === '/agregar-registros') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      const params = new URLSearchParams(body);
      const nombre = params.get('nombre');
      const descripcion = params.get('descripcion');

      // Guardamos en el arreglo
      conceptos.push({ nombre, descripcion });

      // Redirigir a mostrar registros
      res.writeHead(302, { Location: '/mostrar-registros' });
      res.end();
    });
  }

  // Mostrar registros
  else if (req.method === 'GET' && parsedUrl.pathname === '/mostrar-registros') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.write('<h1>Conceptos guardados</h1>');
    res.write('<ul>');
    conceptos.forEach((c, i) => {
      res.write(`<li><strong>${c.nombre}</strong>: ${c.descripcion}</li>`);
    });
    res.write('</ul>');
    res.end();
  }

  // API REST ///////////////////////////////////////////////////////

  // GET: obtener listado de todos los conceptos
  else if (req.method === 'GET' && parsedUrl.pathname === '/api/conceptos') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(conceptos));
  }

  // GET/id: obtener un concepto en particular
  else if (req.method === 'GET' && parsedUrl.pathname.startsWith('/api/conceptos/')) {
    const id = parseInt(parsedUrl.pathname.split('/')[3]);
    const concepto = conceptos.find(c => c.id === id);

    if (concepto) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(concepto));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Concepto no encontrado' }));
    }
  }

  // POST: crear un concepto en JSON
  else if (req.method === 'POST' && parsedUrl.pathname === '/api/conceptos') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        if (!data.nombre || !data.descripcion) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ error: 'Faltan campos: nombre y descripcion son requeridos' }));
        }

        const nuevoConcepto = {
          id: conceptos.length + 1,
          nombre: data.nombre,
          descripcion: data.descripcion
        };

        conceptos.push(nuevoConcepto);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(nuevoConcepto));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'JSON inválido' }));
      }
    });
  }

  // DELETE: eliminar todos los conceptos
  else if (req.method === 'DELETE' && parsedUrl.pathname === '/api/conceptos') {
    conceptos = [];
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ mensaje: 'Todos los conceptos eliminados' }));
  }

  // DELETE/id: eliminar un concepto en particular
  else if (req.method === 'DELETE' && parsedUrl.pathname.startsWith('/api/conceptos/')) {
    const id = parseInt(parsedUrl.pathname.split('/')[3]);
    const index = conceptos.findIndex(c => c.id === id);

    if (index !== -1) {
      conceptos.splice(index, 1);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ mensaje: `Concepto con id ${id} eliminado` }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Concepto no encontrado' }));
    }
  }

  // Si la ruta no existe
  else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Ruta no encontrada');
  }

  

});

const PORT = 3000;
servidor.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
