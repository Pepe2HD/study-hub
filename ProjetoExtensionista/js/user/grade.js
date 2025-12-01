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

let cursoSelecionadoExclusao = null;
let cursoEmEdicaoVinculo = null;


/* ============================
   API
=============================*/
const API_URL = "https://study-hub-2mr9.onrender.com/curso";
const API_DISCIPLINA = "https://study-hub-2mr9.onrender.com/disciplina";
const API_PROFESSOR = "https://study-hub-2mr9.onrender.com/professor";

// APIs de Associação
const API_CURSO_DISCIPLINA = "https://study-hub-2mr9.onrender.com/curso/disciplina";
const API_DISCIPLINA_PROFESSOR_RVS = "https://study-hub-2mr9.onrender.com/disciplina/professor/rvs";


/* ============================
   MAPAS AUXILIARES
=============================*/
let disciplinasMap = new Map();
let professoresMap = new Map();

//-----------------------------------------
// POP-UP PROFISSIONAL
//-----------------------------------------
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupTitle = document.getElementById("popup-title");
const popupIcon = document.querySelector(".popup-icon");
const popupClose = document.getElementById("popup-close");

function showPopup(message, type = "erro") {
  popupText.innerHTML = message;

  popup.classList.remove("sucesso", "erro");
  popup.classList.add(type);

  if (type === "sucesso") {
    popupTitle.textContent = "Sucesso!";
    popupIcon.innerHTML = "✔️";
  } else {
    popupTitle.textContent = "Erro!";
    popupIcon.innerHTML = "❌";
  }

  popup.style.display = "flex";

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);
}

function hidePopup() {
  popup.classList.remove("show");
  setTimeout(() => {
    popup.style.display = "none";
  }, 250);
}

popupClose.addEventListener("click", hidePopup);





/* ============================
   1. CARREGAR CURSOS (SEM PROFESSORES)
=============================*/
async function carregarCursos() {
    cursosList.innerHTML = "<li>Carregando cursos...</li>";

    try {
        // --- Carrega cursos e disciplinas ---
        const cursosRes = await fetch(API_URL);
        const discRes = await fetch(API_DISCIPLINA);

        if (!cursosRes.ok || !discRes.ok) {
            throw new Error("Falha ao carregar dados principais.");
        }

        let cursos = await cursosRes.json();
        const disciplinasData = await discRes.json();

        if (!Array.isArray(cursos) || cursos.length === 0) {
            cursosList.innerHTML = `<li style="text-align:center; padding:15px;">Nenhum curso foi adicionado ainda.</li>`;
            return;
        }

        // Mapas auxiliares
        disciplinasMap.clear();
        disciplinasData.forEach(d => disciplinasMap.set(d.id_disciplina, d.nome));

        // --- Carregar disciplinas de cada curso (SEM PROFESSORES) ---
        cursos = await Promise.all(cursos.map(async curso => {
            try {
                const discDoCursoRes = await fetch(`${API_CURSO_DISCIPLINA}/${curso.id_curso}`);
                let discDoCursoData = [];

                if (discDoCursoRes.ok) {
                    discDoCursoData = await discDoCursoRes.json();
                    if (!Array.isArray(discDoCursoData)) discDoCursoData = [];
                }

                const disciplinaIDs = discDoCursoData.map(d => d.id_disciplina);

                curso.disciplinasNomes = disciplinaIDs
                    .map(id => disciplinasMap.get(id))
                    .filter(Boolean);

                curso.professoresNomes = []; // <- removido, mas mantido para não quebrar filtros antigos

                return curso;

            } catch (err) {
                console.warn(`Erro ao carregar vínculo do curso ${curso.id_curso}:`, err);
                curso.disciplinasNomes = [];
                curso.professoresNomes = [];
                return curso;
            }
        }));

        cursosCache = cursos;
        gerarListasUnicas(cursos);
        renderizarCursos(cursos);

    } catch (error) {
        console.error("ERRO FINAL:", error);
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

        li.innerHTML = `
            <span class="course-name">${curso.nome}</span>
        `;

        // ===========================
        // NOVA FUNÇÃO DE SELEÇÃO
        // ===========================
        li.addEventListener("click", (e) => {
            // Evita conflito com os botões dos 3 pontinhos
            if (!e.target.classList.contains("option-btn") &&
                !e.target.closest(".option-dropdown")) {
                selecionarCurso(curso.id_curso, curso.nome);
            }
        });

        cursosList.appendChild(li);
    });

    //filterCursos();
}


/* ============================
   2.1 FUNÇÃO PARA SELECIONAR CURSO
=============================*/
function selecionarCurso(id, nome) {
    showPopup(`<br>Curso "${nome}" escolhido 😄<br>Agora é só abrir os horários.`, "sucesso");
    
    // Salva (ou atualiza) no localStorage
    localStorage.setItem("cursoSelecionado", id);
    localStorage.setItem("cursoNomeSelecionado", nome);
}


