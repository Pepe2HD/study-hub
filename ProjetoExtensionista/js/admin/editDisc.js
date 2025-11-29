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

// ==============================
// CONFIGURAÇÃO DAS APIS
// ==============================
const API_DISCIPLINA = "https://study-hub-2mr9.onrender.com/disciplina";
const API_CURSO_DISCIPLINA = "https://study-hub-2mr9.onrender.com/curso/disciplina";


// ==============================
// PEGAR ID DA DISCIPLINA DA URL
// ==============================
const urlParams = new URLSearchParams(window.location.search);
const disciplinaId = urlParams.get("id");

if (!disciplinaId) {
    alert("ID da disciplina não encontrado!");
    window.history.back();
}


// ==============================
// CARREGAR DADOS DA DISCIPLINA
// ==============================
async function carregarDados() {
    try {
        const resposta = await fetch(`${API_DISCIPLINA}/${disciplinaId}`);
        const dados = await resposta.json();

        document.getElementById("nome").value = dados.nome;
        document.getElementById("tipo").value = dados.tipo;

    } catch (erro) {
        console.error("Erro ao carregar disciplina:", erro);
        alert("Não foi possível carregar os dados da disciplina.");
    }
}

carregarDados();


// ==============================
// FUNÇÃO PARA ATUALIZAR DISCIPLINA
// ==============================
async function atualizarDisciplina() {
    const nome = document.getElementById("nome").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (!nome) {
        alert("Digite o nome da disciplina!");
        return;
    }

    const dados = { nome, tipo };

    try {
        const resposta = await fetch(`${API_DISCIPLINA}/${disciplinaId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (!resposta.ok) {
            alert("Erro ao atualizar: " + resultado.message);
            return;
        }

        alert("Disciplina atualizada com sucesso!");

    } catch (erro) {
        console.error("Erro ao atualizar disciplina:", erro);
        alert("Erro de conexão com a API.");
    }
}


// ==============================
// FUNÇÃO PARA ENVIAR ASSOCIAÇÃO CURSO ⇄ DISCIPLINA
// ==============================
async function salvarCursosAssociados(listaCursos) {
    try {
        const resposta = await fetch(API_CURSO_DISCIPLINA, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                disciplina_id: disciplinaId,
                cursos: listaCursos
            })
        });

        return await resposta.json();

    } catch (erro) {
        console.error("Erro ao associar cursos:", erro);
        return { erro: true };
    }
}


// ==============================
// BOTÃO ATUALIZAR
// ==============================
document.getElementById("btnCadastrar").addEventListener("click", async () => {

    // 1) Atualiza disciplina
    await atualizarDisciplina();

    // 2) (OPCIONAL) enviar lista de cursos selecionados
    // pegue IDs dos tags selecionados
    const tags = document.querySelectorAll("#cursosAssociadosTags .tag");
    const listaCursos = [...tags].map(tag => Number(tag.dataset.id));

    await salvarCursosAssociados(listaCursos);

});



