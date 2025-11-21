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
const cursosList = document.getElementById('curso-list');
const searchInput = document.getElementById('searchInput');

const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

const btnDisciplinas = document.getElementById('btnDisciplinas');
const btnProfessores = document.getElementById('btnProfessores');
const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');
const activeFiltersDiv = document.getElementById('activeFilters');

let cursosCache = [];
let currentList = [];
let disciplinasUnicas = [];
let professoresUnicos = [];
let activeFilters = { disciplinas: [], professores: [] };

let cursoSelecionado = null;

/* ============================
   API
=============================*/
const API_URL = "https://study-hub-7qc5.onrender.com/curso";
const API_DISCIPLINA = "https://study-hub-7qc5.onrender.com/disciplina";
const API_PROFESSOR = "https://study-hub-7qc5.onrender.com/professor";

// APIs para buscar associações (IDs)
const API_CURSO_DISCIPLINA = "https://study-hub-7qc5.onrender.com/curso/disciplina";
const API_DISCIPLINA_PROFESSOR_RVS = "https://study-hub-7qc5.onrender.com/disciplina/professor/rvs";

/* ============================
   1. CARREGAR CURSOS DA API
=============================*/
let disciplinasMap = new Map();
let professoresMap = new Map();

async function carregarCursos() {
    cursosList.innerHTML = "<li>Carregando cursos...</li>";

    try {
        const [cursosRes, discRes, profRes] = await Promise.all([
            fetch(API_URL),
            fetch(API_DISCIPLINA),
            fetch(API_PROFESSOR)
        ]);

        let cursos = await cursosRes.json();
        const disciplinasData = await discRes.json();
        const professoresData = await profRes.json();

        if (!Array.isArray(cursos) || cursos.length === 0) {
            cursosList.innerHTML = `<li style="text-align:center; padding:15px;">Nenhum curso foi adicionado ainda.</li>`;
            return;
        }

        disciplinasData.forEach(d => disciplinasMap.set(d.id_disciplina, d.nome));
        professoresData.forEach(p => professoresMap.set(p.id_professor, p.nome));

        cursos = await Promise.all(cursos.map(async curso => {

            const discDoCursoRes = await fetch(`${API_CURSO_DISCIPLINA}/${curso.id_curso}`);
            const discDoCursoData = await discDoCursoRes.json();

            const disciplinaIDs = discDoCursoData.map(d => d.id_disciplina);

            curso.disciplinasNomes = [];
            let professorIDsUnicos = new Set();

            const profPromises = disciplinaIDs.map(async idDisc => {
                const nomeDisc = disciplinasMap.get(idDisc);
                if (nomeDisc) curso.disciplinasNomes.push(nomeDisc);

                try {
                    const profDaDiscRes = await fetch(`${API_DISCIPLINA_PROFESSOR_RVS}/${idDisc}`);

                    if (profDaDiscRes.ok) {
                        const profDaDiscData = await profDaDiscRes.json();
                        if (Array.isArray(profDaDiscData)) {
                            profDaDiscData.forEach(p => professorIDsUnicos.add(p.id_professor));
                        } else {
                            console.warn(`Professores não encontrados para disciplina ${idDisc}`, profDaDiscData);
                        }
                    } else {
                        console.warn(`Não foi possível carregar professores da disciplina ${idDisc}`);
                    }
                } catch (err) {
                    console.error(`Erro ao buscar professores da disciplina ${idDisc}:`, err);
                }
            });

            await Promise.all(profPromises);

            curso.professoresNomes = Array.from(professorIDsUnicos)
                .map(idProf => professoresMap.get(idProf))
                .filter(nome => nome);

            return curso;
        }));

        cursosCache = cursos;

        gerarListasUnicas(cursos);
        renderizarCursos(cursos);

    } catch (error) {
        console.error("Erro ao carregar detalhes dos cursos:", error);
        cursosList.innerHTML = "<li>Erro ao carregar cursos e associações.</li>";
    }
}

