let cenarioAtual = 'vila';

let heroi = {
    nome: "Herói",
    vida: 100,
    ataque: 10,
    defesa: 5,
    dinheiro: 0,
    xp: 0,
    nivel: 1,
    monstrosDerrotados: 0, // ➡️ Para o sistema de sorte

    // ➕ Histórico de progresso
    criaturasDerrotadas: [],   // ➡️ Guarda os nomes das criaturas ancestrais derrotadas
    vilasReconstruidas: [],    // ➡️ Guarda nomes das vilas restauradas

    itens: {
        espada: false,
        escudo: false,
        armadura: false,
        partesArmadura: {
            bota: false,
            calca: false,
            capacete: false,
            peitoral: false
        },
        arco: false,
        reforco: false,
        sorte: false,           // Nível 4: Sorte ativada
        escudoDivino: false,    // Nível 5: Chance de evitar dano
        artefato: false,        // Artefato Lendário
        derrotouChefao: false,  // Marca se o chefão final foi vencido
        pocoes: 0,
        elixires: 0
    }
};

let vilas = [
    { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 } }, // Vila 1
    { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 } }, // Vila 2
    { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 } }  // Vila 3
];

const partesOrdem = [
    { nome: 'bota', preco: 30, defesa: 2 },
    { nome: 'calca', preco: 40, defesa: 3 },
    { nome: 'capacete', preco: 50, defesa: 4 },
    { nome: 'peitoral', preco: 60, defesa: 5 }
];

let missaoAtiva = null;
let progressoMissao = 0;
const trilha = document.getElementById('trilha');
let mensagemTemploMostrada = false;
let jogoFoiCarregado = false;
let criaturaAncestralAtiva = false;
let criaturaAncestralEncontrada = false;  // ✅ NOVO - já encontrou alguma vez
let vidaCriaturaAncestral = 0;
let chefaoFinalAtivo = false;
let vidaChefaoFinal = 0;
let chefesDerrotados = 0;
let numeroDaVila = 0;
let inventarioAberto = false;
document.getElementById('numero-vila').innerText = numeroDaVila;
let vilaAtual = vilas[numeroDaVila];

// ---------------------- Funções de Navegação ----------------------

function startGame() {
    atualizarTela();
    mudarCenario(`imagens/${cenarioAtual}.jpg`, false);

    if (jogoFoiCarregado) {
        log("✅ Jogo carregado! Continue sua jornada.");
        jogoFoiCarregado = false;
        return; // ⬅️ Evita mostrar mensagens extras
    }

    // Verifica se é o começo do jogo (sem progresso ainda)
    const comecoDeJogo = heroi.nivel === 1 && heroi.xp === 0 && heroi.dinheiro === 0;

    if (comecoDeJogo) {
        log("🌟 Bem-vindo ao jogo!");
        log("Há muito tempo sua vila foi destruída pelos monstros e os heróis derrotados...");
        log("Mas agora, você é o último herói. Reconstrua sua vila e restaure a glória do seu povo.");
    } else {
        log("▶️ Continuando sua aventura...");
    }
}

function iniciarJogo() {
    document.getElementById('tela-inicial').style.display = 'none';
    document.getElementById('creditos').style.display = 'none';
    document.getElementById('jogo').style.display = 'block';
    document.getElementById('cenario').style.display = 'block';
    mudarCenario('imagens/vila.jpg')
    trilha.play();
    startGame();
}

function novoJogo() {
    log("🌟 Novo jogo iniciado.");
    resetarHeroi();          // 🔁 Primeiro resetar tudo
    atualizarTela();         // 🔁 E garantir que o HUD está certo
    iniciarJogo();           // ✅ Depois iniciar a interface
}

function mostrarCreditos() {
    document.getElementById('tela-inicial').style.display = 'none';
    document.getElementById('creditos').style.display = 'block';
}

function voltarAoMenu() {
    document.getElementById('jogo').style.display = 'none';
    document.getElementById('cenario').style.display = 'none';
    document.getElementById('creditos').style.display = 'none';
    document.getElementById('tela-inicial').style.display = 'block';
    document.getElementById('log').innerHTML = '';
    document.getElementById('botao-transformar').style.display = 'none';
    atualizarBotoesTelaInicial();
}

function atualizarBotoesTelaInicial() {
    const jogar = document.getElementById('btn-jogar');
    const novoJogo = document.getElementById('btn-novo-jogo');

    if (!jogar || !novoJogo) return; // evita erro se os elementos não existem

    const temProgresso =
        heroi.nivel > 1 ||
        heroi.xp > 0 ||
        heroi.dinheiro > 0 ||
        numeroDaVila > 0;

    jogar.style.display = temProgresso ? 'inline-block' : 'none';
    novoJogo.style.display = 'inline-block';
}
// ---------------------- Sistema de Cenarios ----------------------

