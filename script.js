document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // VIACEP
  // =========================

const cepInput = document.getElementById("cep");

if (cepInput) {
  const limparEndereco = () => {
    document.getElementById("rua").value = "";
    document.getElementById("bairro").value = "";
    document.getElementById("cidade").value = "";
    document.getElementById("estado").value = "";
  };

  cepInput.addEventListener("input", () => {
    limparEndereco();
  });

  cepInput.addEventListener("blur", async () => {
    const cep = cepInput.value.replace(/\D/g, "");

    limparEndereco();

    if (cep.length !== 8) {
      alert("CEP inválido. Digite um CEP com 8 números.");
      return;
    }

    try {
      const resposta = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const dados = await resposta.json();

      if (dados.erro) {
        alert("CEP não encontrado.");
        limparEndereco();
        return;
      }

      document.getElementById("rua").value = dados.logradouro;
      document.getElementById("bairro").value = dados.bairro;
      document.getElementById("cidade").value = dados.localidade;
      document.getElementById("estado").value = dados.uf;
    } catch (erro) {
      alert("Erro ao buscar o CEP.");
      limparEndereco();
    }
  });
}


  // =========================
  // CADASTRAR RECLAMAÇÃO
  // =========================
 const btnRegistrar = document.getElementById("btnRegistrar");

if (btnRegistrar) {
  btnRegistrar.addEventListener("click", () => {
    const nome = document.querySelector('input[placeholder="Nome do cliente"]').value.trim();
    const email = document.querySelector('input[placeholder="E-mail do cliente"]').value.trim();
    const estabelecimento = document.getElementById("estabelecimento").value.trim();
    const cep = document.getElementById("cep").value.trim();
    const descricao = document.querySelector("textarea").value.trim();
    const categoria = document.querySelector("select").value;

    if (!nome || !email || !estabelecimento || !cep || !descricao || !categoria) {
      alert("Preencha todos os campos obrigatórios antes de registrar a reclamação.");
      return;
    }

    const novaReclamacao = {
      nome,
      email,
      estabelecimento,
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
          <span>Loja: ${item.estabelecimento}</span>
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
          <p><strong>Estabelecimento:</strong> ${item.estabelecimento}</p>
          
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
 //  DASHBOARD
 // =========================
    const totalReclamacoes = document.getElementById("totalReclamacoes");

    if (totalReclamacoes) {
    const reclamacoes = JSON.parse(localStorage.getItem("reclamacoes")) || [];

    const normalizar = texto =>
        texto
        ?.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    totalReclamacoes.textContent = reclamacoes.length;

    document.getElementById("emAnalise").textContent =
        reclamacoes.filter(item => normalizar(item.status) === "em analise").length;

    document.getElementById("resolvidas").textContent =
        reclamacoes.filter(item => normalizar(item.status) === "resolvida").length;

   document.getElementById("abertas").textContent =
        reclamacoes.filter(item => normalizar(item.status) === "aberta").length;
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

    const percResolvidas = document.getElementById("percResolvidas");
    const percAnalise = document.getElementById("percAnalise");
    const percAbertas = document.getElementById("percAbertas");

    if (percResolvidas && percAnalise && percAbertas) {
    percResolvidas.textContent =
        `${Math.round((resolvidas / totalReal) * 100)}%`;

    percAnalise.textContent =
        `${Math.round((analise / totalReal) * 100)}%`;

    percAbertas.textContent =
        `${Math.round((abertas / totalReal) * 100)}%`;
}
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