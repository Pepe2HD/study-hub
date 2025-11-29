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
const API_BASE = "https://study-hub-2mr9.onrender.com";

//-----------------------------------------
// PEGAR ID DO CURSO DA URL
//-----------------------------------------
const params = new URLSearchParams(window.location.search);
const idCurso = params.get("id");

if (!idCurso) {
  showPopup("Curso não encontrado.", "erro");
  setTimeout(() => {
    window.location.href = "/html/admin/curso.html";
  }, 1500);
}

//-----------------------------------------
// ELEMENTOS DO DOM
//-----------------------------------------
const inputNome = document.getElementById("nome");
const inputCarga = document.getElementById("hours");
const btnSalvar = document.getElementById("btnAtualizar");

//-----------------------------------------
// POP-UP PROFISSIONAL
//-----------------------------------------
const popup = document.getElementById("popup");
const popupText = document.getElementById("popup-text");
const popupTitle = document.getElementById("popup-title");
const popupIcon = document.querySelector(".popup-icon");
const popupClose = document.getElementById("popup-close");

function showPopup(message, type = "erro") {
  popupText.textContent = message;

  popup.classList.remove("sucesso", "erro");
  popup.classList.add(type);

  if (type === "sucesso") {
    popupTitle.textContent = "Sucesso!";
    popupIcon.innerHTML = "✔️";
  } else {
    popupTitle.textContent = "Erro!";
    popupIcon.innerHTML = "❌";
  }

  popup.style.display = "flex";

  setTimeout(() => {
    popup.classList.add("show");
  }, 10);
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
    btnSalvar.classList.add("loading");
    btnSalvar.textContent = "Salvando...";
    btnSalvar.disabled = true;
  } else {
    btnSalvar.classList.remove("loading");
    btnSalvar.textContent = "Salvar Alterações";
    btnSalvar.disabled = false;
  }
}

//-----------------------------------------
// CARREGAR CURSO EXISTENTE
//-----------------------------------------
async function carregarCurso() {
  toggleLoading(true);
  btnSalvar.textContent = "Carregando...";

  try {
    const res = await fetch(`${API_BASE}/curso/${idCurso}`);

    if (!res.ok) {
      showPopup("Erro ao carregar curso.", "erro");
      return;
    }

    const curso = await res.json();

    inputNome.value = curso.nome ?? "";
    inputCarga.value = curso.carga_horaria ?? "";

  } catch (error) {
    console.error("Erro ao carregar curso:", error);
    showPopup("Erro interno ao carregar curso.", "erro");
  } finally {
    toggleLoading(false);
  }
}

carregarCurso();

//-----------------------------------------
// SALVAR ALTERAÇÕES
//-----------------------------------------
btnSalvar.addEventListener("click", async () => {
  const nome = inputNome.value.trim();
  const cargaRaw = inputCarga.value.trim();

  if (!nome || !cargaRaw) {
    showPopup("Preencha todos os campos.", "erro");
    return;
  }

  const carga = Number(cargaRaw);

  if (!Number.isFinite(carga) || carga <= 0) {
    showPopup("Informe uma carga horária válida (maior que 0).", "erro");
    return;
  }

  toggleLoading(true);

  try {
    const res = await fetch(`${API_BASE}/curso/${idCurso}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nome,
        carga_horaria: carga
      })
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      showPopup("Erro ao atualizar: " + txt, "erro");
      return;
    }

    showPopup("Curso atualizado com sucesso!", "sucesso");

    setTimeout(() => {
      window.location.href = "/html/admin/curso.html";
    }, 1500);

  } catch (error) {
    console.error("Erro ao salvar alterações:", error);
    showPopup("Falha ao salvar. Verifique sua conexão.", "erro");

  } finally {
    toggleLoading(false);
  }
});

//-----------------------------------------
// ENVIAR COM ENTER
//-----------------------------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnSalvar.click();
});
