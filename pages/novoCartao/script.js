function showMessage(message, type) {
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
  
    const colors = {
      success: "#4CAF50",
      error: "#F44336",
      warning: "#FFC107",
      info: "#2196F3"
    };
    toast.style.backgroundColor = colors[type] || "#333";
    
    toastContainer.appendChild(toast);
  
    setTimeout(() => {
      toast.style.opacity = "1";
      toast.style.transform = "translateY(0)";
    }, 100);
    
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(-20px)";
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }
  

function resetFormAndUnlockInputs(form) {
  form.reset();
  form.querySelectorAll("input").forEach((input) => (input.disabled = false));
}

document.getElementById("cartaoForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const cartao = {
    nome: document.getElementById("nome").value,
    banco: document.getElementById("banco").value,
    limite: parseFloat(document.getElementById("limite").value),
    vencimento: document.getElementById("vencimento").value,
  };

  try {
    const response = await fetch("/api/cartoes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartao),
    });
    if (response.ok) {
      showMessage("Cartão adicionado com sucesso!", "success");
      resetFormAndUnlockInputs(event.target);
    } else {
      throw new Error("Erro ao adicionar cartão");
    }
  } catch (error) {
    console.error(`Erro ao adicionar cartão: ${error.message}`);
    showMessage(`Erro ao adicionar cartão: ${error.message}`, "danger");
  }
});