document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // VIACEP
  // =========================
  const cepInput = document.getElementById("cep");

  if (cepInput) {
    cepInput.addEventListener("blur", async () => {
      const cep = cepInput.value.replace(/\D/g, "");

      if (cep.length !== 8) return;

      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        alert("CEP não encontrado.");
        return;
      }

      document.getElementById("rua").value = dados.logradouro;
      document.getElementById("bairro").value = dados.bairro;
      document.getElementById("cidade").value = dados.localidade;
      document.getElementById("estado").value = dados.uf;
    });
  }


  // =========================
  // CADASTRAR RECLAMAÇÃO
  // =========================
  const btnRegistrar = document.getElementById("btnRegistrar");

  if (btnRegistrar) {
    btnRegistrar.addEventListener("click", () => {
      const nome = document.querySelector('input[placeholder="Nome do cliente"]').value;
      const email = document.querySelector('input[placeholder="E-mail do cliente"]').value;
      const cep = document.getElementById("cep").value;
      const descricao = document.querySelector("textarea").value;
      const categoria = document.querySelector("select").value;

      if (!nome || !email || !cep || !descricao || !categoria) {
        alert("Preencha todos os campos obrigatórios antes de registrar a reclamação.");
        return;
      }

      const novaReclamacao = {
        nome,
        email,
        cep,
        categoria,
        descricao,
        status: "Aberta",
        data: new Date().toLocaleDateString("pt-BR")
      };

      const reclamacoes = JSON.parse(localStorage.getItem("reclamacoes")) || [];
      reclamacoes.push(novaReclamacao);

      localStorage.setItem("reclamacoes", JSON.stringify(reclamacoes));

      document.getElementById("mensagemSucesso").style.display = "block";

      setTimeout(() => {
        window.location.href = "reclamacoes.html";
      }, 1500);
    });
  }


  // =========================
  // CARREGAR RECLAMAÇÕES
  // =========================
  const lista = document.getElementById("listaReclamacoes");

  if (lista) {
    const reclamacoes = JSON.parse(localStorage.getItem("reclamacoes")) || [];

    lista.innerHTML = "";

    reclamacoes.forEach((item, index) => {
      const classeStatus =
        item.status === "Resolvida"
          ? "resolvido"
          : item.status === "Em análise"
          ? "analise"
          : "aberto";

      lista.innerHTML += `
        <article class="complaint-card">
          <div class="status ${classeStatus}">${item.status}</div>
          <h3>${item.categoria}</h3>
          <p>${item.descricao}</p>
          <span>Cliente: ${item.nome}</span>
          <span>Data: ${item.data}</span>
          <a href="detalhes.html?id=${index}" class="btn primary">Ver Detalhes</a>
        </article>
      `;
    });
  }


  // =========================
  // DETALHES DA RECLAMAÇÃO
  // =========================
  const detalhes = document.getElementById("detalhesReclamacao");

  if (detalhes) {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    const reclamacoes = JSON.parse(localStorage.getItem("reclamacoes")) || [];
    const item = reclamacoes[id];

    if (item) {
      const classeStatus =
        item.status === "Resolvida"
          ? "resolvido"
          : item.status === "Em análise"
          ? "analise"
          : "aberto";

      detalhes.innerHTML = `
        <span class="status ${classeStatus}">${item.status}</span>
        <h2>${item.categoria}</h2>
        <p>${item.descricao}</p>

        <div class="details-info">
          <p><strong>Cliente:</strong> ${item.nome}</p>
          <p><strong>E-mail:</strong> ${item.email}</p>
          <p><strong>Categoria:</strong> ${item.categoria}</p>
          <p><strong>CEP:</strong> ${item.cep}</p>
          <p><strong>Data:</strong> ${item.data}</p>
        </div>

        <div class="status-actions">
          <button class="btn secondary" onclick="alterarStatus(${id}, 'Aberta')">Aberta</button>
          <button class="btn secondary" onclick="alterarStatus(${id}, 'Em análise')">Em análise</button>
          <button class="btn secondary" onclick="alterarStatus(${id}, 'Resolvida')">Resolvida</button>
        </div>

        <div class="details-buttons">
        <button class="btn danger" onclick="excluirReclamacao(${id})">
            Excluir Reclamação
        </button>

        <a href="reclamacoes.html" class="btn secondary">
            Voltar para Reclamações
        </a>
        </div>
      `
    }
  }


  // =========================
  // DASHBOARD
  // =========================
  const totalReclamacoes = document.getElementById("totalReclamacoes");

  if (totalReclamacoes) {
    const reclamacoes = JSON.parse(localStorage.getItem("reclamacoes")) || [];

    totalReclamacoes.textContent = reclamacoes.length;

    document.getElementById("emAnalise").textContent =
    reclamacoes.filter(item => item.status === "Em análise").length;

    document.getElementById("resolvidas").textContent =
    reclamacoes.filter(item => item.status === "Resolvida").length;

    document.getElementById("urgentes").textContent =
    reclamacoes.filter(item => item.categoria === "Suporte Técnico").length;
  }


   // =========================
   // ESTATÍSTICAS
   // =========================
    const statEntrega = document.getElementById("statEntrega");

    if (statEntrega) {
    const reclamacoes = JSON.parse(localStorage.getItem("reclamacoes")) || [];
    const total = reclamacoes.length || 1;

    const atualizarBarra = (id, categoria) => {
        const qtd = reclamacoes.filter(item => item.categoria === categoria).length;
        const porcentagem = (qtd / total) * 100;

        const barra = document.getElementById(id);
        barra.textContent = `${categoria} - ${qtd}`;
        barra.style.setProperty("--valor", `${porcentagem}%`);
    };

    atualizarBarra("statEntrega", "Entrega");
    atualizarBarra("statProduto", "Produto");
    atualizarBarra("statPagamento", "Pagamento");
    atualizarBarra("statAtendimento", "Atendimento");
    atualizarBarra("statSuporte", "Suporte Técnico");

    const totalReal = reclamacoes.length || 1;

        const abertas = reclamacoes.filter(item => {
        const status = item.status?.toLowerCase();
        return status === "aberta" || status === "aberto" || status === "em aberto";
        }).length;

        const analise = reclamacoes.filter(item => {
        const status = item.status?.toLowerCase();
        return status === "em análise" || status === "em analise" || status === "analise";
        }).length;

        const resolvidas = reclamacoes.filter(item => {
        const status = item.status?.toLowerCase();
        return status === "resolvida" || status === "resolvido";
        }).length;

    document.getElementById("percResolvidas").textContent =
    `${Math.round((resolvidas / totalReal) * 100)}%`;

    document.getElementById("percAnalise").textContent =
    `${Math.round((analise / totalReal) * 100)}%`;

    document.getElementById("percAbertas").textContent =
    `${Math.round((abertas / totalReal) * 100)}%`;
}
});


// =========================
// ALTERAR STATUS
// =========================
function alterarStatus(id, novoStatus) {
  const reclamacoes = JSON.parse(localStorage.getItem("reclamacoes")) || [];

  reclamacoes[id].status = novoStatus;

  localStorage.setItem("reclamacoes", JSON.stringify(reclamacoes));

  location.reload();
}


  function excluirReclamacao(id) {
  const reclamacoes = JSON.parse(localStorage.getItem("reclamacoes")) || [];

  reclamacoes.splice(id, 1);

  localStorage.setItem("reclamacoes", JSON.stringify(reclamacoes));

  window.location.href = "reclamacoes.html";
}