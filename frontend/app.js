const API_URL = 'http://localhost:5000';
let token = localStorage.getItem('token');
let accountId = localStorage.getItem('accountId');

const authContainer = document.getElementById('auth-container');
const accountContainer = document.getElementById('account-container');
const balanceElement = document.getElementById('balance');

function showAccount() {
    authContainer.style.display = 'none';
    accountContainer.style.display = 'block';
    updateBalance();
}

function showAuth() {
    authContainer.style.display = 'block';
    accountContainer.style.display = 'none';
}

if (token && accountId) {
    showAccount();
} else {
    showAuth();
}

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await response.json();
        if (data.success) {
            alert('Registration successful. Please log in.');
        } else {
            alert(`Registration failed: ${data.error}`);
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
});

document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (data.success) {
            token = data.token;
            localStorage.setItem('token', token);
            createAccount();
        } else {
            alert(`Login failed: ${data.error}`);
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
});

async function createAccount() {
    try {
        const response = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ userId: 1 }) // Replace with actual user ID
        });
        const data = await response.json();
        if (data.success) {
            accountId = data.accountId;
            localStorage.setItem('accountId', accountId);
            showAccount();
        } else {
            alert(`Failed to create account: ${data.error}`);
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
}

async function updateBalance() {
    try {
        const response = await fetch(`${API_URL}/balance/${accountId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) {
            balanceElement.textContent = data.balance.toFixed(2);
        } else {
            alert(`Failed to fetch balance: ${data.error}`);
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
}

document.getElementById('deposit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('deposit-amount').value;

    try {
        const response = await fetch(`${API_URL}/deposit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ accountId, amount: parseFloat(amount) })
        });
        const data = await response.json();
        if (data.success) {
            alert('Deposit successful');
            updateBalance();
        } else {
            alert(`Deposit failed: ${data.error}`);
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
});

document.getElementById('withdraw-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = document.getElementById('withdraw-amount').value;

    try {
        const response = await fetch(`${API_URL}/withdraw`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ accountId, amount: parseFloat(amount) })
        });
        const data = await response.json();
        if (data.success) {
            alert('Withdrawal successful');
            updateBalance();
        } else {
            alert(`Withdrawal failed: ${data.error}`);
        }
    } catch (error) {
        alert(`An error occurred: ${error.message}`);
    }
});