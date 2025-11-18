
// --- CONFIGURAÇÕES DA API ---
const API_URL = 'https://study-hub-0y3p.onrender.com'; // COLOQUE AQUI O ENDEREÇO DA SUA API

// --- SELETORES DO DOM ---
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const discList = document.getElementById('disc-list');
const modalSearch = document.getElementById('modalSearch');

// Filtros
const btnCursos = document.getElementById('btnDisciplinas');
const btnProfessores = document.getElementById('btnProfessores');
const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const activeFiltersDiv = document.getElementById('activeFilters');

// Modal de Exclusão
const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

// --- ESTADO DA APLICAÇÃO ---
let disciplinasData = []; // Armazena os dados vindos da API
let activeFilters = { cursos: [], professores: [] };
let currentFilterList = []; // Lista atual exibida no modal de filtro
let idParaExcluir = null;   // ID da disciplina selecionada para exclusão
let elementoParaExcluir = null; // Elemento DOM selecionado

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    setupSidebar();
    fetchDisciplinas(); // Carrega os dados ao abrir a página
});

// --- FUNÇÕES DE API (FETCH & DELETE) ---

async function fetchDisciplinas() {
    try {
        // Faz a requisição para a API
        const response = await fetch(API_URL); 
        if (!response.ok) throw new Error('Erro ao buscar disciplinas');
        
        const data = await response.json();
        disciplinasData = data;

        // Renderiza a lista na tela
        renderDisciplinas(disciplinasData);
        
    } catch (error) {
        console.error('Erro:', error);
        discList.innerHTML = '<p style="color:red; padding:20px;">Erro ao carregar disciplinas.</p>';
    }
}

async function deleteDisciplinaAPI(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Erro ao excluir');
        
        // Se deu certo, remove do DOM e do array local
        if (elementoParaExcluir) {
            elementoParaExcluir.remove();
        }
        disciplinasData = disciplinasData.filter(d => d.id !== id);
        closeConfirmModal();

    } catch (error) {
        alert('Erro ao excluir disciplina no servidor.');
        console.error(error);
    }
}

// --- RENDERIZAÇÃO NA TELA ---

function renderDisciplinas(lista) {
    discList.innerHTML = '';

    if (lista.length === 0) {
        discList.innerHTML = '<p style="padding:20px;">Nenhuma disciplina encontrada.</p>';
        return;
    }

    lista.forEach(disc => {
        // Cria o elemento LI
        const li = document.createElement('li');
        
        // Assume que a API retorna: { id, nome, professor, cursos: [] ou string }
        const cursosString = Array.isArray(disc.cursos) ? disc.cursos.join(', ') : disc.cursos;
        
        li.dataset.id = disc.id; 
        li.dataset.professor = disc.professor;
        li.dataset.cursos = cursosString;

        li.innerHTML = `
            <span class="course-name">${disc.nome}</span>
            <div class="actions">
                <button class="edit-btn">✏️ Editar</button>
                <button class="delete-btn">🗑️ Excluir</button>
            </div>
        `;
        
        discList.appendChild(li);
    });
}

// --- LÓGICA DE SIDEBAR ---
function setupSidebar() {
    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            menuBtn.classList.toggle('active');
        });
    }
}

// --- LÓGICA DE EDIÇÃO E EXCLUSÃO (EVENT DELEGATION) ---

