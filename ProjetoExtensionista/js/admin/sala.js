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
   ELEMENTOS DA PÁGINA
=============================*/
const salasList = document.getElementById('sala-list');
const searchInput = document.getElementById('searchInput');

const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

const btnBlocos = document.getElementById('btnBlocos');
const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');
const activeFiltersDiv = document.getElementById('activeFilters');

let salaSelecionada = null;
let blocos = [];
let activeFilters = { blocos: [] };
let currentList = [];

/* ============================
   API
=============================*/
const API_URL = "https://study-hub-7qc5.onrender.com/sala";

/* ============================
   1. CARREGAR SALAS DA API
=============================*/
let salasCache = [];

async function carregarSalas() {
    salasList.innerHTML = "<li>Carregando salas...</li>";

    try {
        const response = await fetch(API_URL);
        const salas = await response.json();
        salasCache = salas;

        if (!Array.isArray(salas) || salas.length === 0) {
            salasList.innerHTML = `
                <li style="text-align:center; padding:15px;">
                    Nenhuma sala foi adicionada ainda.
                </li>
            `;
            return;
        }

        gerarListaDeBlocos(salas);
        renderizarSalas(salas);

    } catch (error) {
        console.error(error);
        salasList.innerHTML = "<li>Erro ao carregar salas.</li>";
    }
}

/* ============================
   2. GERAR LISTA DE BLOCOS DINAMICAMENTE
=============================*/
function gerarListaDeBlocos(salas) {
    const setBlocos = new Set();

    salas.forEach(sala => {
        if (sala.bloco) setBlocos.add(sala.bloco);
    });

    blocos = [...setBlocos];
}

/* ============================
   3. RENDERIZAR SALAS
=============================*/
function renderizarSalas(salas) {
    salasList.innerHTML = "";

    salas.forEach(sala => {
        const li = document.createElement("li");
        li.dataset.bloco = sala.bloco;

        li.innerHTML = `
            <span class="course-name">
                ${sala.nome} — Bloco ${sala.bloco}
            </span>

            <div class="actions">
                <button class="edit-btn" onclick="editarSala(${sala.id_sala})">✏️ Editar</button>
                <button class="delete-btn" onclick="abrirModalExcluir(${sala.id_sala}, '${sala.nome}')">🗑️ Excluir</button>
            </div>
        `;

        salasList.appendChild(li);
    });

    filterSalas();
}

/* ============================
   4. EDITAR SALA
=============================*/
function editarSala(id) {
    window.location.href = `/html/admin/editSala.html?id=${id}`;
}

/* ============================
   5. EXCLUSÃO
=============================*/
function abrirModalExcluir(id, nome) {
    salaSelecionada = id;
    confirmText.textContent = `Tem certeza que deseja excluir a sala “${nome}”?`;
    confirmModal.style.display = "flex";
}

confirmYes.addEventListener("click", async () => {
    if (!salaSelecionada) return;

    try {
        const response = await fetch(`${API_URL}/${salaSelecionada}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("Não foi possível excluir a sala.");
            return;
        }

        confirmModal.style.display = "none";
        carregarSalas();

    } catch (error) {
        console.error(error);
        alert("Erro ao excluir sala.");
    }
});

confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

/* ============================
   6. PESQUISA POR NOME
=============================*/
searchInput.addEventListener("input", () => filterSalas());

/* ============================
   7. FILTROS DE BLOCO
=============================*/
btnBlocos.addEventListener("click", () => openFiltro(blocos, 'blocos'));

function openFiltro(list, type) {
    currentList = list;
    renderList(list, type);
    modalFiltro.style.display = 'block';
    modalSearch.value = '';
    modalFiltro.dataset.type = type;
    modalSearch.focus();
}

function renderList(list, type) {
    modalList.innerHTML = "";

    list.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;

        li.onclick = () => {
            addFilter(item, type);
            closeFiltro();
            filterSalas();
        };

        modalList.appendChild(li);
    });
}

function closeFiltro() {
    modalFiltro.style.display = "none";
}

modalSearch.addEventListener("input", () => {
    const type = modalFiltro.dataset.type;
    const filtered = currentList.filter(item =>
        item.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderList(filtered, type);
});

window.addEventListener("click", (e) => {
    if (e.target === modalFiltro) closeFiltro();
});

/* ============================
   8. ADICIONAR / REMOVER FILTRO
=============================*/
function addFilter(item, type) {
    if (type === "blocos") {
        activeFilters.blocos.forEach(f => removeFilter(f, "blocos"));
    }

    if (!activeFilters[type].includes(item)) {
        activeFilters[type].push(item);

        const tag = document.createElement("span");
        tag.classList.add("filter-tag");
        tag.textContent = item + " ✕";
        tag.onclick = () => removeFilter(item, type);

        activeFiltersDiv.appendChild(tag);
    }
}

function removeFilter(item, type) {
    activeFilters[type] = activeFilters[type].filter(f => f !== item);

    [...activeFiltersDiv.children].forEach(tag => {
        if (tag.textContent.startsWith(item)) tag.remove();
    });

    filterSalas();
}

/* ============================
   9. FILTRAR SALAS
=============================*/
function filterSalas() {
    const termo = searchInput.value.toLowerCase();
    const items = salasList.querySelectorAll("li");

    items.forEach(li => {
        let show = true; 
        const nome = li.querySelector(".course-name").textContent.toLowerCase();
        const bloco = li.dataset.bloco;

        if (!nome.includes(termo)) {
            show = false;
        }

        if (activeFilters.blocos.length > 0) {
            if (!activeFilters.blocos.includes(bloco)) {
                show = false;
            }
        }

        li.style.display = show ? "flex" : "none";
    });
}

/* ============================
   10. INICIAR
=============================*/
carregarSalas();
