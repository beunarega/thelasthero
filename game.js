let cenarioAtual = 'vila';
let desbloqueouPai = false;

let heroi = {
    nome: "Herói",
    vida: 100,
    vidaMaxima: 100,
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
        espadaNivel: 0, // 0 = nenhuma, 1 = madeira, 2 = ferro, 3 = aço
        escudoNivel: 0,  // 0 = nenhum, 1 = madeira, 2 = ferro, 3 = aço
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
        artefatoAtaque: false,
        artefatoVida: false,
        derrotouChefao: false,  // Marca se o chefão final foi vencido
        pocoes: 0,
        elixires: 0
    },
    codigosResgatados: {}
};

let vilas = [
    { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, monstrosDerrotados: 0 }, // Vila 1
    { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, monstrosDerrotados: 0 }, // Vila 2
    { nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, monstrosDerrotados: 0 }  // Vila 3
];

const nomeDasVilas = {
    0: "Aldebaram",
    1: "Vanjag",
    2: "Salem"
};
function nomeVila(index) {
    return nomeDasVilas[index] || `Vila ${index + 1}`;
}

const partesOrdem = [
    { nome: 'bota', preco: 30, defesa: 2 },
    { nome: 'calca', preco: 40, defesa: 3 },
    { nome: 'capacete', preco: 50, defesa: 4 },
    { nome: 'peitoral', preco: 60, defesa: 5 }
];

let cristais = {
    ataque: 0,
    defesa: 0,
    vida: 0
};

let time = {
    heroiPrincipal: heroi,
    heroiSecundario: null,  // Ativado ao evoluir vila 2
    capivara: null,
    monstroAmigo: null,
    paiLendario: null
};

const miniBosses = [
    {
        id: "mutante",
        nome: "Criatura Mutante",
        vida: 50,
        ataque: 20,
        defesa: 15,
        recompensa: 30,
        tipo: "mutante",
        nivelRecomendado: 5,
        descricao: "Um humano deformado pela corrupção e ácido. Cuspe ácido e resiste bastante."
    },
    {
        id: "antiheroi",
        nome: "Criatura Anti-Heróis",
        vida: 100,
        ataque: 25,
        defesa: 20,
        recompensa: 40,
        tipo: "antiheroi",
        nivelRecomendado: 6,
        descricao: "Um reflexo sombrio do próprio herói. Reduz seus atributos."
    },
    {
        id: "elemental",
        nome: "Criatura Elemental",
        vida: 150,
        ataque: 30,
        defesa: 25,
        recompensa: 50,
        tipo: "elemental",
        nivelRecomendado: 7,
        descricao: "Ser formado pelos elementos. Seus ataques ignoram parte da defesa."
    },
    {
        id: "guardiaoFinal",
        nome: "Guardião Final",
        vida: '5000',
        ataque: '1029',
        defesa: '888',
        recompensa: '1000',
        tipo: "guardiaoFinal",
        nivelRecomendado: '???',
        descricao: "O último protetor do Criador. Só pode ser vencido com o Guerreiro Lendário ao seu lado."
    }
];

const teclaFloresta = '1';
const teclaCaverna = '2';
const teclaVila = '3';

let miniBossAtual = null;
let miniBossIndex = 0; // começa na criatura mais fraca
let emCombateMiniBoss = false;
let miniBossDerrotados = [];

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
let vilaAtual = vilas[numeroDaVila];
let jogoEstaRodando = true;
var mostrouCartazes = false;
let ataqueOriginal = null;
let defesaOriginal = null;
let acharCristais = false;
let usouModoGrinding = false;
let conquistas = { finalRuim: false, finalMediano: false, finalBom: false };

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
        log(`🌟 Bem-vindo ao jogo, ${heroi.nome}!`);
        log("Há muito tempo sua vila foi destruída pelos monstros e os heróis derrotados...");
        log(`Mas agora, ${heroi.nome}, você é o último herói. Reconstrua sua vila e restaure a glória do seu povo.`);
    } else {
        log(`▶️ Continuando sua aventura, ${heroi.nome}...`);
        atualizarPainelTime();
        atualizarTimeVisual();
    }
}

function iniciarJogo() {
    document.getElementById('tela-inicial').style.display = 'none';
    document.getElementById('creditos').style.display = 'none';
    document.getElementById('jogo').style.display = 'block';
    document.getElementById('cenario').style.display = 'block';
    trilha.play();
    startGame();
}

function novoJogo() {
    const nome = prompt("Qual é o nome do seu herói?", "Herói");

    // Se o usuário cancelar ou não digitar nada, a função para.
    if (nome === null || nome.trim() === "") {
        return;
    }

    log("🌟 Novo jogo iniciado.");
    resetarHeroi();          // 1. Reseta tudo (nome volta para "Herói")
    heroi.nome = nome.trim(); // 2. Define o novo nome que o usuário digitou

    atualizarTela();
    iniciarJogo();
    atualizarTimeVisual();
    atualizarPainelTime();
}

function mostrarCreditos() {
    document.getElementById('tela-inicial').style.display = 'none';
    document.getElementById('creditos').style.display = 'block';
}

function voltarAoMenu() {
    document.getElementById('jogo').style.display = 'none';
    document.getElementById('cenario').style.display = 'none';
    document.getElementById('creditos').style.display = 'none';
    document.getElementById('tela-inicial').style.display = 'flex';
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
        numeroDaVila > 0 ||
        (heroi.codigosResgatados && Object.keys(heroi.codigosResgatados).length > 0);

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

    if (logar) log(`Você ${heroi.nome} foi para a ${cenarioAtual}.`);

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
    document.getElementById('status-capivara').textContent = time.capivara ? "No time" : "Não recrutada";
    document.getElementById('status-monstro-amigo').textContent = time.monstroAmigo ? "No time" : "Não recrutado";
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
    atualizarLoja()
    atualizarTimeVisual();
    atualizarNomeVila();
    atualizarPainelTime();

    // Esta chamada estava na sua base original, portanto foi mantida.
    if (cenarioAtual === 'caverna') {
        atualizarVilaStatus();
    }
}

//-------------------- sistema de atalhos -----------------------------//


function controlarCenariosPelaTecla(event) { // MUDADO
    switch (event.key) { // MUDADO
        case '1':
            mudarCenario('imagens/vila.jpg');
            break;
        case '2':
            mudarCenario('imagens/floresta.jpg');
            break;
        case '3':
            mudarCenario('imagens/caverna.jpg');
            break;
        case '4':
            voltarAoMenu();
            break;
        case 'Tab': // NOVO
            event.preventDefault(); // Impede o navegador de trocar de foco
            toggleInventario();
            break;
        default:
            console.log("Nenhuma ação mapeada para a tecla: " + event.key);
            break;
    }
}

document.addEventListener('keydown', function (event) {
    // Apenas para ter certeza de que a função é chamada
    controlarCenariosPelaTecla(event); // MUDADO
});



document.addEventListener('keydown', function (event) {
    // Apenas para ter certeza de que a função é chamada
    controlarCenariosPelaTecla(event); // MUDADO para event
});

document.addEventListener('keydown', function (event) {
    // Apenas para ter certeza de que a função é chamada
    controlarCenariosPelaTecla(event.key);
});

function abrirConfiguracoes() {
    document.getElementById('configuracoes').style.display = 'block';
    document.getElementById('atalho-floresta').value = atalhos.floresta;
    document.getElementById('atalho-caverna').value = atalhos.caverna;
    document.getElementById('atalho-vila').value = atalhos.vila;
}

function fecharConfiguracoes() {
    document.getElementById('configuracoes').style.display = 'none';
}

// ------------------------- sistema de codigos ---------------------------

