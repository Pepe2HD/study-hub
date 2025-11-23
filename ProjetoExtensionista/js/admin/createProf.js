/* ============================
   CONFIGURAÇÃO
=============================*/
const API_URL = "https://study-hub-2mr9.onrender.com/professor";

const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

/* ============================
   LOGICA DE CADASTRO
=============================*/
document.addEventListener('DOMContentLoaded', function () {
    const btnCadastrar = document.getElementById('btnCadastrar');
    const inputNome = document.getElementById('nome');
    const inputEmail = document.getElementById('email');

    btnCadastrar.addEventListener('click', async function (e) {
        e.preventDefault(); // Previne comportamento padrão de form se houver

        const nome = inputNome.value.trim();
        const email = inputEmail.value.trim();

        if (!nome || !email) {
            alert("Por favor, preencha todos os campos.");
            return;
        }

        const novoProfessor = { nome, email };

        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(novoProfessor)
            });

            if (response.ok) {
                alert("Professor cadastrado com sucesso!");
                // Redireciona de volta para a lista
                window.location.href = "/html/admin/prof.html";
            } else {
                const erro = await response.json();
                alert(`Erro ao cadastrar: ${erro.message || response.statusText}`);
            }
        } catch (error) {
            console.error("Erro na requisição:", error);
            alert("Erro ao conectar com o servidor.");
        }
    });
});