# Real-time Chat Application

A full-featured real-time chat application built with Node.js, Express, Socket.IO, and MongoDB. Support multiple authentication methods including local authentication and Google OAuth 2.0.

🔗 **Live Demo**: [https://chat-app.qctrung.site](https://chat-app.qctrung.site)

## Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Multiple Authentication**: Support both local registration/login and Google OAuth 2.0
- **User Status Tracking**: Real-time online/offline status display
- **Typing Indicators**: Shows when users are typing messages
- **Message History**: Persistent message storage with MongoDB
- **Session Management**: JWT-based authentication with access and refresh tokens
- **Responsive UI**: Clean and modern interface built with Bootstrap and EJS
- **Docker Support**: Easy deployment with Docker and Docker Compose

## Tech Stack

### Backend

- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time Communication**: Socket.IO
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js (Local Strategy + Google OAuth 2.0)
- **Security**: JWT (jsonwebtoken), bcryptjs for password hashing

### Frontend

- **Template Engine**: EJS
- **CSS Framework**: Bootstrap 4
- **Icons**: Font Awesome 5
- **Client-side**: jQuery, Socket.IO Client

### DevOps

- **Containerization**: Docker, Docker Compose
- **Development**: Nodemon for auto-reload

## Project Structure

```bash
.
├── app.js                          # Application entry point
├── config/                         # Configuration files
│   ├── cookieConfig.js             # Cookie settings (access/refresh token)
│   ├── database.js                 # MongoDB connection setup
│   ├── jwt.js                      # JWT token utilities
│   └── passport.js                 # Passport authentication strategies
├── controllers/                    # Request handlers
│   ├── chatController.js           # Chat page controller
│   └── userController.js           # User authentication controller
├── middlewares/                    # Custom middlewares
│   ├── authentication/
│   │   └── authMiddleware.js       # JWT & session validation
│   └── validation/
│       ├── authValidation.js       # Input validation rules
│       └── validationHandler.js
├── models/                         # MongoDB schemas
│   ├── Message.js                  # Message model
│   └── User.js                     # User model
├── routers/                        # Route definitions
│   ├── chatRouter.js               # Chat routes
│   └── userRouter.js               # Authentication routes
├── services/                       # Business logic
│   ├── messageService.js           # Message CRUD operations
│   ├── socketService.js            # Socket.IO event handlers
│   └── userService.js              # User CRUD operations
├── views/                          # EJS templates
│   ├── chat.ejs                    # Chat interface
│   ├── index.ejs                   # User list page
│   ├── login.ejs                   # Login page
│   └── register.ejs                # Registration page
├── docker-compose.yml              # Docker Compose configuration
├── Dockerfile                      # Docker image build instructions
└── package.json                    # Project dependencies
```

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v14 or higher)
- **MongoDB** (v6 or higher)
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Google Cloud Console** account (for Google OAuth setup)

## Installation

### 1. Clone the Repository

```bash
git https://github.com/lngquoctrung/real-time-chat-with-socketio.git
cd real-time-chat-with-socketio
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Application Configuration
APP_HOST=localhost
APP_PORT=3000

# Database Configuration
DB_HOST=localhost
DB_PORT=27017
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_NAME=ChatApp

# JWT Secret Keys
ACCESS_TOKEN_KEY=your_access_token_secret_key
REFRESH_TOKEN_KEY=your_refresh_token_secret_key

# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Session Secret
SESSION_SECRET=your_session_secret_key

# Docker Configuration (for deployment)
DOCKERHUB_USERNAME=your_dockerhub_username
```

### 4. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

## Usage

### Development Mode

Run the application with Nodemon for auto-reload:

```bash
npm start
```

The application will be available at `http://localhost:3000`

### Production Mode with Docker

#### Using Docker Compose

```bash
docker-compose up -d
```

This will start both the MongoDB database and the chat application in containers.

#### Manual Docker Build

```bash
# Build the Docker image
docker build -t chat-app .

# Run the container
docker run -p 3000:3000 --env-file .env chat-app
```

## Features Guide

### User Authentication

- **Local Registration**: Create account with username, email, and password
- **Local Login**: Login with email and password
- **Google OAuth**: Quick login using Google account
- **Remember Me**: Option to stay logged in with refresh tokens

### Chat Functionality

- **User List**: View all registered users with their online status
- **Real-time Messaging**: Send and receive messages instantly
- **Message History**: View previous conversations when entering a chat
- **Typing Indicator**: See when the other user is typing
- **Online Status**: Real-time updates when users go online/offline

## API Endpoints

### Authentication Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/login` | Display login page |
| POST | `/auth/login` | Process login credentials |
| GET | `/register` | Display registration page |
| POST | `/auth/register` | Create new user account |
| GET | `/auth/google` | Initiate Google OAuth flow |
| GET | `/auth/google/callback` | Google OAuth callback handler |
| POST | `/auth/logout` | Logout and clear session |

### Chat Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Display user list (requires authentication) |
| GET | `/chat/:email` | Open chat with specific user |

## Socket.IO Events

### Client to Server

- `get-message-history`: Request message history with a user
- `send-message`: Send a new message
- `notify-user-typing`: Notify that user is typing

### Server to Client

- `users`: Broadcast updated user list
- `user-connect`: Notify when a user comes online
- `user-disconnect`: Notify when a user goes offline
- `message-history`: Send message history to client
- `receive-message`: Deliver new message to recipient
- `get-notification-user-typing`: Notify typing status

## Database Schema

### User Model

```javascript
{
  email: String (unique),
  username: String,
  pass: String (hashed),
  refreshToken: String,
  googleId: String,
  socketId: String,
  status: String,
  onlineAt: String,
  offlineAt: String
}
```

### Message Model

```javascript
{
  content: String,
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  sentAt: String,
  timestamps: true
}
```

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Tokens**: Access tokens (15min) and refresh tokens (24h)
- **HTTP-only Cookies**: Secure token storage
- **Input Validation**: Express-validator for request validation
- **Session Management**: Express-session with secure configuration

## Deployment

The application is deployed at [https://chat-app.qctrung.site](https://chat-app.qctrung.site) using:

1. VPS server setup
2. Docker containerization
3. MongoDB database
4. Reverse proxy (nginx/caddy recommended)
5. SSL certificate for HTTPS

## Development

### Running Tests

```bash
npm test
```

### Code Structure Guidelines

- **Controllers**: Handle HTTP requests and responses
- **Services**: Contain business logic and database operations
- **Middlewares**: Authentication, validation, and error handling
- **Models**: MongoDB schema definitions
- **Config**: Application configuration and setup

## Troubleshooting

### Common Issues

#### MongoDB Connection Error

```text
Solution: Check if MongoDB is running and credentials in .env are correct
```

#### Google OAuth Not Working

```text
Solution: Verify GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and callback URL
```

#### Socket.IO Connection Failed

```text
Solution: Ensure the server is running and check CORS configuration
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Author

### Ly Nguyen Quoc Trung

- GitHub: [@lngquoctrung](https://github.com/lngquoctrung)
- Email: lngquoctrung.work@gmail.com
- Portfolio: [https://lngquoctrung.github.io/](https://lngquoctrung.github.io/)