const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

const btnProfessor = document.getElementById('btnCurso');
const btnDisciplinas = document.getElementById('btnDisciplinas');

const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');

const cursosList = document.getElementById('curso-list');
const activeFiltersDiv = document.getElementById('activeFilters');

const professores = [
    'Pedro Henrique',
    'Giovanna Bonfim',
    'Marcos',
    'Ana Cecilia',
    'Fernando H.',
    'Tiago G.',
    'Lorena M.'
];

const disciplinas = [
    'Matemática Aplicada',
    'Física Geral',
    'Introdução à Programação',
    'Gestão de Pessoas'
];

let activeFilters = { professores: [], disciplinas: [] };
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
            filterCourses();
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
    filterCourses();
}

function filterCourses() {
    const items = cursosList.querySelectorAll('li');

    items.forEach(li => {
        const courseNameElement = li.querySelector('.course-name');

        if (!courseNameElement) {
            li.style.display = 'none';
            return;
        }

        const itemProfessor = li.dataset.professor || '';
        const itemDisciplinas = (li.dataset.disciplinas || '').split(',').map(d => d.trim());

        let show = true;

        if (activeFilters.professores.length > 0) {
            show = activeFilters.professores.some(profFilter => itemProfessor.includes(profFilter));
        }

        if (!show) {
            li.style.display = 'none';
            return;
        }

        if (activeFilters.disciplinas.length > 0) {
            show = activeFilters.disciplinas.every(discFilter => itemDisciplinas.includes(discFilter));
        }

        li.style.display = show ? 'flex' : 'none';
    });
}

btnProfessor.addEventListener('click', () => openFiltro(professores, 'professores'));
btnDisciplinas.addEventListener('click', () => openFiltro(disciplinas, 'disciplinas'));

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

let cursoSelecionado = null;

cursosList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const li = e.target.closest('li');
        cursoSelecionado = li;

        const courseNameElement = li.querySelector('.course-name');
        let nomeCurso = 'este curso';
        if (courseNameElement) {
            nomeCurso = courseNameElement.textContent.trim();
        }

        confirmText.textContent = `Tem certeza que deseja excluir o curso “${nomeCurso}”?`;

        confirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (e.target.classList.contains('edit-btn')) {
        const li = e.target.closest('li');
        const courseNameElement = li.querySelector('.course-name');
        let nomeCurso = '';
        if (courseNameElement) {
            nomeCurso = courseNameElement.textContent.trim();
        }
        window.location.href = `/html/admin/editCurso.html?nome=${encodeURIComponent(nomeCurso)}`;
    }
});

confirmYes.addEventListener('click', () => {
    if (cursoSelecionado) {
        cursoSelecionado.remove();
        cursoSelecionado = null;
    }
    confirmModal.style.display = 'none';
    document.body.style.overflow = '';
});

confirmNo.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    document.body.style.overflow = '';
});