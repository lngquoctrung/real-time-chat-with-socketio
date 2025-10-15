const express = require('express');
const socketIO = require('socket.io');
const bodyParser = require('body-parser');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authentication = require('./middlewares/authentication/authMiddleware');
const socketService = require('./services/socketService');
dotenv.config();
require('./config/passport');


// * ------- ENVIRONMENT VARIABLES -------
const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;
// Rise error if missing configuration
if(!appHost || !appPort){
    console.log('Internal server error: missing configuration');
    process.exit(1);
}


// * ------- INITIALIZE THE SERVER -------
const app = express();
app.set('view engine', 'ejs');
const cookieMiddleware = cookieParser();
const sessionMiddleware = session({
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: false,
        maxAge: 24 * 60 * 1000, // 24h
    }
});


// * ------- MIDDLEWARES -------
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieMiddleware);
app.use(sessionMiddleware);
app.use(flash());
app.use((req, res, next) => {
    const msg = req.flash("errorMsg")[0];
    // Get error messages from other middlewares
    res.locals.errorMsg = msg;
    // Get form data to keep value in rendering form
    res.locals.formData = req.flash("formData")[0];
    res.locals.isShowErr = msg !== undefined;
    res.locals.user = req.flash('user')[0];
    next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(authentication);


// * ------- ROUTERS -------
app.use('/auth', require('./routers/userRouter'));
app.use('/chat', require('./routers/chatRouter'));


// * ------- ROUTES -------
app.get('/', (req, res) => {
    res.render('index', {
        email: res.locals.user.email,
        username: res.locals.user.username,
    });
});

app.get('/login', (req, res) => {
    res.render('login', {
        isShowErr: res.locals.isShowErr,
        errorMsg: res.locals.errorMsg || "",
        ...res.locals.formData
    });
});

app.get('/register', (req, res) => {
    res.render('register', {
        isShowErr: res.locals.isShowErr,
        errorMsg: res.locals.errorMsg || "",
        ...res.locals.formData
    });
});

app.get('health-check', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString(),
    });
});


// * ------- START SERVER -------
const server = app.listen(appPort, appHost, async () => {
    await connectDB();
    console.log(`The server is running on http://${appHost}:${appPort}`);
}).on('error', (error) => {
    console.log('Error occurred: ', error);
});

// * ------- SOCKET IO -------
const io = socketIO(server);
// Allow socket io to access session and cookie
io.engine.use(sessionMiddleware);
io.engine.use(cookieMiddleware);
socketService(io);