function resgatarCodigo() {
    const inputElement = document.getElementById('input-codigo');
    if (!inputElement) return; // Segurança

    const codigo = inputElement.value.toLowerCase().trim();

    // Inicializa o objeto se não existir (Movido para o topo para mais segurança)
    if (!heroi.codigosResgatados) {
        heroi.codigosResgatados = {};
    }

    if (codigo === 'medico') {
        // Verifica se o código já foi resgatado
        if (heroi.codigosResgatados.medico) {
            alert('Erro: O código "medico" já foi resgatado.');
            inputElement.value = '';
            return;
        }

        // Aplica a recompensa
        heroi.itens.pocoes += 10;
        heroi.itens.elixires += 10;
        // Marca o código como resgatado
        heroi.codigosResgatados.medico = true;

        alert('Código "medico" resgatado!\n\nVocê recebeu:\n+ 10 Poções\n+ 10 Elixires');

        salvarJogo();
        atualizarBotoesTelaInicial();

    } else if (codigo === 'elon musk') { // <-- BLOCO NOVO
        if (heroi.codigosResgatados.elonmusk) { // Usamos 'elonmusk' como a chave
            alert('Erro: O código "elon musk" já foi resgatado.');
            inputElement.value = '';
            return;
        }

        heroi.dinheiro += 999999;
        heroi.codigosResgatados.elonmusk = true;

        alert('Código "elon musk" resgatado!\n\nVocê recebeu:\n+ 999.999 Dinheiro');

        salvarJogo();
        atualizarBotoesTelaInicial(); // Vai funcionar por causa da nossa correção no Passo 1

    } else if (codigo === 'heroi') { // <-- BLOCO NOVO
        if (heroi.codigosResgatados.heroi) {
            alert('Erro: O código "heroi" já foi resgatado.');
            inputElement.value = '';
            return;
        }

        heroi.ataque += 10;
        heroi.defesa += 10;
        heroi.codigosResgatados.heroi = true;

        alert('Código "heroi" resgatado!\n\nVocê recebeu:\n+ 10 Ataque\n+ 10 Defesa');

        salvarJogo();
        atualizarBotoesTelaInicial(); // Vai funcionar por causa da nossa correção no Passo 1

    } else if (codigo === '') {
        alert('Por favor, digite um código.');
    } else {
        alert('Código inválido. Tente novamente.');
    }

    // Limpa o campo de texto
    inputElement.value = '';
}

// ==============================
// 🏆 Sistema de Conquistas
// ==============================
function mostrarConquistas() {
    let lista = "🏆 Suas Conquistas 🏆\n\n";

    lista += conquistas.finalBom ? "✅ Final Bom: O Salvador\n" : "❌ Final Bom: O Salvador\n";
    lista += conquistas.finalMediano ? "✅ Final Mediano: O Executor\n" : "❌ Final Mediano: O Executor\n";
    lista += conquistas.finalRuim ? "✅ Final Ruim: O Monstro\n" : "❌ Final Ruim: O Monstro\n";

    alert(lista);
}

// ---------------------- Atualizações de Interface ----------------------

function atualizarLoja() {
    const loja = document.getElementById('loja');
    loja.style.display = (cenarioAtual === 'vila') ? 'block' : 'none';

    if (cenarioAtual !== 'vila') return; // Impede o resto caso não esteja na vila

    const espadaNiveis = ["madeira", "ferro", "aço"];
    const escudoNiveis = ["madeira", "ferro", "aço"];
    const custosEspada = [20, 30, 40];
    const custosEscudo = [20, 30, 40];

    let nivelEspada = heroi.itens.espadaNivel || 0;
    let nivelEscudo = heroi.itens.escudoNivel || 0;

    const botaoEspada = document.getElementById("botao-comprar-espada");
    const botaoEscudo = document.getElementById("botao-comprar-escudo");

    if (nivelEspada < 3) {
        botaoEspada.style.display = "inline-block";
        botaoEspada.innerText = `Comprar Espada de ${espadaNiveis[nivelEspada]} (${custosEspada[nivelEspada]} moedas)`;
    } else {
        botaoEspada.style.display = "none";
    }

    if (nivelEscudo < 3) {
        botaoEscudo.style.display = "inline-block";
        botaoEscudo.innerText = `Comprar Escudo de ${escudoNiveis[nivelEscudo]} (${custosEscudo[nivelEscudo]} moedas)`;
    } else {
        botaoEscudo.style.display = "none";
    }
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

    if ((numeroDaVila === 1 && vilaAtualObj.nivel >= 4 || numeroDaVila === 2 && vilaAtualObj.nivel >= 3) &&
        !heroi.itens.derrotouChefao &&
        !criaturaAncestralAtiva &&
        cenarioAtual === 'vila') {

        log("🗣️ Segundo Herói: 'Excelente! A vila atingiu seu potencial máximo. No entanto, uma presença sombria foi sentida na área. Prepare-se para o verdadeiro desafio!'");
    }

    if ((numeroDaVila === 1 && vilaAtualObj.nivel >= 4 || numeroDaVila === 2 && vilaAtualObj.nivel >= 3) &&
        !heroi.itens.derrotouChefao &&
        !criaturaAncestralAtiva &&
        cenarioAtual === 'caverna') {

        iniciarCombateAncestral(numeroDaVila + 1); // Criatura 2 ou 3
        log(`A Criatura Ancestral aparece! Vida: ${vidaCriaturaAncestral}`);
    }

    if (numeroDaVila === 1 && vilaAtualObj.nivel >= 3) {
        acharCristais = true
    }

    // Templo ativo apenas na vila natal
    if (numeroDaVila === 0 && vilaAtualObj.nivel >= 3 && cenarioAtual === 'vila' && heroi.itens.derrotouChefao) {
        document.getElementById('sacrificio').style.display = 'block';
    }

    if (numeroDaVila === 2) {
        acharCristais = false
    }

}

