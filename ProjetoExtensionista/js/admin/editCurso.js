// -----------------------------------------
// CONFIG / MENU LATERAL
// -----------------------------------------
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
}

// -----------------------------------------
// PARÂMETROS URL 
// -----------------------------------------
const params = new URLSearchParams(window.location.search);
const idCurso = params.get('id');

// -----------------------------------------
// ELEMENTOS 
// -----------------------------------------
const inputNome = document.getElementById('nome');
const inputHours = document.getElementById('hours');
const btnCadastrar = document.getElementById('btnCadastrar');
const btnHorario = document.getElementById('btnHorario');
const modalHorario = document.getElementById('modalHorario');
const overlay = document.getElementById('overlay');
const closeModalHorario = document.getElementById('closeModal');
const tabela = document.getElementById('tabelaHorario');

// modal de seleção (disciplina/professor/sala)
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

// select de periodo (no modal principal)
const selectPeriodo = document.getElementById('periodo');
const textoPeriodoSelecionado = document.getElementById('textoPeriodoSelecionado');

// -----------------------------------------
// ENDPOINTS (ajuste se mudar)
// -----------------------------------------
const BASE = "https://study-hub-7qc5.onrender.com";
const API_DISCIPLINA = `${BASE}/disciplina`;
const API_PROFESSOR = `${BASE}/professor`;
const API_SALA = `${BASE}/sala`;
const API_CURSO = `${BASE}/curso`;
const API_CURSO_DISCIPLINA = `${BASE}/curso/disciplina`;
const API_HORARIO = `${BASE}/horario`;
const API_DISCIPLINA_PROF = `${BASE}/disciplina/professor`;
const API_PERIODOS = `${BASE}/periodo`;

// -----------------------------------------
// estado local
// -----------------------------------------
let disciplinaSelecionada = null;
let professorSelecionado = null;
let salaSelecionada = null;
let celulaAtual = null;
let horarioAtual = "";
let diaAtual = "";
let trAtual = null;

let horariosSelecionados = [];

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

const mapaIDTurnoParaLinhaIndex = {
  1: 1, // manhã
  2: 2, // manhã
  3: 4, // tarde
  4: 5, // tarde
  5: 7, // noturno 
  6: 8  // noturno
};


// -----------------------------------------
// UTIL: obter turno ID pela TR
// -----------------------------------------
function obterTurnoID(tr) {
  if (!tr) return null;
  const linha = tr.rowIndex;
  const nomeTurno = mapaTurnos[linha];
  return mapaTurnosID[nomeTurno] || null;
}

// -----------------------------------------
// CARREGAR PERÍODOS (select principal)
// -----------------------------------------
async function carregarPeriodos() {
  if (!selectPeriodo) return;
  try {
    const res = await fetch(API_PERIODOS);
    const periodos = await res.json();
    selectPeriodo.innerHTML = `<option value="">-- Selecione período --</option>`;
    periodos.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id_periodo;
      option.textContent = `Período ${p.numero}`;
      selectPeriodo.appendChild(option);
    });
  } catch (err) {
    console.error("Erro ao carregar períodos:", err);
  }
}
carregarPeriodos();
selectPeriodo?.addEventListener('change', () => {
  document.getElementById("btnHorario").disabled = !selectPeriodo.value;
  if (textoPeriodoSelecionado) {
    const sel = selectPeriodo;
    const txt = sel.options[sel.selectedIndex]?.text || "";
    textoPeriodoSelecionado.textContent = txt ? `Período: ${txt}` : "";
  }
});

// -----------------------------------------
// ABRIR / FECHAR modalHorario (principal)
// -----------------------------------------
function openHorarioModal(e) {
  if (e) e.preventDefault();
  if (!selectPeriodo.value) { alert("Selecione um período primeiro."); return; }
  modalHorario.style.display = 'block';
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}
function closeHorarioModalFn() {
  modalHorario.style.display = 'none';
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}
btnHorario?.addEventListener('click', openHorarioModal);
closeModalHorario?.addEventListener('click', closeHorarioModalFn);
overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeHorarioModalFn(); });


// -----------------------------------------
// ABRIR / FECHAR modalSelecao (disciplina/prof/sala)
// -----------------------------------------
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

  const periodoId = selectPeriodo.value || null;
  carregarDisciplinas(periodoId);
}
closeSelecao?.addEventListener("click", () => {
  modalSelecao.style.display = "none";
  overlaySelecao.style.display = "none";
  document.body.style.overflow = '';
});
overlaySelecao?.addEventListener('click', (e) => { if (e.target === overlaySelecao) { modalSelecao.style.display = "none"; overlaySelecao.style.display = "none"; document.body.style.overflow = ''; } });

