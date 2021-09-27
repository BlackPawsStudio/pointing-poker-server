const connectMessage = (name, connect) => {
  if(connect)
    return `
      <p class="connected">${name} connected!</p>
    `
  else
    if(name === null)
      return ''
    else
      return `
        <p class="disconnected">${name} disconnected!</p>
      `
}

const message = (data) => {
  return `
  <p class="message">${data[0]} said: ${data[1]}</div>
  `
}

const kickPopup = () => {
  const kickPopup = document.getElementsByClassName('popup-kick')[0]
  kickPopup.style.display = "flex"
  const answ = document.getElementsByClassName('kick-confirm')
  answ[0].addEventListener('click', () => {
    socket.emit('user-opinion', true)
    kickPopup.style.display = "none"
  })
  answ[1].addEventListener('click', () => {
    socket.emit('user-opinion', false)
    kickPopup.style.display = "none"
  })
}

const addKickUser = (user) => {
  return `
  <button class="kick-this">${user}</button>`
}