// ==============================
// CONFIGURAÇÃO DA API
// ==============================
const API_URL = "https://study-hub-2mr9.onrender.com/disciplina";  

// ==============================
// FUNÇÃO PARA ENVIAR PARA A API
// ==============================
async function enviarParaAPI(dados) {
    try {
        const resposta = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();
        return { ok: resposta.ok, resultado };
    } catch (erro) {
        console.error("Erro ao conectar na API:", erro);
        return { ok: false, resultado: { message: "Falha de conexão com servidor" } };
    }
}

// ==============================
// AÇÃO DO BOTÃO CADASTRAR
// ==============================
document.getElementById("btnCadastrar").addEventListener("click", async () => {
    const nome = document.getElementById("nome").value.trim();
    const tipo = document.getElementById("tipo").value;

    if (!nome) {
        alert("Digite o nome da disciplina!");
        return;
    }

    const dadosDisciplina = {
        nome: nome,
        tipo: tipo,
        id_sala: null // Enviamos null pois o campo foi removido da tela
    };

    console.log("Enviando para API:", dadosDisciplina);

    // Enviando
    const resposta = await enviarParaAPI(dadosDisciplina);

    if (resposta.ok) {
        alert("Disciplina cadastrada com sucesso!");
        // Opcional: Limpar o campo nome após cadastrar
        document.getElementById("nome").value = "";
    } else {
        alert("Erro: " + (resposta.resultado.message || "Erro desconhecido"));
    }
});