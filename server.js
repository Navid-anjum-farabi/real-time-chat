const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const {userJoin,getCurrentUser,userLeave,getRoomUser} = require('./utils/users');


const app = express();
const server = http.createServer(app);
const io = socketio(server);

const botName = 'Bank Asia  ';

// set static folder //
app.use(express.static(path.join(__dirname, 'public')));

// runs when a clients connect-------------------------|||
io.on('connection', socket=>{
    socket.on('joinRoom', ({username,room})=>{
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
          // WELLCOME CURRENT USER//  
     socket.emit('message', formatMessage(botName , 'what is your emergency ?'));

     // BROADCAST WHEN A USER CONNECTS //
          socket.broadcast.to(user.room).emit('message', formatMessage(botName,`${user.username} joined the chat`));
          //send user and room info//
          io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getRoomUser(user.room)
          });


        })


        //listen for chatMessage
        socket.on('chatMessage', msg =>{
            const user = getCurrentUser(socket.id);
            io.to(user.room).emit('message', formatMessage(user.username, msg));
        });

        // runs when user is disconnect//
    socket.on('disconnect', ()=>{
        const user = userLeave(socket.id);

        if (user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the chat`)); 

            //send user and room info//
          io.to(user.room).emit('roomUsers',{
            room : user.room,
            users : getRoomUser(user.room)
          });

        }
        
      });
}); //-------------------------------------------------------|||

const PORT = 3000 || process.env.PORT;

server.listen(PORT, ()=> console.log(`server running on ${PORT}`));