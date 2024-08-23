import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import fetch from 'node-fetch';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

dotenv.config();
async function hasuraRequest(query, variables = {}) {
  // Remove line breaks and extra spaces, and replace any remaining spaces with a single space
  const formattedQuery = query.replace(/\s+/g, ' ').trim();
  
  const body = JSON.stringify({
    query: formattedQuery,
    variables
  });
  
  console.log('Request body:', body);

  try {
    const response = await fetch(process.env.HASURA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET,
      },
      body: body,
    });

    const data = await response.json();
    console.log('Hasura response:', JSON.stringify(data, null, 2));

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }
    return data.data;
  } catch (error) {
    console.error('Hasura request error:', error);
    throw error;
  }
}
// User registration
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const passwordHash = await bcrypt.hash(password, 10);

  const mutation = `
    mutation ($username: String!, $email: String!, $passwordHash: String!) {
      insert_users_one(object: {username: $username, email: $email, password_hash: $passwordHash}) {
        id
      }
    }
  `;

  try {
    const result = await hasuraRequest(mutation, { username, email, passwordHash });
    res.json({ success: true, userId: result.insert_users_one.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const query = `
    query ($email: String!) {
      users(where: {email: {_eq: $email}}) {
        id
        password_hash
      }
    }
  `;

  try {
    const result = await hasuraRequest(query, { email });
    if (result.users.length === 0) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const user = result.users[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ success: true, token });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Create account
app.post('/accounts', async (req, res) => {
  const { userId } = req.body;

  const mutation = `
    mutation ($userId: Int!) {
      insert_accounts_one(object: {user_id: $userId}) {
        id
      }
    }
  `;

  try {
    const result = await hasuraRequest(mutation, { userId });
    res.json({ success: true, accountId: result.insert_accounts_one.id });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Deposit
app.post('/deposit', async (req, res) => {
  const { accountId, amount } = req.body;

  const mutation = `
    mutation ($accountId: Int!, $amount: numeric!) {
      update_accounts(where: {id: {_eq: $accountId}}, _inc: {balance: $amount}) {
        affected_rows
      }
      insert_transactions_one(object: {account_id: $accountId, amount: $amount, transaction_type: "deposit"}) {
        id
      }
    }
  `;

  try {
    await hasuraRequest(mutation, { accountId, amount });
    res.json({ success: true });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// Withdraw
app.post('/withdraw', async (req, res) => {
  const { accountId, amount } = req.body;

  const mutation = `
    mutation Withdraw($accountId: Int!, $amount: Int!) {
      update_accounts(
        where: { id: { _eq: $accountId }, balance: { _gte: $amount } },
        _inc: { balance: -$amount }
      ) {
        affected_rows
      }
    }
  `;

  try {
    const result = await hasuraRequest(mutation, { accountId: parseInt(accountId), amount: parseFloat(amount) });
    if (result.update_accounts.affected_rows === 0) {
      return res.status(400).json({ success: false, error: 'Insufficient balance or account not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(400).json({ success: false, error: error.message });
  }
});

// Get account balance
app.get('/balance/:accountId', async (req, res) => {
  const { accountId } = req.params;

  const query = `
    query ($accountId: Int!) {
      accounts_by_pk(id: $accountId) {
        balance
      }
    }
  `;

  try {
    const result = await hasuraRequest(query, { accountId });
    if (!result.accounts_by_pk) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }
    res.json({ success: true, balance: result.accounts_by_pk.balance });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});