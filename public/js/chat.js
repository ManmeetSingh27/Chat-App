const socket = io()

const $messageform =document.querySelector('#message-form')
const $messageFormInput = $messageform.querySelector('input')
const $messageFormButton = $messageform.querySelector('button')

const $locationsend = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

const messageTemplates =document.querySelector('#message-templates').innerHTML
const urlTemplates =document.querySelector('#url-templates').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML
const { username, room } =  Qs.parse(location.search, { ignoreQueryPrefix: true})

const autoscroll = () => {
    const $newMessage = $messages.lastElementChild

    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
    
    const visibleHeight = $messages.offsetHeight

    const containerHeight = $messages.scrollHeight

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (message) => {
    console.log(message)
    const html = Mustache.render(messageTemplates, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationmessage',(url)=>{
    console.log(url)

    const html = Mustache.render(urlTemplates, {
        username: url.username,
        url: url.url,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room, users}) => {
    const html = Mustache.render(sidebartemplate,{
        room,
        users
   })
   document.querySelector('#sidebar').innerHTML = html
})

$messageform.addEventListener('submit',(e) =>{
   e.preventDefault()
   const message = e.target.elements.message.value

   $messageFormButton.setAttribute('disabled','disabled')

   socket.emit('sendMessage',message, (error) => {

    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = '' 
    $messageFormInput.focus()

       if(error){
           return console.log(error)
       }

       console.log('Message Delivered')
   })
})

$locationsend.addEventListener('click', () =>{
    if(!navigator.geolocation) return alert('Geolocation is not supported by your browser.')

    $locationsend.setAttribute('disabled', 'disabled')
    
    navigator.geolocation.getCurrentPosition( (position) =>{



        socket.emit('sendLocation',{
            latitude : position.coords.latitude,
            longitude: position.coords.longitude,
        },(result) =>{
            console.log(result)
        })
    })
    $locationsend.removeAttribute('disabled')
})

socket.emit('join', { username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})