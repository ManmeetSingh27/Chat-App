const users = []

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if(!username || !room){
        return {
            error : 'Provide proper value!'
        }
    }

    // Check for exisiting user
    const exisitingUser = users.find( (user) =>{
         return user.room === room && user.username === username
    })

    // Validate username
    if(exisitingUser) {
        return {
            error : 'Username is in already use !'
        }
    }
    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex( (user) => user.id === id)

    if(index !== -1) {
       return users.splice(index,1)[0]     
    }
}

const getUser = (id) => {
     return users.find( (user) => user.id === id)
}

const getUserInRoom = (room) => {
    return users.filter( (user) => user.room === room )
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}

