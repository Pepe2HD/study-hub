// quadroHorario.js
// Gerencia somente o quadro de horários de um curso (carregar / editar / salvar / excluir)

// ============================
// MENU LATERAL
// ============================
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");
menuBtn?.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  menuBtn.classList.toggle("active");
});

// ============================
// PEGAR ID DO CURSO NA URL
// ============================
function getCursoIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}
const idCurso = getCursoIdFromURL();
if (!idCurso) {
  alert("Curso não encontrado. Voltando à lista de cursos.");
  window.location.href = "/html/user/horario.html";
}

// ============================
// ENDPOINTS (já fornecidos por você)
// ============================
const BASE = "https://study-hub-2mr9.onrender.com";
const API_CURSO = `${BASE}/curso`;
const API_PERIODO = `${BASE}/periodo`;
const API_DISCIPLINA_CURSO = `${BASE}/curso/disciplina`; // GET /curso/disciplina/{idCurso}
const API_DISCIPLINA_PROF = `${BASE}/disciplina/professor`; // GET /disciplina/professor/{idDisc}
const API_DISCIPLINA = `${BASE}/disciplina`;
const API_PROFESSOR = `${BASE}/professor`;
const API_SALA = `${BASE}/sala`;
const API_HORARIO = `${BASE}/horario`;
const API_CURSO_DISCIPLINA = `${BASE}/curso/disciplina`;

// ============================
// ELEMENTOS DOM
// ============================
const tituloCursoEl = document.getElementById("tituloCurso");
const selectPeriodo = document.getElementById("periodo");
const btnHorario = document.getElementById("btnHorario");
const modalHorario = document.getElementById("modalHorario");
const overlay = document.getElementById("overlay");
const closeModalHorario = document.getElementById("closeModal");
const tabela = document.getElementById("tabelaHorario");

// modal de seleção
const modalSelecao = document.getElementById("modalSelecao");
const overlaySelecao = document.getElementById("overlaySelecao");
const closeSelecao = document.getElementById("closeSelecao");
const inputBuscaDisciplina = document.getElementById("buscaDisciplina");
const listaDisciplinas = document.getElementById("listaDisciplinas");
const inputBuscaProfessor = document.getElementById("buscaProfessor");
const listaProfessores = document.getElementById("listaProfessores");
const inputBuscaSala = document.getElementById("buscaSala");
const listaSalas = document.getElementById("listaSalas");
const btnAdicionarHorario = document.getElementById("btnAdicionarHorario");

// container para botão salvar (criado dinamicamente se não existir)
const quadroContainer = document.getElementById("quadroContainer");

// ============================
// ESTADO LOCAL
// ============================
let disciplinaSelecionada = null;
let professorSelecionado = null;
let salaSelecionada = null;
let celulaAtual = null;
let horarioAtual = "";
let diaAtual = "";
let trAtual = null;

// Horários em memória: origem -> carregados do backend (horariosExistentes) e a lista "atual" que o usuário edita (horariosSelecionados)
let horariosExistentes = []; // itens vindos do backend (possuem id_horario)
let horariosSelecionados = []; // itens atuais que serão salvos (sem id_horario para novos)

// Mapas de turnos / linhas (mantidos do seu código de base)
const mapaTurnos = {
  1: "matutino_1",
  2: "matutino_2",
  4: "vespertino_1",
  5: "vespertino_2",
  7: "noturno_1",
  8: "noturno_2"
};
const mapaTurnosID = {
  matutino_1: 1,
  matutino_2: 2,
  vespertino_1: 4,
  vespertino_2: 5,
  noturno_1: 7,
  noturno_2: 8
};
// mapa ID turno -> índice (linha) da tabela onde cada turno aparece
const mapaIDTurnoParaLinhaIndex = {
  1: 1,
  2: 2,
  3: 4,
  4: 5,
  5: 7,
  6: 8
};

