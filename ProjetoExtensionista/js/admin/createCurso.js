//-----------------------------------------
// ELEMENTOS DO DOM
//-----------------------------------------
const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');
const btnCadastrar = document.getElementById("btnCadastrar");
const nomeInput = document.getElementById("nome");
const hoursInput = document.getElementById("hours");


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
const API_CURSO = "https://study-hub-2mr9.onrender.com/curso";

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
// BOTÃO CADASTRAR CURSO
//-----------------------------------------
btnCadastrar.addEventListener("click", async () => {
  const nomeValue = nomeInput.value.trim();
  const hoursValue = hoursInput.value.trim();

  if (!nomeValue || !hoursValue) {
    showPopup("Preencha todos os campos.", "erro");
    return;
  }

  toggleLoading(true);

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
      const errorText = await res.text();
      showPopup("Erro ao criar o curso: " + errorText, "erro");
      return;
    }

    showPopup("Curso criado com sucesso!", "sucesso");

    setTimeout(() => {
      window.location.href = "/html/admin/curso.html";
    }, 1500);

  } catch (erro) {
    console.error("Erro ao criar curso:", erro);
    showPopup("Erro ao criar curso. Verifique sua conexão.", "erro");

  } finally {
    toggleLoading(false);
  }
});

//-----------------------------------------
// ENVIAR COM ENTER
//-----------------------------------------
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") btnCadastrar.click();
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
  btnYes.id = "popup-confirm";
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