function atualizarAcoesEspecificas() {
    const vilaAtual = vilas[numeroDaVila];
    const exibirFloresta = (cenarioAtual === 'floresta');
    const exibirMelhorar = (cenarioAtual === 'vila');

    document.getElementById('explorar-floresta').style.display = exibirFloresta ? 'block' : 'none';
    document.getElementById('melhorar-vila').style.display = exibirMelhorar ? 'block' : 'none';
    document.getElementById('bruxa').style.display = (cenarioAtual === 'floresta' && numeroDaVila === 1 && vilaAtual.nivel >= 3) ? 'block' : 'none';

    // Correção aqui: usando a vila correta para checar nível
    if (numeroDaVila === 0 && cenarioAtual === 'vila' && vilaAtual.nivel >= 3) {
        document.getElementById('sacrificio').style.display = 'block';
    } else {
        document.getElementById('sacrificio').style.display = 'none';
    }

    if (vilaAtual.nivel >= 1 && numeroDaVila === 0 && !mostrouCartazes) {
        document.getElementById('botao-cartazes').style.display = (cenarioAtual === 'vila' && vilaAtual.nivel >= 1) ? 'block' : 'none';
        mostrouCartazes = true;
        log(`Derrepente durante as construções você ${heroi.nome} encontra um conjunto de cartazes.`);
    } else if (vilaAtual.nivel >= 1 && numeroDaVila === 0 && mostrouCartazes) {
        document.getElementById('botao-cartazes').style.display = (cenarioAtual === 'vila') ? 'block' : 'none';
    } else if (numeroDaVila === 1 || numeroDaVila === 2 && mostrouCartazes) {
        document.getElementById('botao-cartazes').style.display = (cenarioAtual === 'vila') ? 'block' : 'none';
        document.getElementById('botao-cartazes').style.display = (cenarioAtual === 'vila') ? 'block' : 'none';
    } else {
        document.getElementById('botao-cartazes').style.display = 'none';
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

function atualizarMenuBruxa() {
    document.getElementById("cristal-ataque").textContent = cristais.ataque;
    document.getElementById("cristal-defesa").textContent = cristais.defesa;
    document.getElementById("cristal-vida").textContent = cristais.vida;
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

            log(`Você ${heroi.nome} comprou a ${parte.nome}. Defesa +${parte.defesa}.`);
            atualizarTela();
            atualizarTextoBotaoArmadura();

            // Verifica se agora todas as partes estão compradas
            const todasPartesCompradas = partesOrdem.every(p => heroi.itens.partesArmadura[p.nome]);
            if (todasPartesCompradas && !time.capivara) {
                log(`Você ${heroi.nome} já comprou todas as partes da armadura.`);
                log('🦫 Uma capivara foi atraída pelo brilho da sua armadura e agora te acompanha em sua jornada!');
                adicionarCapivara();
                log("Seu time expandiu! Jogo salvo automaticamente");
                atualizarTimeVisual();
            }
            return;
        }
    }
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

//---------------------------- time ------------------------------

function adicionarCapivara() {
    time.capivara = {
        nome: "Capivara",
        vida: 50,
        ataque: 5,
        defesa: 2,
        tipo: 'animal'
    };
    log("🦫 Uma Capivara se juntou ao seu time!");
    salvarJogo();
    atualizarPainelTime();
    atualizarTimeVisual();
}

function adicionarMonstroAliado() {
    time.monstroAmigo = {
        nome: "Monstro Consciente",
        vida: 60,
        ataque: 8,
        defesa: 3,
        tipo: 'monstro'
    };
    log("👹 Um monstro com mente humana se uniu ao seu time!");
    log("Seu time expandiu! Jogo salvo automaticamente");
    salvarJogo();
    atualizarPainelTime();
    atualizarTimeVisual();
}

function adicionarPaiLendario() {
    time.paiLendario = {
        nome: "Guerreiro Lendário (pai)",
        vida: 999,
        ataque: 999,
        defesa: 999,
        tipo: 'lendario'
    };
    log("🧑‍🦳 Um Guerreiro Lendário se juntou ao seu pai!");
    salvarJogo();
    atualizarPainelTime();
    atualizarTimeVisual();
}

function ataqueDoTime(inimigo) {
    time.forEach(membro => {
        let dano = Math.max(0, membro.ataque - inimigo.defesa);
        inimigo.vida -= dano;
        log(`${membro.nome} atacou e causou ${dano} de dano.`);
    });
}

function atualizarPainelTime() {
    let lista = document.getElementById('lista-time');
    if (!lista) return;

    lista.innerHTML = '';
    for (const membroKey in time) {
        if (membroKey === 'heroiPrincipal') continue;
        const membro = time[membroKey];
        if (membro) {
            const li = document.createElement('li');
            li.textContent = `${membro.nome} (❤️${membro.vida}, ATQ: ${membro.ataque}, DEF: ${membro.defesa})`;
            lista.appendChild(li);
        }
    }
}

function atualizarTimeVisual() {
    const timeDiv = document.getElementById("time-status");
    timeDiv.innerHTML = ""; // Limpa visual anterior

    // Adiciona os membros do time com emojis
    if (time.heroiSecundario) {
        const span = document.createElement("span");
        span.textContent = "🧑‍🤝‍🧑";
        span.title = "Herói Secundário";
        timeDiv.appendChild(span);
    }

    if (time.capivara) {
        const span = document.createElement("span");
        span.textContent = "🦫";
        span.title = "Capivara";
        timeDiv.appendChild(span);
    }

    if (time.monstroAmigo) {
        const span = document.createElement("span");
        span.textContent = "👹";
        span.title = "Monstro Consciente";
        timeDiv.appendChild(span);
    }

    if (time.paiLendario) {
        const span = document.createElement("span");
        span.textContent = "🧑‍🦳";
        span.title = "Guerreiro Lendário (pai)";
        timeDiv.appendChild(span);
    }

}

// ==============================
// 🛠️ Sistema de Evolução por Vila Secundária
// ==============================

function aplicarBeneficiosVilaAtual() {
    const dados = vilas[numeroDaVila];

    if (numeroDaVila === 0) {
        // 🏠 Vila natal — benefícios únicos

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
            log(`🍀 Você ${heroi.nome} agora tem Sorte! A cada 10 monstros derrotados, ganha uma recompensa extra.`);
        }

        if (dados.nivel >= 5 && !heroi.itens.escudoDivino) {
            heroi.itens.escudoDivino = true;
            log(`🛡️ Uma aura divina envolve você ${heroi.nome}. Escudo Divino ativado!`);
        }

    } else {
        // 🏘️ Vilas secundárias — buffs por nível

        // Garante que exista o array de bonus
        if (!dados.bonus) dados.bonus = [];

        if (dados.nivel >= 1 && !dados.bonus.includes("ataque")) {
            dados.bonus.push("ataque");
            heroi.ataque += 2;
            log("⚔️ Armas reforçadas pela evolução da nova vila! Ataque +2.");
        }

        if (dados.nivel >= 2 && !dados.bonus.includes("defesa")) {
            dados.bonus.push("defesa");
            heroi.defesa += 2;
            log("🛡️ Armadura reforçada na nova vila! Defesa +2.");
        }

        // ✅ Novo nível 3: ativa encantamento com cristais
        if (numeroDaVila === 1 && dados.nivel >= 3 && !dados.bonus.includes("encantamento")) {
            dados.bonus.push("encantamento");
            log("🔮 Uma bruxa chegou à vila de Vanjag! Ela pode usar cristais mágicos para encantamentos.");
            // Se desejar, adicionar alguma flag extra ou variável de controle aqui
        }

        // Novo nível 4: segundo herói
        if (numeroDaVila === 1 && dados.nivel >= 4 && !heroi.segundoHeroi) {
            heroi.segundoHeroi = true;
            time.heroiSecundario = {
                nome: "Herói Secundário",
                vida: 80,
                ataque: 6,
                defesa: 3
            };
            log("🧑‍🤝‍🧑 Um novo herói se juntou ao time!");
            log("Seu time expandiu! Jogo salvo automaticamente");
            salvarJogo();
            atualizarPainelTime();
            atualizarTimeVisual();
        }
    }

    atualizarTela();
    atualizarVilaStatus();
}

function mudarVila(nomeDaVila) {
    mudarCenario(`imagens/${nomeDaVila}.jpg`); // Atualiza o fundo visual

    log(`Você ${heroi.nome} chegou na ${nomeDaVila}.`);
    atualizarTela();
    atualizarVilaStatus();

    numeroDaVila++; // vai para próxima vila
    if (numeroDaVila >= vilas.length) {
        log(`Você ${heroi.nome} já reconstruiu todas as vilas!`);
    } else {
        log(`Você ${heroi.nome} chegou na Vila ${numeroDaVila + 1}.`);
        mudarCenario('imagens/vila.jpg');
        atualizarTela();
        atualizarVilaStatus();
        atualizarNomeVila();
    }
}

// ---------------------- Sistema de Missões ----------------------

function ativarMissao(tipo) {
    missaoAtiva = tipo;
    progressoMissao = 0;
    log(`Missão ativada: ${tipo}! Vá cumprir seu objetivo.`);
}

// ---------------------- sistema de miniBoss ----------------------

function exibirCartazMiniBoss(index) {
    const boss = miniBosses[index];
    miniBossAtual = boss; // Define o boss atual, mas só ativa combate depois
    document.getElementById('nome-miniboss').textContent = boss.nome;
    document.getElementById('nivel-recomendado').textContent = boss.nivelRecomendado;
    document.getElementById('recompensa-miniboss').textContent = boss.recompensa;
    document.getElementById('descricao-miniboss').textContent = boss.descricao;
    document.getElementById('cartaz-miniboss').style.display = 'block';
}

function confirmarCombateMiniBoss() {
    if (miniBossDerrotados.includes(miniBossAtual.nome)) {
        log(`❌ Você ${heroi.nome} já derrotou ${miniBossAtual.nome}. Não há honra em lutar novamente.`);
        document.getElementById('cartaz-miniboss').style.display = 'none';
        return;
    }

    if (miniBossAtual) {
        delete miniBossAtual.debuffAplicado;  // Anti-Herói
        delete miniBossAtual.debuffAvisado;
        delete miniBossAtual.dotRestante;     // Mutante (ácido)
    }

    emCombateMiniBoss = true;
    document.getElementById('cartaz-miniboss').style.display = 'none';
    log(`⚔️ Você ${heroi.nome} decidiu enfrentar ${miniBossAtual.nome}! Prepare-se para o combate.`);
    atualizarTela();
}


function abrirCartazesMiniBoss() {
    if (cenarioAtual !== 'vila') {
        log("📜 Os cartazes só estão disponíveis na vila.");
        return;
    }

    const container = document.getElementById('log');
    container.innerHTML = "<h3>📜 Cartazes de Mini Boss:</h3>";

    miniBosses.forEach((boss, index) => {
        const btn = document.createElement('button');
        btn.textContent = `${boss.nome} (Recompensa: ${boss.recompensa} moedas)`;
        btn.onclick = () => exibirCartazMiniBoss(index);
        container.appendChild(btn);
    });
}

function fecharCartaz() {
    miniBossAtual = null;
    document.getElementById('cartaz-miniboss').style.display = 'none';
}

miniBosses.forEach((boss, index) => {
    const botao = document.createElement('button');
    botao.textContent = `📜 ${boss.nome} (Recompensa: ${boss.recompensa})`;
    botao.onclick = () => exibirCartazMiniBoss(index); // Antes começava o combate direto
});

//--------------------------- resete do heroi ---------------------

