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
      selectPeriodo.value = periodoInicial;
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
// ABRIR / FECHAR modalSelecao (disciplina → professor → sala)
// ============================
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
  document.body.style.overflow = "hidden";

  const periodoId = selectPeriodo.value || null;
  carregarDisciplinasDoCurso(periodoId);
}
function fecharModalSelecao() {
  modalSelecao.style.display = "none";
  overlaySelecao.style.display = "none";
  document.body.style.overflow = "";
}
closeSelecao?.addEventListener("click", fecharModalSelecao);
overlaySelecao?.addEventListener("click", (e) => { if (e.target === overlaySelecao) fecharModalSelecao(); });

// ============================
// CARREGAR DISCIPLINAS (APENAS AS DO CURSO) -- usa API_CURSO_DISCIPLINA/{idCurso}
// ============================
async function carregarDisciplinasDoCurso(periodoId) {
  try {
    // seu endpoint retorna disciplinas vinculadas ao curso => usamos API_CURSO_DISCIPLINA/{idCurso}
    const res = await fetch(`${API_DISCIPLINA_CURSO}/${idCurso}`);
    const disciplinas = await res.json();

    // Se desejar ainda filtrar por período, a API_CURSO_DISCIPLINA pode não aceitar ?periodo=
    // Porém o /disciplina?periodo= existe - vamos filtrar localmente caso a API_CURSO_DISCIPLINA traga disciplinas sem info de periodo.
    // Para simplicidade: se o backend aceitar querystring, substitua a chamada acima.
    listaDisciplinas.innerHTML = "";

    function render(filtro = "") {
      listaDisciplinas.innerHTML = "";
      disciplinas
        .filter(d => (d.nome || "").toLowerCase().includes((filtro || "").toLowerCase()))
        .forEach(d => {
          const li = document.createElement("li");
          li.textContent = d.nome;
          li.onclick = () => selecionarDisciplina(d);
          listaDisciplinas.appendChild(li);
        });
      if (disciplinas.length === 0) listaDisciplinas.innerHTML = "<li>Nenhuma disciplina vinculada</li>";
    }

    inputBuscaDisciplina.oninput = e => render(e.target.value);
    render();
  } catch (err) {
    console.error("Erro ao carregar disciplinas do curso:", err);
    listaDisciplinas.innerHTML = "<li>Erro ao carregar disciplinas</li>";
  }
}

// ============================
// AO SELECIONAR DISCIPLINA → BUSCAR PROFESSORES RELACIONADOS
// ============================
async function selecionarDisciplina(d) {
  disciplinaSelecionada = d;
  listaProfessores.innerHTML = "";
  inputBuscaProfessor.disabled = false;

  try {
    const res = await fetch(`${API_PROFESSOR}`);
    const professores = await res.json();

    function render(filtro = "") {
      listaProfessores.innerHTML = "";
      professores
        .filter(p => (p.nome || "").toLowerCase().includes((filtro || "").toLowerCase()))
        .forEach(p => {
          const li = document.createElement("li");
          li.textContent = p.nome;
          li.onclick = () => selecionarProfessor(p);
          listaProfessores.appendChild(li);
        });
      if (professores.length === 0) listaProfessores.innerHTML = "<li>Nenhum professor disponível</li>";
    }
    inputBuscaProfessor.oninput = e => render(e.target.value);
    render();
  } catch (err) {
    console.error("Erro ao carregar professores da disciplina:", err);
    listaProfessores.innerHTML = "<li>Erro ao carregar professores</li>";
  }
}

function selecionarProfessor(p) {
  professorSelecionado = p;
  listaSalas.innerHTML = "";
  inputBuscaSala.disabled = false;
  carregarSalas();
}