function mudarCenario(imagem, logar = true) {
    // Primeiro, determine o tipo de cenário (vila, caverna, floresta)
    cenarioAtual = imagem.includes('caverna') ? 'caverna' :
        imagem.includes('floresta') ? 'floresta' : 'vila';

    let imagemDeFundoParaAplicar = imagem; // Começa com a imagem que foi passada

    // --- LÓGICA PARA SELEÇÃO DA IMAGEM DA VILA (AJUSTADA) ---
    // Se o cenário for uma 'vila', então ajustamos a imagem baseada no numeroDaVila
    if (cenarioAtual === 'vila') {
        switch (numeroDaVila) {
            case 0: // Vila 1 (Vila inicial), usar vila.jpg CONFORME SOLICITADO
                imagemDeFundoParaAplicar = 'imagens/vila.jpg';
                break;
            case 1: // Vila 2
                imagemDeFundoParaAplicar = 'imagens/vila2.jpg';
                break;
            case 2: // Vila 3
                imagemDeFundoParaAplicar = 'imagens/vila3.jpg';
                break;
            // Adicione mais casos aqui para vilas futuras (ex: case 3: imagemDeFundoParaAplicar = 'imagens/vila4.jpg'; break;)
            // Se o numeroDaVila não estiver mapeado, a imagem original (e.g., 'imagens/vila.jpg' se foi o que passou) será mantida.
        }
    }
    // --- FIM DA LÓGICA DE SELEÇÃO DA IMAGEM DA VILA ---

    document.getElementById('cenario').style.backgroundImage = `url('${imagemDeFundoParaAplicar}')`;

    // Limpa o log AQUI, antes das mensagens específicas do cenário
    document.getElementById('log').innerHTML = '';

    if (logar) log(`Você foi para a ${cenarioAtual}.`);

    document.getElementById('cenario').style.display = 'block';

    // Oculta todos os elementos de UI que não são do cenário atual POR PADRÃO
    document.getElementById('combate').style.display = 'none';
    document.getElementById('loja').style.display = 'none';
    document.getElementById('blackmarket').style.display = 'none';
    document.getElementById('missoes').style.display = 'none';
    document.getElementById('explorar-floresta').style.display = 'none';
    document.getElementById('melhorar-vila').style.display = 'none';
    document.getElementById('sacrificio').style.display = 'none';
    document.getElementById('vila-status').style.display = 'none';

    // Mostra os elementos de UI específicos para o cenário atual
    if (cenarioAtual === 'vila') {
        document.getElementById('loja').style.display = 'block';
        document.getElementById('missoes').style.display = 'block';
        document.getElementById('melhorar-vila').style.display = 'block';
        document.getElementById('vila-status').style.display = 'block';
        aplicarBeneficiosVilaAtual();
        // A lógica de ativação da criatura ancestral NÃO está aqui, conforme sua instrução.
        // A chamada a atualizarVilaStatus() também não está aqui, mas sim no final, conforme sua base.
    } else if (cenarioAtual === 'caverna') {
        document.getElementById('combate').style.display = 'block';
    } else if (cenarioAtual === 'floresta') {
        document.getElementById('blackmarket').style.display = 'block';
        document.getElementById('explorar-floresta').style.display = 'block';
    }

    // Lógica para o botão de transformar
    if (criaturaAncestralAtiva && cenarioAtual === 'caverna' && heroi.vida > 0) {
        document.getElementById('botao-transformar').style.display = 'block';
    } else {
        document.getElementById('botao-transformar').style.display = 'none';
    }

    // Chame estas funções para garantir que a UI esteja sempre atualizada
    atualizarTela();
    atualizarAcoesEspecificas();
    atualizarTextoBotaoArmadura();

    // Esta chamada estava na sua base original, portanto foi mantida.
    if (cenarioAtual === 'caverna') {
        atualizarVilaStatus();
    }
}

// ---------------------- Atualizações de Interface ----------------------

function atualizarLoja() {
    document.getElementById('loja').style.display = (cenarioAtual === 'vila') ? 'block' : 'none';
}

function atualizarCombate() {
    document.getElementById('combate').style.display = (cenarioAtual === 'caverna') ? 'block' : 'none';
}

function atualizarBlackMarket() {
    document.getElementById('blackmarket').style.display = (cenarioAtual === 'floresta') ? 'block' : 'none';
}

function atualizarMissoes() {
    document.getElementById('missoes').style.display = (cenarioAtual === 'vila') ? 'block' : 'none';
}

function atualizarVilaStatus() {
    const vilaAtualObj = vilas[numeroDaVila];

    document.getElementById('nivel-vila').textContent = vilaAtualObj.nivel;
    document.getElementById('madeira').textContent = vilaAtualObj.materiais.madeira;
    document.getElementById('pedra').textContent = vilaAtualObj.materiais.pedra;
    document.getElementById('ferro').textContent = vilaAtualObj.materiais.ferro;

    // Lógica para ativar a criatura ancestral da Vila 2 ou 3
    if ((numeroDaVila === 1 || numeroDaVila === 2) && vilaAtualObj.nivel >= 3 && !heroi.itens.derrotouChefao && !criaturaAncestralAtiva && cenarioAtual === 'vila') {
        log("🗣️ Segundo Herói: 'Excelente! A vila atingiu seu potencial máximo. No entanto, uma presença sombria foi sentida na área. Prepare-se para o verdadeiro desafio!'");
    }

    if ((numeroDaVila === 1 || numeroDaVila === 2) && vilaAtualObj.nivel >= 3 && !heroi.itens.derrotouChefao && !criaturaAncestralAtiva && cenarioAtual === 'caverna') {
        iniciarCombateAncestral(numeroDaVila + 1); // Chama a função que inicia o combate ancestral
        log(`A Criatura Ancestral aparece! Vida: ${vidaCriaturaAncestral}`);
    }

    // Lógica para o Templo de Sacrifício (exemplo, ajuste se o seu for diferente)
    if (numeroDaVila === 0 && vilaAtualObj.nivel >= 3 && heroi.itens.derrotouChefao) {
        if (typeof ativarTemploDeSacrificio === 'function') {
            ativarTemploDeSacrificio();
        } else {
            // Se ativarTemploDeSacrificio não existe, garantir que o botão aparece
            document.getElementById('sacrificio').style.display = 'block';
        }
    }
}

function atualizarAcoesEspecificas() {
    const vilaAtual = vilas[numeroDaVila];
    const exibirFloresta = (cenarioAtual === 'floresta');
    const exibirMelhorar = (cenarioAtual === 'vila');

    document.getElementById('explorar-floresta').style.display = exibirFloresta ? 'block' : 'none';
    document.getElementById('melhorar-vila').style.display = exibirMelhorar ? 'block' : 'none';

    // Correção aqui: usando a vila correta para checar nível
    if (numeroDaVila === 0 && cenarioAtual === 'vila' && vilaAtual.nivel >= 3) {
        document.getElementById('sacrificio').style.display = 'block';
    } else {
        document.getElementById('sacrificio').style.display = 'none';
    }
}

function atualizarTela() {
    document.getElementById('game-text').innerHTML =
        `Vida: ${heroi.vida} | Ataque: ${heroi.ataque} | Defesa: ${heroi.defesa} | Dinheiro: ${heroi.dinheiro} | XP: ${heroi.xp} | Nível: ${heroi.nivel} | Poções: ${heroi.itens.pocoes} | Elixires: ${heroi.itens.elixires}`;
}

