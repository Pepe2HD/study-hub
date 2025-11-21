// ------------------------------------------
// URLs
// ------------------------------------------
const API_DISCIPLINA = "https://study-hub-7qc5.onrender.com/disciplina";
const API_SALA = "https://study-hub-7qc5.onrender.com/sala";
const API_CURSO = "https://study-hub-7qc5.onrender.com/curso";
const API_CURSO_DISCIPLINA = "https://study-hub-7qc5.onrender.com/curso/disciplina";

// ------------------------------------------
// Carregar Salas
// ------------------------------------------
async function carregarSalas() {
  const select = document.getElementById("id_sala");

  try {
    const res = await fetch(API_SALA);
    const dados = await res.json();

    dados.forEach(s => {
      const option = document.createElement("option");
      option.value = s.id_sala;
      option.textContent = s.nome;
      select.appendChild(option);
    });

  } catch (err) {
    alert("Erro ao carregar salas.");
  }
}

// ------------------------------------------
// Carregar Cursos
// ------------------------------------------
async function carregarCursos() {
  const container = document.getElementById("listaCursos");

  try {
    const res = await fetch(API_CURSO);
    const cursos = await res.json();

    cursos.forEach(c => {
      const div = document.createElement("div");
      div.classList.add("checkbox-item");

      div.innerHTML = `
        <label>
          <input type="checkbox" value="${c.id_curso}">
          ${c.nome}
        </label>
      `;

      container.appendChild(div);
    });

  } catch (err) {
    alert("Erro ao carregar cursos.");
  }
}

// ------------------------------------------
// Salvar Disciplina
// ------------------------------------------
document.getElementById("btnSalvar").addEventListener("click", async () => {
  const nome = document.getElementById("nome").value.trim();
  const tipo = document.getElementById("tipo").value.trim();
  const id_sala = document.getElementById("id_sala").value;

  if (!nome || !tipo || !id_sala) {
    return alert("Preencha todos os campos.");
  }

  try {
    // 1️⃣ Criar a disciplina
    const res = await fetch(API_DISCIPLINA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, tipo, id_sala: Number(id_sala) })
    });

    const novaDisciplina = await res.json();
    const id_disciplina = novaDisciplina.id_disciplina;

    // 2️⃣ Associar cursos
    const cursosMarcados = [...document.querySelectorAll("#listaCursos input:checked")]
      .map(check => Number(check.value));

    for (const idCurso of cursosMarcados) {
      await fetch(API_CURSO_DISCIPLINA, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_curso: idCurso,
          id_disciplina
        })
      });
    }

    alert("Disciplina criada com sucesso!");
    window.location.href = "/html/admin/disciplina.html";

  } catch (err) {
    alert("Erro ao criar disciplina.");
  }
});

// Carregar dados iniciais
carregarSalas();
carregarCursos();