function resetarHeroi() {
    // Reinicia os dados do herói manualmente
    heroi.nome = "Herói";
    heroi.vida = 100;
    heroi.vidaMaxima = 100;
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
        artefatoAtaque: false,
        artefatoVida: false,
        derrotouChefao: false,
        pocoes: 0,
        elixires: 0
    };

    heroi.codigosResgatados = {};

    // Reinicia vilas também
    numeroDaVila = 0;
    heroi.vilaAtual = 0;

    vilas = [
        { nome: "Aldebaram", nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, bonus: [], monstrosDerrotados: 0 },
        { nome: "Vanjag", nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, bonus: [], monstrosDerrotados: 0 },
        { nome: "ReverBlo", nivel: 0, materiais: { madeira: 0, pedra: 0, ferro: 0 }, bonus: [], monstrosDerrotados: 0 }
    ];

    cristais = {
        ataque: 0,
        defesa: 0,
        vida: 0
    };

    miniBossDerrotados = [];

    usouModoGrinding = false;

    criaturaAncestralAtiva = false;
    criaturaAncestralEncontrada = false;
    chefesDerrotados = 0;
    chefaoFinalAtivo = false;
    mostrouCartazes = false;

    // 🔄 Reinicia o time
    time = {
        heroiSecundario: null,
        capivara: null,
        monstroAmigo: null,
        paiLendario: null
    };
    if (desbloqueouPai) {
        adicionarPaiLendario(); // garante que ele continue no novo jogo
    }

    atualizarTimeVisual();
    atualizarTela();
    atualizarBotoesTelaInicial();
    atualizarPainelTime();
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
    document.getElementById('inventario-espada').textContent =
        heroi.itens.espadaNivel > 0 ? `Nível ${heroi.itens.espadaNivel}` : 'Não';
    document.getElementById('inventario-escudo').textContent =
        heroi.itens.escudoNivel > 0 ? `Nível ${heroi.itens.escudoNivel}` : 'Não';
    document.getElementById('status-capivara').textContent = time.capivara ? "No time" : "Não recrutada";
    document.getElementById('status-monstro-amigo').textContent = time.monstroAmigo ? "No time" : "Não recrutado";

    document.getElementById('inventario-cristal-ataque').textContent = cristais.ataque;
    document.getElementById('inventario-cristal-defesa').textContent = cristais.defesa;
    document.getElementById('inventario-cristal-vida').textContent = cristais.vida;

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
        heroi.vidaMaxima += 5;
        heroi.vida = heroi.vidaMaxima;
        log(`Parabéns! Você ${heroi.nome} subiu para o nível ${heroi.nivel}!`);
        atualizarTela();

        if (missaoAtiva === 'uparNivel') {
            const vilaAtual = vilas[numeroDaVila]; // Pega a vila atual para dar a recompensa
            vilaAtual.materiais.ferro += 1; // Recompensa: 1 ferro
            log(`Missão Upar Nível completa: você ${heroi.nome} ganhou 1 ferro!`);
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
        log(`Você ${heroi.nome} está morto e não pode lutar!`);
        document.getElementById('botao-transformar').style.display = 'none';
        return;
    }

    if (cenarioAtual !== 'caverna') {
        log("Só pode lutar na caverna!");
        document.getElementById('botao-transformar').style.display = 'none';
        return;
    }

    // 📌 Calcular força total com o time
    let ataqueTotal = heroi.ataque;
    let defesaTotal = heroi.defesa;

    if (time.heroiSecundario) {
        ataqueTotal += time.heroiSecundario.ataque;
        defesaTotal += time.heroiSecundario.defesa;
    }
    if (time.capivara) {
        ataqueTotal += time.capivara.ataque;
        defesaTotal += time.capivara.defesa;
    }
    if (time.monstroAmigo) {
        ataqueTotal += time.monstroAmigo.ataque;
        defesaTotal += time.monstroAmigo.defesa;
    }
    if (time.paiLendario) {
        ataqueTotal += time.paiLendario.ataque;
        defesaTotal += time.paiLendario.defesa;
    }



    // ⚔️ Combate final contra o Criador
    if (chefaoFinalAtivo) {
        vidaChefaoFinal -= ataqueTotal;
        heroi.vida -= 30;

        if (heroi.vida > 0) {
            log(`O Monstro Original: 'Você ${heroi.nome} veio longe... mas será o bastante?'`);
        }

        log(`Você ${heroi.nome} atacou o Monstro Original! Vida dele: ${vidaChefaoFinal}. Sua vida: ${heroi.vida}`);

        if (usouModoGrinding) {
            log(`Você ${heroi.nome} salvou o mundo da ameaça, mas as vilas que deixou para trás nunca foram reconstruídas.`);
            log(`Seu pai o observa de longe, mas não se junta a você ${heroi.nome}. A sua jornada foi solitária.`);
            log("(Final Mediano)");
            conquistas.finalMediano = true;
            chefaoFinalAtivo = false;
            atualizarBotoesTelaInicial();
            setTimeout(() => {
                alert(`Fim do jogo! Você ${heroi.nome} salvou o mundo, mas não restaurou as vilas.`);
                voltarAoMenu();
                resetarHeroi();
                atualizarBotoesTelaInicial();
            }, 20000);
            return; // Sai antes de dar o pai
        }

        if (vidaChefaoFinal <= 0) {
            mudarCenario('imagens/vila.jpg');
            log(`Você ${heroi.nome} derrotou o Monstro Original! Sua missão está completa.`);
            log("(Final bom)");
            conquistas.finalBom = true;

            desbloqueouPai = true;
            time.paiLendario = {
                nome: "Guerreiro Lendário (pai)",
                vida: 999,
                ataque: 999,
                defesa: 999,
                tipo: 'lendario'
            };
            log(`Você ${heroi.nome} foi digno e agora...`);
            adicionarPaiLendario();
            log("O seu time aumentou! Jogo salvo automaticamente.")
            atualizarTimeVisual();
            atualizarPainelTime();
            atualizarBotoesTelaInicial();
            setTimeout(() => {
                alert(`Fim do jogo! Você ${heroi.nome} salvou todas as vilas e derrotou o criador dos monstros.`);
                voltarAoMenu();
                resetarHeroi();
                atualizarBotoesTelaInicial();
            }, 20000);
            chefaoFinalAtivo = false;
            atualizarBotoesTelaInicial();
            return;
        }

        if (heroi.vida <= 0) {
            if (heroi.itens.elixires > 0) {
                heroi.itens.elixires--;
                heroi.vida = Math.floor(heroi.vidaMaxima * 0.5);
                log(`Você ${heroi.nome} usou um Elixir e evitou a morte! Vida restaurada para 50.`);
            } else {
                log(`Você ${heroi.nome} morreu durante o combate final.`);
                mudarCenario('imagens/vila.jpg');
            }
        }

        atualizarTela();
        verificarNivel();
        return;
    }

    if (emCombateMiniBoss && miniBossAtual) {
        const chave = (miniBossAtual.id != null)
            ? String(miniBossAtual.id)
            : (miniBossAtual.nome || '').toLowerCase();

        // Se por algum motivo entrar aqui com um mini-boss já derrotado, cancela
        if (miniBossDerrotados[chave]) {
            emCombateMiniBoss = false;
            log(`❌ Você ${heroi.nome} já derrotou ${miniBossAtual.nome}. Não há honra em lutar novamente.`);
            miniBossAtual = null;
            atualizarTela();
            return;
        }

        // Nomes/tipo para identificar as habilidades
        const nomeNormalizado = (miniBossAtual.nome || '')
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

        const isAntiHero =
            miniBossAtual.tipo === 'antiheroi' ||
            /anti-?heroi/.test(nomeNormalizado);

        const isMutante =
            miniBossAtual.tipo === 'mutante' ||
            /mutante/.test(nomeNormalizado);

        const isElemental =
            miniBossAtual.tipo === 'elemental' ||
            /elemental/.test(nomeNormalizado);


        const isGuardiaoFinal =
            miniBossAtual.tipo === 'guardiaoFinal' ||
            /guardiao/.test(nomeNormalizado);

        // --- Habilidade: Anti-Herói (debuff temporário aplicado nos cálculos) ---
        // Dentro da lógica de combate do miniboss:

        let defesaTotalE = heroi.defesa
        let ataqueTotalE = heroi.ataque

        if (time.paiLendario) {
            ataqueTotalE += time.paiLendario.ataque;
            defesaTotalE += time.paiLendario.defesa;
        }

        let ataqueHeroiTurno = ataqueTotalE;
        let defesaHeroiTurno = defesaTotalE;

        if (isGuardiaoFinal) {
            if (!time.paiLendario) {
                log("❌ O Guardião Final é impenetrável sem o Guerreiro Lendário!");
                miniBossAtual = null;
                return;
            }

            // Atributos temporários do Pai Lendário só para este combate
            let ataquePai = 999;
            let defesaPai = 999;

            // Dano do Pai ao Guardião
            let danoDoPai = Math.max(1, ataquePai - (miniBossAtual.defesa || 0));
            miniBossAtual.vida -= danoDoPai;
            log(`🗡️ O Guerreiro Lendário ataca e causa ${danoDoPai} de dano ao Guardião Final!`);

            // Guardião ataca o herói normalmente
            let danoRecebido = Math.max(1, (miniBossAtual.ataque || 0) - defesaPai);
            heroi.vida -= danoRecebido;
            log(`💢 O Guardião Final ataca! Você ${heroi.nome} recebeu ${danoRecebido} de dano.`);

            if (miniBossAtual.vida <= 0) {
                emCombateMiniBoss = false;
                heroi.dinheiro += (miniBossAtual.recompensa || 0);
                log(`🏆 Você ${heroi.nome} derrotou o ${miniBossAtual.nome}! Recompensa: ${miniBossAtual.recompensa} moedas.`);

                // Marca como derrotado
                const chave = miniBossAtual.id || miniBossAtual.nome.toLowerCase();
                miniBossDerrotados[chave] = true;
                miniBossDerrotados[miniBossAtual.id] = true;
                miniBossAtual = null;
                atualizarTela();
                return;
            }

            if (heroi.vida <= 0) {
                log(`☠️ Você ${heroi.nome} foi derrotado pelo Guardião Final!`);
                if (heroi.itens.elixires > 0) {
                    heroi.itens.elixires--;
                    heroi.vida = Math.floor(heroi.vidaMaxima * 0.5);
                    log(`✨ Você ${heroi.nome} usou um Elixir para se reerguer!`);
                } else {
                    heroi.vida = 0;
                    heroi.dinheiro = Math.floor(heroi.dinheiro * 0.5);
                    mudarCenario('imagens/vila.jpg');
                    emCombateMiniBoss = false;
                    miniBossAtual = null;
                }
                atualizarTela();
                return;
            }
        }

        if (isAntiHero) {
            // Só aplica uma vez por luta
            if (!miniBossAtual.debuffAplicado && Math.random() < 0.35) {
                miniBossAtual.debuffAplicado = true;

                // Calcula quanto será reduzido
                let novoAtaque = Math.max(1, Math.floor(ataqueHeroiTurno * 0.8));
                let novaDefesa = Math.max(0, Math.floor(defesaHeroiTurno * 0.8));

                let perdeuAtaque = ataqueHeroiTurno - novoAtaque;
                let perdeuDefesa = defesaHeroiTurno - novaDefesa;

                log("🌀 A Criatura Anti-Herói enfraqueceu seus poderes!");
                log(`⬇️ Ataque -${perdeuAtaque} (de ${ataqueHeroiTurno} para ${novoAtaque})`);
                log(`⬇️ Defesa -${perdeuDefesa} (de ${defesaHeroiTurno} para ${novaDefesa})`);

                ataqueHeroiTurno = novoAtaque;
                defesaHeroiTurno = novaDefesa;
            }

            if (miniBossAtual.debuffAplicado) {
                // Mantém os valores reduzidos durante a luta
                ataqueHeroiTurno = Math.max(1, Math.floor(ataqueHeroiTurno * 0.6));
                defesaHeroiTurno = Math.max(0, Math.floor(defesaHeroiTurno * 0.6));
            }

            atualizarTela();
        }

        // Usa ataqueHeroiTurno e defesaHeroiTurno no cálculo do dano
        let dano = ataqueHeroiTurno - miniBossAtual.defesa;
        let danoRecebido = Math.max(0, miniBossAtual.ataque - defesaHeroiTurno);

        // --- Habilidade: Mutante (DOT de ácido por 3 turnos) ---
        if (isMutante) {
            // 35% de chance de aplicar o DOT quando não ativo
            if (!miniBossAtual.dotRestante && Math.random() < 0.35) {
                miniBossAtual.dotRestante = 3;
                log(`☣️ O Mutante cuspiu ácido! Você ${heroi.nome} sofrerá dano por 3 turnos.`);
            }
            if (miniBossAtual.dotRestante) {
                const dotDano = 4 + Math.floor(heroi.nivel / 2);
                heroi.vida -= dotDano;
                miniBossAtual.dotRestante--;
                log(`🧪 O ácido corrói sua pele (-${dotDano} vida). Turnos restantes: ${miniBossAtual.dotRestante}`);
            }
        }

        // --- Dano do herói para o mini-boss ---
        const danoHeroi = Math.max(1, ataqueHeroiTurno - (miniBossAtual.defesa || 0));
        miniBossAtual.vida -= danoHeroi;
        log(`💥 Você ${heroi.nome} causou ${danoHeroi} de dano a ${miniBossAtual.nome}. Vida restante: ${miniBossAtual.vida}`);

        // --- Ataque do mini-boss ao herói ---
        if (isElemental && Math.random() < 0.25) {
            // Elemental: ataque que ignora parte da defesa e causa +50% de dano
            const bruto = Math.floor((miniBossAtual.ataque || 0) * 1.5);
            const defesaMitigada = Math.floor(defesaHeroiTurno * 0.5);
            danoRecebido = Math.max(1, bruto - defesaMitigada);
            log("🌩️ O Elemental libera um ataque elemental que ignora parte da sua defesa!");
        } else {
            danoRecebido = Math.max(0, (miniBossAtual.ataque || 0) - defesaHeroiTurno);
        }
        heroi.vida -= danoRecebido;
        log(`💢 Você ${heroi.nome} recebeu ${danoRecebido} de dano.`);

        // --- Checa vitória/derrota ---
        if (miniBossAtual.vida <= 0) {

            // Adicionado a verificação se o debuff foi aplicado antes de tentar restaurar

            if (ataqueOriginal !== null && defesaOriginal !== null) {
                heroi.ataque = ataqueOriginal;
                heroi.defesa = defesaOriginal;
                ataqueOriginal = null;
                defesaOriginal = null;
                log("✨ Seus poderes retornaram ao normal após derrotar a Criatura Anti-Herói!");
            }

            emCombateMiniBoss = false;

            // Marque como derrotado se você usa estrutura de controle em outra parte:
            if (typeof miniBossDerrotados !== 'undefined' && miniBossAtual.id != null) {
                miniBossDerrotados[miniBossAtual.id] = true;
            }

            heroi.dinheiro += (miniBossAtual.recompensa || 0);
            log(`🏆 Você ${heroi.nome} derrotou ${miniBossAtual.nome} e recebeu ${(miniBossAtual.recompensa || 0)} moedas!`);

            // Limpa estados especiais
            delete miniBossAtual.debuffAplicado;
            delete miniBossAtual.debuffAvisado;
            delete miniBossAtual.dotRestante;
            miniBossAtual.debuffAplicado = false;
            miniBossDerrotados[chave] = true;

            miniBossAtual = null;
            if (typeof miniBossIndex !== 'undefined') miniBossIndex++;

            atualizarTela();
            return;
        }

        if (heroi.vida <= 0) {
            log(`☠️ Você ${heroi.nome} foi derrotado!`);
            if (heroi.itens.elixires > 0) {
                heroi.itens.elixires--;
                heroi.vida = Math.floor(heroi.vidaMaxima * 0.5);
                log(`Você ${heroi.nome} usou um Elixir para sobreviver!`);
            } else {

                if (miniBossAtual && miniBossAtual.nome === "Criatura Anti-Herói" && miniBossAtual.debuffAplicado) {
                    heroi.ataque = miniBossAtual.ataqueOriginal;
                    heroi.defesa = miniBossAtual.defesaOriginal;
                    log("✨ Seus poderes retornaram ao normal após a luta.");
                }

                heroi.vida = 0;
                heroi.dinheiro = Math.floor(heroi.dinheiro * 0.5);
                log(`Você ${heroi.nome} morreu e perdeu metade do dinheiro!`);
                mudarCenario('imagens/vila.jpg');
                emCombateMiniBoss = false;
                miniBossAtual = null;
            }

            atualizarTela();
            return;
        }

        atualizarTela();
        return; // IMPORTANTÍSSIMO: evita cair no combate comum
    }
    if (!criaturaAncestralAtiva && !criaturaAncestralEncontrada) {
        // 🐾 Combate comum
        let dificuldade = heroi.nivel * 4;
        let danoMonstro = Math.floor(Math.random() * dificuldade) + dificuldade;

        if (heroi.itens.escudoDivino && Math.random() < 0.2) {
            danoMonstro = 0;
            log("Os deuses o protegeram deste ataque!");
        }

        let danoRecebido = Math.max(0, danoMonstro - defesaTotal);
        heroi.vida -= danoRecebido;


        heroi.dinheiro += Math.floor(Math.random() * heroi.nivel) + 1;
        heroi.xp += Math.floor(Math.random() * 3) + heroi.nivel;
        heroi.monstrosDerrotados++;

        const vilaParaGrinding = vilas[numeroDaVila];
        if (vilaParaGrinding) {
            vilaParaGrinding.monstrosDerrotados = (vilaParaGrinding.monstrosDerrotados || 0) + 1;

            // Checa a condição de 150 mortes
            if (vilaParaGrinding.monstrosDerrotados >= 150 && numeroDaVila < vilas.length - 1) {
                log(`☠️ Você ${heroi.nome} dizimou as criaturas desta área tantas vezes que a própria terra o rejeita...`);
                log(`Você ${heroi.nome} avança, mas deixa a vila para trás, sem reconstruí-la.`);
                usouModoGrinding = true; // Marca que o final mediano será ativado

                // Usamos a função avancarParaProximaVila() que já existe
                avancarParaProximaVila();

                // Reseta a contagem para não disparar de novo
                vilaParaGrinding.monstrosDerrotados = 0;

                // Pula o resto da função de lutar
                atualizarTela();
                verificarNivel();
                return;
            }
        }

        log(`Você ${heroi.nome} lutou e recebeu ${danoRecebido} de dano.`);

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
            log(`Você ${heroi.nome} encontrou uma Criatura Ancestral!`);

            if (heroi.vida <= 10) {
                log(`A criatura o atacou de surpresa e você ${heroi.nome} não resistiu...`);
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
        vidaCriaturaAncestral -= ataqueTotal;
        heroi.vida -= ((chefesDerrotados + 1) * 15);

        if (heroi.vida > 0) {
            log(`Criatura Ancestral: 'Você ${heroi.nome} é forte... Junte-se a mim...'`);
            log("Clique em Transformar para aceitar.");
            document.getElementById('botao-transformar').style.display = 'block';
        }

        log(`Você ${heroi.nome} atacou a criatura! Vida dela: ${vidaCriaturaAncestral}. Sua vida: ${heroi.vida}`);

        if (vidaCriaturaAncestral <= 0) {
            criaturaAncestralAtiva = false;
            heroi.itens.derrotouChefao = true;
            chefesDerrotados++;
            document.getElementById('botao-transformar').style.display = 'none';

            log(`Você ${heroi.nome} derrotou a Criatura Ancestral!`);
            log(`Ela sussurra: 'Eu era como você ${heroi.nome}... mas o verdadeiro mal ainda vive...'`);

            if (chefesDerrotados === 1) {
                log("Os anciões da vila revelam a verdade: existe um Criador dos monstros.");
                log("Restaure as vilas perdidas e enfrente o verdadeiro mal.");
            }

            if (chefesDerrotados === 2) {
                log(`Um monstro com a mente não conrrompida aparece disendo que viu que você ${heroi.nome} é poderoso e pode salvar o mundo e agora te acompanha em sua jornada.`);
                adicionarMonstroAliado();
            }

            if (chefesDerrotados >= 3) {
                ativarChefaoFinal();
            }

            aoDerrotarCriaturaAncestral();
            verificarFinal();
        }
    } else {
        document.getElementById('botao-transformar').style.display = 'none';
    }

    if (heroi.vida <= 0) {
        document.getElementById('botao-transformar').style.display = 'none';
        if (heroi.itens.elixires > 0) {
            heroi.itens.elixires--;
            heroi.vida = Math.floor(heroi.vidaMaxima * 0.5);
            log(`Você ${heroi.nome} usou um Elixir e evitou a morte! Vida restaurada.`);
        } else {
            let perdaDinheiro = Math.floor(heroi.dinheiro * 0.5);
            let perdaXP = Math.min(5, heroi.xp);
            heroi.dinheiro -= perdaDinheiro;
            heroi.xp -= perdaXP;
            log(`Você ${heroi.nome} morreu! Perdeu ${perdaDinheiro} dinheiro e ${perdaXP} XP.`);
            mudarCenario('imagens/vila.jpg');
        }
    }

    atualizarTela();
    verificarNivel();
    atualizarTimeVisual();
}


