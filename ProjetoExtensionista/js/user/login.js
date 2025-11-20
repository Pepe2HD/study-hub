function cadastrar() {
    window.location.href = "register.html";
}

function login() {
    const usuario = document.getElementById("usuario").value;
    const senha = document.getElementById("senha").value;

    if (usuario === "" || senha === "") {
        alert("Por favor, preencha usuário e senha!");
        return;
    }

    alert(`Tentando login com usuário: ${usuario}`);
    window.location.href = "../admin/homeAdm.html";
}

function entrarSemLogin() {
    window.location.href = "/index.html";
}

function voltar() {
    window.location.href = "/index.html";
}
