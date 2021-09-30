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

  socket.on('connect-user', name => {
    if(usersArr.includes(name))
      socket.emit('relogin')
    else {
      users[socket.id] = name
      usersArr.push(name) 
      socket.broadcast.emit('user-connected', name)
      console.log(`${users[socket.id]} connected`)
    }
  })

  socket.on('message-request', message => {
    socket.broadcast.emit('message-post', [users[socket.id], message])
    console.log(`${users[socket.id]} messaged ${message}`)
  })

  socket.on('get-users-request', () => {
    socket.emit('send-all-users', usersArr)
  })

  socket.on('get-kick-request', () => {
    socket.emit('kick-users-list', usersArr)
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    console.log(`${users[socket.id]} disconnected`)
    usersArr.splice(usersArr.indexOf(users[socket.id]), 1)
    delete users[socket.id]
  })

  socket.on('kick-user', name => {
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

