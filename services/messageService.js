const Message = require('../models/Message');
const UserService = require('../services/userService');

class MessageService{
    static create = async (senderEmail, receiverEmail, content) => {
        try{
            const sender = await UserService.protectedGet({ email: senderEmail });
            const receiver = await UserService.protectedGet({ email: receiverEmail });

            const newMessage = new Message({
                content: content,
                sender: sender._id,
                receiver: receiver._id,
            });

            await newMessage.save();
            return newMessage;
        }
        catch(error){
            throw error;
        }
    }

    static getMessageHistory = async (user1Email, user2Email) => {
        try{
            const user1 = await UserService.protectedGet({ email: user1Email });
            const user2 = await UserService.protectedGet({ email: user2Email });

            const messages = await Message.find({
                $or: [
                    { sender: user1._id, receiver: user2._id },
                    { sender: user2._id, receiver: user1._id }
                ]
            })
            .sort({ timestamp: 1 })
            .populate('sender', 'username email')
            .populate('receiver', 'username email');

            return messages;
        }
        catch(error){
            throw error;
        }
    }
}

module.exports = MessageService;