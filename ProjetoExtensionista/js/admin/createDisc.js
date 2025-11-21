//------------------------------------
// API NECESSÁRIAS
//------------------------------------
const API_DISCIPLINA = "https://study-hub-7qc5.onrender.com/disciplina";
const API_SALA = "https://study-hub-7qc5.onrender.com/sala";
const API_CURSO = "https://study-hub-7qc5.onrender.com/curso";
const API_PERIODO = "https://study-hub-7qc5.onrender.com/periodo";
const API_TURNO = "https://study-hub-7qc5.onrender.com/turno";

//------------------------------------
// ELEMENTOS DO DOM
//------------------------------------
const btnMenu = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");

const inputNome = document.getElementById("nome");
const selectTipo = document.getElementById("tipo");
const selectPeriodo = document.getElementById("periodo");
const selectTurno = document.getElementById("turno");
const selectSala = document.getElementById("sala");

const btnAbrirModalCurso = document.getElementById("btnAbrirModalCurso");
const modal = document.getElementById("modal");
const modalList = document.getElementById("modalList");
const modalSearch = document.getElementById("modalSearch");
const cursosTags = document.getElementById("cursosAssociadosTags");

const btnCadastrar = document.getElementById("btnCadastrar");

let cursos = [];
let cursosSelecionados = [];

//------------------------------------
// MENU LATERAL
//------------------------------------
btnMenu.addEventListener("click", () => {
    sidebar.classList.toggle("active");
});

//------------------------------------
// CARREGAR SELECTS BASICOS
//------------------------------------
async function carregarSelects() {
    const [periodos, turnos, salas, cursosBD] = await Promise.all([
        fetch(API_PERIODO).then(r => r.json()),
        fetch(API_TURNO).then(r => r.json()),
        fetch(API_SALA).then(r => r.json()),
        fetch(API_CURSO).then(r => r.json())
    ]);

    cursos = cursosBD;

    preencherSelect(selectPeriodo, periodos, "id_periodo", "numero");
    preencherSelect(selectTurno, turnos, "id_turno", "turno");
    preencherSelect(selectSala, salas, "id_sala", "nome");
}

function preencherSelect(select, lista, id, texto) {
    select.innerHTML = "";
    lista.forEach(item => {
        const op = document.createElement("option");
        op.value = item[id];
        op.textContent = item[texto];
        select.appendChild(op);
    });
}

carregarSelects();

//------------------------------------
// MODAL DOS CURSOS
//------------------------------------
btnAbrirModalCurso.addEventListener("click", () => {
    modal.style.display = "flex";
    renderList(cursos);
    modalSearch.value = "";
    modalSearch.focus();
});

modalSearch.addEventListener("input", () => {
    const filtrado = cursos.filter(c =>
        c.nome.toLowerCase().includes(modalSearch.value.toLowerCase())
    );
    renderList(filtrado);
});

window.addEventListener("click", e => {
    if (e.target === modal) modal.style.display = "none";
});

function renderList(lista) {
    modalList.innerHTML = "";
    lista.forEach(curso => {
        if (cursosSelecionados.includes(curso.id_curso)) return;

        const li = document.createElement("li");
        li.textContent = curso.nome;
        li.onclick = () => addCurso(curso);
        modalList.appendChild(li);
    });
}

function addCurso(curso) {
    cursosSelecionados.push(curso.id_curso);

    const tag = document.createElement("span");
    tag.classList.add("filter-tag");
    tag.textContent = curso.nome + " ✕";
    tag.onclick = () => removerCurso(curso.id_curso, tag);

    cursosTags.appendChild(tag);
    atualizarBotao();
    modal.style.display = "none";
}

function removerCurso(id, elemento) {
    cursosSelecionados = cursosSelecionados.filter(c => c !== id);
    elemento.remove();
    atualizarBotao();
}

function atualizarBotao() {
    btnAbrirModalCurso.value =
        cursosSelecionados.length > 0
            ? `Cursos Associados (${cursosSelecionados.length}) 🟢`
            : "Cursos Associados ⚪";
}

//------------------------------------
// CADASTRAR DISCIPLINA
//------------------------------------
btnCadastrar.addEventListener("click", async () => {

    if (!inputNome.value.trim()) return alert("Digite o nome da disciplina!");
    if (cursosSelecionados.length === 0) return alert("Selecione pelo menos 1 curso!");

    const dados = {
        nome: inputNome.value.trim(),
        tipo: selectTipo.value,
        fk_id_periodo: parseInt(selectPeriodo.value),
        fk_id_turno: parseInt(selectTurno.value),
        fk_id_sala: parseInt(selectSala.value),
        cursos: cursosSelecionados
    };

    try {
        const response = await fetch(API_DISCIPLINA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        if (!response.ok) throw new Error("Erro ao cadastrar disciplina");

        alert("Disciplina cadastrada com sucesso!");
        window.location.href = "/html/admin/disciplina.html";

    } catch (err) {
        console.error(err);
        alert("Erro ao cadastrar disciplina.");
    }
});
