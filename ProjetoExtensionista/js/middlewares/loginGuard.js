import authService from "./authService.js";

async function loginGuard() {

    if (!authService.isLogged()) return;

    const API = "https://study-hub-2mr9.onrender.com";

    const valido = await authService.checkAuth(API);

    if (valido) {
        window.location.href = "/html/admin/homeAdm.html";
    }
}

loginGuard();
export default loginGuard;
