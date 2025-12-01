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


// ===============================
// FECHAR SELECT CUSTOM AO CLICAR FORA
// ===============================
document.addEventListener("click", (event) => {
    const select = document.querySelector(".select-custom");
    const options = document.querySelector(".select-custom .select-options");

    if (!select) return;

    // Se clicou no trigger → alterna o menu normalmente
    if (event.target.closest(".select-trigger")) {
        return; 
    }

    // Se clicou fora do select → fecha
    if (!event.target.closest(".select-custom")) {
        options.style.display = "none";
    }
});

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
// filtrar opções com o input #searchDisciplina
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchDisciplina");
  const optionsSelector = "#disciplinaSelect .select-options .option-item";

  if (!searchInput) return; // nada a fazer se o input não existir

  searchInput.addEventListener("input", () => {
    const filter = searchInput.value.trim().toLowerCase();
    const items = document.querySelectorAll(optionsSelector);

    // se não houver itens ainda, não faz nada
    if (!items || items.length === 0) return;

    items.forEach(item => {
      const text = (item.textContent || "").toLowerCase();
      // usa '' para mostrar (herdar display default) ou 'none' para esconder
      item.style.display = text.includes(filter) ? "" : "none";
    });

    // opcional: se desejar que o dropdown abra automaticamente ao digitar:
    const optionsBox = document.querySelector("#disciplinaSelect .select-options");
    if (optionsBox && filter.length > 0) {
      optionsBox.style.display = "block";
    }
  });
});


function preencherSelectCustom(disciplinas) {
    const trigger = document.querySelector(".select-custom .select-trigger");
    const optionsBox = document.querySelector(".select-custom .select-options");

    optionsBox.innerHTML = "";

    disciplinas.forEach(d => {
        const item = document.createElement("div");
        item.textContent = d.nome;
        item.dataset.value = d.id;

        item.addEventListener("click", () => {
            trigger.textContent = d.nome;
            trigger.dataset.value = d.id;
            optionsBox.style.display = "none";
        });

        optionsBox.appendChild(item);
    });

    trigger.addEventListener("click", () => {
        optionsBox.style.display =
            optionsBox.style.display === "block" ? "none" : "block";
    });
}

/* ============================
   3. FUNÇÕES DE NAVEGAÇÃO
=============================*/
function editarCurso(id) {
    window.location.href = `/html/admin/editCurso.html?id=${id}`;
}

function abrirQuadroHorario(idCurso) {
    window.location.href = `/html/admin/quadroHorario.html?id=${idCurso}`;
}

/* ============================
   4. EXCLUSÃO DE CURSO
=============================*/
function abrirModalExcluir(id, nome) {
    cursoSelecionadoExclusao = id;
    confirmText.textContent = `Tem certeza que deseja excluir o curso “${nome}”?`;
    confirmModal.style.display = "flex";
}

