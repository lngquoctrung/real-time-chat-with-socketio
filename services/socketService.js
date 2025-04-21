const { accessToken } = require('../config/jwt');
const UserService = require('./userService');
const MessageService = require('./messageService');

const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

const getUser = async (client) => {
    let email;
    // Get user's data from access token
    const token = client.request.cookies.accessToken;
    if(token){
        try{
            const decode = accessToken.verify(token);
            email = decode.email;
            await UserService.update(
                { email: email },
                { socketId: client.id, status: "online", onlineAt: getCurrentTime() }
            );
            const user = await UserService.protectedGet({ email: email });
            return user;
        }
        catch(error){
            throw new Error('Token is invalid');
        }
    }
    // Get user's data from session
    try{
        email = client.request.session.user?.email;
        await UserService.update(
            { email: email }, 
            { socketId: client.id, status: "online", onlineAt: getCurrentTime() }
        );
        const user = await UserService.protectedGet({ email: email });
        return user;
    }
    catch(error){
        throw new Error('Internal Server Error');
    }
}

module.exports = (io) => {
    const userList = new Map();
    const disconnectTimers = new Map();
    io.on('connection', async (client) => {
        // Get user's data
        const user = await getUser(client);

        // If user connect immediately then server will not update user's status
        if(disconnectTimers.has(user.email)){
            clearTimeout(disconnectTimers.get(user.email));
            disconnectTimers.delete(user.email);
        }
        
        // Set user into the list of users
        userList.set(user.email, user);

        // Send the list of users to client
        io.emit('users', Array.from(userList.values()));

        // Send a notification that has a new connection to other users
        client.broadcast.emit('user-connect', user);

        // Get message
        client.on('send-message', async ({ target, msg }) => {
            try{
                const newMessage = await MessageService.create(
                    user.email,
                    target,
                    msg
                );
                // Find current recipient socket ID based on email
                const receiverUser = userList.get(target);
                if (receiverUser) {
                    // Send message to recipient's current socket ID
                    client.to(receiverUser.socketId).emit('receive-message', {
                        _id: newMessage._id,
                        sender: user.email,
                        content: msg,
                        sentAt: newMessage.sentAt
                    });
                }
            }
            catch(error){
                throw error;
            }
        });

        // Get history messages
        client.on('get-message-history', async ({ targetEmail }) => {
            try {
                const messages = await MessageService.getMessageHistory(
                    user.email, 
                    targetEmail
                );
                // Send message history to client
                client.emit('message-history', messages);
            } catch (error) {
                throw error;
            }
        });

        // In the server.js file (socket.io connection handler)
        const notifyUserTyping = (client, sender, receiver, senderUsername) => {
            // Find the receiver's current socket
            const receiverUser = userList.get(receiver);
            
            // Only emit typing notification if the receiver is in the specific chat with the sender
            if (receiverUser) {
                client.to(receiverUser.socketId).emit('get-notification-user-typing', {
                    sender: sender,
                    username: senderUsername
                });
            }
        };

        // Modify the existing notify-user-typing event handler
        client.on('notify-user-typing', ({ senderEmail, receiverEmail, senderUsername }) => {
            notifyUserTyping(client, senderEmail, receiverEmail, senderUsername);
        });

        // Handle when a user disconnect
        client.on('disconnect', () => {
            // If user disconnect over 3s then server update user's status
            const timer = setTimeout( async () => {
                // Update status of user
                const updatedUser = await UserService.update(
                    { email: user.email },
                    { socketId: '', status: 'busy', offlineAt: getCurrentTime() }
                );
                userList.set(updatedUser.email, updatedUser);
                // Send a notification that a user disconnect
                client.broadcast.emit('user-disconnect', user);

                // Send the updated list to users
                io.emit('users', Array.from(userList.values()));
            }, 3000);
            disconnectTimers.set(user.email, timer);
        });
    });
}