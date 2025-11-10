const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
}


document.addEventListener('DOMContentLoaded', function () {
  const btnCadastrar = document.getElementById('btnCadastrar');
  const inputNome = document.getElementById('nome');
  const inputHours = document.getElementById('hours');

  if (btnCadastrar && inputNome && inputHours) {
    btnCadastrar.addEventListener('click', function (event) {
      const nomeValue = inputNome.value.trim();
      const hoursValue = inputHours.value.trim();

      if (nomeValue === "") {
        alert("Por favor, preencha o campo Nome.");
        inputNome.focus();
      }

      if (hoursValue === "") {
        alert("Por favor, preencha o campo de horas.");
        inputHours.focus();
        return;
      }

      alert("Curso atualizado com sucesso!");

      window.location.href = '/html/admin/curso.html';
    });
  }


});

const btnHorario = document.getElementById('btnHorario');
const modal = document.getElementById('modalHorario');
const overlay = document.getElementById('overlay');
const closeModal = document.getElementById('closeModal');

function openModal() {
  if (!modal || !overlay) return;
  modal.style.display = 'block';
  overlay.style.display = 'block';
  document.body.style.overflow = 'hidden';
}

function closeModalFn() {
  if (!modal || !overlay) return;
  modal.style.display = 'none';
  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

if (btnHorario) {
  btnHorario.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
}

if (closeModal) {
  closeModal.addEventListener('click', closeModalFn);
}

if (overlay) {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModalFn();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModalFn();
});

