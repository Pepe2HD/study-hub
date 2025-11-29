const inputs = document.querySelectorAll(".digit");
const reenviar = document.getElementById("reenviar-code");
const alertBox = document.getElementById("alert-email");
const API_LOGIN = "https://study-hub-2mr9.onrender.com/login";

alertBox.classList.add("show");

setTimeout(() => {
    alertBox.classList.remove("show");
}, 3000);

inputs.forEach((input, index) => {
    input.addEventListener("input", () => {
        if (input.value.length === 1 && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && input.value === "" && index > 0) {
            inputs[index - 1].focus();
        }
    });
});

reenviar.addEventListener("click", async () => {
    const loginDataStr = localStorage.getItem("loginData");
    const loginData = JSON.parse(loginDataStr);
    const usuario = loginData.user;
    const senha = loginData.pass;

    try {
        await fetch(`${API_LOGIN}/send-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: usuario, senha: senha })
        });

        alertBox.classList.add("show");

        setTimeout(() => {
            alertBox.classList.remove("show");
        }, 3000);
    } catch (e) {
        console.error("Erro ao enviar code:", erro);
        alert("Erro ao tentar fazer login. Tente novamente.");
    }
})

document.getElementById("prosseguirBtn").addEventListener("click", async () => {
    const alerta = document.getElementById("alert-erro");

    alerta.style.display = "none";

    let codigo = "";

    inputs.forEach(input => codigo += input.value);

    if (codigo.length !== 6) {
        alerta.textContent = "* Digite todos os 6 dígitos.";
        alerta.style.display = "block";
        return;
    }
    const loginDataStr = localStorage.getItem("loginData");
    const loginData = JSON.parse(loginDataStr);
    const usuario = loginData.user; 
    

    try {
        const res = await fetch(`${API_LOGIN}/validate-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: usuario, code: codigo })
        });

        const data = await res.json();
        token = data.token;
        localStorage.setItem("token", token); 

        if (!res.ok) {
            alerta.textContent = "* Código incorreto/expirado";
            alerta.style.display = "block";
            return;
        }
        window.location.href = "../admin/homeAdm.html";
    } catch (erro) {
        console.error("Erro ao validar code:", erro);
        alert("Erro ao validar o código. Tente novamente.");
    }
});