confirmYes.addEventListener("click", async () => {
    if (!cursoSelecionadoExclusao) return;
    try {
        const response = await fetch(`${API_URL}/${cursoSelecionadoExclusao}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Falha ao excluir");
        
        confirmModal.style.display = "none";
        carregarCursos();
    } catch (error) {
        alert("Erro ao excluir o curso.");
    }
});

confirmNo.addEventListener("click", () => {
    confirmModal.style.display = "none";
});

/* ============================
   5. MODAL DE VÍNCULO (NOVO)
=============================*/

// Referências do select custom
const selectWrapper = document.getElementById("disciplinaSelect");
const trigger = selectWrapper.querySelector(".select-trigger");
const optionsBox = selectWrapper.querySelector(".select-options");

let disciplinaSelecionada = null;

// Abrir Modal
async function abrirModalVincular(idCurso, nomeCurso) {
    cursoEmEdicaoVinculo = idCurso;
    tituloVincular.textContent = `Disciplinas de: ${nomeCurso}`;
    modalVincular.style.display = "block";

    // Reset visual do select custom
    trigger.textContent = "Carregando...";
    trigger.dataset.value = "";
    optionsBox.innerHTML = "<div>Carregando...</div>";
    disciplinaSelecionada = null;

    // Reset lista
    listaVinculadas.innerHTML = "<li>Carregando...</li>";
    btnAdicionarVinculo.disabled = true;

    await carregarDadosDoModalVinculo(idCurso);
}

// Carregar dados e preencher listas
async function carregarDadosDoModalVinculo(idCurso) {
    try {
        // 1. Pega TODAS as disciplinas
        const resTodas = await fetch(API_DISCIPLINA);
        const todasDisciplinas = await resTodas.json();

        // 2. Pega disciplinas vinculadas
        const resVinc = await fetch(`${API_CURSO_DISCIPLINA}/${idCurso}`);
        let vinculadas = resVinc.ok ? await resVinc.json() : [];

        // 3. Renderiza vinculadas
        listaVinculadas.innerHTML = "";
        const idsVinculados = new Set();

        if (vinculadas.length === 0) {
            listaVinculadas.innerHTML = `<li style="color:#777;">Nenhuma disciplina vinculada.</li>`;
        } else {
            vinculadas.forEach(disc => {
                idsVinculados.add(disc.id_disciplina);

                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${disc.nome}</span>
                    <button class="btn-remove-vinculo" onclick="removerDisciplina(${idCurso}, ${disc.id_disciplina})">✕</button>
                `;
                listaVinculadas.appendChild(li);
            });
        }

        // 4. Preencher SELECT CUSTOM (somente disciplinas NÃO vinculadas)
        optionsBox.innerHTML = "";
        trigger.textContent = "Selecione uma disciplina...";
        trigger.dataset.value = "";
        disciplinaSelecionada = null;

        const disponiveis = todasDisciplinas.filter(d => !idsVinculados.has(d.id_disciplina));

        if (disponiveis.length === 0) {
            optionsBox.innerHTML = `<div style="padding:8px; color:#777;">Nenhuma disponível.</div>`;
        } else {
            disponiveis.forEach(d => {
                const item = document.createElement("div");
                item.classList.add("option-item");
                item.textContent = d.nome;
                item.dataset.value = d.id_disciplina;

                item.addEventListener("click", () => {
                    trigger.textContent = d.nome;
                    trigger.dataset.value = d.id_disciplina;
                    disciplinaSelecionada = d.id_disciplina;
                    optionsBox.style.display = "none";
                    btnAdicionarVinculo.disabled = false;
                });

                optionsBox.appendChild(item);
            });
        }

        // Abre/fecha o dropdown
        trigger.onclick = () => {
            optionsBox.style.display = 
                optionsBox.style.display === "block" ? "none" : "block";
        };

    } catch (err) {
        console.error("Erro no modal de vínculo:", err);
        listaVinculadas.innerHTML = "<li>Erro ao carregar dados.</li>";
    }
}

// Adicionar disciplina
btnAdicionarVinculo.addEventListener("click", async () => {
    if (!disciplinaSelecionada || !cursoEmEdicaoVinculo) return;

    try {
        const res = await fetch(API_CURSO_DISCIPLINA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                id_curso: cursoEmEdicaoVinculo,
                id_disciplina: disciplinaSelecionada
            })
        });

        if (res.ok) {
            await carregarDadosDoModalVinculo(cursoEmEdicaoVinculo);
        } else {
            alert("Erro ao vincular disciplina.");
        }
    } catch (err) {
        console.error(err);
    }
});

// Remover disciplina (HTML chama esta função)
async function removerDisciplina(idCurso, idDisciplina) {
    if (!confirm("Remover esta disciplina do curso?")) return;

    try {
        const res = await fetch(`${API_CURSO_DISCIPLINA}/${idCurso}/${idDisciplina}`, {
            method: "DELETE"
        });

        if (res.ok) {
            await carregarDadosDoModalVinculo(idCurso);
        } else {
            alert("Erro ao remover vínculo.");
        }
    } catch (err) {
        console.error(err);
    }
}

// Fechar modal
closeVincular.addEventListener("click", () => {
    modalVincular.style.display = "none";
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