// ============================
// UTIL: obter turno ID a partir de <tr> (linha)
// ============================
function obterTurnoID(tr) {
  if (!tr) return null;
  const linhaIndex = tr.rowIndex;
  const nomeTurno = mapaTurnos[linhaIndex];
  return mapaTurnosID[nomeTurno] || null;
}

// ============================
// CARREGAR PERÍODOS
// ============================
async function carregarPeriodos() {
  try {
    const res = await fetch(API_PERIODO);
    const periodos = await res.json();
    selectPeriodo.innerHTML = `<option value="">-- Selecione período --</option>`;
    periodos.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id_periodo;
      opt.textContent = `Período ${p.numero}`;
      selectPeriodo.appendChild(opt);
    });
    // ativar botão quando houver escolha
    selectPeriodo.addEventListener("change", () => {
      btnHorario.disabled = !selectPeriodo.value;
      // atualizar rótulo do período (se estiver o modal aberto)
      const txt = selectPeriodo.options[selectPeriodo.selectedIndex]?.text || "";
      document.getElementById("textoPeriodoSelecionado").textContent = txt ? `Período: ${txt}` : "";
      preencherTabelaPorPeriodo(selectPeriodo.value);
    });
  } catch (err) {
    console.error("Erro ao carregar períodos:", err);
  }
}

// ============================
// CARREGAR INFORMAÇÕES DO CURSO E HORÁRIOS EXISTENTES
// ============================
async function carregarCursoEHorarios() {
  try {
    // título do curso
    const resCurso = await fetch(`${API_CURSO}/${idCurso}`);
    if (!resCurso.ok) throw new Error("Curso não encontrado");
    const curso = await resCurso.json();
    tituloCursoEl.textContent = curso.nome || `Curso ${idCurso}`;

    // carregar todos os horários do backend e filtrar por idCurso
    const resHorarios = await fetch(API_HORARIO);
    const todosHorarios = await resHorarios.json();

    // cada item do backend deve conter id_horario, id_curso, id_periodo, id_turno, dia_da_semana, horario, id_disciplina, id_professor, id_sala
    const horariosDoCurso = todosHorarios.filter(h => {
      // backend pode devolver id_curso null ou string - converter para Number p/ comparação segura
      return Number(h.id_curso) === Number(idCurso);
    });

    // guardo esses existentes para comparar na hora de salvar (PUT vs POST vs DELETE)
    horariosExistentes = horariosDoCurso.map(h => ({ ...h }));

    // inicializo horariosSelecionados com os dados já existentes (mesma forma usada para render)
    horariosSelecionados = horariosDoCurso.map(h => ({
      id_horario: h.id_horario,
      id_curso: h.id_curso,
      id_periodo: h.id_periodo ?? null,
      id_turno: h.id_turno ?? null,
      dia_da_semana: h.dia_da_semana,
      horario: h.horario,
      id_disciplina: h.id_disciplina,
      id_professor: h.id_professor,
      id_sala: h.id_sala
    }));

    // se já tiver um período entre os horários existentes e selectPeriodo estiver vazio, preencha
    const periodoInicial = selectPeriodo.value || (horariosDoCurso[0]?.id_periodo ?? null);
    if (periodoInicial) {
      const txt = selectPeriodo.options[selectPeriodo.selectedIndex]?.text || "";
      document.getElementById("textoPeriodoSelecionado").textContent = txt ? `Período: ${txt}` : "";
      preencherTabelaPorPeriodo(periodoInicial);
    }
  } catch (err) {
    console.error("Erro ao carregar curso e horários:", err);
    alert("Erro ao carregar curso/horários: " + err.message);
  }
}

// ============================
// ABRIR / FECHAR modalHorario (principal)
// ============================
function abrirModalHorario() {
  const periodo = selectPeriodo.value;
  if (!periodo) return alert("Selecione um período.");
  document.getElementById("textoPeriodoSelecionado").textContent = selectPeriodo.options[selectPeriodo.selectedIndex]?.text || "";
  modalHorario.style.display = "block";
  overlay.style.display = "block";
  document.body.style.overflow = "hidden";
  // preencher tabela para o periodo escolhido
  preencherTabelaPorPeriodo(periodo);
}
function fecharModalHorario() {
  modalHorario.style.display = "none";
  overlay.style.display = "none";
  document.body.style.overflow = "";
}
btnHorario?.addEventListener("click", abrirModalHorario);
closeModalHorario?.addEventListener("click", fecharModalHorario);
overlay?.addEventListener("click", (e) => { if (e.target === overlay) fecharModalHorario(); });