function encantar(tipo) {

    if (cenarioAtual !== 'floresta' || numeroDaVila !== 1) {
        log(`Você ${heroi.nome} só pode encantar com a bruxa na segunda vila.`);
        return;
    }

    if (cristais[tipo] <= 0) {
        log(`❌ Você ${heroi.nome} não possui Cristais de ${tipo}.`);
        return;
    }

    if (heroi.dinheiro < 10) {
        log(`❌ Você ${heroi.nome} precisa de 10 moedas para realizar um encantamento.`);
        return;
    }

    cristais[tipo]--;  // ✅ Remove 1 cristal apenas do tipo usado
    heroi.dinheiro -= 10;  // ✅ Custa 10 moedas

    if (tipo === 'ataque') {
        heroi.ataque += 1;
        log("⚔️ Encantamento de Ataque: +1 de ataque!");
    } else if (tipo === 'defesa') {
        heroi.defesa += 1;
        log("🛡️ Encantamento de Defesa: +1 de defesa!");
    } else if (tipo === 'vida') {
        heroi.vidaMaxima += 10;
        heroi.vida = heroi.vidaMaxima;
        log("❤️ Encantamento de Vida: Vida máxima aumentada!");
    }

    atualizarTela();
    atualizarMenuBruxa();
    atualizarInventarioVisual();
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
        log(`Você ${heroi.nome} não tem ferro suficiente para sacrificar.`);
        return;
    }

    vilaAtual.materiais.ferro -= 1;

    if (tipo === 'ataque') {
        heroi.ataque += 1;
        log(`Você ${heroi.nome} sacrificou 1 ferro e ganhou +1 de ataque.`);
    } else if (tipo === 'defesa') {
        heroi.defesa += 1;
        log(`Você ${heroi.nome} sacrificou 1 ferro e ganhou +1 de defesa.`);
    } else {
        log("Tipo de sacrifício inválido.");
        vilaAtual.materiais.ferro += 1; // devolve o ferro
    }

    atualizarVilaStatus();
    atualizarTela();
}

