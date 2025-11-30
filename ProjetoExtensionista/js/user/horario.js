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

// Modais existentes
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

// Elementos do NOVO Modal de Vínculo
const modalVincular = document.getElementById('modalVincular');
const closeVincular = document.getElementById('closeVincular');
const tituloVincular = document.getElementById('tituloVincular');
const selectDisciplinaVincular = document.getElementById('selectDisciplinaVincular');
const btnAdicionarVinculo = document.getElementById('btnAdicionarVinculo');
const listaVinculadas = document.getElementById('listaVinculadas');

/* ============================
   VARIÁVEIS GLOBAIS
=============================*/
let cursosCache = [];
let currentList = [];
let disciplinasUnicas = [];
let professoresUnicos = [];
let activeFilters = { disciplinas: [], professores: [] };

let cursoSelecionadoExclusao = null; // Para excluir o Curso inteiro
let cursoEmEdicaoVinculo = null;     // ID do curso aberto no modal de disciplinas

/* ============================
   API
=============================*/
const API_URL = "https://study-hub-2mr9.onrender.com/curso";
const API_DISCIPLINA = "https://study-hub-2mr9.onrender.com/disciplina";
const API_PROFESSOR = "https://study-hub-2mr9.onrender.com/professor";

// APIs de Associação
const API_CURSO_DISCIPLINA = "https://study-hub-2mr9.onrender.com/curso/disciplina"; // POST e DELETE aqui
const API_DISCIPLINA_PROFESSOR_RVS = "https://study-hub-2mr9.onrender.com/disciplina/professor/rvs";

/* ============================
   MAPAS AUXILIARES
=============================*/
let disciplinasMap = new Map();
let professoresMap = new Map();

