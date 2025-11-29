const API_LOGIN = "https://study-hub-2mr9.onrender.com/login";

    const token = new URLSearchParams(window.location.search).get("token");
    
    async function validarToken() {
        const res = await fetch(`${API_LOGIN}/reset-password/${token}`);
        if (!res.ok) {
            sessionStorage.setItem("passwordResetSuccess", "false");
            window.location.href = "../user/login.html";
        }
    }

    validarToken();

    document.getElementById("prosseguir").addEventListener("click", async () => {
        const s1 = document.getElementById("senha1").value.trim();
        const s2 = document.getElementById("senha2").value.trim();
        const alerta = document.getElementById("alert-erro");

        alerta.style.display = "none";

        if (s1.length < 5) {
            alerta.textContent = "* A senha deve ter pelo menos 5 caracteres.";
            alerta.style.display = "block";
            return;
        }

        if (s1 !== s2) {
            alerta.textContent = "* As senhas não coincidem.";
            alerta.style.display = "block";
            return;
        }

        const res = await fetch(`${API_LOGIN}/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                token: token,
                novaSenha: s1
            })
        });

        if (!res.ok) {
            sessionStorage.setItem("passwordResetSuccess", "false");
            window.location.href = "../user/login.html";
            return;
        }

        sessionStorage.setItem("passwordResetSuccess", "true");
        window.location.href = "../user/login.html";
    });