function log(mensagem) {
    const logDiv = document.getElementById('log');
    const p = document.createElement('p');
    p.textContent = mensagem;
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight; // ⬅️ Sempre rola até o final
}

// ---------------------- armadura ----------------------

function comprarProximaParteArmadura() {
    for (let parte of partesOrdem) {
        if (!heroi.itens.partesArmadura[parte.nome]) {
            if (heroi.dinheiro < parte.preco) {
                log(`Dinheiro insuficiente para comprar ${parte.nome}.`);
                return;
            }

            heroi.dinheiro -= parte.preco;
            heroi.defesa += parte.defesa;
            heroi.itens.partesArmadura[parte.nome] = true;

            log(`Você comprou a ${parte.nome}. Defesa +${parte.defesa}.`);
            atualizarTela();
            atualizarTextoBotaoArmadura();  // Atualiza o nome do botão
            return;
        }
    }

    log("Você já comprou todas as partes da armadura.");
}

function atualizarTextoBotaoArmadura() {
    const botao = document.getElementById('botao-armadura');

    for (let parte of partesOrdem) {
        if (!heroi.itens.partesArmadura[parte.nome]) {
            botao.innerText = `Comprar ${parte.nome} (${parte.preco}g, +${parte.defesa} DEF)`;
            botao.disabled = false;
            return;
        }
    }

    botao.innerText = "Armadura completa!";
    botao.disabled = true;
}


// ==============================
// 🛠️ Sistema de Evolução por Vila Secundária
// ==============================

function aplicarBeneficiosVilaAtual() {
    const dados = vilas[numeroDaVila];

    if (numeroDaVila === 0) {
        // 💎 Vila natal – benefícios especiais

        if (dados.nivel >= 1 && !heroi.itens.arco) {
            heroi.itens.arco = true;
            heroi.ataque += 2;
            log("🟢 Sua vila agora tem um Arco! Ataque +2.");
        }

        if (dados.nivel >= 2 && !heroi.itens.reforco) {
            heroi.itens.reforco = true;
            heroi.defesa += 1;
            log("🛡️ Ferreiro reforçou sua armadura! Defesa +1.");
        }

        if (dados.nivel >= 3 && !mensagemTemploMostrada) {
            mensagemTemploMostrada = true;
            log("⛩️ O Templo agora aceita sacrifícios! Use-os para ganhar poder.");
        }

        if (dados.nivel >= 4 && !heroi.itens.sorte) {
            heroi.itens.sorte = true;
            log("🍀 Você agora tem Sorte! A cada 10 monstros derrotados, ganha uma recompensa extra.");
        }

        if (dados.nivel >= 5 && !heroi.itens.escudoDivino) {
            heroi.itens.escudoDivino = true;
            log("🛡️ Uma aura divina envolve você. Escudo Divino ativado!");
        }

    } else {
        // 🏰 Vilas secundárias – bônus simples por nível

        if (dados.nivel >= 1 && !dados.bonus?.includes("ataque")) {
            if (!dados.bonus) dados.bonus = [];
            dados.bonus.push("ataque");
            heroi.ataque += 2;
            log("⚔️ Armas reforçadas pela evolução da nova vila! Ataque +2.");
        }

        if (dados.nivel >= 2 && !dados.bonus?.includes("defesa")) {
            if (!dados.bonus) dados.bonus = [];
            dados.bonus.push("defesa");
            heroi.defesa += 2;
            log("🛡️ Armadura reforçada na nova vila! Defesa +2.");
        }

        if (dados.nivel >= 3 && !heroi.segundoHeroi) {
            heroi.segundoHeroi = true;
            log("👥 Um novo herói se juntou a você! Ele ajuda no combate.");
        }
    }

    atualizarTela();
    atualizarVilaStatus();
}

function mudarVila(nomeDaVila) {
    vilaAtual = nomeDaVila; // Atualiza qual vila está ativa
    mudarCenario(`imagens/${nomeDaVila}.jpg`); // Atualiza o fundo visual

    log(`Você chegou na ${nomeDaVila}.`);
    atualizarTela();
    atualizarVilaStatus();

    numeroDaVila++; // vai para próxima vila
    if (numeroDaVila >= vilas.length) {
        log("Você já reconstruiu todas as vilas!");
    } else {
        log(`Você chegou na Vila ${numeroDaVila + 1}.`);
        mudarCenario('imagens/vila.jpg');
        atualizarTela();
        atualizarVilaStatus();
    }
}

// ---------------------- Sistema de Missões ----------------------

function ativarMissao(tipo) {
    missaoAtiva = tipo;
    progressoMissao = 0;
    log(`Missão ativada: ${tipo}! Vá cumprir seu objetivo.`);
}

//--------------------------- resete do heroi ---------------------

function resetarHeroi() {
    // Reinicia os dados do herói manualmente
    heroi.nome = "Herói";
    heroi.vida = 100;
    heroi.ataque = 10;
    heroi.defesa = 5;
    heroi.dinheiro = 0;
    heroi.xp = 0;
    heroi.nivel = 1;
    heroi.monstrosDerrotados = 0;
    heroi.segundoHeroi = false;

    heroi.itens = {
        espada: false,
        escudo: false,
        armadura: false,
        partesArmadura: {
            bota: false,
            calca: false,
            capacete: false,
            peitoral: false
        },
        arco: false,
        reforco: false,
        sorte: false,
        escudoDivino: false,
        artefato: false,
        derrotouChefao: false,
        pocoes: 0,
        elixires: 0
    };

    // Reinicia vilas também
    numeroDaVila = 0;
    heroi.vilaAtual = 0;
    vilas = [
        { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, bonus: [] },
        { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, bonus: [] },
        { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, bonus: [] }
    ];

    criaturaAncestralAtiva = false;
    criaturaAncestralEncontrada = false;
    chefesDerrotados = 0;
    chefaoFinalAtivo = false;

    atualizarTela();
}

