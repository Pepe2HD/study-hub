const menuBtn = document.getElementById('menu-btn');
const sidebar = document.getElementById('sidebar');

if (menuBtn && sidebar) {
  menuBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    menuBtn.classList.toggle('active');
  });
}

const btnHorario = document.getElementById('btnHorario');
const btnHorario2 = document.getElementById('btnHorario2');
const modal = document.getElementById('modal');
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

if (btnHorario || btnHorario2) {
  btnHorario.addEventListener('click', (e) => {
    e.preventDefault();
    openModal();
  });
  btnHorario2.addEventListener('click', (e) => {
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
