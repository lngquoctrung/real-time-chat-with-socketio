const UserService = require('../services/userService');

const chat = async (req, res) => {
    const email = req.params.id;
    const user = res.locals.user;
    try{
        const receiver = await UserService.protectedGet({ email: email });
        const sender = await UserService.protectedGet({ email: user.email });
        return res.render('chat', {
            sender: sender,
            receiver: receiver,
        });
    }
    catch(error){
        throw new Error('User not found');
    }
}

module.exports = { chat }