// ----------------------------- inventario ------------------------

function toggleInventario() {
    inventarioAberto = !inventarioAberto;
    document.getElementById('inventario-menu').style.display = inventarioAberto ? 'block' : 'none';
    atualizarInventarioVisual(); // Chama a função para atualizar o conteúdo sempre que o menu é aberto
}

function atualizarInventarioVisual() {
    const inventarioMenu = document.getElementById('inventario-menu');
    if (!inventarioMenu || inventarioMenu.style.display === 'none') {
        return;
    }

    document.getElementById('inventario-pocoes').textContent = heroi.itens.pocoes;
    document.getElementById('inventario-elixires').textContent = heroi.itens.elixires;
    document.getElementById('inventario-espada').textContent = heroi.itens.espada ? 'Sim' : 'Não';
    document.getElementById('inventario-escudo').textContent = heroi.itens.escudo ? 'Sim' : 'Não';

    // Atualiza as partes da armadura
    const partes = heroi.itens.partesArmadura;
    document.getElementById('inventario-bota').textContent = partes.bota ? 'Sim' : 'Não';
    document.getElementById('inventario-calca').textContent = partes.calca ? 'Sim' : 'Não';
    document.getElementById('inventario-capacete').textContent = partes.capacete ? 'Sim' : 'Não';
    document.getElementById('inventario-peitoral').textContent = partes.peitoral ? 'Sim' : 'Não';
}

// ---------------------- Sistema de Evolução ----------------------

function verificarNivel() {
    const xpParaProximoNivel = heroi.nivel * 10;
    if (heroi.xp >= xpParaProximoNivel) {
        heroi.xp -= xpParaProximoNivel;
        heroi.nivel++;
        heroi.ataque += 2;
        heroi.defesa += 1;
        heroi.vida = 100;
        log(`Parabéns! Você subiu para o nível ${heroi.nivel}!`);
        atualizarTela();

        if (missaoAtiva === 'uparNivel') {
            const vilaAtual = vilas[numeroDaVila]; // Pega a vila atual para dar a recompensa
            vilaAtual.materiais.ferro += 1; // Recompensa: 1 ferro
            log("Missão 'Upar Nível' completa: você ganhou 1 ferro!");
            missaoAtiva = null; // Reseta a missão ativa
            progressoMissao = 0; // Reseta o progresso da missão
            atualizarVilaStatus(); // Atualiza a exibição dos materiais na vila
        }
    }
}

// ---------------------- Sistema de Ações ----------------------

function lutar() {
    const vilaAtual = vilas[numeroDaVila];

    if (heroi.vida <= 0) {
        log("Você está morto e não pode lutar!");
        document.getElementById('botao-transformar').style.display = 'none';
        return;
    }

    if (cenarioAtual !== 'caverna') {
        log("Só pode lutar na caverna!");
        document.getElementById('botao-transformar').style.display = 'none';
        return;
    }

    // Combate final contra o Criador
    if (chefaoFinalAtivo) {
        vidaChefaoFinal -= heroi.ataque;
        heroi.vida -= 12;

        if (heroi.vida > 0) {
            log("O Monstro Original: 'Você veio longe... mas será o bastante?'");
        }

        log(`Você atacou o Monstro Original! Vida dele: ${vidaChefaoFinal}. Sua vida: ${heroi.vida}`);

        if (vidaChefaoFinal <= 0) {
            log("Você derrotou o Monstro Original! Sua missão está completa.");
            voltarAoMenu();
            setTimeout(() => {
                mudarCenario('imagens/vila.jpg');
                voltarAoMenu();
            }, 5000);
            setTimeout(() => {
                alert("Fim do jogo! Você salvou todas as vilas e derrotou o criador dos monstros.");
                resetarHeroi();
            }, 6000);
            chefaoFinalAtivo = false;
            return;
        }

        if (heroi.vida <= 0) {
            if (heroi.itens.elixires > 0) {
                heroi.itens.elixires--;
                heroi.vida = 50;
                log("Você usou um Elixir e evitou a morte! Vida restaurada para 50.");
            } else {
                log("Você morreu durante o combate final.");
                mudarCenario('imagens/vila.jpg');
            }
        }

        atualizarTela();
        verificarNivel();
        return;
    }

    if (!criaturaAncestralAtiva && !criaturaAncestralEncontrada) {
        // Combate comum
        let dificuldade = heroi.nivel * 4;
        let danoMonstro = Math.floor(Math.random() * dificuldade) + dificuldade;

        if (heroi.itens.escudoDivino && Math.random() < 0.2) {
            danoMonstro = 0;
            log("Os deuses o protegeram deste ataque!");
        }

        let danoRecebido = Math.max(0, danoMonstro - heroi.defesa);
        heroi.vida -= danoRecebido;

        heroi.dinheiro += Math.floor(Math.random() * heroi.nivel) + 1;
        heroi.xp += Math.floor(Math.random() * 3) + heroi.nivel;
        heroi.monstrosDerrotados++;

        log(`Você lutou e recebeu ${danoRecebido} de dano.`);

        if (missaoAtiva === 'caverna') {
            progressoMissao++;
            log(`Progresso da missão: ${progressoMissao}/3`);
            if (progressoMissao >= 3) {
                vilaAtual.materiais.madeira += 5;
                log("Missão completa: ganhou 5 madeiras!");
                missaoAtiva = null;
                progressoMissao = 0;
                atualizarVilaStatus();
            }
        }

    }

    if (heroi.itens.sorte && heroi.monstrosDerrotados >= 10) {
        heroi.monstrosDerrotados = 0;
        heroi.dinheiro += 20;
        log("Sua sorte o recompensou! Ganhou dinheiro extra.");
    }

    if (!heroi.itens.derrotouChefao && !criaturaAncestralAtiva && !criaturaAncestralEncontrada) {
        if (vilaAtual.nivel >= 5 && Math.random() < 0.1) {
            criaturaAncestralAtiva = true;
            criaturaAncestralEncontrada = true;
            vidaCriaturaAncestral = 70 + (chefesDerrotados * 20);
            log("Você encontrou uma Criatura Ancestral!");

            if (heroi.vida <= 10) {
                log("A criatura o atacou de surpresa e você não resistiu...");
                heroi.vida = 0;
                heroi.dinheiro = Math.floor(heroi.dinheiro * 0.5);
                heroi.xp = Math.max(0, heroi.xp - 5);
                mudarCenario('imagens/vila.jpg');
                atualizarTela();
                return;
            }
        }
    }

    if (criaturaAncestralAtiva) {
        vidaCriaturaAncestral -= heroi.ataque;
        heroi.vida -= 10;

        if (heroi.vida > 0) {
            log("Criatura Ancestral: 'Você é forte... Junte-se a mim...'");
            log("Clique em Transformar para aceitar.");
            document.getElementById('botao-transformar').style.display = 'block';
        }

        log(`Você atacou a criatura! Vida dela: ${vidaCriaturaAncestral}. Sua vida: ${heroi.vida}`);

        if (vidaCriaturaAncestral <= 0) {

            criaturaAncestralAtiva = false;
            heroi.itens.derrotouChefao = true;
            chefesDerrotados++;
            document.getElementById('botao-transformar').style.display = 'none';

            log("Você derrotou a Criatura Ancestral!");
            log("Ela sussurra: 'Eu era como você... mas o verdadeiro mal ainda vive...'");

            if (chefesDerrotados === 1) {
                log("Os anciões da vila revelam a verdade: existe um Criador dos monstros.");
                log("Restaure as vilas perdidas e enfrente o verdadeiro mal.");
            }

            if (chefesDerrotados >= 3) {
                log("Você sente uma energia sombria... O Criador está vindo.");
                chefaoFinalAtivo = true;
                vidaChefaoFinal = 150;
            }
            aoDerrotarCriaturaAncestral()
            verificarFinal()
        }
    } else {
        document.getElementById('botao-transformar').style.display = 'none';
    }

    if (heroi.vida <= 0) {
        document.getElementById('botao-transformar').style.display = 'none';
        if (heroi.itens.elixires > 0) {
            heroi.itens.elixires--;
            heroi.vida = 50;
            log("Você usou um Elixir e evitou a morte! Vida restaurada.");
        } else {
            let perdaDinheiro = Math.floor(heroi.dinheiro * 0.5);
            let perdaXP = Math.min(5, heroi.xp);
            heroi.dinheiro -= perdaDinheiro;
            heroi.xp -= perdaXP;
            log(`Você morreu! Perdeu ${perdaDinheiro} dinheiro e ${perdaXP} XP.`);
            mudarCenario('imagens/vila.jpg');
        }
    }

    atualizarTela();
    verificarNivel();
}