function explorar() {
    const vila = vilas[numeroDaVila];
    if (cenarioAtual !== 'floresta') {
        log("Só pode explorar na floresta!");
        return;
    }

    let chance = Math.random();
    let encontrouMaterialOuArtefato = false;

    if (chance < 0.02 && !heroi.itens.artefato && vila.nivel >= 2) {
        heroi.itens.artefato = true;
        heroi.defesa += 3;
        log(`Você ${heroi.nome} encontrou o Artefato Lendário azul  escondido na floresta! Defesa +3.`);
        encontrouMaterialOuArtefato = true;
    }

    // Artefato de Ataque (NOVO)
    else if (chance < 0.04 && !heroi.itens.artefatoAtaque && vila.nivel >= 2) {
        heroi.itens.artefatoAtaque = true;
        heroi.ataque += 3;
        log(`Você ${heroi.nome} encontrou o Artefato Lendário vermelho escondido na floresta! Ataque +3.`);
        encontrouMaterialOuArtefato = true;
        atualizarTela();
    }

    // Artefato de Vida (NOVO)
    else if (chance < 0.06 && !heroi.itens.artefatoVida && vila.nivel >= 2) {
        heroi.itens.artefatoVida = true;
        heroi.vidaMaxima += 20;
        heroi.vida = heroi.vidaMaxima; // Cura
        log(`Você ${heroi.nome} encontrou o Artefato Lendário verde escondido na floresta! Vida Máxima +20.`);
        encontrouMaterialOuArtefato = true;
        atualizarTela();
    }

    else if (chance < 0.12) {
        log("Um Monstro da Floresta surgiu!");

        let defesaTotal = heroi.defesa;
        if (time.heroiSecundario) {
            defesaTotal += time.heroiSecundario.defesa;
        }
        if (time.capivara) {
            defesaTotal += time.capivara.defesa;
        }
        if (time.monstroAmigo) {
            defesaTotal += time.monstroAmigo.defesa;
        }
        if (time.paiLendario) {
            defesaTotal += time.paiLendario.defesa;
        }
        // ▲▲ FIM DO BLOCO ADICIONADO ▲▲

        let dificuldade = heroi.nivel * 2;

        let danoMonstro = Math.floor(Math.random() * dificuldade) + dificuldade;

        if (heroi.itens.escudoDivino && Math.random() < 0.2) {
            danoMonstro = 0;
            log("Os deuses o protegeram!");
        }

        let danoRecebido = Math.max(0, danoMonstro - defesaTotal);
        heroi.vida -= danoRecebido;
        log(`Você ${heroi.nome} recebeu ${danoRecebido} de dano.`);

        if (heroi.vida <= 0) {
            if (heroi.itens.elixires > 0) {
                heroi.itens.elixires--;
                heroi.vida = Math.floor(heroi.vidaMaxima * 0.5);
                log("Usou um Elixir! Vida restaurada.");
            } else {
                let perdaDinheiro = Math.floor(heroi.dinheiro * 0.5);
                let perdaXP = Math.min(5, heroi.xp);
                heroi.dinheiro -= perdaDinheiro;
                heroi.xp -= perdaXP;
                log(`Você ${heroi.nome} morreu! Perdeu ${perdaDinheiro} moedas e ${perdaXP} XP.`);
                mudarCenario('imagens/vila.jpg');
                atualizarTela();
                return;
            }
        }

        heroi.dinheiro += Math.floor(Math.random() * heroi.nivel) + 1;
        heroi.xp += Math.floor(Math.random() * 3) + heroi.nivel;
        heroi.monstrosDerrotados++;

        verificarNivel();

        if (missaoAtiva === 'caverna') {
            progressoMissao++;
            log(`Missão: ${progressoMissao}/3`);
            if (progressoMissao >= 3) {
                vila.materiais.madeira += 5;
                log("Missão completa: +5 madeira.");
                missaoAtiva = null;
                progressoMissao = 0;
            }
        }

        if (heroi.itens.sorte && heroi.monstrosDerrotados >= 10) {
            heroi.monstrosDerrotados = 0;
            heroi.dinheiro += 20;
            log("Sua sorte te deu 20 moedas extras!");
        }

    }

    // 🎇 Cristais mágicos: 10% (0.12 a 0.22)
    else if (chance < 0.22 && vilas[1].nivel >= 3 && acharCristais) {
        const tipos = ['ataque', 'defesa', 'vida'];
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];

        if (chance < 0.22 && vilas[1].nivel >= 3) {
            const tipos = ['ataque', 'defesa', 'vida'];
            const tipo = tipos[Math.floor(Math.random() * tipos.length)];

            cristais[tipo] += 1;

            log(`✨ Você ${heroi.nome} encontrou um Cristal de ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}!`);
            encontrouMaterialOuArtefato = true;
        }
        atualizarMenuBruxa();
        encontrouMaterialOuArtefato = true;
        atualizarInventarioVisual()
    }



    else if (chance < 0.47) {
        vila.materiais.madeira += 1;
        log(`Você ${heroi.nome} encontrou uma madeira.`);
        encontrouMaterialOuArtefato = true;
    }

    else if (chance < 0.67) {
        vila.materiais.pedra += 1;
        log(`Você ${heroi.nome} encontrou uma pedra.`);
        encontrouMaterialOuArtefato = true;
    }

    else if (chance < 0.75) {
        vila.materiais.ferro += 1;
        log(`Você ${heroi.nome} encontrou um ferro raro.`);
        encontrouMaterialOuArtefato = true;
    }

    else {
        log(`Você ${heroi.nome} não encontrou nada...`);
    }

    if (missaoAtiva === 'floresta' && encontrouMaterialOuArtefato) {
        progressoMissao++;
        log(`Missão: ${progressoMissao}/2`);
        if (progressoMissao >= 2) {
            vila.materiais.pedra += 3;
            log("Missão completa: +3 pedras!");
            missaoAtiva = null;
            progressoMissao = 0;
        }
    }

    atualizarVilaStatus();
    atualizarTela();
}


