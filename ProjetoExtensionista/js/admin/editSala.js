//-----------------------------------------
// MENU LATERAL
//-----------------------------------------
const menuBtn = document.getElementById("menu-btn");
const sidebar = document.getElementById("sidebar");

if (menuBtn && sidebar) {
  menuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    menuBtn.classList.toggle("active");
  });
}

//-----------------------------------------
// API
//-----------------------------------------
const API_SALA = "https://study-hub-2mr9.onrender.com/sala";

//-----------------------------------------
// PEGAR ID DA URL
//-----------------------------------------
const params = new URLSearchParams(window.location.search);
const salaId = params.get("id");

if (!salaId) {
  showPopup("Sala não encontrada.", "erro");
  setTimeout(() => window.location.href = "/html/admin/sala.html", 1500);
}

//-----------------------------------------
// ELEMENTOS DO DOM
//-----------------------------------------
const inputNome = document.getElementById("nome");
const inputBloco = document.getElementById("bloco");
const inputCapacidade = document.getElementById("capacidade");
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

  popupTitle.textContent = type === "sucesso" ? "Sucesso!" : "Erro!";
  popupIcon.innerHTML = type === "sucesso" ? "✔️" : "❌";

  popup.style.display = "flex";
  setTimeout(() => popup.classList.add("show"), 10);
}

function hidePopup() {
  popup.classList.remove("show");
  setTimeout(() => popup.style.display = "none", 250);
}

popupClose.addEventListener("click", hidePopup);

//-----------------------------------------
// BOTÃO COM LOADING
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
// CARREGAR SALA
//-----------------------------------------
async function carregarSala() {
  toggleLoading(true);
  btnSalvar.textContent = "Carregando...";

  try {
    const res = await fetch(`${API_SALA}/${salaId}`);

    if (!res.ok) {
      showPopup("Erro ao carregar sala.", "erro");
      return;
    }

    const sala = await res.json();

    inputNome.value = sala.nome ?? "";
    inputBloco.value = sala.bloco ?? "";
    inputCapacidade.value = sala.capacidade ?? "";

  } catch (erro) {
    console.error("Erro ao carregar:", erro);
    showPopup("Erro interno ao carregar dados.", "erro");
  } finally {
    toggleLoading(false);
  }
}

carregarSala();

//-----------------------------------------
// ATUALIZAR SALA
//-----------------------------------------
async function atualizarSala() {
  const nome = inputNome.value.trim();
  const bloco = inputBloco.value.trim();
  const capacidade = inputCapacidade.value.trim();

  if (!nome) {
    showPopup("Digite o nome da sala.", "erro");
    return false;
  }

  if (!bloco) {
    showPopup("Digite o bloco da sala.", "erro");
    return false;
  }

  if (!capacidade || isNaN(capacidade) || Number(capacidade) <= 0) {
    showPopup("Informe uma capacidade válida.", "erro");
    return false;
  }

  try {
    const res = await fetch(`${API_SALA}/${salaId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome,
        bloco,
        capacidade: Number(capacidade)
      })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      showPopup("Erro ao atualizar sala: " + txt, "erro");
      return false;
    }

    return true;

  } catch (erro) {
    console.error("Erro ao atualizar:", erro);
    showPopup("Erro interno ao salvar sala.", "erro");
    return false;
  }
}

//-----------------------------------------
// SALVAR ALTERAÇÕES
//-----------------------------------------
btnSalvar.addEventListener("click", async () => {
  toggleLoading(true);

  const ok = await atualizarSala();
  if (!ok) {
    toggleLoading(false);
    return;
  }

  showPopup("Sala atualizada com sucesso!", "sucesso");

  setTimeout(() => {
    window.location.href = "/html/admin/sala.html";
  }, 1500);

  toggleLoading(false);
});

//-----------------------------------------
// ENVIAR COM ENTER
//-----------------------------------------
document.addEventListener("keydown", e => {
  if (e.key === "Enter") btnSalvar.click();
});
