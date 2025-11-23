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
// CADASTRAR SALA
//-----------------------------------------
const btnCadastrar = document.getElementById('btnCadastrar');

btnCadastrar.addEventListener('click', async () => {
  const nome = document.getElementById('nome').value.trim();
  const bloco = document.getElementById('bloco').value.trim();
  const capacidade = document.getElementById('capacidade').value.trim();

  if (!nome) return alert("Digite o nome da sala.");
  if (!bloco) return alert("Digite o bloco.");
  if (!capacidade) return alert("Digite a capacidade.");

  try {
    const res = await fetch("https://study-hub-2mr9.onrender.com/sala", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome,
        bloco: bloco,
        capacidade: parseInt(capacidade)
      })
    });

    if (!res.ok) throw new Error("Erro ao cadastrar sala.");

    const salaCriada = await res.json();
    alert(`Sala "${salaCriada.nome}" cadastrada com sucesso!`);
    
    document.getElementById('nome').value = "";
    document.getElementById('bloco').value = "";
    document.getElementById('capacidade').value = "";

    window.location.href = "/html/admin/sala.html";

  } catch (err) {
    alert("Erro: " + err.message);
  }
});

