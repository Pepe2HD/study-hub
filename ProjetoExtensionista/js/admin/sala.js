const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}

const btnBlocos = document.getElementById('btnBlocos');

const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');

const salaList = document.getElementById('sala-list');
const activeFiltersDiv = document.getElementById('activeFilters');

const blocos = [
    'Bloco A',
    'Bloco B'
];

let activeFilters = { blocos: [] };
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
            filterSalas();
        };
        modalList.appendChild(li);
    });
}

function closeFiltro() {
    modalFiltro.style.display = 'none';
}

function addFilter(item, type) {
    if (type === 'blocos') {
        activeFilters.blocos.forEach(f => removeFilter(f, 'blocos'));
    }

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
    filterSalas(); // Chama a função de filtro
}

// Filtrar Salas (Ajustado para considerar o filtro de Bloco)
function filterSalas() {
    const items = salaList.querySelectorAll('li');

    items.forEach(li => {
        // Assume-se que a informação do bloco está no atributo data-bloco do <li>.
        const itemBloco = li.dataset.bloco || '';

        let show = true;

        // Lógica do Filtro de Blocos
        if (activeFilters.blocos.length > 0) {
            // A sala deve estar associada a UM dos blocos filtrados
            show = activeFilters.blocos.some(blocoFilter => itemBloco.includes(blocoFilter));
        }

        li.style.display = show ? 'flex' : 'none';
    });
}

// Event Listener para o botão de Bloco
btnBlocos.addEventListener('click', () => openFiltro(blocos, 'blocos'));

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

let salaSelecionada = null;

salaList.addEventListener('click', (e) => {
    if (e.target.classList.contains('delete-btn')) {
        const li = e.target.closest('li');
        salaSelecionada = li;

        const salaNameElement = li.querySelector('.course-name');
        let nomeSala = 'esta sala';
        if (salaNameElement) {
            nomeSala = salaNameElement.textContent.trim();
        }

        confirmText.textContent = `Tem certeza que deseja excluir a sala “${nomeSala}”?`;

        confirmModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    if (e.target.classList.contains('edit-btn')) {
        const li = e.target.closest('li');
        const salaNameElement = li.querySelector('.course-name');
        let nomeSala = '';
        if (salaNameElement) {
            nomeSala = salaNameElement.textContent.trim();
        }
        window.location.href = `/html/admin/editSala.html?nome=${encodeURIComponent(nomeSala)}`;
    }
});

confirmYes.addEventListener('click', () => {
    if (salaSelecionada) {
        salaSelecionada.remove();
        salaSelecionada = null;
    }
    confirmModal.style.display = 'none';
    document.body.style.overflow = '';
});

confirmNo.addEventListener('click', () => {
    confirmModal.style.display = 'none';
    document.body.style.overflow = '';
});