// -----------------------------------------
// CARREGAR DISCIPLINAS (filtradas por período)
// -----------------------------------------
async function carregarDisciplinas(periodoId) {
  try {
    const q = periodoId ? `?periodo=${encodeURIComponent(periodoId)}` : "";
    const res = await fetch(`${API_DISCIPLINA}${q}`);
    const disciplinas = await res.json();
    listaDisciplinas.innerHTML = "";

    function render(filtro = "") {
      listaDisciplinas.innerHTML = "";
      disciplinas
        .filter(d => (d.nome || "").toLowerCase().includes((filtro || "").toLowerCase()))
        .forEach(d => {
          const li = document.createElement('li');
          li.textContent = d.nome;
          li.onclick = () => {
            disciplinaSelecionada = d;
            carregarProfessores();
          };
          listaDisciplinas.appendChild(li);
        });
      if (disciplinas.length === 0) listaDisciplinas.innerHTML = "<li>Nenhuma disciplina</li>";
    }

    inputBuscaDisciplina.oninput = e => render(e.target.value);
    render();
  } catch (err) {
    console.error("Erro ao carregar disciplinas:", err);
    listaDisciplinas.innerHTML = "<li>Erro ao carregar disciplinas</li>";
  }
}

// -----------------------------------------
// CARREGAR PROFESSORES
// -----------------------------------------
async function carregarProfessores() {
  try {
    const res = await fetch(API_PROFESSOR);
    const professores = await res.json();
    listaProfessores.innerHTML = "";

    function render(filtro = "") {
      listaProfessores.innerHTML = "";
      professores
        .filter(p => (p.nome || "").toLowerCase().includes((filtro || "").toLowerCase()))
        .forEach(p => {
          const li = document.createElement('li');
          li.textContent = p.nome;
          li.onclick = () => {
            professorSelecionado = p;
            carregarSalas();
          };
          listaProfessores.appendChild(li);
        });
      if (professores.length === 0) listaProfessores.innerHTML = "<li>Nenhum professor</li>";
    }

    inputBuscaProfessor.oninput = e => render(e.target.value);
    render();
  } catch (err) {
    console.error("Erro ao carregar professores:", err);
    listaProfessores.innerHTML = "<li>Erro ao carregar professores</li>";
  }
}

// -----------------------------------------
// CARREGAR SALAS
// -----------------------------------------
async function carregarSalas() {
  try {
    const res = await fetch(API_SALA);
    const salas = await res.json();
    listaSalas.innerHTML = "";

    function render(filtro = "") {
      listaSalas.innerHTML = "";
      salas
        .filter(s => (s.nome || "").toLowerCase().includes((filtro || "").toLowerCase()))
        .forEach(s => {
          const li = document.createElement('li');
          li.textContent = s.nome;
          li.onclick = () => salaSelecionada = s;
          listaSalas.appendChild(li);
        });
      if (salas.length === 0) listaSalas.innerHTML = "<li>Nenhuma sala</li>";
    }

    inputBuscaSala.oninput = e => render(e.target.value);
    render();
  } catch (err) {
    console.error("Erro ao carregar salas:", err);
    listaSalas.innerHTML = "<li>Erro ao carregar salas</li>";
  }
}

// -----------------------------------------
// AO CONFIRMAR NO MODAL DE SELEÇÃO (adiciona horário)
// -----------------------------------------
btnAdicionarHorario?.addEventListener('click', async () => {
  if (!disciplinaSelecionada || !professorSelecionado || !salaSelecionada) {
    return alert("Selecione disciplina, professor e sala antes de confirmar.");
  }

  try {
    await fetch(API_DISCIPLINA_PROF, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id_disciplina: disciplinaSelecionada.id_disciplina,
        id_professor: professorSelecionado.id_professor
      })
    });
  } catch (err) {
    console.warn("Não foi possível associar disciplina-professor (não bloqueante):", err);
  }

  const id_periodo = selectPeriodo.value ? parseInt(selectPeriodo.value, 10) : null;
  const id_turno = obterTurnoID(trAtual);

  const novo = {
    dia_da_semana: diaAtual,
    horario: horarioAtual,
    id_disciplina: disciplinaSelecionada.id_disciplina,
    id_professor: professorSelecionado.id_professor,
    id_sala: salaSelecionada.id_sala,
    id_periodo: id_periodo,
    id_turno: id_turno
  };

  horariosSelecionados = horariosSelecionados.filter(h => !(h.dia_da_semana === novo.dia_da_semana && h.horario === novo.horario));

  horariosSelecionados.push(novo);

  celulaAtual.classList.remove("campo-vazio");
  celulaAtual.innerHTML = `
    <div class="cell-content">
      <strong>${disciplinaSelecionada.nome}</strong><br>
      ${professorSelecionado.nome}<br>
      Sala: ${salaSelecionada.nome}
      <button class="remover-horario-btn" title="Remover">✕</button>
    </div>
  `;

  const btnRem = celulaAtual.querySelector('.remover-horario-btn');
  if (btnRem) {
    btnRem.addEventListener('click', (ev) => {
      ev.stopPropagation();
      horariosSelecionados = horariosSelecionados.filter(h => !(h.dia_da_semana === novo.dia_da_semana && h.horario === novo.horario));
      celulaAtual.innerText = "Adicionar ";
      celulaAtual.classList.add("campo-vazio");
    });
  }

  modalSelecao.style.display = "none";
  overlaySelecao.style.display = "none";
  document.body.style.overflow = '';
});

