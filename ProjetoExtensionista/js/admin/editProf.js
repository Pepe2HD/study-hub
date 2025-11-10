const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}


document.addEventListener('DOMContentLoaded', function () {
    const btnCadastrar = document.getElementById('btnCadastrar');
    const inputNome = document.getElementById('nome');
    const inputEmail = document.getElementById('email');

    if (btnCadastrar && inputNome && inputEmail) {
        btnCadastrar.addEventListener('click', function (event) {
            const nomeValue = inputNome.value.trim();
            const emailValue = inputEmail.value.trim();

            if (nomeValue === "") {
                alert("Por favor, preencha o campo Nome.");
                inputNome.focus();
            }

            if (emailValue === "") {
                alert("Por favor, preencha o campo Email.");
                inputEmail.focus();
                return;
            }

            alert("Professor atualizado com sucesso!");

            window.location.href = '/html/admin/prof.html';
        });
    }

});
