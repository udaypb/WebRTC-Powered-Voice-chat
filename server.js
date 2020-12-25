const express = require('express');
const app = express();
const http = require('http').Server(app);


const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;



http.listen(PORT, () => {
    console.log('listening on port ', PORT);
});


app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

app.use(express.static('public'));


const activeUsers = {};

//accepting new connections
io.on('connection', (socket) => {
    console.log('new connection from client ', socket.id);

    socket.on('userName', (data) => {
        activeUsers[socket.id] = data;
        console.log(activeUsers);

        io.sockets.emit('newUserConnected', activeUsers);
    });
});