/* ============================
   1. CARREGAR CURSOS
=============================*/
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

        // Popula mapas para acesso rápido por ID
        disciplinasMap.clear();
        disciplinasData.forEach(d => disciplinasMap.set(d.id_disciplina, d.nome));
        
        professoresMap.clear();
        professoresData.forEach(p => professoresMap.set(p.id_professor, p.nome));

        // Monta objetos completos
        cursos = await Promise.all(cursos.map(async curso => {
            // Busca disciplinas deste curso
            const discDoCursoRes = await fetch(`${API_CURSO_DISCIPLINA}/${curso.id_curso}`);
            const discDoCursoData = await discDoCursoRes.json();
            
            const disciplinaIDs = Array.isArray(discDoCursoData) ? discDoCursoData.map(d => d.id_disciplina) : [];

            curso.disciplinasNomes = [];
            let professorIDsUnicos = new Set();

            const profPromises = disciplinaIDs.map(async idDisc => {
                const nomeDisc = disciplinasMap.get(idDisc);
                if (nomeDisc) curso.disciplinasNomes.push(nomeDisc);

                // Busca professores da disciplina
                try {
                    const profDaDiscRes = await fetch(`${API_DISCIPLINA_PROFESSOR_RVS}/${idDisc}`);
                    if (profDaDiscRes.ok) {
                        const profDaDiscData = await profDaDiscRes.json();
                        if (Array.isArray(profDaDiscData)) {
                            profDaDiscData.forEach(p => professorIDsUnicos.add(p.id_professor));
                        }
                    }
                } catch (err) {
                    console.error(`Erro prof da disc ${idDisc}:`, err);
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
   2. RENDERIZAR CURSOS
=============================*/
function renderizarCursos(cursos) {
    cursosList.innerHTML = "";

    cursos.forEach(curso => {
        const li = document.createElement("li");

        li.dataset.disciplinas = curso.disciplinasNomes.join(',');
        li.dataset.professores = curso.professoresNomes.join(',');

        // ADICIONADO O BOTÃO "📚 Disciplinas"
        li.innerHTML = `
            <span class="course-name">${curso.nome}</span>

            <div class="option-container">
                <button class="option-btn">⋮</button>

                <div class="option-dropdown">
                    <button onclick="abrirModalVincular(${curso.id_curso}, '${curso.nome}')">📚 Disciplinas</button>
                    <button onclick="abrirQuadroHorario(${curso.id_curso})">📅 Horários</button>
    
                </div>
            </div>
        `;
        cursosList.appendChild(li);
    });

    filterCursos();
}

/* ============================
   3. FUNÇÕES DE NAVEGAÇÃO
=============================*/


function abrirQuadroHorario(idCurso) {
    window.location.href = `/html/user/quadroHorario.html?id=${idCurso}`;
}

/* ============================
   4. EXCLUSÃO DE CURSO
=============================*/



confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

/* ============================
   5. MODAL DE VÍNCULO (NOVO)
=============================*/

// Abrir Modal
async function abrirModalVincular(idCurso, nomeCurso) {
    cursoEmEdicaoVinculo = idCurso;
    tituloVincular.textContent = `Disciplinas de: ${nomeCurso}`;
    modalVincular.style.display = "block";
    
    // Reset visual
    selectDisciplinaVincular.innerHTML = '<option>Carregando...</option>';
    listaVinculadas.innerHTML = '<li>Carregando...</li>';
    selectDisciplinaVincular.disabled = true;
    btnAdicionarVinculo.disabled = true;

    await carregarDadosDoModalVinculo(idCurso);
}

// Carregar dados e preencher listas
async function carregarDadosDoModalVinculo(idCurso) {
    try {
        // 1. Pega TODAS as disciplinas do sistema
        const resTodas = await fetch(API_DISCIPLINA);
        const todasDisciplinas = await resTodas.json();

        // 2. Pega as disciplinas JÁ vinculadas a este curso
        const resVinculadas = await fetch(`${API_CURSO_DISCIPLINA}/${idCurso}`);
        let vinculadas = [];
        if (resVinculadas.ok) {
            vinculadas = await resVinculadas.json();
        }

        // 3. Renderiza a lista de vinculadas (com botão de excluir)
        listaVinculadas.innerHTML = "";
        const idsVinculados = new Set();

        if (vinculadas.length === 0) {
            listaVinculadas.innerHTML = '<li style="color:#777">Nenhuma disciplina vinculada.</li>';
        } else {
            vinculadas.forEach(disc => {
                idsVinculados.add(disc.id_disciplina);
                
                const li = document.createElement("li");
              
                listaVinculadas.appendChild(li);
            });
        }

        // 4. Preencher Select (apenas com as NÃO vinculadas)

        
        todasDisciplinas.forEach(disc => {
            if (!idsVinculados.has(disc.id_disciplina)) {
                const opt = document.createElement("option");
                opt.value = disc.id_disciplina;
                opt.textContent = disc.nome;
                selectDisciplinaVincular.appendChild(opt);
            }
        });

        selectDisciplinaVincular.disabled = false;
        btnAdicionarVinculo.disabled = false;

    } catch (error) {
        console.error("Erro no modal de vinculo:", error);
        listaVinculadas.innerHTML = "<li>Erro ao carregar dados.</li>";
    }
}




// Fechar Modal de Vínculo
closeVincular.addEventListener("click", () => {
    modalVincular.style.display = "none";
    // Recarrega a lista principal para refletir mudanças nos filtros/badges
    carregarCursos();
});

/* ============================
   6. FILTROS E PESQUISA
=============================*/
searchInput.addEventListener("input", filterCursos);

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




function removeFilter(item, type) {
    activeFilters[type] = activeFilters[type].filter(f => f !== item);
    [...activeFiltersDiv.children].forEach(tag => {
        if (tag.textContent.startsWith(item)) tag.remove();
    });
    filterCursos();
}

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
   7. GERENCIADOR DE CLIQUES (Fechar modais)
=============================*/
window.addEventListener("click", (e) => {
    if (e.target === modalFiltro) closeFiltro();
    if (e.target === modalVincular) {
        modalVincular.style.display = "none";
        carregarCursos();
    }
});

document.addEventListener("click", function(event) {
    const isButton = event.target.matches(".option-btn");
    const allMenus = document.querySelectorAll(".option-dropdown");

    if (isButton) {
        const dropdown = event.target.nextElementSibling;
        const isOpen = dropdown.style.display === "block";
        allMenus.forEach(menu => menu.style.display = "none");
        if (!isOpen) dropdown.style.display = "block";
    } else {
        allMenus.forEach(menu => menu.style.display = "none");
    }
});

// Inicialização
carregarCursos();