function showMessage(message, type) {
    // Cria o container do toast se não existir
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.style.position = "fixed";
        toastContainer.style.top = "20px";
        toastContainer.style.right = "20px";
        toastContainer.style.zIndex = "9999";
        toastContainer.style.display = "flex";
        toastContainer.style.flexDirection = "column";
        toastContainer.style.gap = "10px";
        document.body.appendChild(toastContainer);
    }

    // Cria o toast
    const toast = document.createElement("div");
    toast.className = `toast-message alert alert-${type}`;
    toast.textContent = message;
    toast.style.padding = "15px 20px";
    toast.style.borderRadius = "8px";
    toast.style.boxShadow = "0 4px 10px rgba(0, 0, 0, 0.2)";
    toast.style.color = "#fff";
    toast.style.fontWeight = "bold";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(-20px)";
    toast.style.transition = "opacity 0.3s ease, transform 0.3s ease";

    // Definindo cores para cada tipo
    const colors = {
        success: "#4CAF50",
        error: "#F44336",
        warning: "#FFC107",
        info: "#2196F3"
    };
    toast.style.backgroundColor = colors[type] || "#333";

    toastContainer.appendChild(toast);

    // Animação para aparecer
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.transform = "translateY(0)";
    }, 100);

    // Remover após 5 segundos
    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

async function inserirDespesasAnoCompleto() {
    try {
        await window.controle.inserirDespesasAnoCompleto();
        showMessage('Despesas inseridas para todos os meses do ano de 2025!', 'success');
    } catch (error) {
        showMessage(`Erro ao inserir despesas: ${error.message}`, 'danger');
    }
}

document.addEventListener('DOMContentLoaded', async (event) => {
    try {
        const config = await window.controle.loadConfig();
        document.getElementById('tema').value = config.tema;
        document.getElementById('notificacoes').value = config.notificacoes;
        document.getElementById('limiteGastos').value = config.limiteGastos || 0;
        document.getElementById('dbPath').value = config.dbPath || 'C:\\Users\\User\\AppData\\Local\\FinancEasyV2';
        document.getElementById('ipServidor').value = config.ipServidor || '127.0.0.1';
        document.getElementById('portaServidor').value = config.portaServidor || 3050;

        atualizarEstadoBotaoNotificacao(config.notificacoes);
    } catch (error) {
        showMessage(`Erro ao carregar configurações: ${error.message}`, 'danger');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const configForm = document.querySelector("#configForm");

    // Salvar configurações
    configForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const ipServidor = document.querySelector("#ipServidor").value;
        const portaServidor = document.querySelector("#portaServidor").value;

        console.log(`Configurações salvas: IP ${ipServidor}, Porta ${portaServidor}`);
        // Adicione lógica para salvar configurações aqui
    });
});

document.getElementById('selectDbPath').addEventListener('click', async (event) => {
    event.preventDefault();
    try {
        const dbPath = await window.controle.selectDbPath();
        if (dbPath) {
            document.getElementById('dbPath').value = dbPath;
        }
    } catch (error) {
        showMessage(`Erro ao selecionar caminho do banco de dados: ${error.message}`, 'danger');
    }
});

document.getElementById('configForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const config = {
        limiteGastos: document.getElementById('limiteGastos').value,
        dbPath: document.getElementById('dbPath').value,
        novaSenha: document.getElementById('novaSenha').value,
        ipServidor: document.getElementById('ipServidor').value,
        portaServidor: parseInt(document.getElementById('portaServidor').value)
    };

    try {
        await window.controle.saveConfig(config);
        showMessage('Configurações salvas com sucesso!', 'success');
        event.target.reset(); // Resetar o formulário
        document.getElementById('configForm').querySelectorAll('input').forEach(input => input.disabled = false); // Desbloquear inputs
    } catch (error) {
        showMessage(`Erro ao salvar configurações: ${error.message}`, 'danger');
    }
});

document.getElementById('inserirTeste').addEventListener('click', async () => {
    try {
        await window.controle.inserirValoresTeste();
        showMessage('Valores de teste inseridos com sucesso!', 'success');
    } catch (error) {
        showMessage(`Erro ao inserir valores de teste: ${error.message}`, 'danger');
    }
});

document.getElementById('limparBanco').addEventListener('click', async () => {
    try {
        await window.controle.limparBanco();
        showMessage('Banco de dados limpo com sucesso!', 'success');
    } catch (error) {
        showMessage(`Erro ao limpar banco de dados: ${error.message}`, 'danger');
    }
});

document.getElementById('exportarDados').addEventListener('click', async () => {
    try {
        const formato = await window.controle.selecionarFormato();
        if (formato) {
            const resultado = await window.controle.exportarDados(formato);
            if (resultado.status === "success") {
                showMessage(resultado.message, 'success');
            } else {
                showMessage(resultado.message, 'warning');
            }
        }
    } catch (error) {
        showMessage(`Erro ao exportar dados: ${error.message}`, 'danger');
    }
});

