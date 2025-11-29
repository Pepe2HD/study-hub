import authService from "./authService.js";
const API= "https://study-hub-2mr9.onrender.com";

async function adminAuthGuard() {

    if (!authService.isLogged()) {
        window.location.href = "../user/login.html";
        return;
    }

    const valido = await authService.checkAuth(API);

    if (!valido) {
        authService.logout();
        return;
    }
}

adminAuthGuard();

document.addEventListener("DOMContentLoaded", () => {
    const btn = document.getElementById("logoutBtn");

    if (!btn) return;

    btn.addEventListener("click", (e) => {
        e.preventDefault();
        authService.logout(); 
        window.location.href = window.location.href = "../user/login.html";
    });
});

export default adminAuthGuard;
