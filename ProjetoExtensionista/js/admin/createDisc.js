const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('active');
        menuBtn.classList.toggle('active');
    });
}


document.addEventListener('DOMContentLoaded', function () {
    const btnCadastrar = document.getElementById('btnCadastrar');
    const inputNome = document.getElementById('nome');
    const inputTipo = document.getElementById('tipo');

    if (btnCadastrar && inputNome && inputTipo) {
        btnCadastrar.addEventListener('click', function (event) {
            const nomeValue = inputNome.value.trim();
            const tipoValue = inputTipo.value.trim();

            if (nomeValue === "") {
                alert("Por favor, preencha o campo Nome.");
                inputNome.focus();
            }

            if (tipoValue === "") {
                alert("Por favor, preencha o tipo.");
                inputTipo.focus();
                return;
            }

            alert("Disciplina cadastrada com sucesso!");

            window.location.href = '/html/admin/disciplina.html';
        });
    }

    const menuBtn = document.getElementById('menu-btn');
    const sidebar = document.getElementById('sidebar');

    if (menuBtn && sidebar) {
        menuBtn.addEventListener('click', function () {
            sidebar.classList.toggle('active');
        });
    }

});

const btnAbrirModalCurso = document.getElementById('btnAbrirModalCurso');
const btnCadastrar = document.getElementById('btnCadastrar');
const inputNome = document.getElementById('nome');
const selectTipo = document.getElementById('tipo');
const cursosAssociadosTags = document.getElementById('cursosAssociadosTags');

const modalFiltro = document.getElementById('modal');
const modalList = document.getElementById('modalList');
const modalSearch = document.getElementById('modalSearch');

const cursosDisponiveis = [
    'Engenharia de Software',
    'Ciência da Computação',
    'Biotecnologia',
    'Ciências Contábeis',
    'Design Gráfico',
    'Psicologia',
    'Engenharia Civil',
    'Medicina'
];

let cursosSelecionados = [];
let currentList = [];

function openFiltro(list) {
    currentList = list;
    renderList(list);
    modalFiltro.style.display = 'flex';
    modalSearch.value = '';
    modalSearch.focus();
}

function renderList(list) {
    modalList.innerHTML = '';
    list.forEach(item => {
        if (cursosSelecionados.includes(item)) return;

        const li = document.createElement('li');
        li.textContent = item;
        li.onclick = () => {
            addCurso(item);
            closeFiltro();
        };
        modalList.appendChild(li);
    });
}

function closeFiltro() {
    modalFiltro.style.display = 'none';
}

function addCurso(item) {
    if (!cursosSelecionados.includes(item)) {
        cursosSelecionados.push(item);

        const tag = document.createElement('span');
        tag.classList.add('filter-tag');
        tag.textContent = item + ' ✕';

        tag.onclick = () => removeCurso(item, tag);

        cursosAssociadosTags.appendChild(tag);
        updateButtonStatus();
    }
}

function removeCurso(item, tagElement) {
    cursosSelecionados = cursosSelecionados.filter(c => c !== item);
    tagElement.remove();
    updateButtonStatus();
}

function updateButtonStatus() {
    if (cursosSelecionados.length > 0) {
        btnAbrirModalCurso.value = `Cursos Associados (${cursosSelecionados.length}) 🟢`;
    } else {
        btnAbrirModalCurso.value = "Cursos Associados ⚪";
    }
}


btnAbrirModalCurso.addEventListener('click', () => openFiltro(cursosDisponiveis));

modalSearch.addEventListener('input', () => {
    const filtered = cursosDisponiveis.filter(item =>
        item.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderList(filtered);
});

window.addEventListener('click', (e) => {
    if (e.target == modalFiltro) closeFiltro();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeFiltro();
});

btnCadastrar.addEventListener('click', () => {
    const nomeDisciplina = inputNome.value.trim();
    const tipoDisciplina = selectTipo.value;

    if (nomeDisciplina === "") {
        alert("Por favor, preencha o nome da disciplina.");
        return;
    }

    if (cursosSelecionados.length === 0) {
        alert("Selecione pelo menos um Curso Associado.");
        return;
    }

    const novaDisciplina = {
        nome: nomeDisciplina,
        tipo: tipoDisciplina === '1' ? 'Obrigatoria' : 'Optativa',
        cursos: cursosSelecionados
    };

    console.log("Nova Disciplina Cadastrada:", novaDisciplina);
    alert(`Disciplina "${nomeDisciplina}" cadastrada com sucesso nos cursos: ${cursosSelecionados.join(', ')}.`);

    inputNome.value = '';
    selectTipo.value = '1';
    cursosSelecionados = [];
    cursosAssociadosTags.innerHTML = '';
    updateButtonStatus();
});

updateButtonStatus();