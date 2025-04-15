async function adicionarCartao() {
    const nome = document.getElementById("nome").value;
    const banco = document.getElementById("banco").value;
    const limite = parseFloat(document.getElementById("limite").value);
    const vencimento = document.getElementById("vencimento").value;

    if (!nome || !banco || isNaN(limite) || !vencimento) {
        console.error("Todos os campos são obrigatórios.");
        alert("Preencha todos os campos corretamente.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/cartoes", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ nome, banco, limite, vencimento }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Erro ao adicionar cartão:", errorData.error);
            alert(`Erro: ${errorData.error}`);
            return;
        }

        const data = await response.json();
        console.log("Cartão adicionado com sucesso:", data);
        alert("Cartão adicionado com sucesso!");
    } catch (error) {
        console.error("Erro ao adicionar cartão:", error);
        alert("Erro ao adicionar cartão. Verifique o console para mais detalhes.");
    }
}
