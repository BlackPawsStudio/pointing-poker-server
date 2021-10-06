const socket = io('http://localhost:3000')


let invocation = new XMLHttpRequest();
let url = 'http://localhost:3000';

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
const master = document.getElementsByClassName('master')[0]
let nameOfUser = '';

connectBtn.addEventListener('click', () => {
  socket.emit('create-user', {name: nameInput.value, status: null, role: 'user'})
  popup.style.display = "none";
})

master.addEventListener('click', () => {
  console.log(nameOfUser)
  socket.emit('set-master', nameOfUser)
})

send.addEventListener('click', () => {
  if(messageInput.value !== '')
    socket.emit('message-send', messageInput.value)
  area.innerHTML += message(["you", messageInput.value])
  messageInput.value = ''
})

users.addEventListener('click', () => {
  socket.emit('request-players')
})

kick.addEventListener('click', () => {
  socket.emit('user-want-to-kick-user')
})

socket.on('kick-users-list', users => {
  console.log(users)
  if (users.length > 1) {
    kickSelect.style.display = 'flex';
    for (let i = 0; i < users.length; i++) {
      if (users[i] != nameOfUser)
        kickUser.innerHTML += addKickUser(users[i])
    }
    const kickThis = document.getElementsByClassName('kick-this')
    for (let i = 0; i < kickThis.length; i++) {
      kickThis[i].addEventListener('click', () => {
        socket.emit('kick-user', kickThis[i].innerHTML)
        socket.emit('user-opinion', true)
        kickSelect.style.display = 'none';
      })
    }
  }
})

const action = (args) => {
  alert(args)
}

const ret = (func) => socket.on('send-all-users', (args)=>func(args))

ret(action)


socket.on('user-connected', userName => {
  area.innerHTML += connectMessage(userName, true)
  nameOfUser = userName
  console.log(userName)
})

socket.on('relogin', () => {
  alert('Name already taken!')
  popup.style.display = "flex";
})

socket.on('recieve-players', users => {
  console.log(users)
})

socket.on('recieving-messages', data => {
  area.innerHTML += message(data)
})

socket.on('user-disconnected', userName => {
  area.innerHTML += connectMessage(userName, false)
  console.log(userName, "dis")
})

socket.on('kick-offer', name => {
  if(nameOfUser !== name) {
    kickPopup(name)
  }
  else {
    alert('Somebody wants to kick you!')
    socket.emit('user-opinion', false)
  }
})

socket.on('force-disconnect', victim => {
  if (victim == nameOfUser) {
    socket.disconnect()
    alert('You have been disconnected')
  }
})

socket.on('kick-declined', victim => {
  alert(`${victim} has beeen spared`)
})

socket.on('this-user-is-typing', () => {
  typingArea.innerHTML = `Somebody is typing`
  setTimeout(() => 
    typingArea.innerHTML = ``, 3000
  )
})

let isSendable = true;

const isTyping = () => {
  if (isSendable) {
    socket.emit('user-is-typing', nameOfUser)
    isSendable = false
    setTimeout(() => {
      isSendable = true
    }, 3000)
  }
} 