function sacrificar(tipo) {
    const vilaAtual = vilas[numeroDaVila];

    if (cenarioAtual !== 'vila') {
        log("O sacrifício só pode ser feito no Templo, na Vila.");
        return;
    }

    if (vilaAtual.nivel < 3) {
        log("O Templo só aceita sacrifícios após a Vila alcançar o nível 3.");
        return;
    }

    if (vilaAtual.materiais.ferro < 1) {
        log("Você não tem ferro suficiente para sacrificar.");
        return;
    }

    vilaAtual.materiais.ferro -= 1;

    if (tipo === 'ataque') {
        heroi.ataque += 1;
        log("Você sacrificou 1 ferro e ganhou +1 de ataque.");
    } else if (tipo === 'defesa') {
        heroi.defesa += 1;
        log("Você sacrificou 1 ferro e ganhou +1 de defesa.");
    } else {
        log("Tipo de sacrifício inválido.");
        vilaAtual.materiais.ferro += 1; // devolve o ferro
    }

    atualizarVilaStatus();
    atualizarTela();
}

function explorar() {
    const vila = vilas[numeroDaVila]; // Certifique-se de que 'vilas' e 'numeroDaVila' estão acessíveis globalmente

    if (cenarioAtual !== 'floresta') {
        log("Só pode explorar na floresta!");
        return;
    }

    let chance = Math.random();
    let encontrouMaterialOuArtefato = false; // Flag para indicar se um material ou artefato foi encontrado

    // --- Nova distribuição de porcentagem e lógica de encontro ---
    // Artefato: 3% (0.00 a 0.03)
    if (chance < 0.03 && !heroi.itens.artefato && vila.nivel >= 2) {
        heroi.itens.artefato = true;
        log("Você encontrou o Artefato Lendário escondido na floresta! Sua defesa aumentou");
        heroi.defesa += 3; // Aumenta a defesa em 3, conforme seu código
        encontrouMaterialOuArtefato = true; // Considera o artefato como algo encontrado para a missão de floresta, se aplicável.
    }
    // Monstro da Floresta: 7% (0.03 a 0.10)
    else if (chance < 0.10) {
        log("Um Monstro da Floresta surgiu de repente!");

        // --- Início do Combate Comum ---
        let dificuldade = heroi.nivel * 2;
        let danoMonstro = Math.floor(Math.random() * dificuldade) + dificuldade;

        if (heroi.itens.escudoDivino && Math.random() < 0.2) {
            danoMonstro = 0;
            log("Os deuses o protegeram deste ataque!");
        }

        let danoRecebido = Math.max(0, danoMonstro - heroi.defesa);
        heroi.vida -= danoRecebido;

        log(`Você lutou e recebeu ${danoRecebido} de dano.`); // Loga o dano recebido.

        // --- LÓGICA PARA VIDA DO HERÓI <= 0 ---
        if (heroi.vida <= 0) {
            if (heroi.itens.elixires > 0) {
                heroi.itens.elixires--;
                heroi.vida = 50;
                log("Você usou um Elixir e evitou a morte! Vida restaurada.");
            } else {
                let perdaDinheiro = Math.floor(heroi.dinheiro * 0.5);
                let perdaXP = Math.min(5, heroi.xp);
                heroi.dinheiro -= perdaDinheiro;
                heroi.xp -= perdaXP;
                log(`Você morreu! Perdeu ${perdaDinheiro} dinheiro e ${perdaXP} XP.`);
                mudarCenario('imagens/vila.jpg');
                atualizarTela();
                return; // Termina a execução da função explorar() aqui, pois o herói morreu.
            }
        }
        // --- FIM DA LÓGICA PARA VIDA DO HERÓI <= 0 ---

        heroi.dinheiro += Math.floor(Math.random() * heroi.nivel) + 1;
        heroi.xp += Math.floor(Math.random() * 3) + heroi.nivel;
        heroi.monstrosDerrotados++;

        verificarNivel(); // <--- Chamada para verificar se o herói subiu de nível após ganhar XP

        if (missaoAtiva === 'caverna') {
            progressoMissao++;
            log(`Progresso da missão: ${progressoMissao}/3`);
            if (progressoMissao >= 3) {
                vila.materiais.madeira += 5; // Usa 'vila' do escopo de explorar()
                log("Missão completa: ganhou 5 madeiras!");
                missaoAtiva = null;
                progressoMissao = 0;
            }
        }

        if (heroi.itens.sorte && heroi.monstrosDerrotados >= 10) {
            heroi.monstrosDerrotados = 0;
            heroi.dinheiro += 20;
            log("Sua sorte o recompensou! Ganhou dinheiro extra.");
        }
        // --- Fim do Combate Comum ---

    }
    // Madeira: 20% (0.10 a 0.30)
    else if (chance < 0.30) {
        vila.materiais.madeira += 1;
        log("Você encontrou uma madeira!");
        encontrouMaterialOuArtefato = true;
    }
    // Pedra: 20% (0.30 a 0.50)
    else if (chance < 0.50) {
        vila.materiais.pedra += 1;
        log("Você encontrou uma pedra!");
        encontrouMaterialOuArtefato = true;
    }
    // Ferro: 8% (0.50 a 0.58)
    else if (chance < 0.58) {
        vila.materiais.ferro += 1;
        log("Você encontrou um ferro raro!");
        encontrouMaterialOuArtefato = true;
    }
    // Nada: 42% (0.58 a 1.00)
    else {
        log("Você não encontrou nada...");
    }

    // A missão de 'floresta' só progride se um material ou artefato foi realmente encontrado.
    if (missaoAtiva === 'floresta' && encontrouMaterialOuArtefato) {
        progressoMissao++;
        log(`Progresso da missão: ${progressoMissao}/2`);
        if (progressoMissao >= 2) {
            vila.materiais.pedra += 3;
            log("Missão completa: ganhou 3 pedras!");
            missaoAtiva = null;
            progressoMissao = 0;
        }
    }

    atualizarVilaStatus();
    atualizarTela();
}

