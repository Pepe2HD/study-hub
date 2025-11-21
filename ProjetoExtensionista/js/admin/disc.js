const API_DISCIPLINA = "https://study-hub-7qc5.onrender.com/disciplina";
const API_SALA = "https://study-hub-7qc5.onrender.com/sala";
const API_CURSO = "https://study-hub-7qc5.onrender.com/curso";
const API_CURSO_DISCIPLINA = "https://study-hub-7qc5.onrender.com/curso/disciplina";

async function carregarDisciplinas() {
  const tabela = document.getElementById("tabelaDisciplina");
  tabela.innerHTML = "";

  const [resD, resS, resC, resCD] = await Promise.all([
    fetch(API_DISCIPLINA),
    fetch(API_SALA),
    fetch(API_CURSO),
    fetch(API_CURSO_DISCIPLINA)
  ]);

  const disciplinas = await resD.json();
  const salas = await resS.json();
  const cursos = await resC.json();
  const cursoDisc = await resCD.json();

  disciplinas.forEach(d => {
    const sala = salas.find(s => s.id_sala === d.id_sala)?.nome || "—";
    const cursosDaDisciplina = cursoDisc
      .filter(cd => cd.id_disciplina === d.id_disciplina)
      .map(cd => cursos.find(c => c.id_curso === cd.id_curso)?.nome);

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${d.id_disciplina}</td>
      <td>${d.nome}</td>
      <td>${d.tipo}</td>
      <td>${sala}</td>
      <td>${cursosDaDisciplina.join(", ") || "—"}</td>

      <td>
        <button class="btn-edit" onclick="editar(${d.id_disciplina})">Editar</button>
        <button class="btn-delete" onclick="excluir(${d.id_disciplina})">Excluir</button>
      </td>
    `;

    tabela.appendChild(tr);
  });
}

function editar(id) {
  window.location.href = `/html/admin/editDisciplina.html?id=${id}`;
}

async function excluir(id) {
  if (!confirm("Deseja realmente excluir?")) return;

  await fetch(`${API_DISCIPLINA}/${id}`, { method: "DELETE" });

  alert("Disciplina excluída.");
  carregarDisciplinas();
}

carregarDisciplinas();
