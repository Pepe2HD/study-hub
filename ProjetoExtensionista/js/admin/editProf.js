/* ============================
   CONFIGURAÇÃO
=============================*/
const API_URL = "https://study-hub-2mr9.onrender.com/professor";

const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

// Captura o ID da URL (ex: editProf.html?id=10)
const params = new URLSearchParams(window.location.search);
const idProfessor = params.get('id');

const inputNome = document.getElementById('nome');
const inputEmail = document.getElementById('email');
const btnSalvar = document.getElementById('btnCadastrar'); // Reaproveitando a classe/id do botão

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

/* ============================
   CARREGAR DADOS DO PROFESSOR
=============================*/
async function carregarDadosProfessor() {
    if (!idProfessor) {
        alert("ID do professor não encontrado.");
        window.location.href = "/html/admin/prof.html";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${idProfessor}`);
        if (!response.ok) throw new Error("Professor não encontrado");

        const prof = await response.json();
        
        // Preenche os inputs
        inputNome.value = prof.nome || "";
        inputEmail.value = prof.email || "";

    } catch (error) {
        console.error(error);
        alert("Erro ao carregar dados do professor.");
        window.location.href = "/html/admin/prof.html";
    }
}

/* ============================
   SALVAR ALTERAÇÕES (PUT)
=============================*/
btnSalvar.addEventListener('click', async function() {
    const nome = inputNome.value.trim();
    const email = inputEmail.value.trim();

    if (!nome || !email) {
        alert("Preencha todos os campos.");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${idProfessor}`, {
            method: "PUT", // ou PATCH, dependendo do seu backend
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ nome, email })
        });

        if (response.ok) {
            alert("Professor atualizado com sucesso!");
            window.location.href = "/html/admin/prof.html";
        } else {
            alert("Erro ao atualizar professor.");
        }

    } catch (error) {
        console.error(error);
        alert("Erro de conexão ao atualizar.");
    }
});

// Inicia o carregamento ao abrir a página
document.addEventListener("DOMContentLoaded", carregarDadosProfessor);