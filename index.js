const socket = io('https://pointing-poker-backend.herokuapp.com')


let invocation = new XMLHttpRequest();
let url = 'https://pointing-poker-backend.herokuapp.com';

// function callOtherDomain() {
//   if(invocation) {
//     invocation.open('GET', url, true);
//     invocation.onreadystatechange = handler;
//     invocation.send();
//   }
// }
const popup = document.getElementsByClassName('popup-cont')[0]
const connectBtn = document.getElementsByClassName('connect')[0]
const nameInput = document.getElementsByClassName('name-input')[0]
const area = document.getElementsByClassName('message-container')[0]
const send = document.getElementsByClassName('send-button')[0]
const messageInput = document.getElementsByClassName('input')[0]
const users = document.getElementsByClassName('users')[0]
const kick = document.getElementsByClassName('kick')[0]
const kickSelect = document.getElementsByClassName('kick-select')[0]
const kickUser = document.getElementsByClassName('kpopup')[0]
const typingArea = document.getElementsByClassName('typing')[0]
let nameOfUser = '';

connectBtn.addEventListener('click', () => {
  socket.emit('connect-user', nameInput.value)
  nameOfUser = nameInput.value;
  popup.style.display = "none";
})

send.addEventListener('click', () => {
  if(messageInput.value !== '')
    socket.emit('chat-message-request', messageInput.value)
  area.innerHTML += message(["you", messageInput.value])
  messageInput.value = ''
})

users.addEventListener('click', () => {
  socket.emit('chat-get-users-request')
})

kick.addEventListener('click', () => {
  socket.emit('chat-get-kick-request')
})

socket.on('chat-kick-users-list', users => {
  if (users.length > 1) {
    kickSelect.style.display = 'flex';
    for (let i = 0; i < users.length; i++) {
      if (users[i] != nameOfUser)
        kickUser.innerHTML += addKickUser(users[i])
    }
    const kickThis = document.getElementsByClassName('kick-this')
    for (let i = 0; i < kickThis.length; i++) {
      kickThis[i].addEventListener('click', () => {
        socket.emit('chat-kick-user', kickThis[i].innerHTML)
        socket.emit('chat-user-opinion', true)
        kickSelect.style.display = 'none';
      })
    }
  }
})

const action = (args) => {
  alert(args)
}

const ret = (func) => socket.on('chat-send-all-users', (args)=>func(args))

ret(action)


socket.on('chat-user-connected', userName => {
  area.innerHTML += connectMessage(userName, true)
})

socket.on('chat-relogin', () => {
  alert('Name already taken!')
  popup.style.display = "flex";
})

socket.on('chat-message-post', data => {
  area.innerHTML += message(data)
})

socket.on('chat-user-disconnected', userName => {
  area.innerHTML += connectMessage(userName, false)
})

socket.on('chat-kick-offer', name => {
  if(nameOfUser !== name) {
    kickPopup(name)
  }
  else {
    alert('Somebody wants to kick you!')
    socket.emit('chat-user-opinion', false)
  }
})

socket.on('chat-force-disconnect', victim => {
  if (victim == nameOfUser) {
    socket.disconnect()
    alert('You have been disconnected')
  }
})

socket.on('chat-kick-declined', victim => {
  alert(`${victim} has beeen spared`)
})

socket.on('chat-this-user-is-typing', () => {
  typingArea.innerHTML = `Somebody is typing`
  setTimeout(() => 
    typingArea.innerHTML = ``, 3000
  )
})

let isSendable = true;

const isTyping = () => {
  if (isSendable) {
    socket.emit('chat-user-is-typing', nameOfUser)
    isSendable = false
    setTimeout(() => {
      isSendable = true
    }, 3000)
  }
} 