/* ============================
   3. NAVEGAÇÃO PARA HORÁRIOS
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
   5. MODAL DE VÍNCULO
=============================*/
async function abrirModalVincular(idCurso, nomeCurso) {
    cursoEmEdicaoVinculo = idCurso;
    tituloVincular.textContent = `Disciplinas de: ${nomeCurso}`;
    modalVincular.style.display = "block";
    
    selectDisciplinaVincular.innerHTML = '<option>Carregando...</option>';
    listaVinculadas.innerHTML = '<li>Carregando...</li>';
    selectDisciplinaVincular.disabled = true;
    btnAdicionarVinculo.disabled = true;

    await carregarDadosDoModalVinculo(idCurso);
}


/* ============================
   FILTROS (APENAS DISCIPLINAS)
=============================*/

// Atualiza lista com base nos filtros ativos
function aplicarFiltros() {
    let filtrados = [...cursosCache];

    // Filtro por disciplinas
    if (activeFilters.disciplinas.length > 0) {
        filtrados = filtrados.filter(curso =>
            curso.disciplinasNomes.some(d =>
                activeFilters.disciplinas.includes(d)
            )
        );
    }

    // Campo de busca (search)
    const searchValue = searchInput.value.trim().toLowerCase();
    if (searchValue !== "") {
        filtrados = filtrados.filter(curso =>
            curso.nome.toLowerCase().includes(searchValue) ||
            curso.disciplinasNomes.some(d => d.toLowerCase().includes(searchValue))
        );
    }

    renderizarCursos(filtrados);
    exibirFiltrosAtivos();
}

/* ============================
   ABRIR MODAL DE FILTRO
=============================*/
function abrirFiltro() {
    modalList.innerHTML = "";
    modalSearch.value = "";
    modalFiltro.style.display = "block";

    currentList = disciplinasUnicas;

    atualizarListaModal();

    modalSearch.addEventListener("input", atualizarListaModal);

    btnDisciplinas.classList.add("active");
}

/* ============================
   ATUALIZAR LISTA NO MODAL
=============================*/
function atualizarListaModal() {
    modalList.innerHTML = "";
    const filtro = modalSearch.value.trim().toLowerCase();

    const filtradas = disciplinasUnicas.filter(item =>
        item.toLowerCase().includes(filtro)
    );

    if (filtradas.length === 0) {
        modalList.innerHTML = "<li>Nenhum resultado encontrado.</li>";
        return;
    }

    filtradas.forEach(item => {
        const li = document.createElement("li");
        li.textContent = item;

        const isSelected = activeFilters.disciplinas.includes(item);
        if (isSelected) li.classList.add("selected");

        li.addEventListener("click", () => {
            if (isSelected) {
                activeFilters.disciplinas =
                    activeFilters.disciplinas.filter(i => i !== item);
            } else {
                activeFilters.disciplinas.push(item);
            }

            aplicarFiltros();
            atualizarListaModal();
            modalFiltro.style.display = "none";
        });

        modalList.appendChild(li);
    });
}

/* ============================
   FECHAR MODAL
=============================*/
function closeFiltro() {
    modalFiltro.style.display = "none";
    btnDisciplinas.classList.remove("active");
}

/* ============================
   EXIBIR FILTROS ATIVOS
=============================*/
function exibirFiltrosAtivos() {
    activeFiltersDiv.innerHTML = "";

    const filtros = [...activeFilters.disciplinas];

    if (filtros.length === 0) {
        activeFiltersDiv.style.display = "none";
        return;
    }

    activeFiltersDiv.style.display = "flex";

    filtros.forEach(f => {
        const tag = document.createElement("div");
        tag.className = "filter-tag";
        tag.innerHTML = `${f} <span class="remove-tag">✕</span>`;

        tag.querySelector(".remove-tag").addEventListener("click", () => {
            activeFilters.disciplinas =
                activeFilters.disciplinas.filter(v => v !== f);
            aplicarFiltros();
        });

        activeFiltersDiv.appendChild(tag);
    });
}

// BOTÃO PARA ABRIR FILTRO
btnDisciplinas.addEventListener("click", abrirFiltro);

// Campo de busca geral
searchInput.addEventListener("input", aplicarFiltros);


/* ============================
   7. GERENCIADOR DE CLIQUES
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


// -----------------------------------------
// FUNÇÃO PARA IR PARA A PÁGINA DE HORÁRIO
// -----------------------------------------
function irParaHorario(event) {
    event.preventDefault();

    // Recupera o ID salvo no localStorage
    const cursoId = localStorage.getItem("cursoSelecionado");

    if (!cursoId) {
        showPopup(`Você ainda não selecionou um curso!<br>Vá até a página de grades e escolha um.`, "erro");
        return;
    }

    // Redireciona para a página de horário com ID na URL
    window.location.href = `/html/user/quadroHorario.html?id=${cursoId}`;
}

if (btnHorario) {
    btnHorario.addEventListener("click", irParaHorario);
}


// Inicialização
carregarCursos();
