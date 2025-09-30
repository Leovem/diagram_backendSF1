// server.js
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const socketIo = require('socket.io')

// 🔗 Sequelize y modelos (no toco esto)
const sequelize = require('./src/config/database')
require('./src/models/Role')
require('./src/models/User')

// Rutas
const userRoutes = require('./src/routes')        // /api/users
const roleRoutes = require('./src/roleRoutes')    // /api/roles

const app = express()

// 👇 Usa el PORT que da Railway
const PORT = process.env.PORT || process.env.RAILWAY_PORT || 3000

// 🔒 Orígenes permitidos (ajusta tu dominio real si tienes frontend en producción)
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'https://diagram-frontend-sf-1-gc4t.vercel.app',
]

// CORS para REST
app.use(cors({
  origin: ALLOWED_ORIGINS,
  methods: ['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
  credentials: true,
}))

app.use(express.json())

// Health root (algunos proxies hacen GET /)
app.get('/', (_req, res) => res.send('OK'))

// Rutas API
app.use('/api/users', userRoutes)
app.use('/api/roles', roleRoutes)

// Endpoints de salud / prueba
app.get('/api/ping', (_req, res) => res.json({ ok: true, message: 'pong' }))
app.get('/api/db-check', async (_req, res) => {
  try {
    const [rows] = await sequelize.query('SELECT NOW() AS now')
    res.json({ ok: true, dbTime: rows[0].now })
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message })
  }
})

// Servidor HTTP para Socket.io
const server = http.createServer(app)

// CORS para Socket.IO (importante que coincida con REST)
const io = socketIo(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET','POST'],
    credentials: true,
  },
  // path: '/socket.io', // por defecto ya es /socket.io
  transports: ['websocket','polling'], // deja ambos; el cliente puede forzar 'websocket'
})

// ---- Socket.io ----
let rooms = {}

io.on('connection', (socket) => {
  console.log('🔌 socket connected', socket.id)

  socket.on('joinRoom', (roomName) => {
    if (!rooms[roomName]) rooms[roomName] = 0
    rooms[roomName] += 1
    socket.join(roomName)
    io.to(roomName).emit('message', `Un nuevo usuario se ha unido a la sala: ${roomName}`)
    io.emit('activeRooms', Object.keys(rooms))
    socket.emit('joinRoom', `Te has unido correctamente a la sala: ${roomName}`)
  })

  socket.on('shapeChange', ({ roomName, shapes }) => {
    socket.to(roomName).emit('receiveShapes', { shapes })
  })

  socket.on('codeGenerated', ({ roomName, htmlCode, cssCode }) => {
    socket.to(roomName).emit('receiveCode', { htmlCode, cssCode })
  })

  socket.on('disconnect', () => {
    for (const roomName in rooms) {
      if (rooms[roomName] > 0) rooms[roomName] -= 1
    }
    io.emit('activeRooms', Object.keys(rooms))
  })
})

// ---- Arranque ----
;(async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ Conexión a PostgreSQL OK')

    await sequelize.sync()
    console.log('✅ Tablas sincronizadas')

    // Escucha en 0.0.0.0 para que Railway exponga correctamente
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 API escuchando en puerto ${PORT}`)
    })
  } catch (err) {
    console.error('❌ Error al iniciar (DB):', err.message)
    process.exit(1)
  }
})()
