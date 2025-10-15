const { accessToken } = require('../config/jwt');
const UserService = require('./userService');
const MessageService = require('./messageService');

const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

const getUser = async (client) => {
    let email;
    
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
};

module.exports = (io) => {
    const userList = new Map();
    const disconnectTimers = new Map();
    
    io.on('connection', async (client) => {
        const user = await getUser(client);
        
        if (!user || !user.email) {
            client.disconnect(true);
            return;
        }
        
        if(disconnectTimers.has(user.email)){
            clearTimeout(disconnectTimers.get(user.email));
            disconnectTimers.delete(user.email);
        }
        
        userList.set(user.email, user);
        io.emit('users', Array.from(userList.values()));
        client.broadcast.emit('user-connect', user);
        
        client.on('send-message', async ({ target, msg }) => {
            try{
                const newMessage = await MessageService.create(
                    user.email,
                    target,
                    msg
                );
                
                const receiverUser = userList.get(target);
                if (receiverUser) {
                    client.to(receiverUser.socketId).emit('receive-message', {
                        _id: newMessage._id,
                        sender: { email: user.email },
                        content: msg,
                        sentAt: newMessage.sentAt
                    });
                }
            }
            catch(error){
                console.error('Error sending message:', error);
            }
        });
        
        client.on('get-message-history', async ({ targetEmail }) => {
            try {
                const messages = await MessageService.getMessageHistory(
                    user.email,
                    targetEmail
                );
                client.emit('message-history', messages);
            } catch (error) {
                console.error('Error getting message history:', error);
            }
        });
        
        client.on('notify-user-typing', async (data) => {
            try {
                const receiver = userList.get(data.receiverEmail);
                
                if (receiver && receiver.socketId) {
                    io.to(receiver.socketId).emit('get-notification-user-typing', {
                        sender: data.senderEmail,
                        username: data.senderUsername,
                        typing: data.typing
                    });
                } else {
                    console.log('Receiver not found or offline:', data.receiverEmail);
                }
            } catch (error) {
                console.error('Error in typing notification:', error);
            }
        });
        
        client.on('disconnect', () => {
            const timer = setTimeout(async () => {
                const updatedUser = await UserService.update(
                    { email: user.email },
                    { socketId: '', status: 'busy', offlineAt: getCurrentTime() }
                );
                userList.set(updatedUser.email, updatedUser);
                
                client.broadcast.emit('user-disconnect', user);
                io.emit('users', Array.from(userList.values()));
            }, 3000);
            
            disconnectTimers.set(user.email, timer);
        });
    });
};
