self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open("v1").then((cache) => {
            return cache.addAll([
                "/",
                "/pages/usuarios/login/login.html",
                "/pages/usuarios/cadastros/cadastro.html",
                "/pages/cartao/cartoes.html",
                "/public/css/style.css",
                "/public/js/script.js",
            ]).catch((error) => {
                console.error("Erro ao adicionar recursos ao cache:", error);
            });
        })
    );
});
