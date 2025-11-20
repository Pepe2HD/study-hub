/* ============================
   MENU LATERAL
============================ */
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

/* ============================
   PARÂMETROS DA URL
============================ */
const params = new URLSearchParams(window.location.search);
const idSala = params.get('id');

/* ============================
   ELEMENTOS
============================ */
const inputNome = document.getElementById('nome');
const inputBloco = document.getElementById('bloco');
const inputCapacidade = document.getElementById('capacidade');
const btnCadastrar = document.getElementById('btnCadastrar');

/* ============================
   API
============================ */
const API_SALA = "https://study-hub-7qc5.onrender.com/sala";

/* ============================
   CARREGAR SALA EXISTENTE
============================ */
async function carregarSala() {
    if (!idSala) return;

    try {
        const res = await fetch(`${API_SALA}/${idSala}`);
        if (!res.ok) throw new Error("Erro ao buscar sala.");
        const sala = await res.json();

        inputNome.value = sala.nome;
        inputBloco.value = sala.bloco;
        inputCapacidade.value = sala.capacidade;

    } catch (err) {
        alert(err.message);
    }
}

/* ============================
   ATUALIZAR SALA
============================ */
if (btnCadastrar) {
    btnCadastrar.addEventListener('click', async () => {
        const nomeValue = inputNome.value.trim();
        const blocoValue = inputBloco.value.trim();
        const capacidadeValue = inputCapacidade.value.trim();

        if (!nomeValue) { alert("Preencha o campo Nome."); inputNome.focus(); return; }
        if (!blocoValue) { alert("Preencha o campo Bloco."); inputBloco.focus(); return; }
        if (!capacidadeValue) { alert("Preencha o campo Capacidade."); inputCapacidade.focus(); return; }

        try {
            const res = await fetch(`${API_SALA}/${idSala}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    nome: nomeValue,
                    bloco: blocoValue,
                    capacidade: parseInt(capacidadeValue)
                })
            });

            if (!res.ok) throw new Error("Erro ao atualizar sala.");

            alert("Sala atualizada com sucesso!");
            window.location.href = "/html/admin/sala.html";

        } catch (err) {
            alert(err.message);
        }
    });
}

/* ============================
   INICIAR
============================ */
document.addEventListener('DOMContentLoaded', carregarSala);
