# Fintech Platform

A basic fintech platform that allows users to manage their accounts and perform simple transactions like deposits and withdrawals, using Node.js, Hasura, and a simple frontend (HTML/CSS/JavaScript).

## Setup Instructions

### Backend Setup

1. Create a new directory for your project:
mkdir fintech-platform
cd fintech-platform

2. Initialize a new Node.js project:
npm init -y

3. Install required dependencies:
npm install express graphql-request bcrypt jsonwebtoken dotenv cors

4. Create a `.env` file in the root directory and add your Hasura credentials:
HASURA_ENDPOINT=https://your-project-name.hasura.app/v1/graphql
HASURA_ADMIN_SECRET=your-admin-secret
JWT_SECRET=your-jwt-secret

5. Create a `server.mjs` file and copy the provided backend code into it.

6. Start the server:
node server.mjs

### Frontend Setup

1. In the project root, create a new directory for the frontend:
mkdir frontend
cd frontend

2. Create the following files:
- `index.html`
- `styles.css`
- `app.js`

3. Copy the provided frontend code into these files.

4. Serve the frontend files using a local server (e.g., Live Server VS Code extension or Python's `http.server`).

## API Documentation

Base URL: `http://localhost:5000` (or your deployed backend URL)

### Endpoints

#### Register User
- Method: POST
- Path: `/register`
- Body: 
{
 "username": "string",
 "email": "string",
 "password": "string"
}

Response:
jsonCopy{
  "success": true,
  "userId": "integer"
}


Login

Method: POST
Path: /login
Body:
jsonCopy{
  "email": "string",
  "password": "string"
}

Response:
jsonCopy{
  "success": true,
  "token": "string"
}


Create Account

Method: POST
Path: /accounts
Body:
jsonCopy{
  "userId": "integer"
}

Response:
jsonCopy{
  "success": true,
  "accountId": "integer"
}


Deposit

Method: POST
Path: /deposit
Body:
jsonCopy{
  "accountId": "integer",
  "amount": "number"
}

Response:
jsonCopy{
  "success": true
}


Withdraw

Method: POST
Path: /withdraw
Body:
jsonCopy{
  "accountId": "integer",
  "amount": "number"
}

Response:
jsonCopy{
  "success": true
}


Get Balance

Method: GET
Path: /balance/:accountId
Response:
jsonCopy{
  "success": true,
  "balance": "number"
}


## Design Decisions and Assumptions

Database Schema:

Three main tables: users, accounts, and transactions.
Each user can have multiple accounts.
Transactions are linked to accounts, not directly to users.


Authentication:

JWT (JSON Web Tokens) are used for authentication.
Passwords are hashed using bcrypt before storing in the database.


Error Handling:

Try-catch blocks are used to handle errors and return appropriate error messages.
Specific error messages are returned for common issues (e.g., insufficient balance).


API Design:

RESTful API design principles are followed.
Each endpoint corresponds to a specific action (register, login, deposit, withdraw, etc.).


Security:

CORS is enabled to allow requests from the frontend.
Hasura admin secret is used for backend-to-Hasura communication.
Sensitive information (like JWT secret and Hasura credentials) is stored in environment variables.


Assumptions:

The frontend and backend are served from different origins, necessitating CORS.
User IDs and account IDs are integers.
Account balance is stored as a numeric value (assumed to be in cents to avoid floating-point issues).
Withdrawal is only allowed if the account has sufficient balance.
Each transaction (deposit or withdrawal) is recorded in the transactions table.
The frontend is a simple single-page application without routing.


Scalability Considerations:

The use of Hasura allows for easy scaling of the database layer.
The separation of frontend and backend allows for independent scaling of each component.


Limitations:

This is a basic implementation and lacks advanced features like multi-currency support, scheduled transactions, or complex financial products.
There's no implementation of user roles or permissions beyond basic authentication.
Error handling and validation could be more robust for a production system.

