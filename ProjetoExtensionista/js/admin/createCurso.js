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
// API
//-----------------------------------------
const API_CURSO = "https://study-hub-7qc5.onrender.com/curso";

//-----------------------------------------
// BOTÃO CADASTRAR CURSO
//-----------------------------------------
document.getElementById("btnCadastrar").addEventListener("click", async () => {
  const nomeValue = document.getElementById("nome").value.trim();
  const hoursValue = document.getElementById("hours").value.trim();

  if (!nomeValue) {
    alert("Digite o nome do curso.");
    return;
  }

  if (!hoursValue) {
    alert("Digite a carga horária do curso.");
    return;
  }

  try {
    const res = await fetch(API_CURSO, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nomeValue,
        carga_horaria: parseInt(hoursValue)
      })
    });

    if (!res.ok) {
      alert("Erro ao criar o curso.");
      return;
    }

    alert("Curso criado com sucesso!");

    window.location.href = "/html/admin/curso.html";

  } catch (erro) {
    console.error("Erro ao criar curso:", erro);
    alert("Erro ao criar curso.");
  }
});