// -----------------------------------------
// MARCAR CELULAS VAZIAS E ABRIR MODAL AO CLICAR
// -----------------------------------------
function inicializarTabelaInterativa() {
  if (!tabela) return;
  tabela.querySelectorAll("tr").forEach((tr) => {
    tr.querySelectorAll("td").forEach((td, colIndex) => {
      if (colIndex === 0) return;
      td.addEventListener('click', () => {
        const horario = tr.cells[0].innerText;
        const dia = tabela.rows[0].cells[colIndex].innerText;
        abrirModalSelecao(horario, dia, td);
      });
    });
  });
}
inicializarTabelaInterativa();

// -----------------------------------------
// PREENCHER TABELA COM HORÁRIOS (VISUAL) POR PERÍODO (AJUSTADO)
// -----------------------------------------
async function preencherTabelaPorPeriodo(periodoId) {
  if (!tabela) return;

  const [resDisciplinas, resProfessores, resSalas] = await Promise.all([
    fetch(API_DISCIPLINA),
    fetch(API_PROFESSOR),
    fetch(API_SALA)
  ]);

  const disciplinas = await resDisciplinas.json();
  const professores = await resProfessores.json();
  const salas = await resSalas.json();

  for (let r = 1; r < tabela.rows.length; r++) {
    for (let c = 1; c < tabela.rows[r].cells.length; c++) {
      tabela.rows[r].cells[c].innerHTML = "Adicionar +";
      tabela.rows[r].cells[c].classList.add("campo-vazio");
    }
  }

  const horariosFiltrados = horariosSelecionados.filter(h => h.id_periodo == periodoId);

  horariosFiltrados.forEach(h => {
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
    if (colunaIndex === -1) {
      console.warn(`Dia da semana '${h.dia_da_semana}' não encontrado na tabela.`);
      return;
    }

    const linhaIndex = mapaIDTurnoParaLinhaIndex[h.id_turno];

    if (linhaIndex === undefined || tabela.rows[linhaIndex] === undefined) {
      console.warn(`Turno ID ${h.id_turno} não mapeado para índice de linha válido.`);
      return;
    }

    const cell = tabela.rows[linhaIndex].cells[colunaIndex];
    cell.classList.remove("campo-vazio");
    cell.innerHTML = `
      <div class="cell-content">
        <strong>${disciplina?.nome || "Disciplina"}</strong><br>
        ${professor?.nome || "Professor"}<br>
        Sala: ${sala?.nome || "Sala"}
        <button class="remover-horario-btn" title="Remover">✕</button>
      </div>
    `;

    const btnRem = cell.querySelector('.remover-horario-btn');
    btnRem?.addEventListener('click', (ev) => {
      ev.stopPropagation();
      horariosSelecionados = horariosSelecionados.filter(item =>
        !(item.dia_da_semana === h.dia_da_semana && item.id_turno === h.id_turno && item.id_periodo === h.id_periodo)
      );
      cell.innerText = "Adicionar +";
      cell.classList.add("campo-vazio");
    });
  });
}

// -----------------------------------------
// ATUALIZA TABELA AO MUDAR PERÍODO
// -----------------------------------------
selectPeriodo?.addEventListener('change', () => {
  document.getElementById("btnHorario").disabled = !selectPeriodo.value;

  if (textoPeriodoSelecionado) {
    const sel = selectPeriodo;
    const txt = sel.options[sel.selectedIndex]?.text || "";
    textoPeriodoSelecionado.textContent = txt ? `Período: ${txt}` : "";
  }

  preencherTabelaPorPeriodo(selectPeriodo.value);
});


