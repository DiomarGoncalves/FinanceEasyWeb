document.addEventListener("DOMContentLoaded", () => {
    const formCadastro = document.getElementById("formCadastro");
    const formLogin = document.getElementById("formLogin");

    if (formCadastro) {
        formCadastro.addEventListener("submit", async (e) => {
            e.preventDefault();
            const nome = document.getElementById("nome").value;
            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;

            try {
                const response = await fetch("/api/usuarios/registro", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nome, email, senha }),
                });

                if (response.ok) {
                    alert("Cadastro realizado com sucesso!");
                    window.location.href = "/pages/usuarios/login/login.html";
                } else {
                    const error = await response.json();
                    alert(`Erro: ${error.error}`);
                }
            } catch (err) {
                console.error("Erro ao cadastrar:", err);
                alert("Erro ao cadastrar. Tente novamente.");
            }
        });
    }

    if (formLogin) {
        formLogin.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("email").value;
            const senha = document.getElementById("senha").value;

            try {
                const response = await fetch("/api/usuarios/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, senha }),
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem("token", data.token); // Armazenar o token no localStorage
                    alert("Login realizado com sucesso!");
                    window.location.href = "/pages/despesas/despesas.html"; // Redirecionar para a página de despesas
                } else {
                    const error = await response.json();
                    alert(`Erro: ${error.error}`);
                }
            } catch (error) {
                console.error("Erro ao realizar login:", error);
                alert("Erro ao realizar login. Tente novamente.");
            }
        });
    }

    // Exemplo de uso do token em uma requisição protegida
    const token = localStorage.getItem("token");
    if (token) {
        fetch("/api/usuarios/perfil", {
            headers: { Authorization: `Bearer ${token}` },
        })
            .then((res) => res.json())
            .then((data) => console.log("Perfil do usuário:", data))
            .catch((err) => console.error("Erro ao buscar perfil:", err));
    }
});
