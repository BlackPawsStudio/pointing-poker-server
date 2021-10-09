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

  //my server part
  socket.on('chat-connect-user', name => {
    if(usersArr.includes(name))
      socket.emit('relogin')
    else {
      users[socket.id] = name
      usersArr.push(name) 
      socket.broadcast.emit('chat-user-connected', name)
      console.log(`${users[socket.id]} connected`)
    }
  })
  socket.on('chat-message-request', message => {
    socket.broadcast.emit('chat-message-post', [users[socket.id], message])
    console.log(`${users[socket.id]} messaged ${message}`)
  })
  socket.on('chat-get-users-request', () => {
    socket.emit('chat-send-all-users', usersArr)
  })
  socket.on('chat-get-kick-request', () => {
    socket.emit('chat-kick-users-list', usersArr)
  })
  socket.on('disconnect', () => {
    socket.broadcast.emit('chat-user-disconnected', users[socket.id])
    console.log(`${users[socket.id]} disconnected`)
    usersArr.splice(usersArr.indexOf(users[socket.id]), 1)
    delete users[socket.id]
  })
  socket.on('chat-kick-user', name => {
    socket.broadcast.emit('kick-offer', name)
    victim = name
    console.log(`${users[socket.id]} wants to kick ${victim}`)
  })
  socket.on('chat-user-opinion', answ => {
    kickCounter += 1
    if (answ) {
      console.log(`${users[socket.id]} chosen ${answ}`)
      voices += 1
    }
    console.log(`all voices ${kickCounter}, voices agrees ${voices}`)
    if (usersArr.length == kickCounter) {
      if (voices >= usersArr.length / 2) {
        socket.broadcast.emit('chat-force-disconnect', victim)
        console.log(`kick ${victim}`)
      }
      else {
        socket.broadcast.emit('chat-kick-declined', victim)
        console.log(`mercy ${victim}`)
      }
      kickCounter = 0
      voices = 0
      victim = null
    }
  })
  socket.on('chat-user-is-typing', () => {
    console.log(`Somebody is typing`)
    socket.broadcast.emit('chat-this-user-is-typing')
  })
})

