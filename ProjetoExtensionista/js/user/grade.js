const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
}


const btnHorario = document.getElementById('btnHorario');
const modalHorario = document.getElementById('modal');
const overlayHorario = document.getElementById('overlay');
const closeModalHorario = document.getElementById('closeModal');

function openHorario() {
  modalHorario.style.display = 'block';
  overlayHorario.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeHorario() {
  modalHorario.style.display = 'none';
  overlayHorario.style.display = 'none';
  document.body.style.overflow = '';
}

if (btnHorario) btnHorario.addEventListener('click', (e) => { e.preventDefault(); openHorario(); });
if (closeModalHorario) closeModalHorario.addEventListener('click', closeHorario);
if (overlayHorario) overlayHorario.addEventListener('click', (e) => { if (e.target === overlayHorario) closeHorario(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeHorario(); });


const btnDisciplinas = document.getElementById('btnDisciplinas');
const btnProfessores = document.getElementById('btnProfessores');
const modalFiltro = document.getElementById('modalGrade');
const modalList = document.getElementById('modalListGrade');
const modalSearch = document.getElementById('modalSearch');

const disciplinas = [
  'Matemática Aplicada',
  'Física Geral',
  'Introdução à Programação',
  'Gestão de Pessoas'
];

const professores = [
  'Maria Silva',
  'João Santos',
  'Carla Ribeiro',
  'Pedro Henrique'
];

let currentList = [];

function openFiltro(list) {
  currentList = list;
  renderList(list);
  modalFiltro.style.display = 'block';
  modalSearch.value = '';
  modalSearch.focus();
  document.body.style.overflow = 'hidden';
}

function renderList(list) {
  modalList.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.onclick = () => {
      alert('Selecionado: ' + item);
      closeFiltro();
    };
    modalList.appendChild(li);
  });
}

function closeFiltro() {
  modalFiltro.style.display = 'none';
  document.body.style.overflow = '';
}

if (btnDisciplinas) btnDisciplinas.addEventListener('click', () => openFiltro(disciplinas));
if (btnProfessores) btnProfessores.addEventListener('click', () => openFiltro(professores));

if (modalSearch) {
  modalSearch.addEventListener('input', () => {
    const filtered = currentList.filter(item =>
      item.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderList(filtered);
  });
}

window.addEventListener('click', (e) => {
  if (e.target === modalFiltro) closeFiltro();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeFiltro();
});


const activeFiltersDiv = document.getElementById('activeFilters');
const profList = document.getElementById('prof-list');

let activeFilters = {
  disciplinas: [],
  professores: []
};

function openFiltro(list, type) {
  currentList = list;
  renderList(list, type);
  modalFiltro.style.display = 'block';
  modalSearch.value = '';
  modalSearch.focus();
  modalFiltro.dataset.type = type;
}

function renderList(list, type) {
  modalList.innerHTML = '';
  list.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    li.onclick = () => {
      addFilter(item, type);
      modalFiltro.style.display = 'none';
      filterCourses();
    };
    modalList.appendChild(li);
  });
}

function addFilter(item, type) {
  if (!activeFilters[type].includes(item)) {
    activeFilters[type].push(item);
    const tag = document.createElement('span');
    tag.classList.add('filter-tag');
    tag.textContent = item + ' ✕';
    tag.onclick = () => {
      removeFilter(item, type);
    };
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
  const items = profList.querySelectorAll('li');
  items.forEach(li => {
    let show = true;

    if (activeFilters.disciplinas.length > 0) {
      const liDisciplinas = li.dataset.disciplinas.split(',');
      show = activeFilters.disciplinas.every(f => liDisciplinas.includes(f));
    }

    if (show && activeFilters.professores.length > 0) {
      const liProfessores = li.dataset.professores.split(',');
      show = activeFilters.professores.every(f => liProfessores.includes(f));
    }

    li.style.display = show ? 'block' : 'none';
  });
}

btnDisciplinas.addEventListener('click', () => openFiltro(disciplinas, 'disciplinas'));
btnProfessores.addEventListener('click', () => openFiltro(professores, 'professores'));

modalSearch.addEventListener('input', () => {
  const type = modalFiltro.dataset.type;
  const filtered = currentList.filter(item => item.toLowerCase().includes(modalSearch.value.toLowerCase()));
  renderList(filtered, type);
});

window.addEventListener('click', (e) => {
  if (e.target == modalFiltro) modalFiltro.style.display = 'none';
});
