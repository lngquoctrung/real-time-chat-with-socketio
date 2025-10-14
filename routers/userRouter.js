const express = require('express');
const userController = require('../controllers/userController');
const authValidation = require('../middlewares/validation/authValidation');
const validationHandler = require('../middlewares/validation/validationHandler');
const passport = require('passport');


// * ------- INITIALIZE ROUTER -------
const router = express.Router();


// * ------- ROUTERS -------
router.post('/login', authValidation.login, validationHandler, userController.login);
router.post('/register', authValidation.register, validationHandler, userController.register);
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback', passport.authenticate('google', { session: false }), userController.google);
router.post('/logout', userController.logout);

module.exports = router;