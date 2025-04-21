const modal = document.getElementById('modalCartao');
const cartoesContainer = document.getElementById('cartoesContainer');
let cartoes = []; // Armazena os cartões carregados

function openModal() {
  modal.classList.remove('hidden');
}

function closeModal() {
  modal.classList.add('hidden');
}

async function carregarCartoes() {
  try {
    const userId = localStorage.getItem("userId"); // Recuperar o userId armazenado
    const token = localStorage.getItem("token"); // Recuperar o token armazenado

    if (!userId || !token) {
      alert("Usuário não autenticado. Faça login novamente.");
      window.location.href = "/"; // Redirecionar para a página de login
      return;
    }

    const response = await fetch('/api/cards', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId, // Usar o userId armazenado
        'Authorization': `Bearer ${token}` // Enviar o token no cabeçalho
      }
    });

    if (response.status === 401) {
      alert("Sessão expirada. Faça login novamente.");
      window.location.href = "/";
      return;
    }

    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error("Resposta inesperada da API");
    }
    cartoes = data;
    renderizarCartoes();
  } catch (error) {
    console.error('Erro ao carregar cartões:', error);
  }
}

function renderizarCartoes() {
  cartoesContainer.innerHTML = '';
  cartoes.forEach(cartao => {
    const card = document.createElement('div');
    card.className = 'bg-zinc-800 p-4 rounded-xl shadow-lg';
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <span class="text-sm text-zinc-400">${cartao.name}</span>
        <div class="flex space-x-2">
          <button onclick="abrirDetalhes('${cartao.id}')" class="text-blue-400 hover:text-blue-600">Detalhes</button>
          <button onclick="abrirEdicao('${cartao.id}')" class="text-yellow-400 hover:text-yellow-600">Editar</button>
          <button onclick="excluirCartao('${cartao.id}')" class="text-red-400 hover:text-red-600">Excluir</button>
        </div>
      </div>
      <p class="text-xs mt-2">Limite disponível</p>
      <p class="text-sm text-green-400">R$ ${cartao.available_limit.toFixed(2)}</p>
      <p class="text-xs text-zinc-400 mt-2">Fechamento: ${cartao.closing_day} | Vencimento: ${cartao.due_day}</p>
    `;
    cartoesContainer.appendChild(card);
  });
}

async function excluirCartao(id) {
  if (!confirm('Tem certeza que deseja excluir este cartão?')) return;

  try {
    const userId = localStorage.getItem("userId"); // Recuperar o userId armazenado
    if (!userId) {
      alert("Usuário não autenticado. Faça login novamente.");
      window.location.href = "/";
      return;
    }

    const response = await fetch(`/api/cards/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId // Usar o userId armazenado
      }
    });

    if (response.ok) {
      alert('Cartão excluído com sucesso!');
      cartoes = cartoes.filter(cartao => cartao.id !== id);
      renderizarCartoes();
    } else {
      const error = await response.json();
      alert(`Erro ao excluir cartão: ${error.error}`);
    }
  } catch (error) {
    console.error('Erro ao excluir cartão:', error);
    alert('Erro ao excluir cartão. Tente novamente.');
  }
}

function abrirDetalhes(id) {
  const cartao = cartoes.find(cartao => cartao.id === id);
  if (!cartao) {
    alert('Cartão não encontrado.');
    return;
  }

  alert(`
    Nome: ${cartao.name}
    Bandeira: ${cartao.brand || 'Não informado'}
    Limite: R$ ${cartao.credit_limit.toFixed(2)}
    Limite Disponível: R$ ${cartao.available_limit.toFixed(2)}
    Fechamento: ${cartao.closing_day}
    Vencimento: ${cartao.due_day}
    Descrição: ${cartao.description || 'Não informado'}
    Tag: ${cartao.tag || 'Não informado'}
  `);
}

function abrirEdicao(id) {
  const cartao = cartoes.find(cartao => cartao.id === id);
  if (!cartao) {
    alert('Cartão não encontrado.');
    return;
  }

  document.getElementById('nomeCartao').value = cartao.name;
  document.getElementById('bandeiraCartao').value = cartao.brand || '';
  document.getElementById('limiteCartao').value = cartao.credit_limit;
  document.getElementById('limiteDisponivel').value = cartao.available_limit;
  document.getElementById('diaFechamento').value = cartao.closing_day;
  document.getElementById('diaVencimento').value = cartao.due_day;
  document.getElementById('descricaoCartao').value = cartao.description || '';
  document.getElementById('tagCartao').value = cartao.tag || '';

  openModal();

  document.getElementById('formNovoCartao').onsubmit = async (e) => {
    e.preventDefault();
    await editarCartao(id);
  };
}

async function editarCartao(id) {
  const cartaoEditado = {
    name: document.getElementById('nomeCartao').value,
    brand: document.getElementById('bandeiraCartao').value,
    credit_limit: parseFloat(document.getElementById('limiteCartao').value),
    available_limit: parseFloat(document.getElementById('limiteDisponivel').value),
    due_day: parseInt(document.getElementById('diaVencimento').value),
    closing_day: parseInt(document.getElementById('diaFechamento').value),
    description: document.getElementById('descricaoCartao').value,
    tag: document.getElementById('tagCartao').value
  };

  try {
    const userId = localStorage.getItem("userId"); // Recuperar o userId armazenado
    if (!userId) {
      alert("Usuário não autenticado. Faça login novamente.");
      window.location.href = "/";
      return;
    }

    const response = await fetch(`/api/cards/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'user-id': userId // Usar o userId armazenado
      },
      body: JSON.stringify(cartaoEditado)
    });

    if (response.ok) {
      alert('Cartão editado com sucesso!');
      closeModal();
      carregarCartoes();
    } else {
      const error = await response.json();
      alert(`Erro ao editar cartão: ${error.error}`);
    }
  } catch (error) {
    console.error('Erro ao editar cartão:', error);
    alert('Erro ao editar cartão. Tente novamente.');
  }
}

// Após o login, armazene o userId e o token retornados pelo backend
function handleLoginResponse(data) {
  if (data.userId && data.token) {
    localStorage.setItem("userId", data.userId); // Armazenar o userId no localStorage
    localStorage.setItem("token", data.token); // Armazenar o token no localStorage
    window.location.href = data.redirect; // Redirecionar para o dashboard
  } else {
    alert("Erro ao autenticar. Tente novamente.");
  }
}

// Carregar cartões ao carregar a página
carregarCartoes();