function descansar() {
    if (cenarioAtual === 'caverna') {
        log("Você não pode descansar na caverna, não é seguro!");
        return;
    }

    if (heroi.itens.pocoes > 0) {
        heroi.itens.pocoes--;
        heroi.vida = 100;
        log("Você usou uma Poção para descansar e recuperou a vida.");
    } else {
        log("Você não tem nenhuma Poção para descansar!");
    }

    atualizarTela();
}

function comprarItem(item) {
    const precos = { espada: 20, escudo: 25, pocao: 10 };
    const preco = precos[item];

    if (heroi.dinheiro < preco) {
        log(`Dinheiro insuficiente para comprar ${item}.`);
        return;
    }

    if (item === 'espada' && heroi.itens.espada) {
        log("Você já tem uma espada!");
        return;
    }
    if (item === 'escudo' && heroi.itens.escudo) {
        log("Você já tem um escudo!");
        return;
    }

    heroi.dinheiro -= preco;

    if (item === 'espada') {
        heroi.itens.espada = true;
        heroi.ataque += 5;
        log("Você comprou uma espada! Ataque +5.");
    } else if (item === 'escudo') {
        heroi.itens.escudo = true;
        heroi.defesa += 3;
        log("Você comprou um escudo! Defesa +3.");
    } else if (item === 'pocao') {
        heroi.itens.pocoes++;
        log("Você comprou uma Poção!");
    }

    atualizarTela();
}

function comprarItemBlack(item) {
    if (cenarioAtual !== 'floresta') {
        log("Você só pode acessar o Mercado Negro na floresta.");
        return;
    }

    if (item === 'elixir') {
        if (heroi.dinheiro >= 50) {
            heroi.dinheiro -= 50;
            heroi.itens.elixires++;
            log("Você comprou um Elixir! Ele será usado automaticamente ao morrer.");
        } else {
            log("Dinheiro insuficiente para comprar Elixir (custa 50).");
        }
    } else if (item === 'armadura') {
        if (heroi.dinheiro >= 60) {
            if (!heroi.itens.armadura) {
                heroi.dinheiro -= 60;
                heroi.itens.armadura = true;
                heroi.defesa += 3;
                log("Você comprou uma Armadura! Defesa +3.");
            } else {
                log("Você já possui uma Armadura.");
            }
        } else {
            log("Dinheiro insuficiente para comprar Armadura (custa 60).");
        }
    } else {
        log("Item inválido no mercado negro.");
    }

    atualizarTela();
}


