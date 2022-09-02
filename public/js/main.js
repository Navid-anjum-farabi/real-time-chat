const chatFrom = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//----GET USER NAME N ROOM FROM URL---//
const { username ,room} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
}); 

const socket = io();

//----join rooms---//
socket.emit('joinRoom', {username, room});

//--- get room and users--//
socket.on('roomUsers', ({room, users})=>{
    outputRoomName(room);
    outputUsers(users);
});

//----msg from server---//
socket.on('message', message =>{
    console.log(message);
    outputMessage(message);

    //--scroll down chat msg--//
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

//---message submit---//
chatFrom.addEventListener('submit', e =>{
    e.preventDefault();
    // get msg text
    const msg = e.target.elements.msg.value;
    // emit msg to the server
    socket.emit('chatMessage', msg);
    // clear chat text input //
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

//---output msg to DOM----//
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML= `<p class="meta"> ${message.username}     <span>  ${message.time}</span> </p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

//--- add room name to DOM

function outputRoomName(room){
    roomName.innerText= room;
}

//-- add usser name to the room DOM

function outputUsers(users){
    userList.innerHTML = `${users.map(user => `<li>${user.username}</li>`).join('')}`;
}