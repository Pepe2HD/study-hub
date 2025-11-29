//-----------------------------------------
// ELEMENTOS DO DOM
//-----------------------------------------
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const btnCadastrar = document.getElementById("btnCadastrar");

const nomeInput = document.getElementById("nome");
const blocoInput = document.getElementById("bloco");
const capacidadeInput = document.getElementById("capacidade");

//-----------------------------------------
// MENU LATERAL
//-----------------------------------------
if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
}

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
  setTimeout(() => {
    popup.style.display = "none";
  }, 250);
}

popupClose.addEventListener("click", hidePopup);

//-----------------------------------------
// LOADING DO BOTÃO
//-----------------------------------------
function toggleLoading(isLoading) {
  if (isLoading) {
    btnCadastrar.classList.add("loading");
    btnCadastrar.textContent = "Cadastrando...";
    btnCadastrar.disabled = true;
  } else {
    btnCadastrar.classList.remove("loading");
    btnCadastrar.textContent = "Cadastrar";
    btnCadastrar.disabled = false;
  }
}

//-----------------------------------------
// API
//-----------------------------------------
const API_SALA = "https://study-hub-2mr9.onrender.com/sala";

//-----------------------------------------
// BOTÃO CADASTRAR SALA
//-----------------------------------------
btnCadastrar.addEventListener("click", async () => {
  const nomeValue = nomeInput.value.trim();
  const blocoValue = blocoInput.value.trim();
  const capacidadeValue = capacidadeInput.value.trim();

  // Validações
  if (!nomeValue || !blocoValue || !capacidadeValue) {
    showPopup("Preencha todos os campos.", "erro");
    return;
  }

  toggleLoading(true);

  try {
    const res = await fetch(API_SALA, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: nomeValue,
        bloco: blocoValue,
        capacidade: parseInt(capacidadeValue)
      })
    });

    if (!res.ok) {
      const msg = await res.text();
      showPopup("Erro ao cadastrar a sala: " + msg, "erro");
      return;
    }

    showPopup("Sala cadastrada com sucesso!", "sucesso");

    setTimeout(() => {
      window.location.href = "/html/admin/sala.html";
    }, 1500);

  } catch (erro) {
    console.error("Erro ao criar sala:", erro);
    showPopup("Erro ao criar sala. Verifique sua conexão.", "erro");

  } finally {
    toggleLoading(false);
  }
});

//-----------------------------------------
// ENVIAR COM ENTER
//-----------------------------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !btnCadastrar.disabled) {
    btnCadastrar.click();
  }
});
