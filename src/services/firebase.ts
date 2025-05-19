// Serviço para acessar a API backend via HTTP

const API_URL = 'http://localhost:3001'; // Altere para a URL do seu backend

export async function login(email: string, password: string) {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Falha no login');
  return res.json();
}

export async function register(email: string, password: string) {
  const res = await fetch(`${API_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) throw new Error('Falha no cadastro');
  return res.json();
}

function getToken() {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  return user?.token;
}

// Cartões de crédito
export async function getCreditCards() {
  const res = await fetch(`${API_URL}/credit-cards`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Erro ao buscar cartões');
  return res.json();
}

export async function createCreditCard(data: any) {
  const res = await fetch(`${API_URL}/credit-cards`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar cartão');
  return res.json();
}

// Receitas
export async function getIncomes() {
  const res = await fetch(`${API_URL}/incomes`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Erro ao buscar receitas');
  return res.json();
}

export async function createIncome(data: any) {
  const res = await fetch(`${API_URL}/incomes`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar receita');
  return res.json();
}

// Despesas
export async function getExpenses() {
  const res = await fetch(`${API_URL}/expenses`, {
    headers: { Authorization: `Bearer ${getToken()}` }
  });
  if (!res.ok) throw new Error('Erro ao buscar despesas');
  return res.json();
}

export async function createExpense(data: any) {
  const res = await fetch(`${API_URL}/expenses`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getToken()}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar despesa');
  return res.json();
}