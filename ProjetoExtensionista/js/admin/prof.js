/* ============================
   CONFIGURAÇÃO E VARIÁVEIS
=============================*/
const API_URL = "https://study-hub-2mr9.onrender.com/professor";

const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const profList = document.getElementById('prof-list');
const searchInput = document.getElementById('searchInput');

// Elementos do Modal de Exclusão
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

let professorIdParaExcluir = null;

/* ============================
   INICIALIZAÇÃO (SIDEBAR)
=============================*/
if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

/* ============================
   FUNÇÕES PRINCIPAIS
=============================*/

// 1. Carregar Professores da API
async function carregarProfessores() {
    profList.innerHTML = '<li style="justify-content:center;">Carregando professores...</li>';

    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro na requisição');
        
        const professores = await response.json();

        // Limpa a lista
        profList.innerHTML = "";

        if (!Array.isArray(professores) || professores.length === 0) {
            profList.innerHTML = '<li style="justify-content:center;">Nenhum professor encontrado.</li>';
            return;
        }

        professores.forEach(prof => {
            adicionarProfessorNaTela(prof);
        });

    } catch (error) {
        console.error(error);
        profList.innerHTML = '<li style="justify-content:center; color: #ffcccc;">Erro ao carregar dados. Verifique a API.</li>';
    }
}

// 2. Renderizar item na lista (MODIFICADO COM O MENU DROPDOWN)
function adicionarProfessorNaTela(prof) {
    const li = document.createElement("li");
    
    // Ajuste de IDs
    const idProf = prof.id || prof.id_professor || prof._id; 
    const nomeProf = prof.nome;

    li.innerHTML = `
        <span class="course-name">${nomeProf}</span>

        <div class="option-container">
            <button class="option-btn">⋮</button>

            <div class="option-dropdown">
                <button onclick="irParaEdicao('${idProf}')">✏️ Editar</button>
                <button onclick="abrirModalExcluir('${idProf}', '${nomeProf}')">🗑️ Excluir</button>
            </div>
        </div>
    `;
    profList.appendChild(li);
}

// 3. Redirecionar para Edição
window.irParaEdicao = function(id) {
    window.location.href = `/html/admin/editProf.html?id=${id}`;
}

/* ============================
   LÓGICA DE EXCLUSÃO
=============================*/
window.abrirModalExcluir = function(id, nome) {
    professorIdParaExcluir = id;
    confirmText.textContent = `Deseja realmente excluir o professor "${nome}"?`;
    confirmModal.style.display = "flex";
}

confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
    professorIdParaExcluir = null;
});

confirmYes.addEventListener("click", async () => {
    if (!professorIdParaExcluir) return;

    try {
        const response = await fetch(`${API_URL}/${professorIdParaExcluir}`, {
            method: "DELETE"
        });

        if (response.ok) {
            // Se necessário, descomente o alert abaixo
            // alert("Professor excluído com sucesso!");
            carregarProfessores(); // Recarrega a lista
        } else {
            alert("Erro ao excluir. Tente novamente.");
        }
    } catch (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro de conexão com o servidor.");
    } finally {
        confirmModal.style.display = "none";
    }
});

/* ============================
   FILTRO DE PESQUISA
=============================*/
searchInput.addEventListener("input", function() {
    const termo = this.value.toLowerCase();
    const itens = profList.querySelectorAll("li");

    itens.forEach(item => {
        const texto = item.querySelector(".course-name").textContent.toLowerCase();
        if (texto.includes(termo)) {
            item.style.display = "flex";
        } else {
            item.style.display = "none";
        }
    });
});

/* ============================
   NOVO: CONTROLE DO MENU DROPDOWN
=============================*/
document.addEventListener("click", function(event) {
    // Verifica se clicou no botão de 3 pontinhos
    const isButton = event.target.matches(".option-btn");
    
    // Seleciona todos os menus abertos
    const allMenus = document.querySelectorAll(".option-dropdown");

    if (isButton) {
        const dropdown = event.target.nextElementSibling;
        
        // Verifica se este específico já está aberto
        const isOpen = dropdown.style.display === "block";

        // Fecha todos antes de abrir o novo (para não ficarem 2 abertos)
        allMenus.forEach(menu => menu.style.display = "none");

        // Se não estava aberto, abre. Se estava, o código acima já fechou.
        if (!isOpen) {
            dropdown.style.display = "block";
        }

    } else {
        // Se clicar fora, fecha tudo
        allMenus.forEach(menu => menu.style.display = "none");
    }
});

// Inicializar ao carregar a página
document.addEventListener("DOMContentLoaded", carregarProfessores);