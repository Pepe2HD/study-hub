function login() {
    window.location.href = "login.html";
}

function cadastrar() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "" || senha === "") {
        alert("Por favor, preencha usuário e senha  válidos!");
        return;
    }

    window.location.href = "../admin/homeAdm.html";
}

function entrarSemLogin() {
    window.location.href = "home.html";
}

function voltar() {
    window.location.href = "home.html";
}