function descansar() {
    if (cenarioAtual === 'caverna') {
        log(`Você ${heroi.nome} não pode descansar na caverna, não é seguro!`);
        return;
    }

    if (heroi.itens.pocoes > 0) {
        heroi.itens.pocoes--;
        heroi.vida = heroi.vidaMaxima;
        log(`Você ${heroi.nome} usou uma Poção para descansar e recuperou sua vida totalmente.`);
    } else {
        log(`Você ${heroi.nome} não tem nenhuma Poção para descansar!`);
    }

    atualizarTela();
}

function comprarItem(item) {
    // Tabelas de evolução para espada e escudo
    const equipamentos = {
        espada: [
            { nome: "Espada de Madeira", preco: 20, bonus: 2 },
            { nome: "Espada de Ferro", preco: 30, bonus: 3 },
            { nome: "Espada de Aço", preco: 40, bonus: 4 }
        ],
        escudo: [
            { nome: "Escudo de Madeira", preco: 20, bonus: 2 },
            { nome: "Escudo de Ferro", preco: 30, bonus: 3 },
            { nome: "Escudo de Aço", preco: 40, bonus: 4 }
        ]
    };

    // Caso seja poção
    if (item === 'pocao') {
        const precoPocao = 10;
        if (heroi.dinheiro < precoPocao) {
            log("❌ Dinheiro insuficiente para comprar uma poção.");
            return;
        }
        heroi.dinheiro -= precoPocao;
        heroi.itens.pocoes++;
        log(`✅ Você ${heroi.nome} comprou uma Poção!`);
        atualizarTela();
        atualizarInventarioVisual?.();
        return;
    }

    // Caso seja espada ou escudo
    if (!equipamentos[item]) {
        log("❌ Item inválido.");
        return;
    }

    const nivelAtual = heroi.itens[item + 'Nivel'] || 0;
    if (nivelAtual >= equipamentos[item].length) {
        log(`⚠️ Você ${heroi.nome} já tem a melhor ${item}.`);
        return;
    }

    const proximo = equipamentos[item][nivelAtual];
    if (heroi.dinheiro < proximo.preco) {
        log(`❌ Você ${heroi.nome} precisa de ${proximo.preco} moedas para comprar a ${proximo.nome}.`);
        return;
    }

    heroi.dinheiro -= proximo.preco;
    heroi.itens[item + 'Nivel'] = nivelAtual + 1;
    if (item === 'espada') heroi.ataque += proximo.bonus;
    if (item === 'escudo') heroi.defesa += proximo.bonus;

    log(`✅ Você comprou a ${proximo.nome}!`);
    atualizarTela();
    atualizarInventarioVisual?.();
    atualizarLoja();

    if (item === 'espada') {
        heroi.ataque += proximo.bonus;
        log(`✅ Você ${heroi.nome} comprou a ${proximo.nome}! Ataque +${proximo.bonus}.`);
    }
    if (item === 'escudo') {
        heroi.defesa += proximo.bonus;
        log(`✅ Você ${heroi.nome} comprou o ${proximo.nome}! Defesa +${proximo.bonus}.`);
    }

}


function comprarItemBlack(item) {
    if (cenarioAtual !== 'floresta') {
        log(`Você ${heroi.nome} só pode acessar o Mercado Negro na floresta.`);
        return;
    }

    if (item === 'elixir') {
        if (heroi.dinheiro >= 50) {
            heroi.dinheiro -= 50;
            heroi.itens.elixires++;
            log(`Você ${heroi.nome} comprou um Elixir! Ele será usado automaticamente ao morrer.`);
        } else {
            log("Dinheiro insuficiente para comprar Elixir (custa 50).");
        }
    } else if (item === 'armadura') {
        if (heroi.dinheiro >= 60) {
            if (!heroi.itens.armadura) {
                heroi.dinheiro -= 60;
                heroi.itens.armadura = true;
                heroi.defesa += 3;
                log(`Você ${heroi.nome} comprou uma Armadura! Defesa +3.`);
            } else {
                log(`Você ${heroi.nome} já possui uma Armadura.`);
            }
        } else {
            log("Dinheiro insuficiente para comprar Armadura (custa 60).");
        }
    } else {
        log("Item inválido no mercado negro.");
    }

    atualizarTela();
}

function atualizarNomeVila() {
    const nome = nomeVila(numeroDaVila);
    const p = document.getElementById('nome-vila-exibido');
    if (p) p.textContent = `Vila Atual: ${nome}`;
}