document.getElementById('importarDados').addEventListener('click', async () => {
    try {
        const formato = await window.controle.selecionarFormato();
        if (formato) {
            const resultado = await window.controle.importarDados(formato);
            if (resultado.status === "success") {
                showMessage(resultado.message, 'success');
                loadReceitas(); // Atualizar a lista de receitas após a importação
            } else {
                showMessage(resultado.message, 'warning');
            }
        }
    } catch (error) {
        showMessage(`Erro ao importar dados: ${error.message}`, 'danger');
    }
});

document.getElementById('executarSql').addEventListener('click', async () => {
    try {
        await window.controle.executarAtualizacaoSql();
        showMessage('Atualização SQL executada com sucesso!', 'success');
    } catch (error) {
        showMessage(`Erro ao executar atualização SQL: ${error.message}`, 'danger');
    }
});

document.getElementById('notificacoes').addEventListener('click', async () => {
    try {
        const config = await window.controle.loadConfig();
        const novaConfiguracao = config.notificacoes === "ativadas" ? "desativadas" : "ativadas";
        await window.controle.saveConfig({ notificacoes: novaConfiguracao });
        atualizarEstadoBotaoNotificacao(novaConfiguracao);
        showMessage(`Notificações ${novaConfiguracao === "ativadas" ? "ativadas" : "desativadas"} com sucesso!`, 'success');
    } catch (error) {
        showMessage(`Erro ao atualizar configuração de notificações: ${error.message}`, 'danger');
    }
});

function atualizarEstadoBotaoNotificacao(estado) {
    const notificacoesBtn = document.getElementById('notificacoes');
    notificacoesBtn.textContent = estado === "ativadas" ? "Desativar Notificações" : "Ativar Notificações";
    notificacoesBtn.className = estado === "ativadas" 
        ? "bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
        : "bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg";
}

async function loadReceitas() {
    try {
        const receitas = await window.controle.getReceitas();
        const tableBody = document.querySelector("#receitasTable tbody");
        if (tableBody) {
            tableBody.innerHTML = ""; // Limpar tabela

            receitas.forEach((receita) => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${receita.descricao}</td>
                    <td>R$ ${receita.valor.toFixed(2)}</td>
                    <td>${receita.data}</td>
                    <td>${receita.categoria}</td>
                    <td>${receita.fonte}</td>
                    <td>${receita.forma_recebimento}</td>
                    <td>${receita.conta_bancaria}</td>
                    <td>${receita.recorrente ? 'Sim' : 'Não'}</td>
                    <td>${receita.intervalo_recorrencia || '-'}</td>
                    <td>
                        <button class="btn btn-danger btn-sm" onclick="deleteReceita(${receita.id})">Excluir</button>
                    </td>
                `;
                tableBody.appendChild(row); // Adicionar linha à tabela
            });
        }
    } catch (error) {
        showMessage(`Erro ao carregar receitas: ${error.message}`, 'danger');
    }
}

async function deleteReceita(id) {
    try {
        await window.controle.deleteReceita(id);
        loadReceitas(); // Atualizar a lista de receitas
        showMessage('Receita excluída com sucesso!', 'success');
    } catch (error) {
        showMessage(`Erro ao excluir receita: ${error.message}`, 'danger');
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const addTestDataButton = document.getElementById("addTestData");
    const addYearDataButton = document.getElementById("addYearData");

    if (!addTestDataButton || !addYearDataButton) {
        console.error("Botões de configuração não encontrados.");
        return;
    }

    addTestDataButton.addEventListener("click", async () => {
        try {
            const response = await window.ipcRenderer.invoke("add-test-data");
            if (response.status === "success") {
                showMessage("Dados de teste adicionados com sucesso!", "success");
            } else {
                showMessage("Erro ao adicionar dados de teste.", "error");
            }
        } catch (error) {
            console.error("Erro ao adicionar dados de teste:", error);
            showMessage("Erro ao adicionar dados de teste.", "error");
        }
    });

    addYearDataButton.addEventListener("click", async () => {
        try {
            const response = await window.ipcRenderer.invoke("add-year-data");
            if (response.status === "success") {
                showMessage("Dados do ano completo adicionados com sucesso!", "success");
            } else {
                showMessage("Erro ao adicionar dados do ano completo.", "error");
            }
        } catch (error) {
            console.error("Erro ao adicionar dados do ano completo:", error);
            showMessage("Erro ao adicionar dados do ano completo.", "error");
        }
    });

    function showMessage(message, type) {
        const toastContainer = document.getElementById("toast-container") || createToastContainer();
        const toast = document.createElement("div");
        toast.className = `toast-message alert alert-${type}`;
        toast.textContent = message;
        toast.style.padding = "15px 20px";
        toast.style.borderRadius = "8px";
        toast.style.marginTop = "10px";
        toast.style.color = "#fff";
        toast.style.backgroundColor = type === "success" ? "#4CAF50" : "#F44336";

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function createToastContainer() {
        const container = document.createElement("div");
        container.id = "toast-container";
        container.style.position = "fixed";
        container.style.top = "20px";
        container.style.right = "20px";
        container.style.zIndex = "9999";
        document.body.appendChild(container);
        return container;
    }
});