// ============================
// CARREGAR SALAS
// ============================
async function carregarSalas() {
  try {
    const res = await fetch(API_SALA);
    const salas = await res.json();

    function render(filtro = "") {
      listaSalas.innerHTML = "";
      salas
        .filter(s => (s.nome || "").toLowerCase().includes((filtro || "").toLowerCase()))
        .forEach(s => {
          const li = document.createElement("li");
          li.textContent = s.nome;
          li.onclick = () => selecionarSala(s);
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
function selecionarSala(s) {
  salaSelecionada = s;
}

// ============================
// atualizar sala da disciplina (PUT /disciplina/{id_disciplina})
// ============================
async function atualizarSalaDisciplina(id_disciplina, id_sala) {
  try {
    const res = await fetch(`${API_DISCIPLINA}/${id_disciplina}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_sala })
    });
    if (!res.ok) throw new Error("Erro ao atualizar disciplina");
    return await res.json();
  } catch (err) {
    console.warn("Falha ao atualizar sala da disciplina:", err);
    // não bloqueante
  }
}

// ============================
// ADICIONAR HORÁRIO NA MEMÓRIA E NA TABELA (botão confirmar no modalSelecao)
// ============================
btnAdicionarHorario?.addEventListener("click", async () => {
  if (!disciplinaSelecionada || !professorSelecionado || !salaSelecionada) {
    return alert("Selecione disciplina, professor e sala antes de confirmar.");
  }

  // tentar associar disciplina↔professor (POST /disciplina/professor)
  try {
    await fetch(`${API_DISCIPLINA}/professor`, {
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

  // atualizar sala da disciplina (não bloqueante)
  await atualizarSalaDisciplina(disciplinaSelecionada.id_disciplina, salaSelecionada.id_sala);

  const id_periodo = selectPeriodo.value ? parseInt(selectPeriodo.value, 10) : null;
  const id_turno = obterTurnoID(trAtual);

  const novo = {
    id_curso: Number(idCurso),
    id_periodo: id_periodo,
    id_turno: id_turno,
    dia_da_semana: diaAtual,
    horario: horarioAtual,
    id_disciplina: disciplinaSelecionada.id_disciplina,
    id_professor: professorSelecionado.id_professor,
    id_sala: salaSelecionada.id_sala
  };

  // remover duplicata (mesmo dia + horario) se existir
  horariosSelecionados = horariosSelecionados.filter(h => !(h.dia_da_semana === novo.dia_da_semana && h.horario === novo.horario && h.id_turno === novo.id_turno && h.id_periodo == novo.id_periodo));
  horariosSelecionados.push(novo);

  // visual
  celulaAtual.classList.remove("campo-vazio");
  celulaAtual.innerHTML = `
    <div class="cell-content">
      <strong>${disciplinaSelecionada.nome}</strong><br>
      ${professorSelecionado.nome}<br>
      Sala: ${salaSelecionada.nome}
      
    </div>
  `;

  const btnRem = celulaAtual.querySelector(".remover-horario-btn");
  if (btnRem) {
    btnRem.addEventListener("click", (ev) => {
      ev.stopPropagation();
      // remover da memória
      horariosSelecionados = horariosSelecionados.filter(h => !(h.dia_da_semana === novo.dia_da_semana && h.horario === novo.horario && h.id_turno === novo.id_turno && h.id_periodo == novo.id_periodo));
      // marcar célula vazia
      celulaAtual.innerText = "Adicionar +";
      celulaAtual.classList.add("campo-vazio");
    });
  }

  // fechar modal seleção
  fecharModalSelecao();
});

// ============================
// INICIALIZA TABELA: marca células como "Adicionar +" e adiciona listener para abrir modal
// ============================
function inicializarTabelaInterativa() {
  if (!tabela) return;

  tabela.querySelectorAll("tr").forEach((tr) => {
    // ignorar linhas que não são de aula
    if (!tr.dataset.turno) return;

    tr.querySelectorAll("td").forEach((td, colIndex) => {
      if (colIndex === 0) return; // primeira coluna é o horário
      // se vazio, coloca "Adicionar +"
      if (!td.innerHTML.trim()) {
        td.innerText = "Adicionar +";
        td.classList.add("campo-vazio");
      }
      td.addEventListener("click", (e) => {
        if (e.target && e.target.closest(".remover-horario-btn")) return;
        const horario = tr.cells[0].innerText.trim();
        const dia = tabela.rows[0].cells[colIndex].innerText.trim();
        abrirModalSelecao(horario, dia, td);
      });
    });
  });
}
inicializarTabelaInterativa();

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
    const sala = salas.find(s => Number(s.id_sala) === Number(h.id_sala));

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

// ============================
// CRIAR BOTÃO "Salvar horários" DINAMICAMENTE (se não existir no HTML)
// ============================


// ============================
// SALVAR HORÁRIOS (POST/PUT/DELETE) e depois redirecionar para /html/admin/curso.html
// ============================
async function salvarHorarios() {
  try {
    // 1) Para cada item em horariosSelecionados:
    //    - Se já existir um id_horario correspondente (comparando por dia+turno+periodo -> achar em horariosExistentes), faz PUT no id_horario.
    //    - Senão, faz POST (novo)
    for (const h of horariosSelecionados) {
      // procura existente pelo mesmo dia, turno, periodo
      const existente = horariosExistentes.find(he =>
        he.dia_da_semana === h.dia_da_semana &&
        Number(he.id_turno) === Number(h.id_turno) &&
        String(he.id_periodo) === String(h.id_periodo)
      );

      const payload = {
        id_curso: Number(idCurso),
        id_disciplina: h.id_disciplina,
        id_professor: h.id_professor,
        id_sala: h.id_sala,
        id_periodo: h.id_periodo ?? null,
        id_turno: h.id_turno ?? null,
        dia_da_semana: h.dia_da_semana,
        horario: h.horario
      };

      if (existente && existente.id_horario) {
        // atualizar
        await fetch(`${API_HORARIO}/${existente.id_horario}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } else {
        // criar novo e, opcionalmente, obter o id retornado
        const res = await fetch(API_HORARIO, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        // se o backend retornar o novo registro, atualizamos horariosExistentes (opcional)
        if (res.ok) {
          const criado = await res.json().catch(() => null);
          if (criado && criado.id_horario) {
            // atualizar listas locais
            horariosExistentes.push({ ...criado });
          }
        }
      }
    }

    // 2) Remoções: cada horario que estava em horariosExistentes e que já não existe mais em horariosSelecionados deve ser deletado
    for (const he of [...horariosExistentes]) {
      const aindaExiste = horariosSelecionados.find(h =>
        h.dia_da_semana === he.dia_da_semana &&
        Number(h.id_turno) === Number(he.id_turno) &&
        String(h.id_periodo) === String(he.id_periodo)
      );
      if (!aindaExiste) {
        // deletar por id_horario
        if (he.id_horario) {
          await fetch(`${API_HORARIO}/${he.id_horario}`, { method: "DELETE" });
          // remover localmente
          horariosExistentes = horariosExistentes.filter(x => x.id_horario !== he.id_horario);
        }
      }
    }

    // 3) Garantir vinculação curso↔disciplina (POST /curso/disciplina) para disciplinas presentes nos horários
    const disciplinasUnicas = [...new Set(horariosSelecionados.map(h => h.id_disciplina))];
    for (const idDisc of disciplinasUnicas) {
      try {
        await fetch(API_CURSO_DISCIPLINA, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_curso: Number(idCurso), id_disciplina: idDisc })
        });
      } catch (err) {
        console.warn("Falha ao associar curso-disciplina (não bloqueante):", idDisc, err);
      }
    }

    alert("Horários salvos com sucesso!");
    // redireciona para lista de cursos (Opção A)
    window.location.href = "/html/user/horario.html";
  } catch (err) {
    console.error("Erro ao salvar horários:", err);
    alert("Erro ao salvar horários. Veja o console para detalhes.");
  }
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



