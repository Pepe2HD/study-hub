const idBtn = document.getElementById("btn-login");
const API_LOGIN = "https://study-hub-2mr9.onrender.com/login";
const alertBox = document.getElementById("alert-email");

function cadastrar() {
    window.location.href = "/cadastro.html";
}

function entrarSemLogin() {
    window.location.href = "/index.html";
}

function voltar() {
    window.location.href = "/index.html";
}

if (sessionStorage.getItem("passwordResetSuccess") == "true") {
    alertBox.classList.add("show");
    alertBox.classList.add("success");
    alertBox.textContent = "Senha redefinida com sucesso!";

    setTimeout(() => {
        alertBox.classList.remove("show");
        alertBox.classList.remove("success");
    }, 3000);
    sessionStorage.removeItem("passwordResetSuccess");
} else if (sessionStorage.getItem("passwordResetSuccess")) {
    alertBox.classList.add("show");
    alertBox.classList.add("fail");
    alertBox.textContent = "Erro ao redefinir a senha, tente novamente.";

    setTimeout(() => {
        alertBox.classList.remove("show");
        alertBox.classList.remove("fail");
    }, 3000);
    sessionStorage.removeItem("passwordResetSuccess");
} 

idBtn.addEventListener("click", async () => {
    const usuario = document.getElementById("usuario").value.trim();
    const senha = document.getElementById("senha").value.trim();
    const alerta = document.getElementById("alert-erro");

    alerta.style.display = "none";

    if (!usuario || !senha) {
        alerta.textContent = "* Preencha usuário e senha.";
        alerta.style.display = "block";
        return;
    }

    try {
        const res = await fetch(`${API_LOGIN}/send-code`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user: usuario, senha: senha })
        });

        if (!res.ok) {
            alerta.textContent = "* Usuário ou senha incorretos.";
            alerta.style.display = "block";
            return;
        }

        const loginData = {
            user: usuario,
            pass: senha
        };
        
        localStorage.setItem("loginData", JSON.stringify(loginData));

        window.location.href = "../login/verifica.html";

    } catch (erro) {
        console.error("Erro ao enviar code:", erro);
        alert("Erro ao tentar fazer login. Tente novamente.");
    }
});

document.getElementById("esqueceu-senha").addEventListener("click", async (event) => {
    event.preventDefault();
    const email = document.getElementById("usuario").value.trim();
    const alerta = document.getElementById("alert-erro");

    alerta.style.display = "none";
    alertBox.textContent = "Enviamos um link para redefinir a sua senha. Verifique seu e-mail, lembre-se de olhar a caixa de spam!";

    if (!email) {
        alerta.textContent = "* Preencha o campo 'Usuário' com seu email.";
        alerta.style.display = "block";
        return;
    }

    try {
        const res = await fetch(`${API_LOGIN}/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (!res.ok) {
            alerta.textContent = "* Email não encontrado";
            alerta.style.display = "block";
            return;
        }
        localStorage.setItem("userLogin", usuario);
        alertBox.classList.add("show");

        setTimeout(() => {
            alertBox.classList.remove("show");
        }, 10000);
    } catch (error) {
        console.error(error);
        alert("Erro ao solicitar redefinição. Tente novamente.");
    }
});
