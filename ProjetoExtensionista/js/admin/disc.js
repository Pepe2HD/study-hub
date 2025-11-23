/* ============================
   MENU LATERAL
=============================*/
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

/* ============================
   ELEMENTOS
=============================*/
const discList = document.getElementById('disc-list');
const searchInput = document.getElementById('searchInput');
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');
const btnCursos = document.getElementById('btnDisciplinas');
const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');
const activeFiltersDiv = document.getElementById('activeFilters');

/* ============================
   VARIÁVEIS
=============================*/
let disciplinasCache = [];
let cursosUnicos = [];
let currentList = [];
let activeFilters = { cursos: [] };
let disciplinaSelecionada = null;

/* ============================
   API
=============================*/
const API_DISCIPLINA = "\https://study-hub-2mr9.onrender.com/disciplina";
const API_CURSO_DISCIPLINA = "https://study-hub-2mr9.onrender.com/curso/disciplina/rvs";

/* ============================
   1. CARREGAR DISCIPLINAS
=============================*/
async function carregarDisciplinas() {
    discList.innerHTML = "<li>Carregando disciplinas...</li>";

    try {
        let disciplinas = await fetch(API_DISCIPLINA).then(r => r.json());

        if (!Array.isArray(disciplinas) || disciplinas.length === 0) {
            discList.innerHTML = `<li style="text-align:center; padding:15px;">Nenhuma disciplina cadastrada.</li>`;
            return;
        }

        disciplinas = await Promise.all(disciplinas.map(async disc => {
            const cursosRes = await fetch(`${API_CURSO_DISCIPLINA}/${disc.id_disciplina}`);
            const cursosData = await cursosRes.json();

            // Garantir que cursosData é um array
            disc.cursos = Array.isArray(cursosData) ? cursosData.map(c => c.nome) : [];

            return disc;
        }));

        disciplinasCache = disciplinas;

        gerarCursosUnicos(disciplinas);
        renderizarDisciplinas(disciplinas);

    } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
        discList.innerHTML = "<li>Erro ao carregar disciplinas.</li>";
    }
}

/* ============================
   1.1 LISTA ÚNICA DE CURSOS
=============================*/
function gerarCursosUnicos(disciplinas) {
    const cursosSet = new Set();
    disciplinas.forEach(d => d.cursos.forEach(c => cursosSet.add(c)));
    cursosUnicos = [...cursosSet].sort();
}

/* ============================
   2. RENDERIZAR LISTA
=============================*/
function renderizarDisciplinas(lista) {
    discList.innerHTML = "";

    lista.forEach(disc => {
        const li = document.createElement("li");
        li.dataset.cursos = disc.cursos.join(",").toLowerCase();

        li.innerHTML = `
          <span class="course-name">${disc.nome}</span>

          <div class="option-container">
              <button class="option-btn">⋮</button>

              <div class="option-dropdown">
                  <button onclick="editarDisciplina(${disc.id_disciplina})">✏️ Editar</button>
                  <button onclick="abrirModalExcluir(${disc.id_disciplina}, '${disc.nome}')">🗑️ Excluir</button>
              </div>
          </div>
    `;


        discList.appendChild(li);
    });

    filterDisciplinas();
}

/* ============================
   3. EDITAR
=============================*/
function editarDisciplina(id) {
    window.location.href = `/html/admin/editDisc.html?id=${id}`;
}

/* ============================
   4. MODAL DE EXCLUSÃO
=============================*/
function abrirModalExcluir(id, nome) {
    disciplinaSelecionada = id;
    confirmText.textContent = `Deseja realmente excluir a disciplina “${nome}”?`;
    confirmModal.style.display = "flex";
}

/* ============================
   5. CONFIRMAR EXCLUSÃO
=============================*/
confirmYes.addEventListener("click", async () => {
    if (!disciplinaSelecionada) return;

    try {
        const res = await fetch(`${API_DISCIPLINA}/${disciplinaSelecionada}`, { method: "DELETE" });

        if (!res.ok) {
            alert("Não foi possível excluir a disciplina.");
            return;
        }

        confirmModal.style.display = "none";
        carregarDisciplinas();

    } catch (err) {
        console.error(err);
        alert("Erro ao excluir a disciplina.");
    }
});

/* ============================
   6. FECHAR MODAL
=============================*/
confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

/* ============================
   7. PESQUISA
=============================*/
searchInput.addEventListener("input", filterDisciplinas);

/* ============================
   8. FILTRO DE CURSOS (MODAL)
=============================*/
btnCursos?.addEventListener("click", () => openFiltro(cursosUnicos));

function openFiltro(list) {
    currentList = list;
    modalFiltro.style.display = "block";
    modalSearch.value = "";
    renderList(list);
    modalSearch.focus();
}

function renderList(list) {
    modalList.innerHTML = "";
    list.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;
        li.onclick = () => {
            addFilter(item);
            closeFiltro();
            filterDisciplinas();
        };
        modalList.appendChild(li);
    });
}

modalSearch.addEventListener("input", () => {
    const filtered = currentList.filter(item =>
        item.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderList(filtered);
});

function closeFiltro() {
    modalFiltro.style.display = "none";
}

window.addEventListener("click", e => {
    if (e.target === modalFiltro) closeFiltro();
});

/* ============================
   8.1 TAGS ATIVAS
=============================*/
function addFilter(item) {
    activeFilters.cursos = [item];
    activeFiltersDiv.innerHTML = "";

    const tag = document.createElement("span");
    tag.classList.add("filter-tag");
    tag.textContent = item + " ✕";
    tag.onclick = () => removeFilter(item);
    activeFiltersDiv.appendChild(tag);
}

function removeFilter(item) {
    activeFilters.cursos = [];
    activeFiltersDiv.innerHTML = "";
    filterDisciplinas();
}

/* ============================
   9. FILTRAR DISCIPLINAS
=============================*/
function filterDisciplinas() {
    const termo = searchInput.value.toLowerCase();
    const items = discList.querySelectorAll("li");

    items.forEach(li => {
        let show = true;
        const nome = li.querySelector(".course-name").textContent.toLowerCase();
        const cursos = li.dataset.cursos;

        if (!nome.includes(termo)) show = false;
        if (activeFilters.cursos.length > 0) {
            const filtro = activeFilters.cursos[0].toLowerCase();
            if (!cursos.includes(filtro)) show = false;
        }

        li.style.display = show ? "flex" : "none";
    });
}

/* ============================
   10. INICIAR
=============================*/
carregarDisciplinas();
/* ============================*/
document.addEventListener("click", function(event) {
    const isButton = event.target.matches(".option-btn");
    const allMenus = document.querySelectorAll(".option-dropdown");

    if (isButton) {
        const dropdown = event.target.nextElementSibling;


        const isOpen = dropdown.style.display === "block";


        allMenus.forEach(menu => menu.style.display = "none");


        if (!isOpen) {
            dropdown.style.display = "block";
        }

    } else {

        allMenus.forEach(menu => menu.style.display = "none");
    }
});