function melhorarVila() {
    const dados = vilas[numeroDaVila];

    // Calcula o nível de herói necessário com base na vila
    let nivelNecessarioHeroi;
    if (numeroDaVila === 0) { // Vila 1 (índice 0)
        nivelNecessarioHeroi = dados.nivel;
    } else if (numeroDaVila === 1) { // Vila 2 (índice 1)
        nivelNecessarioHeroi = dados.nivel * 3; // Dobro do nível da vila
    } else if (numeroDaVila === 2) { // Vila 3 (índice 2)
        nivelNecessarioHeroi = dados.nivel * 4; // Triplo do nível da vila
    } else {
        // Fallback para qualquer outra vila, caso você adicione mais no futuro
        nivelNecessarioHeroi = dados.nivel;
    }

    if (
        dados.materiais.madeira >= 5 &&
        dados.materiais.pedra >= 5 &&
        dados.materiais.ferro >= 2 &&
        heroi.nivel > nivelNecessarioHeroi // Nova condição de nível do herói
    ) {
        const limite = (numeroDaVila === 0) ? 5 : 3; // Limite de nível da vila (Vila 1 vai até 5, outras até 3)
        if (dados.nivel >= limite) {
            log("Esta vila já atingiu o nível máximo.");
            return;
        }

        dados.nivel++;
        dados.materiais.madeira -= 5;
        dados.materiais.pedra -= 5;
        dados.materiais.ferro -= 2;

        log(`🛠️ A Vila ${numeroDaVila + 1} evoluiu para o nível ${dados.nivel}.`);

        aplicarBeneficiosVilaAtual();
        atualizarAcoesEspecificas();

        // Narrativas específicas para a Vila 1
        if (numeroDaVila === 0) {
            if (dados.nivel === 2) narrativaVilaNivel2();
            if (dados.nivel === 3) narrativaVilaNivel3();
            if (dados.nivel === 4) narrativaVilaNivel4();
            if (dados.nivel === 5) narrativaVilaNivel5();
        }
    } else {
        // Mensagem de erro atualizada para refletir o novo requisito de nível
        log(`❌ Requisitos: 5 Madeira, 5 Pedra, 2 Ferro, e estar em nível ${nivelNecessarioHeroi + 1} ou superior.`);
    }
}

function ajustarVolume(valor) {
    trilha.volume = valor;
    log(`Volume ajustado para: ${(valor * 100).toFixed(0)}%`);
}

function narrativaVilaNivel2() {
    log("Enquanto a vila cresce, você encontra inscrições antigas: um artefato lendário está escondido na floresta...");
}

function narrativaVilaNivel3() {
    log("O Templo foi restaurado. Um sacerdote conta que uma criatura ancestral desperta na caverna...");
}

function narrativaVilaNivel4() {
    log("A sorte sorri para você... mas também atrai inimigos mais poderosos das sombras.");
}

function narrativaVilaNivel5() {
    log("Você descobre: a vila foi destruída por uma entidade sombria. Está na hora do confronto final!");
}

// --- FUNÇÃO VERIFICARFINAL---
function verificarFinal() {
    if (heroi.itens.derrotouChefao) {
        if (numeroDaVila < vilas.length - 1) {
            log(`Você derrotou a Criatura Ancestral da Vila ${numeroDaVila + 1}!`);
            log(`Preparando para descobrir a próxima área...`);

            setTimeout(() => {
                numeroDaVila++;
                // heroi.vilaAtual = numeroDaVila;

                criaturaAncestralAtiva = false;
                criaturaAncestralEncontrada = false;
                heroi.itens.derrotouChefao = false;

                document.getElementById('log').innerHTML = '';
                mudarCenario(`imagens/vila.jpg`, false);

                log(`🧭 Uma nova vila foi descoberta. Bem-vindo à Vila ${numeroDaVila + 1}.`);
                log("Comece a reconstruí-la e prepare-se para novos desafios.");

                atualizarTela();
                atualizarVilaStatus();
                // aplicarBeneficiosVilaAtual();
                // atualizarAcoesEspecificas();
            }, 15000);
        } else {
            log("🎉 Parabéns! Você derrotou a última Criatura Ancestral e restaurou todas as vilas.");
            log("Agora, um desafio final o aguarda...");
            // desbloquearCombateFinal();
        }
    }
}

function transformarEmMonstro() {
    criaturaAncestralAtiva = false;

    log("Você aceitou a proposta da Criatura Ancestral...");
    log("Agora você é um monstro como ela, e vagueia pela caverna por toda eternidade.");

    // ➡️ Desativar interações do jogo
    document.getElementById('combate').style.display = 'none';
    document.getElementById('loja').style.display = 'none';
    document.getElementById('blackmarket').style.display = 'none';
    document.getElementById('missoes').style.display = 'none';
    document.getElementById('explorar-floresta').style.display = 'none';
    document.getElementById('melhorar-vila').style.display = 'none';

    document.getElementById('botao-transformar').style.display = 'none';

    setTimeout(() => {
        resetarHeroi();
        mudarCenario('imagens/vila.jpg');
        voltarAoMenu();
        alert("Final alternativo: Você se tornou um monstro.");
    }, 5000);
}

function avancarParaProximaVila() {
    // Estas mensagens aparecerão IMEDIATAMENTE após a criatura ser derrotada.
    log(`Você derrotou a Criatura Ancestral e pode avançar!`);
    log(`Parabéns, herói! A paz está um passo mais próxima.`); // Adicione qualquer outra mensagem de vitória aqui

    // Verifica se ainda existem vilas para desbloquear
    if (numeroDaVila < vilas.length - 1) {
        // Usa setTimeout para introduzir um atraso.
        // TUDO que está DENTRO deste setTimeout só acontecerá APÓS o tempo especificado (3 segundos).
        setTimeout(() => {
            numeroDaVila++; // Aumenta o número da vila (de 0 para 1, de 1 para 2, etc.)

            // Reseta os status do "chefão" para a próxima vila
            criaturaAncestralAtiva = false;
            criaturaAncestralEncontrada = false;
            heroi.itens.derrotouChefao = false; // Importante para permitir o encontro de novas criaturas

            // Limpa o log *apenas agora*, após o tempo de leitura das mensagens de vitória.
            document.getElementById('log').innerHTML = '';

            // Muda o cenário para a nova vila.
            mudarCenario('imagens/vila.jpg', false); // Passe 'false' para não logar "Você foi para a vila" novamente.

            // Mensagens da nova vila que aparecerão no log já limpo.
            log(`🧭 Uma nova área foi descoberta. Bem-vindo à Vila ${numeroDaVila + 1}.`);
            log("Comece a reconstruí-la e prepare-se para novos desafios.");


            // Força a atualização de toda a interface para refletir a nova vila
            atualizarTela();
            atualizarVilaStatus();
            aplicarBeneficiosVilaAtual(); // Aplica bônus, se a nova vila já tiver algum nível
            atualizarAcoesEspecificas();

        }, 15000); // 15 segundos (15000 milissegundos) de atraso. Ajuste conforme necessário.

    } else {
        // Se todas as vilas foram desbloqueadas, lida com o chefão final
        log("🎉 Parabéns! Você derrotou a última Criatura Ancestral e restaurou todas as vilas.");
        log("Agora, um desafio final o aguarda...");
        desbloquearCombateFinal(); // Inicia a lógica do chefão final do jogo
    }
}

