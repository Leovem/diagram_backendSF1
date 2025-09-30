// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// 🔗 Sequelize (una sola instancia) y modelos
const sequelize = require('./src/config/database');   
require('./src/models/Role');                        
require('./src/models/User');                        

// Rutas
const userRoutes = require('./src/routes');       // /api/users
const roleRoutes = require('./src/roleRoutes');   // /api/roles

const app = express();
const port = process.env.PORT || 5000;

// Servidor HTTP para Socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['*'],
    credentials: true,
  },
});

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);

// Endpoints de salud / prueba
app.get('/api/ping', (_req, res) => res.json({ ok: true, message: 'pong' }));
app.get('/api/db-check', async (_req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT NOW() AS now');
    res.json({ ok: true, dbTime: rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ---- Socket.io ----
let rooms = {};

io.on('connection', (socket) => {
  console.log('Un cliente se ha conectado');

  socket.on('joinRoom', (roomName) => {
    console.log(`Cliente se ha unido a la sala: ${roomName}`);
    if (!rooms[roomName]) rooms[roomName] = 0;
    rooms[roomName] += 1;

    socket.join(roomName);

    io.to(roomName).emit('message', `Un nuevo usuario se ha unido a la sala: ${roomName}`);
    io.emit('activeRooms', Object.keys(rooms));
    socket.emit('joinRoom', `Te has unido correctamente a la sala: ${roomName}`);
  });

  // Broadcast de shapes
  socket.on('shapeChange', ({ roomName, shapes }) => {
    socket.to(roomName).emit('receiveShapes', { shapes });
  });

  // Broadcast de código generado
  socket.on('codeGenerated', ({ roomName, htmlCode, cssCode }) => {
    socket.to(roomName).emit('receiveCode', { htmlCode, cssCode });
  });

  socket.on('disconnect', () => {
    console.log('Un cliente se ha desconectado');
    for (const roomName in rooms) {
      if (rooms[roomName] > 0) rooms[roomName] -= 1;
    }
    io.emit('activeRooms', Object.keys(rooms));
  });
});

// ---- Arranque: autenticar y sincronizar BD UNA sola vez ----
(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a PostgreSQL OK');

    // En desarrollo puedes usar { alter: true }. Si tuviste errores de duplicados, usa simple.
    await sequelize.sync();
    console.log('✅ Tablas sincronizadas');

    server.listen(port, () => {
      console.log(`Servidor corriendo en http://localhost:${port}`);
      console.log(`Healthcheck DB:   http://localhost:${port}/api/db-check`);
      console.log(`Healthcheck ping: http://localhost:${port}/api/ping`);
    });
  } catch (err) {
    console.error('❌ Error al iniciar (DB):', err.message);
    process.exit(1);
  }
})();
