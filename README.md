# **REAL-TIME CHAT APPLICATION**

## **1. SUMMARY**

Some functions of the chat application:

- Log in and register for an account.
- Log out.
- Log in or register with Google.
- Requires login to access website content.
- Option to remember account (default will be session, check remember me then it will be token, if it is Google then it will be token).
- Display list and number of users online or offline.
- Function to send messages to online users.
- Interface displays sender typing message
- Stores messages in database

## **2. HOW TO RUN THE APPLICATION**

### **2.1 PREPARATION (Optional - Use existing data)**

Connect to Mongo Server and open Mongo Compass application. Then, connect to Mongo database with port 27017 (optional - can be replaced with another port in `.env` file).

Create database with name `ChatApp` and a collection named `users`, after creating, create another collection named `messages`.

### **2.2 Add data to database**

After creating 2 collections, the next step is to import data. In each collection, choose to import data in json format, the data is located in the `data` folder of the project.

For the `users` collection, the corresponding file will be `ChatApp.users.json` and the `messages` collection will be `ChatApp.messages,json`.

## **3. RUN THE PROJECT**

The database data is available, now run the project. To run the project, use the command line below to run:

```bash
npm start
```

After the project has run successfully, the terminal's running result will display the website's path as `http://127.0.0.1:5000`.

--------
**Created by**: Quoc Trung

**Created date**: 12/3/2024
