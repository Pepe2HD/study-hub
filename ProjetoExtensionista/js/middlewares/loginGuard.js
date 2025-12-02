import authService from "./authService.js";
const API = "https://study-hub-2mr9.onrender.com";

async function loginGuard() {

    if (!authService.isLogged()) {
        window.location.href = "/html/user/login.html";
        return false;
    }

    const valido = await authService.checkAuth(API);

    if (valido) {
        window.location.href = "/html/admin/homeAdm.html";
        return;
    }

    window.location.href = "/html/user/login.html";
}

document.getElementById("btnLogin").addEventListener("click", ()=> {
    loginGuard();
})
export default loginGuard;
