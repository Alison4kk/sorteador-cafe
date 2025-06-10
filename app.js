$(document).ready(function () {
  const nPesoInicial = 5;
  let nAnguloAtual = 0;

  function carregarDados() {
    return JSON.parse(localStorage.getItem('participantes') || '[]');
  }

  function salvarDados(lista) {
    localStorage.setItem('participantes', JSON.stringify(lista));
  }

  function renderizarLista() {
    const aPessoas = carregarDados();
    $('#nameList').empty();
    aPessoas.forEach(p => {
      $('#nameList').append(
        `<li>
          <span class="font-medium">${p.nome}</span>
          <span class="text-sm text-gray-500">(peso: ${p.peso})</span>
          <button class="text-red-500 ml-2 remover" data-nome="${p.nome}">✕</button>
        </li>`
      );
    });
    desenharRoleta(aPessoas);
  }

  function desenharRoleta(aPessoas) {
    const $roleta = $('#roleta').empty();
    const total = aPessoas.length;
    if (total === 0) return;

    const angulo = 360 / total;
    aPessoas.forEach((pessoa, i) => {
      const $segmento = $('<div class="segmento"></div>');
      $segmento.text(pessoa.nome);
      $segmento.css('transform', `rotate(${i * angulo}deg) skewY(${90 - angulo}deg)`);
      $roleta.append($segmento);
    });
  }

  $('#addBtn').click(function () {
    const sNome = $('#nameInput').val().trim();
    if (!sNome) return;

    let aPessoas = carregarDados();
    if (!aPessoas.some(p => p.nome === sNome)) {
      aPessoas.push({ nome: sNome, peso: nPesoInicial });
      salvarDados(aPessoas);
      renderizarLista();
    }
    $('#nameInput').val('');
  });

  $('#nameList').on('click', '.remover', function () {
    const sNome = $(this).data('nome');
    let aPessoas = carregarDados().filter(p => p.nome !== sNome);
    salvarDados(aPessoas);
    renderizarLista();
  });

  $('#spinBtn').click(function () {
    const aPessoas = carregarDados();
    if (aPessoas.length === 0) {
      alert('Adicione participantes!');
      return;
    }

    // Cria pool ponderado
    let aPool = [];
    aPessoas.forEach(p => {
      for (let i = 0; i < p.peso; i++) {
        aPool.push(p.nome);
      }
    });

    // Nome final sorteado
    const sSorteado = aPool[Math.floor(Math.random() * aPool.length)];

    let contador = 0;
    const maxTrocas = 30;
    const $nomeGirando = $('#nomeGirando');

    const intervalo = setInterval(() => {
      const sAleatorio = aPool[Math.floor(Math.random() * aPool.length)];
      $nomeGirando.text(sAleatorio);
      contador++;

      if (contador >= maxTrocas) {
        clearInterval(intervalo);
        $nomeGirando.text(sSorteado);
        $('#winnerName').text(sSorteado);

        // Atualiza pesos
        const aAtualizada = aPessoas.map(p => {
          if (p.nome === sSorteado) return { ...p, peso: Math.max(1, p.peso - 2) };
          return { ...p, peso: Math.min(nPesoInicial, p.peso + 1) };
        });

        salvarDados(aAtualizada);
        renderizarLista();
      }
    }, 100);
  });


  renderizarLista();
});
