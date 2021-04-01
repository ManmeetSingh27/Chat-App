const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')
const { addUser,removeUser,getUser, getUserInRoom } = require('./utils/users')


const { generateMessage } = require('./utils/messages')
const { generateLocation } = require('./utils/messages')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

io.on('connection',(socket) => {
    console.log('New Websocket connection')
   
    
    
    socket.on('join',(options, callback) => {

        const { error,user } = addUser({id: socket.id, ...options})

        if(error){
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('message', generateMessage('Admin','Welcome!'))
        socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        
        io.to(user.room).emit('roomData',{
            room :user.room,
            users: getUserInRoom(user.room)
        })

        callback()
    })

    socket.on('sendMessage',(message,callback) => {
        const filter = new Filter()
        const user =getUser(socket.id)

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }


        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback()
    })

    socket.on('sendLocation',(data,callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationmessage',generateLocation(user.username, 'https://google.com/maps?q='+data.latitude+','+data.longitude))

        callback('Location is shared')
    })
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if(user) {
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users: getUserInRoom(user.room)
            })
        }

        
    })
})
server.listen(port, () => {
    console.log('Server is up on port '+port+'!')
})