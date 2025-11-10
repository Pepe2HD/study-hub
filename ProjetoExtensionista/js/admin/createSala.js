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
    const inputBloco = document.getElementById('bloco');
    const inputCapac = document.getElementById('capacidade');

    if (btnCadastrar && inputNome && inputBloco && inputCapac) {
        btnCadastrar.addEventListener('click', function (event) {
            const nomeValue = inputNome.value.trim();
            const blocoValue = inputBloco.value.trim();
            const capacValue = inputBloco.value.trim();

            if (nomeValue === "") {
                alert("Por favor, preencha o campo Nome.");
                inputNome.focus();
            }

            if (blocoValue === "") {
                alert("Por favor, preencha o campo do bloco.");
                inputHours.focus();
                return;
            }

            if (capacValue === "") {
                alert("Por favor, preencha o campo de capacidade.");
                inputHours.focus();
                return;
            }

            alert("Sala cadastrada com sucesso!");

            window.location.href = '/html/admin/sala.html';
        });
    }

});