function melhorarVila() {
    const dados = vilas[numeroDaVila];

    // Calcula o nível de herói necessário com base na vila
    let nivelNecessarioHeroi;
    if (numeroDaVila === 0) { // Vila 1 (índice 0)
        nivelNecessarioHeroi = dados.nivel;
    } else if (numeroDaVila === 1) { // Vila 2 (índice 1)
        nivelNecessarioHeroi = dados.nivel * 2; // Dobro do nível da vila
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
        let limite;
        if (numeroDaVila === 0) {
            limite = 5;
        } else if (numeroDaVila === 1) {
            limite = 4;
        } else {
            limite = 3;
        }
        if (dados.nivel >= limite) {
            log("Esta vila já atingiu o nível máximo.");
            return;
        }

        dados.nivel++;
        dados.materiais.madeira -= 5;
        dados.materiais.pedra -= 5;
        dados.materiais.ferro -= 2;

        log(`🛠️ A vila de ${nomeVila(numeroDaVila)} evoluiu para o nível ${dados.nivel}.`);

        aplicarBeneficiosVilaAtual();
        atualizarAcoesEspecificas();
        atualizarNomeVila();

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
    log(`Enquanto a vila cresce, você ${heroi.nome} encontra inscrições antigas: três artefatos lendários estão escondidos pela floresta...`);
}

function narrativaVilaNivel3() {
    log("O Templo foi restaurado. Um sacerdote conta que uma criatura ancestral desperta na caverna...");
}

function narrativaVilaNivel4() {
    log(`A sorte sorri para você ${heroi.nome}... mas também atrai inimigos mais poderosos das sombras.`);
}

function narrativaVilaNivel5() {
    log(`Você ${heroi.nome} descobre: a vila foi destruída por uma entidade sombria. Está na hora do confronto final!`);
}

// --- FUNÇÃO VERIFICARFINAL---

function ativarChefaoFinal() {
    log(`Você ${heroi.nome} sente uma energia sombria... O Criador está vindo.`);
    chefaoFinalAtivo = true;
    vidaChefaoFinal = 1000;
    log(`De repente você ${heroi.nome} é informado de que um grande mal voltou à sua vila natal.`);
    log("🕯️ Um mal ancestral desperta... A caverna da vila natal o aguarda.");
    log("⚔️ Volte à caverna da vila natal para enfrentar o Criador.");

    // Mudei para 5 segundos para testes, pode voltar para 20000 se quiser
    setTimeout(() => {
        numeroDaVila = 0; // Redefine para a vila natal
        // A linha 'vilaAtual.nivel == 0;' no seu código original não fazia nada e foi removida.
        heroi.itens.derrotouChefao = false;
        mudarCenario('imagens/vila.jpg');
        atualizarVilaStatus();
    }, 20000); // 5 segundos
}

function verificarFinal() {
    if (heroi.itens.derrotouChefao) {
        if (numeroDaVila < vilas.length - 1) {
            log(`Você ${heroi.nome} derrotou a Criatura Ancestral da Vila ${numeroDaVila + 1}!`);
            log(`Preparando para descobrir a próxima área...`);

            setTimeout(() => {
                numeroDaVila++;
                // heroi.vilaAtual = numeroDaVila;

                criaturaAncestralAtiva = false;
                criaturaAncestralEncontrada = false;
                heroi.itens.derrotouChefao = false;

                document.getElementById('log').innerHTML = '';
                mudarCenario(`imagens/vila.jpg`, false);

                log(`🧭 Uma nova vila foi descoberta. Bem-vindo à ${nomeVila(numeroDaVila)}.`);
                log("Comece a reconstruí-la e prepare-se para novos desafios.");
                salvarJogo(); // Auto-save aqui!
                log("Nova vila desbloqueada. O jogo foi salvo automaticamente.");

                atualizarTela();
                atualizarVilaStatus();
                aplicarBeneficiosVilaAtual();
                atualizarAcoesEspecificas();
            }, 20000);



        } else {
            // Este bloco é chamado ao derrotar a criatura da ÚLTIMA vila.
            log(`🎉 Parabéns! Você ${heroi.nome} derrotou a Criatura Ancestral final.`);

            // AQUI ESTÁ O SEU TESTE:
            // Se o jogador usou o "grinding" para pular vilas...
            if (usouModoGrinding) {
                log(`O caminho que você ${heroi.nome} trilhou o leva direto ao fim..."`);
                ativarChefaoFinal(); // Invoca o chefe imediatamente!
            } else {
                // Se for o caminho normal, a ativação do chefe já aconteceu em lutar()
                // (no Passo 2 que fizemos). Apenas mostramos a mensagem final.
                log(`Você ${heroi.nome} restaurou todas as vilas e derrotou todos os Ancestrais.`);
                log("Agora, um desafio final o aguarda...");
                // Não precisamos fazer nada, o chefe já foi ativado.
            }
        }
    }
}

function transformarEmMonstro() {
    criaturaAncestralAtiva = false;

    log(`Você ${heroi.nome} aceitou a proposta da Criatura Ancestral...`);
    log(`Agora você ${heroi.nome} é um monstro como ela, e vagueia pela caverna por toda eternidade.`);
    log("(Final ruin)");
    conquistas.finalRuim = true;


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
        alert(`Final alternativo: Você ${heroi.nome} se tornou um monstro.`);
    }, 15000);
}

function avancarParaProximaVila() {
    // Estas mensagens aparecerão IMEDIATAMENTE após a criatura ser derrotada.
    log(`Você ${heroi.nome} derrotou a Criatura Ancestral e pode avançar!`);
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

        }, 20000); // 20 segundos (20000 milissegundos) de atraso. Ajuste conforme necessário.

    } else {
        // Se todas as vilas foram desbloqueadas, lida com o chefão final
        log(`🎉 Parabéns! Você ${heroi.nome} derrotou a última Criatura Ancestral e restaurou todas as vilas.`);
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

    log(`⚔️ Você ${heroi.nome} encontrou a Criatura Ancestral Nível ${nivelAncestral}! Prepare-se para a luta...`);
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
    heroi.defesa += 5;
    log(`🎉 Você ${heroi.nome} derrotou a Criatura Ancestral! Defesa +5.`);
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
        log(`Você ${heroi.nome} causou dano! Vida do monstro: ${vidaMonstroFinal}. Sua vida: ${heroi.vida}`);
    }

    if (heroi.vida <= 0) {
        log("⚰️ O Monstro Original o derrotou. Ainda há esperança?");
        heroi.vida = 0;
        return;
    }

    log(`🌟 Você ${heroi.nome} derrotou o Monstro Original e restaurou a paz no mundo!`);
    setTimeout(() => {
        alert(`Obrigado por jogar  O último herói!\nVocê ${heroi.nome} completou sua jornada.`);

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
        time,
        vilas,
        numeroDaVila,
        cenario: cenarioAtual,
        criaturaAncestralAtiva,
        criaturaAncestralEncontrada,
        vidaCriaturaAncestral,
        chefesDerrotados,
        chefaoFinalAtivo,
        vidaChefaoFinal,
        missaoAtiva,
        progressoMissao,
        miniBossIndex,
        miniBossDerrotados,
        usouModoGrinding,
        conquistas
    };

    localStorage.setItem('saveGame', JSON.stringify(dados));
    log("💾 Jogo salvo com sucesso!");
}


function carregarJogo() {
    const dados = localStorage.getItem('saveGame');
    if (!dados) {
        log("⚠️ Nenhum jogo salvo encontrado.");
        return;
    }

    const obj = JSON.parse(dados);

    Object.assign(heroi, obj.heroi || {});
    Object.assign(heroi.itens, obj.heroi?.itens || {});
    heroi.segundoHeroi = obj.heroi?.segundoHeroi || false;

    // Time
    time = obj.time || {};

    // Vilas
    vilas.length = 0;
    (obj.vilas || []).forEach(v => {
        if (!v.bonus) v.bonus = [];
        vilas.push(v);
    });

    numeroDaVila = obj.numeroDaVila ?? 0;
    cenarioAtual = obj.cenario || 'vila';

    if (!heroi.codigosResgatados) {
        heroi.codigosResgatados = {};
    }

    usouModoGrinding = obj.usouModoGrinding || false;
    conquistas = obj.conquistas || { finalRuim: false, finalMediano: false, finalBom: false };

    // Criaturas Ancestrais e Chefão
    criaturaAncestralAtiva = obj.criaturaAncestralAtiva || false;
    criaturaAncestralEncontrada = obj.criaturaAncestralEncontrada || false;
    vidaCriaturaAncestral = obj.vidaCriaturaAncestral || 0;
    chefesDerrotados = obj.chefesDerrotados || 0;
    chefaoFinalAtivo = obj.chefaoFinalAtivo || false;
    vidaChefaoFinal = obj.vidaChefaoFinal || 0;

    // Missão e Mini Boss
    missaoAtiva = obj.missaoAtiva || null;
    progressoMissao = obj.progressoMissao || 0;
    miniBossIndex = obj.miniBossIndex || 0;
    miniBossDerrotados = obj.miniBossDerrotados || [];


    // Atualizações gerais
    mudarCenario(`imagens/${cenarioAtual}.jpg`, false);
    atualizarTela();
    atualizarLoja();
    atualizarCombate();
    atualizarBlackMarket();
    atualizarMissoes();
    atualizarVilaStatus();
    atualizarAcoesEspecificas();
    atualizarBotoesTelaInicial();

    log("✅ Jogo carregado com sucesso!");
}

function fecharJogo() {
    window.location.href = "https://www.google.com"; // Substitua pelo seu link
}
