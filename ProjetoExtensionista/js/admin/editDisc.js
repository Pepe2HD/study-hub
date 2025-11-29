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
// API BASE
//-----------------------------------------
const API_DISCIPLINA = "https://study-hub-2mr9.onrender.com/disciplina";

//-----------------------------------------
// PEGAR ID DA DISCIPLINA
//-----------------------------------------
const params = new URLSearchParams(window.location.search);
const disciplinaId = params.get("id");

if (!disciplinaId) {
  showPopup("Disciplina não encontrada.", "erro");
  setTimeout(() => window.location.href = "/html/admin/disciplina.html", 1500);
}

//-----------------------------------------
// ELEMENTOS DO DOM
//-----------------------------------------
const inputNome = document.getElementById("nome");
const inputTipo = document.getElementById("tipo");
const btnSalvar = document.getElementById("btnCadastrar");

//-----------------------------------------
// POPUP PROFISSIONAL
//-----------------------------------------
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupTitle = document.getElementById("popup-title");
const popupIcon = document.querySelector(".popup-icon");
const popupClose = document.getElementById("popup-close");

function showPopup(message, type = "erro") {
  popupText.textContent = message;

  popup.classList.remove("erro", "sucesso");
  popup.classList.add(type);

  if (type === "sucesso") {
    popupTitle.textContent = "Sucesso!";
    popupIcon.innerHTML = "✔️";
  } else {
    popupTitle.textContent = "Erro!";
    popupIcon.innerHTML = "❌";
  }

  popup.style.display = "flex";
  setTimeout(() => popup.classList.add("show"), 10);
}

function hidePopup() {
  popup.classList.remove("show");
  setTimeout(() => popup.style.display = "none", 250);
}

popupClose.addEventListener("click", hidePopup);

//-----------------------------------------
// LOADING DO BOTÃO
//-----------------------------------------
function toggleLoading(isLoading) {
  if (isLoading) {
    btnSalvar.disabled = true;
    btnSalvar.textContent = "Salvando...";
    btnSalvar.classList.add("loading");
  } else {
    btnSalvar.disabled = false;
    btnSalvar.textContent = "Salvar Alterações";
    btnSalvar.classList.remove("loading");
  }
}

//-----------------------------------------
// CARREGAR DISCIPLINA
//-----------------------------------------
async function carregarDados() {
  toggleLoading(true);
  btnSalvar.textContent = "Carregando...";

  try {
    const res = await fetch(`${API_DISCIPLINA}/${disciplinaId}`);

    if (!res.ok) {
      showPopup("Erro ao carregar disciplina.", "erro");
      return;
    }

    const disc = await res.json();

    inputNome.value = disc.nome ?? "";
    inputTipo.value = disc.tipo ?? "";

  } catch (erro) {
    console.error("Erro ao carregar:", erro);
    showPopup("Erro interno ao carregar dados.", "erro");
  } finally {
    toggleLoading(false);
  }
}

carregarDados();

//-----------------------------------------
// ATUALIZAR DISCIPLINA
//-----------------------------------------
async function atualizarDisciplina() {
  const nome = inputNome.value.trim();
  const tipo = inputTipo.value;

  if (!nome) {
    showPopup("Digite o nome da disciplina.", "erro");
    return false;
  }

  try {
    const res = await fetch(`${API_DISCIPLINA}/${disciplinaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, tipo })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      showPopup("Erro ao atualizar disciplina: " + txt, "erro");
      return false;
    }

    return true;

  } catch (erro) {
    console.error("Erro ao atualizar disciplina:", erro);
    showPopup("Erro ao salvar disciplina.", "erro");
    return false;
  }
}

//-----------------------------------------
// BOTÃO SALVAR ALTERAÇÕES
//-----------------------------------------
btnSalvar.addEventListener("click", async () => {
  toggleLoading(true);

  const ok = await atualizarDisciplina();

  if (!ok) {
    toggleLoading(false);
    return;
  }

  showPopup("Disciplina atualizada com sucesso!", "sucesso");

  setTimeout(() => {
    window.location.href = "/html/admin/disciplina.html";
  }, 1500);

  toggleLoading(false);
});

//-----------------------------------------
// ENVIAR COM ENTER
//-----------------------------------------
document.addEventListener("keydown", e => {
  if (e.key === "Enter") btnSalvar.click();
});