/* ============================
   1.1. GERAR LISTAS ÚNICAS DE FILTROS
=============================*/
function gerarListasUnicas(cursos) {
    const discSet = new Set();
    const profSet = new Set();

    cursos.forEach(curso => {
        curso.disciplinasNomes.forEach(nome => discSet.add(nome));
        curso.professoresNomes.forEach(nome => profSet.add(nome));
    });

    disciplinasUnicas = [...discSet].sort();
    professoresUnicos = [...profSet].sort();
}

/* ============================
   2. RENDERIZAR CURSOS (SIMPLIFICADA)
=============================*/
function renderizarCursos(cursos) {
    cursosList.innerHTML = "";

    cursos.forEach(curso => {
        const li = document.createElement("li");

        li.dataset.disciplinas = curso.disciplinasNomes.join(',');
        li.dataset.professores = curso.professoresNomes.join(',');

        li.innerHTML = `
            <span class="course-name">${curso.nome}</span>

            <div class="option-container">
                <button class="option-btn">⋮</button>

                <div class="option-dropdown">
                    <button onclick="editarCurso(${curso.id_curso})">✏️ Editar</button>
                    <button onclick="abrirQuadroHorario(${curso.id_curso})">📅 Horários</button>
                    <button onclick="abrirModalExcluir(${curso.id_curso}, '${curso.nome}')">🗑️ Excluir</button>
                </div>
            </div>
        `;


        cursosList.appendChild(li);
    });

    filterCursos();
}

/* ============================
   3. EDITAR CURSO
=============================*/
function editarCurso(id) {
    window.location.href = `/html/admin/editCurso.html?id=${id}`;
}

/* ============================
   3.1. ABRIR QUADRO DE HORÁRIOS
=============================*/
function abrirQuadroHorario(idCurso) {
    window.location.href = `/html/admin/quadroHorario.html?id=${idCurso}`;
}


/* ============================
   4. ABRIR MODAL DE EXCLUSÃO
=============================*/
function abrirModalExcluir(id, nome) {
    cursoSelecionado = id;
    confirmText.textContent = `Tem certeza que deseja excluir o curso “${nome}”?`;
    confirmModal.style.display = "flex";
}

/* ============================
   5. CONFIRMAR EXCLUSÃO
=============================*/
confirmYes.addEventListener("click", async () => {
    if (!cursoSelecionado) return;

    try {
        const response = await fetch(`${API_URL}/${cursoSelecionado}`, { method: "DELETE" });

        if (!response.ok) {
            alert("Não foi possível excluir o curso.");
            return;
        }

        confirmModal.style.display = "none";
        carregarCursos();

    } catch (error) {
        console.error(error);
        alert("Erro ao excluir o curso.");
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
searchInput.addEventListener("input", () => {
    filterCursos();
});

/* ============================
   8. FILTROS (MODAL E GERAL)
=============================*/
btnDisciplinas?.addEventListener("click", () => openFiltro(disciplinasUnicas, 'disciplinas'));
btnProfessores?.addEventListener("click", () => openFiltro(professoresUnicos, 'professores'));

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
            filterCursos();
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
   8.1. ADICIONAR / REMOVER FILTRO (TAGS)
=============================*/
function addFilter(item, type) {
    activeFilters[type].forEach(f => removeFilter(f, type));

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

    filterCursos();
}

/* ============================
   8.2. FUNÇÃO DE FILTRAGEM DE CURSOS
=============================*/
function filterCursos() {
    const termo = searchInput.value.toLowerCase();
    const items = cursosList.querySelectorAll("li");

    items.forEach(li => {
        let show = true;
        const nome = li.querySelector(".course-name").textContent.toLowerCase();

        const discData = li.dataset.disciplinas?.toLowerCase() || '';
        const profData = li.dataset.professores?.toLowerCase() || '';

        if (!nome.includes(termo)) show = false;

        if (activeFilters.disciplinas.length > 0) {
            const filtroDisc = activeFilters.disciplinas[0].toLowerCase();
            if (!discData.includes(filtroDisc)) show = false;
        }

        if (activeFilters.professores.length > 0) {
            const filtroProf = activeFilters.professores[0].toLowerCase();
            if (!profData.includes(filtroProf)) show = false;
        }

        li.style.display = show ? "flex" : "none";
    });
}

/* ============================
   9. INICIAR
=============================*/
carregarCursos();

/* ============================
   10. ABRIR OPÇÕES
=============================*/

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