// ==============================
// 🧩 Combate contra Criatura Ancestral (versões escaláveis)
// ==============================

function iniciarCombateAncestral(nivelAncestral) {
    if (criaturaAncestralAtiva) return; // Garante que não inicie um novo combate se já estiver em um

    criaturaAncestralAtiva = true;
    criaturaAncestralEncontrada = true; // Necessário para a lógica de "ancestral encontrado"
    // Usando a sua fórmula para a vida do ancestral. Ajuste 'chefesDerrotados' se preferir outra base.
    vidaCriaturaAncestral = 70 + nivelAncestral * 30;

    log(`⚔️ Você encontrou a Criatura Ancestral Nível ${nivelAncestral}! Prepare-se para a luta...`);
    log(`Vida da Criatura: ${vidaCriaturaAncestral}`);

    // Esconde os elementos de UI da vila/exploração que não são relevantes para o combate
    document.getElementById('missoes').style.display = 'none';
    document.getElementById('loja').style.display = 'none';
    document.getElementById('blackmarket').style.display = 'none';
    document.getElementById('explorar-floresta').style.display = 'none';
    document.getElementById('melhorar-vila').style.display = 'none'; // Esconde o botão de melhorar vila
    document.getElementById('sacrificio').style.display = 'none'; // Esconde o templo de sacrifício se visível
    document.getElementById('vila-status').style.display = 'none'; // Esconde o status da vila

    // Mostra os elementos de UI específicos para o combate
    document.getElementById('combate').style.display = 'block'; // Mostra a seção de combate geral
    // Certifique-se de ter um elemento no seu HTML com id="vida-criatura-ancestral-display"
    document.getElementById('botao-transformar').style.display = 'block'; // Mostra o botão de transformar (se usado na luta ancestral)

    // Muda o cenário para o local de combate ancestral (ex: caverna)
    mudarCenario('imagens/caverna.jpg'); // Chama sua função mudarCenario para exibir o fundo correto

    atualizarTela(); // Atualiza a tela com a vida do herói e outros displays
}


// ==============================
// 🧠 Função de Transição após cada vitória
// ==============================

function aoDerrotarCriaturaAncestral(nivel) {
    criaturaAncestralAtiva = false;
    // heroi.itens[`chefaoDerrotado_${nivel}`] = true; // Removido ou mantido, conforme sua necessidade
    heroi.defesa += 5;
    log(`🎉 Você derrotou a Criatura Ancestral! Defesa +5.`);
    // REMOVA OU COMENTE A LINHA ABAIXO:
    // avancarParaProximaVila(); // Esta linha DEVE ser removida!
}
// ==============================
// 🏰 Combate Final contra o Monstro Original
// ==============================

function desbloquearCombateFinal() {
    log("A vila natal está sob ataque do Monstro Original!");
    log("⚠️ Prepare-se para o confronto final.");
    heroi.finalDisponivel = true;
}

function enfrentarMonstroOriginal() {
    if (!heroi.finalDisponivel) {
        log("Ainda há vilas a restaurar e criaturas a derrotar.");
        return;
    }

    let vidaMonstroFinal = 200;
    log("👹 O Monstro Original aparece em meio à destruição!");

    while (vidaMonstroFinal > 0 && heroi.vida > 0) {
        vidaMonstroFinal -= heroi.ataque;
        heroi.vida -= 15;
        log(`Você causou dano! Vida do monstro: ${vidaMonstroFinal}. Sua vida: ${heroi.vida}`);
    }

    if (heroi.vida <= 0) {
        log("⚰️ O Monstro Original o derrotou. Ainda há esperança?");
        heroi.vida = 0;
        return;
    }

    log("🌟 Você derrotou o Monstro Original e restaurou a paz no mundo!");
    setTimeout(() => {
        alert("Obrigado por jogar THE LAST HERO!\nVocê completou sua jornada.");

        voltarAoMenu();
    }, 3000);
}

// ---------------------- Sistema de Salvamento ----------------------

function salvarJogo() {
    // Garante que cada vila tenha um array de bônus
    vilas.forEach((vila, i) => {
        if (!vila.bonus) vilas[i].bonus = [];
    });

    const dados = {
        heroi,
        cenario: cenarioAtual,
        vilas,
        numeroDaVila,
        criaturaAncestralAtiva,
        vidaCriaturaAncestral
    };

    localStorage.setItem('saveGame', JSON.stringify(dados));
    log("💾 Jogo salvo com sucesso!");
}


function carregarJogo() {
    const dados = localStorage.getItem('saveGame');
    if (dados) {
        const obj = JSON.parse(dados);

        Object.assign(heroi, obj.heroi || {});
        Object.assign(heroi.itens, obj.heroi?.itens || {});
        heroi.segundoHeroi = obj.heroi?.segundoHeroi || false;

        // Vilas
        vilas.length = 0;
        (obj.vilas || []).forEach(v => {
            if (!v.bonus) v.bonus = [];
            vilas.push(v);
        });

        numeroDaVila = obj.numeroDaVila ?? 0;

        cenarioAtual = obj.cenario || 'vila';
        criaturaAncestralAtiva = obj.criaturaAncestralAtiva || false;
        vidaCriaturaAncestral = obj.vidaCriaturaAncestral || 0;

        mudarCenario(`imagens/${cenarioAtual}.jpg`, false);
        atualizarTela();
        atualizarLoja();
        atualizarCombate();
        atualizarBlackMarket();
        atualizarMissoes();
        atualizarVilaStatus();
        atualizarAcoesEspecificas();

        jogoFoiCarregado = true;
        log("✅ Jogo carregado com sucesso!");
    } else {
        log("⚠️ Nenhum jogo salvo encontrado.");
    }
}