// ============================
// PREENCHER TABELA VISUALMENTE POR PERÍODO
// ============================
async function preencherTabelaPorPeriodo(periodoId) {
  if (!tabela) return;

  // reset visual
  for (let r = 1; r < tabela.rows.length; r++) {
    const tr = tabela.rows[r];
    if (!tr.dataset.turno) continue; 

    for (let c = 1; c < tr.cells.length; c++) {
      tr.cells[c].innerHTML = " ";
      tr.cells[c].classList.add("campo-vazio");
    }
  }

  // buscar meta-dados (disciplinas/professores/salas) para mostrar nomes
  const [resDisciplinas, resProfessores, resSalas] = await Promise.all([
    fetch(API_DISCIPLINA),
    fetch(API_PROFESSOR),
    fetch(API_SALA)
  ]);
  const disciplinas = await resDisciplinas.json();
  const professores = await resProfessores.json();
  const salas = await resSalas.json();

  // filtrar horários na memória para o período
  const filtrados = horariosSelecionados.filter(h => String(h.id_periodo) === String(periodoId));

  filtrados.forEach(h => {
    const disciplina = disciplinas.find(d => Number(d.id_disciplina) === Number(h.id_disciplina));
    const professor = professores.find(p => Number(p.id_professor) === Number(h.id_professor));
    const sala = salas.find(s => Number(s.id_sala) === Number(disciplina.id_sala));

    // encontrar coluna pelo nome do dia (assume texto igual entre frontend/backend)
    let colunaIndex = -1;
    for (let c = 1; c < tabela.rows[0].cells.length; c++) {
      if (tabela.rows[0].cells[c].innerText.trim() === h.dia_da_semana) {
        colunaIndex = c;
        break;
      }
    }
    if (colunaIndex === -1) return; // dia não encontrado

    const linhaIndex = mapaIDTurnoParaLinhaIndex[h.id_turno];
    if (linhaIndex === undefined || !tabela.rows[linhaIndex]) return;

    const cell = tabela.rows[linhaIndex].cells[colunaIndex];
    cell.classList.remove("campo-vazio");
    cell.innerHTML = `
      <div class="cell-content">
        <strong>${disciplina?.nome || "Disciplina"}</strong><br>
        ${professor?.nome || "Professor"}<br>
        Sala: ${sala?.nome || "Sala"}
        
      </div>
    `;
    // botão remover
    const btnRem = cell.querySelector(".remover-horario-btn");
    btnRem?.addEventListener("click", (ev) => {
      ev.stopPropagation();
      // remover da memória
      horariosSelecionados = horariosSelecionados.filter(item =>
        !(item.dia_da_semana === h.dia_da_semana && item.id_turno === h.id_turno && String(item.id_periodo) === String(h.id_periodo))
      );
      // marcar a célula como vazia
      cell.innerText = "Adicionar +";
      cell.classList.add("campo-vazio");
    });
  });
}

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

if (btnHorarioAbre) {
    btnHorarioAbre.addEventListener("click", irParaHorario);
}

// ============================
// INICIALIZAÇÃO DO MÓDULO
// - carregar períodos
// - carregar curso e horários do backend
// - inicializar tabela interativa (eventos já adicionados)
// ============================
document.addEventListener("DOMContentLoaded", async () => {
  await carregarPeriodos();
  await carregarCursoEHorarios();
  // preencherTabelaPorPeriodo caso um período já esteja selecionado
  if (selectPeriodo.value) preencherTabelaPorPeriodo(selectPeriodo.value);
});


