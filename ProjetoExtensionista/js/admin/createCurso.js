//-----------------------------------------
// MENU LATERAL
//-----------------------------------------
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
}

//-----------------------------------------
// CARREGAR PERÍODOS
//-----------------------------------------
async function carregarPeriodos() {
  const selectPeriodo = document.getElementById("periodo");

  try {
    const resposta = await fetch("https://study-hub-7qc5.onrender.com/periodo");
    const periodos = await resposta.json();

    periodos.forEach(p => {
      const option = document.createElement("option");
      option.value = p.id_periodo;
      option.textContent = `Período ${p.numero}`;
      selectPeriodo.appendChild(option);
    });

  } catch (erro) {
    console.error("Erro ao carregar períodos:", erro);
  }
}
carregarPeriodos();

document.getElementById("periodo").addEventListener("change", () => {
  document.getElementById("btnHorario").disabled = false;
});

//-----------------------------------------
// MODAL PRINCIPAL
//-----------------------------------------
const btnHorario = document.getElementById('btnHorario');
const modalHorario = document.getElementById('modalHorario');
const overlay = document.getElementById('overlay');
const closeModalHorario = document.getElementById('closeModal');
const tabela = document.getElementById('tabelaHorario');

//-----------------------------------------
// MODAL PRINCIPAL (AJUSTADO)
//-----------------------------------------
function openHorarioModal() {
  const select = document.getElementById("periodo");
  const periodoSelecionadoId = select.value;

  if (!periodoSelecionadoId) {
    alert("Selecione um período primeiro.");
    return;
  }

  const periodoTexto = select.options[select.selectedIndex].text;
  document.getElementById("textoPeriodoSelecionado").textContent =
    "Período: " + periodoTexto;

  modalHorario.style.display = 'block';
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';

  limparEPreencherTabela(periodoSelecionadoId);
}

