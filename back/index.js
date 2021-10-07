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
let game = {
  players: [],
  master: null,
  rounds: [],
  currentRound: null
}
let issues = []
let currentIssue = null
let settings = null

const idGenerator = (a, arr) => arr.map(e => e.id).includes(a) ? idGenerator(++a, arr) : a

io.on('connection', (socket) => {
  console.log(`connection`)

  socket.on('create-user', (name) => {
    name.id = idGenerator(0, usersArr)
    users[socket.id] = name
    usersArr.push(name)
    io.sockets.emit('user-connected', name)
    console.log(`${name.name} connected`)
  })

  socket.on('message-send', (message) => {
    io.sockets.emit('recieving-messages', [users[socket.id], message])
    console.log(`${users[socket.id]} messaged ${message}`)
  })
  
  socket.on('request-players', () => {
    socket.emit('recieve-players', usersArr)
    console.log('request all players', usersArr)
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('user-disconnected', users[socket.id])
    console.log(`${users[socket.id]} disconnected`)
    usersArr.splice(usersArr.indexOf(users[socket.id]), 1)
    delete users[socket.id]
  })

  socket.on('user-want-to-kick-user', (name) => {
    socket.broadcast.emit('kick-offer', name)
    victim = name
    console.log(`${users[socket.id]} wants to kick ${victim}`)
  })

  socket.on('user-opinion', (answ) => {
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

  socket.on('request-master', () => {
    socket.emit('recieve-master', usersArr.find(el => { if ( el.role == 'Dealer' ) return el }))
  })

  socket.on('set-master', (user) => {
    user.role = 'Dealer'
    users[socket.id] = user
    usersArr[user.id] = user
  })

  socket.on('request-all-rounds', () => {
    socket.emit('recieve-all-rounds', issues)
  })

  socket.on('set-all-rounds', (rounds) => {
    rounds.map((el) => { el.id = idGenerator(0, rounds) })
    issues = rounds
  })

  socket.on('game-start', () => {
    game.rounds = issues;
    game.players = usersArr;
    game.master = usersArr.find(el => { if ( el.role == 'Dealer' ) return el });
    socket.emit('game-started', game)
    currentIssue = issues[0];
  })

  socket.on('user-vote', (vote) => {
    currentIssue.votes.push(vote)
  })

  socket.on('round-end', () => {
    let average = 0
    const votes = currentIssue.votes.map((el) => {
      average = +el.vote + average
    })
    average = average / votes.length

    game.rounds[currentIssue.id].average = average
    issues.splice(0, 1)
    currentIssue = issues[0]
    socket.emit('round-change', currentIssue)
  })

  socket.on('request-all-stats', () => {
    socket.emit('receive-all-stats', game.rounds)
  })

  socket.on('request-round-stats', (issue) => {
    const stats = game.rounds.find(el => { if (el.issue == issue) return el})
    socket.emit('recieve-round-stats', stats)
  })

  socket.on('update-lobby-settings', settings => settings = settings)

  socket.on('request-lobby-settings', () => {
    socket.emit('recieve-lobby-settings', settings)
  })

  socket.on('reset', () => {
    users = {}
    usersArr = []
    kickCounter = 0
    voices = 0
    victim = null
    game = {
      players: [],
      master: null,
      rounds: [],
      currentRound: null
    }
    issues = []
    currentIssue = null
    settings = null
  })
})