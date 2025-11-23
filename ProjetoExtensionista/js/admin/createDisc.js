// ==============================
// CONFIGURAÇÃO DA API
// ==============================
const API_URL = "https://study-hub-2mr9.onrender.com/disciplina";  
// Se quiser mudar a rota, basta alterar a constante acima.


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
    const salaSelect = document.getElementById("sala");

    // id_sala pode ser null
    const id_sala = salaSelect.value === "" ? null : Number(salaSelect.value);

    if (!nome) {
        alert("Digite o nome da disciplina!");
        return;
    }

    const dadosDisciplina = {
        nome: nome,
        tipo: tipo,
        id_sala: id_sala
    };

    console.log("Enviando para API:", dadosDisciplina);

    // Enviando
    const resposta = await enviarParaAPI(dadosDisciplina);

    if (resposta.ok) {
        alert("Disciplina cadastrada com sucesso!");
    } else {
        alert("Erro: " + resposta.resultado.message);
    }
});