function closeHorarioModal() {
  modalHorario.style.display = 'none';
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

btnHorario?.addEventListener('click', (e) => {
  e.preventDefault();
  openHorarioModal();
});
closeModalHorario?.addEventListener('click', closeHorarioModal);
overlay?.addEventListener('click', (e) => {
  if (e.target === overlay) closeHorarioModal();
});

//-----------------------------------------
// MODAL DE SELEÇÃO
//-----------------------------------------
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

let celulaAtual = null;
let horarioAtual = "";
let diaAtual = "";
let trAtual = null;

let disciplinaSelecionada = null;
let professorSelecionado = null;
let salaSelecionada = null;

let horariosSelecionados = [];

//-----------------------------------------
// URLs
//-----------------------------------------
const API_DISCIPLINA = "https://study-hub-7qc5.onrender.com/disciplina";
const API_PROFESSOR = "https://study-hub-7qc5.onrender.com/professor";
const API_SALA = "https://study-hub-7qc5.onrender.com/sala";
const API_CURSO = "https://study-hub-7qc5.onrender.com/curso";
const API_CURSO_DISCIPLINA = "https://study-hub-7qc5.onrender.com/curso/disciplina";
const API_HORARIO = "https://study-hub-7qc5.onrender.com/horario";

//-----------------------------------------
// MAPA DE TURNOS POR LINHA
//-----------------------------------------
const mapaTurnos = {
  1: "matutino_1",
  2: "matutino_2",
  3: null,
  4: "vespertino_1",
  5: "vespertino_2",
  6: null,
  7: "noturno_1",
  8: "noturno_2"
};

// MAPA PARA CONVERTER NOME → ID
const mapaTurnosID = {
  matutino_1: 1,
  matutino_2: 2,
  vespertino_1: 4,
  vespertino_2: 5,
  noturno_1: 7,
  noturno_2: 8
};

// -----------------------------------------
// UTIL: LIMPAR E PREENCHER TABELA POR PERÍODO
// -----------------------------------------
async function limparEPreencherTabela(periodoId) {
  if (!tabela) return;

  tabela.querySelectorAll("tr").forEach((tr) => {
    tr.querySelectorAll("td").forEach((td, colIndex) => {
      if (colIndex === 0) return;
      td.innerHTML = "Adicionar +";
      td.classList.add("campo-vazio");
    });
  });

  const [resDisciplinas, resProfessores, resSalas] = await Promise.all([
    fetch(API_DISCIPLINA),
    fetch(API_PROFESSOR),
    fetch(API_SALA)
  ]);

  const disciplinas = await resDisciplinas.json();
  const professores = await resProfessores.json();
  const salas = await resSalas.json();

  const horariosDoPeriodo = horariosSelecionados.filter(h => h.id_periodo == periodoId);

  horariosDoPeriodo.forEach(h => {
    const horarioRef = {
      dia_da_semana: h.dia_da_semana,
      id_turno: h.id_turno,
      id_periodo: h.id_periodo
    };

    const disciplina = disciplinas.find(d => d.id_disciplina === h.id_disciplina);
    const professor = professores.find(p => p.id_professor === h.id_professor);
    const sala = salas.find(s => s.id_sala === h.id_sala);

    let colunaIndex = -1;
    for (let c = 1; c < tabela.rows[0].cells.length; c++) {
      if (tabela.rows[0].cells[c].innerText === h.dia_da_semana) {
        colunaIndex = c;
        break;
      }
    }
    if (colunaIndex === -1) return;

    let linhaIndex = null;
    for (let r = 1; r < tabela.rows.length; r++) {
      const nomeTurno = mapaTurnos[tabela.rows[r].rowIndex];
      if (mapaTurnosID[nomeTurno] === h.id_turno) {
        linhaIndex = r;
        break;
      }
    }
    if (linhaIndex === null) return;

    const cell = tabela.rows[linhaIndex].cells[colunaIndex];
    cell.classList.remove("campo-vazio");

    cell.innerHTML = `
          <div class="cell-content-agenda">
            <strong>${disciplina?.nome || "Disciplina"}</strong>
            <span>${professor?.nome || "Professor"}</span>
            <span class="sala-txt">Sala: ${sala?.nome || "Sala"}</span>
            <button class="remover-horario-btn" title="Remover">✕</button>
          </div>
        `;

    const btnRem = cell.querySelector('.remover-horario-btn');
    btnRem?.addEventListener('click', (ev) => {
      ev.stopPropagation();

      const cellToClear = ev.currentTarget.closest('td');

      horariosSelecionados = horariosSelecionados.filter(item =>
        !(item.dia_da_semana === horarioRef.dia_da_semana && item.id_turno === horarioRef.id_turno && item.id_periodo === horarioRef.id_periodo)
      );

      cellToClear.innerHTML = "Adicionar +";
      cellToClear.classList.add("campo-vazio");
    });
  });
}

//-----------------------------------------
// ABRIR MODAL SELEÇÃO
//-----------------------------------------
function abrirModalSelecao(horario, dia, td) {
  horarioAtual = horario;
  diaAtual = dia;
  celulaAtual = td;
  trAtual = td.parentElement;

  disciplinaSelecionada = null;
  professorSelecionado = null;
  salaSelecionada = null;

  listaDisciplinas.innerHTML = "";
  listaProfessores.innerHTML = "";
  listaSalas.innerHTML = "";

  modalSelecao.style.display = "block";
  overlaySelecao.style.display = "block";
  document.body.style.overflow = 'hidden';

  const periodoId = document.getElementById("periodo").value;
  carregarDisciplinas(periodoId);
}

closeSelecao?.addEventListener("click", () => {
  modalSelecao.style.display = "none";
  overlaySelecao.style.display = "none";
  document.body.style.overflow = '';
});

//-----------------------------------------
// CARREGAR DISCIPLINAS
//-----------------------------------------
async function carregarDisciplinas(periodoId) {
  try {
    const res = await fetch(`${API_DISCIPLINA}?periodo=${periodoId}`);
    const disciplinas = await res.json();

    function render(filtro = "") {
      listaDisciplinas.innerHTML = "";

      disciplinas
        .filter(d => d.nome.toLowerCase().includes(filtro.toLowerCase()))
        .forEach(d => {
          const li = document.createElement("li");
          li.textContent = d.nome;
          li.onclick = () => {
            disciplinaSelecionada = d;
            carregarProfessores();
          };
          listaDisciplinas.appendChild(li);
        });
    }

    inputBuscaDisciplina.oninput = e => render(e.target.value);
    render();

  } catch {
    listaDisciplinas.innerHTML = "<li>Erro ao carregar.</li>";
  }
}

//-----------------------------------------
// CARREGAR PROFESSORES
//-----------------------------------------
async function carregarProfessores() {
  const res = await fetch(API_PROFESSOR);
  const professores = await res.json();

  function render(filtro = "") {
    listaProfessores.innerHTML = "";

    professores
      .filter(p => p.nome.toLowerCase().includes(filtro.toLowerCase()))
      .forEach(p => {
        const li = document.createElement("li");
        li.textContent = p.nome;
        li.onclick = () => {
          professorSelecionado = p;
          carregarSalas();
        };
        listaProfessores.appendChild(li);
      });
  }

  inputBuscaProfessor.oninput = e => render(e.target.value);
  render();
}

//-----------------------------------------
// CARREGAR SALAS
//-----------------------------------------
async function carregarSalas() {
  const res = await fetch(API_SALA);
  const salas = await res.json();

  function render(filtro = "") {
    listaSalas.innerHTML = "";

    salas
      .filter(s => s.nome.toLowerCase().includes(filtro.toLowerCase()))
      .forEach(s => {
        const li = document.createElement("li");
        li.textContent = s.nome;
        li.onclick = () => salaSelecionada = s;
        listaSalas.appendChild(li);
      });
  }

  inputBuscaSala.oninput = e => render(e.target.value);
  render();
}

//-----------------------------------------
// DETERMINAR TURNO (ID)
//-----------------------------------------
function obterTurnoID(tr) {
  return parseInt(tr.dataset.turno);
}


async function atualizarSalaDisciplina(id_disciplina, id_sala) {
  try {
    const res = await fetch(`${API_DISCIPLINA}/${id_disciplina}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_sala: id_sala })
    });

    if (!res.ok) throw new Error(`Erro ao atualizar disciplina ${id_disciplina}`);

    const disciplinaAtualizada = await res.json();
    console.log('Disciplina atualizada com sucesso:', disciplinaAtualizada);
    return disciplinaAtualizada;

  } catch (err) {
    console.error('Erro na atualização da disciplina:', err);
    alert('Erro ao atualizar a sala da disciplina!');
  }
}

//-----------------------------------------
// CONFIRMAR HORÁRIO (AJUSTADO VISUAL)
//-----------------------------------------
btnAdicionarHorario.addEventListener("click", async () => {
  if (!disciplinaSelecionada || !professorSelecionado || !salaSelecionada) {
    return alert("Selecione tudo antes de confirmar.");
  }

  const id_periodo = document.getElementById("periodo").value;
  const id_turno = obterTurnoID(trAtual);

  const novoHorario = {
    dia_da_semana: diaAtual,
    horario: horarioAtual,
    id_disciplina: disciplinaSelecionada.id_disciplina,
    id_professor: professorSelecionado.id_professor,
    id_sala: salaSelecionada.id_sala,
    id_periodo: id_periodo,
    id_turno: id_turno
  };

  const indexExistente = horariosSelecionados.findIndex(h =>
    h.dia_da_semana === novoHorario.dia_da_semana &&
    h.horario === novoHorario.horario
  );
  if (indexExistente !== -1) {
    horariosSelecionados.splice(indexExistente, 1);
  }

  horariosSelecionados.push(novoHorario);

  await atualizarSalaDisciplina(disciplinaSelecionada.id_disciplina, salaSelecionada.id_sala);

  try {
    await fetch(`${API_DISCIPLINA}/professor`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_disciplina: disciplinaSelecionada.id_disciplina,
        id_professor: professorSelecionado.id_professor
      })
    });
    console.log("Professor associado à disciplina com sucesso.");
  } catch (err) {
    console.error("Erro ao associar disciplina e professor:", err);
    alert("Erro ao associar professor à disciplina!");
  }

  celulaAtual.innerHTML = `
    <div class="cell-content-agenda">
      <strong>${disciplinaSelecionada.nome}</strong>
      <span>${professorSelecionado.nome}</span>
      <span class="sala-txt">Sala: ${salaSelecionada.nome}</span>
      <button class="remover-horario-btn" title="Remover">✕</button>
    </div>
  `;
  celulaAtual.classList.remove("campo-vazio");

  const btnRem = celulaAtual.querySelector('.remover-horario-btn');
  btnRem?.addEventListener('click', (ev) => {
    ev.stopPropagation();

    const cellToClear = ev.currentTarget.closest('td');

    horariosSelecionados = horariosSelecionados.filter(item =>
      !(item.dia_da_semana === novoHorario.dia_da_semana && item.id_turno === novoHorario.id_turno && item.id_periodo === novoHorario.id_periodo)
    );

    cellToClear.innerHTML = "Adicionar +";
    cellToClear.classList.add("campo-vazio");
  });

  modalSelecao.style.display = "none";
  overlaySelecao.style.display = "none";
  document.body.style.overflow = '';
});

//-----------------------------------------
// MARCAR CELULAS
//-----------------------------------------
tabela.querySelectorAll("tr").forEach((tr) => {
  tr.querySelectorAll("td").forEach((td, colIndex) => {
    if (colIndex === 0) return;
    if (td.innerHTML.trim() === "") {
      td.innerText = "Adicionar +";
      td.classList.add("campo-vazio");
    }
  });
});

//-----------------------------------------
// ABRIR SELEÇÃO AO CLICAR 
//-----------------------------------------
tabela.querySelectorAll("tr").forEach((tr) => {
  tr.querySelectorAll("td").forEach((td, colIndex) => {
    if (colIndex === 0) return;

    td.addEventListener("click", (e) => {
      if (e.target.classList.contains('remover-horario-btn')) {
        return;
      }

      const horario = tr.cells[0].innerText;
      const dia = tabela.rows[0].cells[colIndex].innerText;

      if (!td.classList.contains('campo-vazio')) {
        td.innerHTML = "";
      }

      abrirModalSelecao(horario, dia, td);
    });
  });
});

//-----------------------------------------
// CADASTRAR CURSO COMPLETO
//-----------------------------------------
document.getElementById("btnCadastrar").addEventListener("click", async () => {
  const nomeValue = document.getElementById("nome").value.trim();
  const hoursValue = document.getElementById("hours").value.trim();

  if (!nomeValue) return alert("Digite o nome do curso.");
  if (!hoursValue) return alert("Digite a carga horária.");

  try {
    const res = await fetch(API_CURSO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nomeValue,
        carga_horaria: parseInt(hoursValue)
      })
    });

    const cursoCriado = await res.json();
    const idCurso = cursoCriado.id_curso;

    const disciplinas = [...new Set(horariosSelecionados.map(h => h.id_disciplina))];

    for (const d of disciplinas) {
      await fetch(API_CURSO_DISCIPLINA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_curso: idCurso,
          id_disciplina: d
        })
      });
    }

    for (const h of horariosSelecionados) {
      await fetch(API_HORARIO, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_curso: idCurso,
          id_disciplina: h.id_disciplina,
          id_professor: h.id_professor,
          id_sala: h.id_sala,
          id_periodo: h.id_periodo,
          id_turno: h.id_turno,
          dia_da_semana: h.dia_da_semana,
          horario: h.horario
        })
      });
    }

    alert("Curso criado com sucesso!");
    window.location.href = "/html/admin/curso.html";

  } catch (err) {
    alert("Erro ao criar curso.");
    console.error(err);
  }
});
