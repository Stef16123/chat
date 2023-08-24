const express = require('express');
const useSocket = require('socket.io');

const app = express();
const server = require('http').Server(app);
const io = useSocket(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  });

app.use(express.json());

const port = 8888
const rooms = new Map();

app.get('/rooms/:id', (req, res) => {
    const roomId =req.params.id
    const obj = rooms.has(roomId) ? {
        users: [...rooms.get(roomId).get('users').values()],
        messages: [...rooms.get(roomId).get('messages').values()]
    } : { users: [], messages: [] }
    res.json(obj);
});

app.post('/rooms', (req, res) => {
    const { roomId, userName}  = req.body;
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Map([
            ['users', new Map()],
            ['messages', []]
        ]));
    };
    res.json({
        status: 200,
        value: [...rooms.keys()]
    });
});

io.on('connection', socket => {
    socket.on('ROOM.JOIN', ({ roomId, userName }) => {
      socket.join(roomId);
      rooms.get(roomId).get('users').set(socket.id, userName);
      const users = [...rooms.get(roomId).get('users').values()];
      socket.broadcast.to(roomId).emit('ROOM.SET_USERS', users);
    });
    console.log('user connected', socket.id);

    socket.on('ROOM.NEW_MESSAGE', ({ roomId, userName, text }) => {
        const obj = { userName, text }
        rooms.get(roomId).get('messages').push(obj);
        socket.broadcast.to(roomId).emit('ROOM.NEW_MESSAGE', obj);
    });

    socket.on('disconnect', () => {
        rooms.forEach((value, roomId) => {
            
            if (value.get('users').delete(socket.id)) {
                const users = [...rooms.get(roomId).get('users').values()];
                socket.broadcast.to(roomId).emit('ROOM.SET_USERS', users)
            };
        });
    });
});



server.listen(port, (err) => {
    if (err) {
        throw Error(err)
    };
    console.log('run server: ' + port);
});
