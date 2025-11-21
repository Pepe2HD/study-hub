const API_DISCIPLINA = "https://study-hub-7qc5.onrender.com/disciplina";
const API_SALA = "https://study-hub-7qc5.onrender.com/sala";
const API_CURSO = "https://study-hub-7qc5.onrender.com/curso";
const API_CURSO_DISC = "https://study-hub-7qc5.onrender.com/curso/disciplina";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

// ------------------------------------
// Carregar dados iniciais
// ------------------------------------
async function carregarDados() {
  const [resD, resS, resC, resCD] = await Promise.all([
    fetch(`${API_DISCIPLINA}/${id}`),
    fetch(API_SALA),
    fetch(API_CURSO),
    fetch(API_CURSO_DISC)
  ]);

  const disciplina = await resD.json();
  const salas = await resS.json();
  const cursos = await resC.json();
  const cursosDisc = await resCD.json();

  // Preencher campos
  document.getElementById("nome").value = disciplina.nome;
  document.getElementById("tipo").value = disciplina.tipo;

  const selectSala = document.getElementById("id_sala");
  salas.forEach(s => {
    const op = document.createElement("option");
    op.value = s.id_sala;
    op.textContent = s.nome;
    if (s.id_sala === disciplina.id_sala) op.selected = true;
    selectSala.appendChild(op);
  });

  // Cursos associados
  const associados = cursosDisc
    .filter(cd => cd.id_disciplina === disciplina.id_disciplina)
    .map(cd => cd.id_curso);

  // Lista de cursos
  const lista = document.getElementById("listaCursos");
  cursos.forEach(c => {
    const div = document.createElement("div");
    div.classList.add("checkbox-item");

    div.innerHTML = `
      <label>
        <input type="checkbox" value="${c.id_curso}"
        ${associados.includes(c.id_curso) ? "checked" : ""}>
        ${c.nome}
      </label>
    `;

    lista.appendChild(div);
  });
}

// ------------------------------------
// Salvar alterações
// ------------------------------------
document.getElementById("btnSalvar").addEventListener("click", async () => {
  const nome = document.getElementById("nome").value.trim();
  const tipo = document.getElementById("tipo").value.trim();
  const id_sala = document.getElementById("id_sala").value;

  await fetch(`${API_DISCIPLINA}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nome, tipo, id_sala: Number(id_sala) })
  });

  // Atualizar cursos associados
  const cursosMarcados = [...document.querySelectorAll("input:checked")]
    .map(c => Number(c.value));

  await fetch(`${API_CURSO_DISC}/disciplina/${id}`, {
    method: "DELETE"
  });

  for (const idCurso of cursosMarcados) {
    await fetch(API_CURSO_DISC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id_curso: idCurso, id_disciplina: Number(id) })
    });
  }

  alert("Disciplina atualizada!");
  window.location.href = "/html/admin/disciplina.html";
});

carregarDados();
