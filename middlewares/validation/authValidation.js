const { body } = require('express-validator');


module.exports = {
    login: [
        body('email')
            .notEmpty()
            .withMessage('Please enter the email')
            .isEmail()
            .withMessage('Email is invalid'),
        
        body('pass')
            .notEmpty()
            .withMessage('Please enter password')
            .isLength({ min: 5})
            .withMessage('Password must be at least 5 characters'),
    ],

    register: [
        body('username')
            .notEmpty()
            .withMessage('Please enter username')
            .isLength({ min: 5 })
            .withMessage('Username must be at least 5 characters'),

        body('email')
            .notEmpty()
            .withMessage('Please enter the email')
            .isEmail()
            .withMessage('Email is invalid'),
        
        body('pass')
            .notEmpty()
            .withMessage('Please enter password')
            .isLength({ min: 5})
            .withMessage('Password must be at least 5 characters'),

        body('cfmPass')
            .notEmpty()
            .withMessage('Please confirm password')
            .custom((value, { req }) => {
                if(value !== req.body.pass)
                    throw new Error('Password does not match');
                return true; 
            })
    ]
}