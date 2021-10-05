const port = process.env.PORT || 3000;
const io = require('socket.io')(port, {
  cors: {
    origin: "*",
  },
})
const users = {}
const usersArr = []
let kickCounter = 0
let voices = 0
let victim = null

io.on('connection', socket => {
  console.log(`connected`)
  socket.on('create-user', name => {
    users[socket.id] = name
    usersArr.push(name) 
    io.sockets.emit('user-connected', name)
    console.log(`${users[socket.id]} connected`)
  })
  socket.on('message-send', message => {
    socket.broadcast.emit('recieving-messages', [users[socket.id], message])
    console.log(`${users[socket.id]} messaged ${message}`)
  })//ok
  socket.on('get-users-request', () => {
    socket.emit('send-all-users', usersArr)
  })//ok
  socket.on('user-want-to-kick-user', () => {         //убрать передаваемые на серв параметры, потому что здесь они пока не надо
    socket.emit('kick-users-list', usersArr)
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    console.log(`${users[socket.id]} disconnected`)
    usersArr.splice(usersArr.indexOf(users[socket.id]), 1)
    delete users[socket.id]
  })//ok
  socket.on('user-want-to-kick-user', name => {
    socket.broadcast.emit('kick-offer', name)
    victim = name
    console.log(`${users[socket.id]} wants to kick ${victim}`)
  })
  socket.on('user-opinion', answ => {
    kickCounter += 1
    if (answ) {
      console.log(`${users[socket.id]} chosen ${answ}`)
      voices += 1
    }
    console.log(`all voices ${kickCounter}, voices agrees ${voices}`)
    if (usersArr.length == kickCounter) {
      if (voices >= usersArr.length / 2) {
        socket.broadcast.emit('force-disconnect', victim)
        console.log(`kick ${victim}`)
      }
      else {
        socket.broadcast.emit('kick-declined', victim)
        console.log(`mercy ${victim}`)
      }
      kickCounter = 0
      voices = 0
      victim = null
    }
  })
  socket.on('user-is-typing', () => {
    console.log(`Somebody is typing`)
    socket.broadcast.emit('this-user-is-typing')
  })
})