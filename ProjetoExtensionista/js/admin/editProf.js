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
const API_PROFESSOR = "https://study-hub-2mr9.onrender.com/professor";

//-----------------------------------------
// PEGAR ID DA URL
//-----------------------------------------
const params = new URLSearchParams(window.location.search);
const professorId = params.get("id");

if (!professorId) {
  showPopup("Professor não encontrado.", "erro");
  setTimeout(() => window.location.href = "/html/admin/prof.html", 1500);
}

//-----------------------------------------
// ELEMENTOS DO DOM
//-----------------------------------------
const inputNome = document.getElementById("nome");
const inputEmail = document.getElementById("email");
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
// CARREGAR DADOS DO PROFESSOR
//-----------------------------------------
async function carregarProfessor() {
  toggleLoading(true);
  btnSalvar.textContent = "Carregando...";

  try {
    const res = await fetch(`${API_PROFESSOR}/${professorId}`);

    if (!res.ok) {
      showPopup("Erro ao carregar professor.", "erro");
      return;
    }

    const prof = await res.json();

    inputNome.value = prof.nome ?? "";
    inputEmail.value = prof.email ?? "";

  } catch (erro) {
    console.error("Erro ao carregar:", erro);
    showPopup("Erro interno ao carregar dados.", "erro");
  } finally {
    toggleLoading(false);
  }
}

carregarProfessor();

//-----------------------------------------
// ATUALIZAR PROFESSOR
//-----------------------------------------
async function atualizarProfessor() {
  const nome = inputNome.value.trim();
  const email = inputEmail.value.trim();

  if (!nome) {
    showPopup("Digite o nome do professor.", "erro");
    return false;
  }

  if (!email || !email.includes("@") || !email.includes(".")) {
    showPopup("Digite um e-mail válido.", "erro");
    return false;
  }

  try {
    const res = await fetch(`${API_PROFESSOR}/${professorId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      showPopup("Erro ao atualizar professor: " + txt, "erro");
      return false;
    }

    return true;

  } catch (erro) {
    console.error("Erro ao atualizar:", erro);
    showPopup("Erro ao salvar professor.", "erro");
    return false;
  }
}

//-----------------------------------------
// BOTÃO SALVAR ALTERAÇÕES
//-----------------------------------------
btnSalvar.addEventListener("click", async () => {
  toggleLoading(true);

  const ok = await atualizarProfessor();
  if (!ok) {
    toggleLoading(false);
    return;
  }

  showPopup("Professor atualizado com sucesso!", "sucesso");

  setTimeout(() => {
    window.location.href = "/html/admin/prof.html";
  }, 1500);

  toggleLoading(false);
});

//-----------------------------------------
// ENVIAR COM ENTER
//-----------------------------------------
document.addEventListener("keydown", e => {
  if (e.key === "Enter") btnSalvar.click();
});
