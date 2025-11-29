const AUTH_KEY = "token"; 

const authService = {
    saveToken(token) {
        localStorage.setItem(AUTH_KEY, token);
    },

    getToken() {
        return localStorage.getItem(AUTH_KEY);
    },

    removeToken() {
        localStorage.removeItem(AUTH_KEY);
    },

    isLogged() {
        const token = this.getToken();
        return token !== null && token !== "";
    },

    async checkAuth(apiBase) {
        const token = this.getToken();
        if (!token) return false;

        try {
            const res = await fetch(`${apiBase}/admin/check-auth`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!res.ok) {
                this.logout();
                return false;
            }

            return true;

        } catch (e) {
            console.error("Erro em checkAuth:", e);
            return false;
        }
    },

    logout() {
        this.removeToken();
        window.location.href = "../user/login.html"; 
    }
};

export default authService;
