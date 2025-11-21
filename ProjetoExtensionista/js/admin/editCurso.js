// editCurso-simples.js
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
// BASE DA API (hospedada)
//-----------------------------------------
const API_BASE = "https://study-hub-7qc5.onrender.com";

//-----------------------------------------
// PEGAR ID DO CURSO DA URL
//-----------------------------------------
const params = new URLSearchParams(window.location.search);
const idCurso = params.get("id");

if (!idCurso) {
    alert("Curso não encontrado.");
    window.location.href = "/html/admin/curso.html";
}

//-----------------------------------------
// ELEMENTOS
//-----------------------------------------
const inputNome = document.getElementById("nome");
const inputCarga = document.getElementById("hours");
const btnSalvar = document.getElementById("btnAtualizar");

//-----------------------------------------
// CARREGAR CURSO
//-----------------------------------------
async function carregarCurso() {
    try {
        const res = await fetch(`${API_BASE}/curso/${idCurso}`);
        if (!res.ok) throw new Error(`Resposta não OK: ${res.status}`);
        const curso = await res.json();

        inputNome.value = curso.nome ?? "";
        inputCarga.value = curso.carga_horaria ?? "";

    } catch (error) {
        console.error("Erro ao carregar curso:", error);
        alert("Erro ao carregar dados do curso. Veja o console para detalhes.");
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
        alert("Preencha todos os campos.");
        return;
    }

    const carga = Number(cargaRaw);
    if (!Number.isFinite(carga) || carga <= 0) {
        alert("Informe uma carga horária válida (número maior que 0).");
        return;
    }

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
            throw new Error(`Status ${res.status} ${txt}`);
        }

        alert("Curso atualizado com sucesso!");
        window.location.href = "/html/admin/curso.html";

    } catch (error) {
        console.error("Erro ao salvar alterações:", error);
        alert("Erro ao salvar alterações. Veja o console para detalhes.");
    }
});