// -----------------------------------------
// CARREGAR CURSO EXISTENTE + HORÁRIOS (AJUSTADO)
// -----------------------------------------
async function carregarCurso() {
  if (!idCurso) return;
  try {
    const res = await fetch(`${API_CURSO}/${idCurso}`);
    if (!res.ok) throw new Error("Erro ao buscar curso");
    const curso = await res.json();
    inputNome.value = curso.nome || "";
    inputHours.value = curso.carga_horaria || "";

    const resHorarios = await fetch(API_HORARIO);
    const todos = await resHorarios.json();
    const horariosDoCurso = todos.filter(h => Number(h.id_curso) === Number(idCurso));

    horariosExistentes = horariosDoCurso;

    horariosSelecionados = horariosDoCurso.map(h => ({
      dia_da_semana: h.dia_da_semana,
      horario: h.horario,
      id_disciplina: h.id_disciplina,
      id_professor: h.id_professor,
      id_sala: h.id_sala,
      id_periodo: h.id_periodo ?? null,
      id_turno: h.id_turno ?? null,
      id_horario: h.id_horario
    }));

    const periodoInicial = selectPeriodo.value || (horariosDoCurso[0]?.id_periodo ?? null);
    if (periodoInicial) {
      selectPeriodo.value = periodoInicial;
      const sel = selectPeriodo;
      const txt = sel.options[sel.selectedIndex]?.text || "";
      textoPeriodoSelecionado.textContent = txt ? `Período: ${txt}` : "";

      preencherTabelaPorPeriodo(periodoInicial);
    }

  } catch (err) {
    console.error("Erro ao carregar curso:", err);
    alert("Erro ao carregar curso: " + err.message);
  }
}

// -----------------------------------------
// AJUSTE NA ORDEM DE EXECUÇÃO
// -----------------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  await carregarPeriodos();
  carregarCurso();
});

// -----------------------------------------
// SALVAR (atualizar) 
// -----------------------------------------
if (btnCadastrar) {
  btnCadastrar.addEventListener('click', async () => {
    const nomeValue = inputNome.value.trim();
    const hoursValue = inputHours.value.trim();

    if (!nomeValue) { alert("Preencha o campo Nome."); inputNome.focus(); return; }
    if (!hoursValue) { alert("Preencha a carga horária."); inputHours.focus(); return; }

    try {
      const resUp = await fetch(`${API_CURSO}/${idCurso}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nomeValue, carga_horaria: parseInt(hoursValue, 10) })
      });
      if (!resUp.ok) {
        const txt = await resUp.text();
        throw new Error("Erro atualizando curso: " + txt);
      }

      for (const h of horariosSelecionados) {
        const existente = horariosExistentes.find(he =>
          he.dia_da_semana === h.dia_da_semana &&
          he.id_turno === h.id_turno &&
          he.id_periodo === h.id_periodo
        );

        const payload = {
          id_curso: idCurso,
          id_disciplina: h.id_disciplina,
          id_professor: h.id_professor,
          id_sala: h.id_sala,
          id_periodo: h.id_periodo ?? null,
          id_turno: h.id_turno ?? null,
          dia_da_semana: h.dia_da_semana,
          horario: h.horario
        };

        if (existente) {
          await fetch(`${API_HORARIO}/${existente.id_horario}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        } else {
          await fetch(API_HORARIO, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
        }
      }

      for (const he of horariosExistentes) {
        const aindaExiste = horariosSelecionados.find(h =>
          h.dia_da_semana === he.dia_da_semana &&
          h.id_turno === he.id_turno &&
          h.id_periodo === he.id_periodo
        );
        if (!aindaExiste) {
          await fetch(`${API_HORARIO}/${he.id_horario}`, { method: "DELETE" });
        }
      }


      const disciplinasUnicas = [...new Set(horariosSelecionados.map(h => h.id_disciplina))];

      for (const idDisc of disciplinasUnicas) {
        try {
          await fetch(API_CURSO_DISCIPLINA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_curso: idCurso, id_disciplina: idDisc })
          });
        } catch (err) {
          console.warn("Falha ao associar curso-disciplina:", idDisc, err);
        }
      }

      alert("Curso atualizado com sucesso!");
      window.location.href = '/html/admin/curso.html';

    } catch (err) {
      console.error("Erro ao salvar curso:", err);
      alert("Erro ao salvar curso: " + (err.message || err));
    }
  });
}


