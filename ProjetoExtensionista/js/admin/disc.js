const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

const btnCursos = document.getElementById('btnDisciplinas');
const btnProfessores = document.getElementById('btnProfessores');

const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');

const discList = document.getElementById('disc-list');
const activeFiltersDiv = document.getElementById('activeFilters');

const cursos = [
    'Engenharia de Software',
    'Ciência da Computação',
    'Biotecnologia',
    'Ciências Contábeis',
    'Design Gráfico',
    'Psicologia',
    'Medicina'
];

const professores = [
    'Pedro Henrique',
    'Giovanna Bonfim',
    'Marcos',
    'Ana Cecilia',
    'Fernando H.',
    'Tiago G.',
    'Lorena M.'
];

let activeFilters = { cursos: [], professores: [] };
let currentList = [];

function openFiltro(list, type) {
    currentList = list;
    renderList(list, type);
    modalFiltro.style.display = 'block';
    modalSearch.value = '';
    modalFiltro.dataset.type = type;
    modalSearch.focus();
}

function renderList(list, type) {
    modalList.innerHTML = '';
    list.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.onclick = () => {
            addFilter(item, type);
            closeFiltro();
            filterDisciplinas();
        };
        modalList.appendChild(li);
    });
}

function closeFiltro() {
    modalFiltro.style.display = 'none';
}

function addFilter(item, type) {
    if (!activeFilters[type].includes(item)) {
        activeFilters[type].push(item);
        const tag = document.createElement('span');
        tag.classList.add('filter-tag');
        tag.textContent = item + ' ✕';
        tag.onclick = () => removeFilter(item, type);
        activeFiltersDiv.appendChild(tag);
    }
}

function removeFilter(item, type) {
    activeFilters[type] = activeFilters[type].filter(f => f !== item);
    [...activeFiltersDiv.children].forEach(tag => {
        if (tag.textContent.startsWith(item)) tag.remove();
    });
    filterDisciplinas();
}

function filterDisciplinas() {
    const items = discList.querySelectorAll('li');

    items.forEach(li => {

        const itemProfessor = li.dataset.professor || '';
        const itemCursos = (li.dataset.cursos || '').split(',').map(c => c.trim());

        let show = true;

        if (activeFilters.cursos.length > 0) {
            show = activeFilters.cursos.every(cursoFilter => itemCursos.includes(cursoFilter));
        }

        if (!show) {
            li.style.display = 'none';
            return;
        }

        if (activeFilters.professores.length > 0) {
            show = activeFilters.professores.some(profFilter => itemProfessor.includes(profFilter));
        }

        li.style.display = show ? 'flex' : 'none';
    });
}

btnCursos.addEventListener('click', () => openFiltro(cursos, 'cursos'));
btnProfessores.addEventListener('click', () => openFiltro(professores, 'professores'));

modalSearch.addEventListener('input', () => {
    const type = modalFiltro.dataset.type;
    const filtered = currentList.filter(item =>
        item.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderList(filtered, type);
});

window.addEventListener('click', (e) => {
    if (e.target == modalFiltro) closeFiltro();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFiltro();
});

const confirmModal = document.getElementById('confirmModal');
const confirmText = document.getElementById('confirmText');
const confirmYes = document.getElementById('confirmYes');
const confirmNo = document.getElementById('confirmNo');

let discSelecionada = null;

discList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const li = e.target.closest('li');
        discSelecionada = li;

        const discNameElement = li.querySelector('.course-name');
        let nomeDisciplina = 'esta disciplina';
        if (discNameElement) {
            nomeDisciplina = discNameElement.textContent.trim();
        }

        confirmText.textContent = `Tem certeza que deseja excluir a disciplina “${nomeDisciplina}”?`;

        confirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (e.target.classList.contains('edit-btn')) {
        const li = e.target.closest('li');
        const discNameElement = li.querySelector('.course-name');
        let nomeDisciplina = '';
        if (discNameElement) {
            nomeDisciplina = discNameElement.textContent.trim();
        }
        window.location.href = `/html/admin/editDisc.html?nome=${encodeURIComponent(nomeDisciplina)}`;
    }
});

confirmYes.addEventListener('click', () => {
    if (discSelecionada) {
        discSelecionada.remove();
        discSelecionada = null;
    }
    confirmModal.style.display = 'none';
    document.body.style.overflow = '';
});

confirmNo.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    document.body.style.overflow = '';
});