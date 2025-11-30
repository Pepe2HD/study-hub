//-----------------------------------------
// ELEMENTOS DO DOM
//-----------------------------------------
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const btnCadastrar = document.getElementById("btnCadastrar");
const nomeInput = document.getElementById("nome");
const tipoInput = document.getElementById("tipo");

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
// API
//-----------------------------------------
const API_DISC = "https://study-hub-2mr9.onrender.com/disciplina";

//-----------------------------------------
// POP-UP BONITO
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
// BOTÃO CADASTRAR DISCIPLINA
//-----------------------------------------
btnCadastrar.addEventListener("click", async () => {
  const nomeValue = nomeInput.value.trim();
  const tipoValue = tipoInput.value.trim();

  if (!nomeValue) {
    showPopup("Digite o nome da disciplina!", "erro");
    return;
  }

  toggleLoading(true);

  const dadosDisciplina = {
    nome: nomeValue,
    tipo: tipoValue,
    id_sala: null
  };

  try {
    const res = await fetch(API_DISC, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dadosDisciplina)
    });

    const result = await res.json();

    if (!res.ok) {
      showPopup("Erro ao criar a disciplina: " + (result.message || "Erro desconhecido"), "erro");
      return;
    }

    showPopup("Disciplina criada com sucesso!", "sucesso");

    setTimeout(() => {
      window.location.href = "/html/admin/disciplina.html";
    }, 1500);

    nomeInput.value = "";

  } catch (erro) {
    console.error("Erro ao criar disciplina:", erro);
    showPopup("Erro de conexão com o servidor.", "erro");

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

//-----------------------------------------
// BOTÃO VOLTAR COM CONFIRMAÇÃO - 
//-----------------------------------------
const btnVoltar = document.getElementById("btn-voltar"); 

function showConfirmPopup(message, onConfirm) {
  popupText.textContent = message;
  popupTitle.textContent = "Confirmação";
  popupIcon.textContent = "⚠️";

  popup.classList.remove("sucesso", "erro");
  popup.classList.add("confirm");

  const popupBox = popup.querySelector(".popup-box");
  const confirmArea = popupBox.querySelector(".popup-confirm-buttons");
  confirmArea.innerHTML = ""; 
  confirmArea.style.display = "flex"; 
  confirmArea.style.justifyContent = "center";

  const btnNo = document.createElement("button");
  btnNo.textContent = "Não";
  btnNo.className = "popup-btn popup-no";

  const btnYes = document.createElement("button");
  btnYes.textContent = "Sim";
  btnYes.className = "popup-btn popup-yes";


  confirmArea.appendChild(btnNo);
  confirmArea.appendChild(btnYes);

  const btnOk = popupBox.querySelector("#popup-close");
  btnOk.style.visibility = "hidden";

  popup.style.display = "flex";
  setTimeout(() => popup.classList.add("show"), 10);

  btnYes.addEventListener("click", () => {
    hideConfirm();
    if (onConfirm) onConfirm();
  });
  btnNo.addEventListener("click", hideConfirm);

  function hideConfirm() {
    popup.classList.remove("show");
    setTimeout(() => {
      popup.style.display = "none";
      confirmArea.style.display = "none";
      confirmArea.innerHTML = "";
      btnOk.style.visibility = "visible"; 
      popup.classList.remove("confirm");
    }, 250);
  }
}

if (btnVoltar) {
  btnVoltar.addEventListener("click", () => {
    if (nomeInput.value.trim() || hoursInput.value.trim()) {
      showConfirmPopup(
        "Você tem certeza que deseja voltar? As alterações não salvas serão perdidas.",
        () => window.history.back()
      );
    } else {
      window.history.back();
    }
  });
}