discList.addEventListener('click', (e) => {
    const target = e.target;
    const li = target.closest('li');

    if (!li) return;

    const id = li.dataset.id;
    const nome = li.querySelector('.course-name').textContent;

    // Botão Excluir
    if (target.classList.contains('delete-btn')) {
        idParaExcluir = id;
        elementoParaExcluir = li;
        confirmText.textContent = `Tem certeza que deseja excluir a disciplina "${nome}"?`;
        confirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    // Botão Editar
    if (target.classList.contains('edit-btn')) {
        // Redireciona passando o ID na URL
        window.location.href = `/html/admin/editDisc.html?id=${id}`;
    }
});

// --- MODAL DE CONFIRMAÇÃO ---

confirmYes.addEventListener('click', () => {
    if (idParaExcluir) {
        deleteDisciplinaAPI(idParaExcluir);
    }
});

confirmNo.addEventListener('click', closeConfirmModal);

function closeConfirmModal() {
    confirmModal.style.display = 'none';
    document.body.style.overflow = '';
    idParaExcluir = null;
    elementoParaExcluir = null;
}

// --- LÓGICA DE FILTROS (DINÂMICA) ---

// Extrai listas únicas dos dados carregados para preencher os filtros
function getUniqueList(key) {
    if (!disciplinasData.length) return [];
    
    const allItems = new Set();
    disciplinasData.forEach(disc => {
        if (key === 'cursos') {
            // Trata se vier como array ou string
            const cursos = Array.isArray(disc.cursos) ? disc.cursos : disc.cursos.split(',');
            cursos.forEach(c => allItems.add(c.trim()));
        } else if (key === 'professor') {
            allItems.add(disc.professor);
        }
    });
    return Array.from(allItems).sort();
}

function openFiltro(type) {
    // Determina qual lista usar baseada nos dados atuais
    const dataKey = type === 'cursos' ? 'cursos' : 'professor';
    currentFilterList = getUniqueList(dataKey);
    
    renderFilterList(currentFilterList, type);
    
    modalFiltro.style.display = 'block';
    modalFiltro.dataset.type = type;
    modalSearch.value = '';
    modalSearch.focus();
}

function renderFilterList(list, type) {
    modalList.innerHTML = '';
    list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.onclick = () => {
            addFilter(item, type);
            closeFiltro();
            applyFilters();
        };
        modalList.appendChild(li);
    });
}

function closeFiltro() {
    modalFiltro.style.display = 'none';
}

// Event Listeners dos Botões de Filtro
btnCursos.addEventListener('click', () => openFiltro('cursos'));
btnProfessores.addEventListener('click', () => openFiltro('professores'));

// Fechar modal ao clicar fora
window.addEventListener('click', (e) => {
    if (e.target == modalFiltro) closeFiltro();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFiltro();
});

// Pesquisa dentro do Modal
modalSearch.addEventListener('input', () => {
    const type = modalFiltro.dataset.type;
    const filtered = currentFilterList.filter(item =>
        item.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderFilterList(filtered, type);
});

// --- APLICAÇÃO DOS FILTROS ---

function addFilter(item, type) {
    if (!activeFilters[type].includes(item)) {
        activeFilters[type].push(item);
        createFilterTag(item, type);
    }
}

function createFilterTag(item, type) {
    const tag = document.createElement('span');
    tag.classList.add('filter-tag');
    tag.textContent = item + ' ✕';
    tag.onclick = () => removeFilter(item, type);
    activeFiltersDiv.appendChild(tag);
}

function removeFilter(item, type) {
    activeFilters[type] = activeFilters[type].filter(f => f !== item);
    // Remove visualmente a tag correta
    const tags = Array.from(activeFiltersDiv.children);
    tags.forEach(tag => {
        if (tag.textContent === item + ' ✕') tag.remove();
    });
    applyFilters();
}

function applyFilters() {
    const items = discList.querySelectorAll('li');
    const searchVal = document.getElementById('searchInput').value.toLowerCase();

    items.forEach(li => {
        const itemProfessor = li.dataset.professor || '';
        const itemCursos = (li.dataset.cursos || '').split(',').map(c => c.trim());
        const itemNome = li.querySelector('.course-name').textContent.toLowerCase();

        let show = true;

        // Filtro de Texto (Barra de Pesquisa Principal)
        if (searchVal && !itemNome.includes(searchVal)) {
            show = false;
        }

        // Filtro de Cursos
        if (show && activeFilters.cursos.length > 0) {
            // Verifica se a disciplina pertence a TODOS os cursos selecionados (ou ALGUM, dependendo da regra de negócio)
            // Aqui usei "every" (tem que ter todos), mas pode mudar para "some"
            show = activeFilters.cursos.every(cursoFilter => itemCursos.includes(cursoFilter));
        }

        // Filtro de Professores
        if (show && activeFilters.professores.length > 0) {
            show = activeFilters.professores.some(profFilter => itemProfessor.includes(profFilter));
        }

        li.style.display = show ? 'flex' : 'none';
    });
}

// Barra de pesquisa principal
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('searchBtn').addEventListener('click', applyFilters);
