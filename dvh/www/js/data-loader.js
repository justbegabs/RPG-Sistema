/**
 * Sistema de Carregamento de Dados
 * Carrega automaticamente todos os arquivos JSON de classes, raças e origens
 */

// Cache dos dados carregados
let dadosCache = {
    classes: [],
    racas: [],
    origens: [],
    itens: {
        armas: [],
        comuns: [],
        raca: [],
        classe: [],
        origem: []
    }
};

// Lista de arquivos conhecidos (pode ser expandida dinamicamente)
const ARQUIVOS_CLASSES = [
    'arsenalhumano.json',
    'armadilheiro.json',
    'atirador.json',
    'carteado.json',
    'clerigo.json',
    'combatente.json',
    'demonologista.json',
    'domador.json',
    'espiao.json',
    'investigador.json',
    'curandeiro.json',
    'mago.json',
    'suporte.json',
    'tecnologico.json'
];

const ARQUIVOS_RACAS = [
    'alien.json',
    'anjo.json',
    'anjocaido.json',
    'anao.json',
    'banshee.json',
    'bruxa.json',
    'ciborgue.json',
    'demonio.json',
    'elfo.json',
    'esqueleto.json',
    'fae.json',
    'humano.json',
    'kanima.json',
    'kitsune.json',
    'lobisomem.json',
    'metamorfo.json',
    'neko.json',
    'ninfa.json',
    'nogitsune.json',
    'semideus.json',
    'satiro.json',
    'sereia.json',
    'sucubo.json',
    'vampiro.json',
    'veliria.json'
];

const ARQUIVOS_ORIGENS = [
    'amnesico.json',
    'artista.json',
    'conspiracionista.json',
    'criancaperdida.json',
    'eremita.json',
    'escolhido.json',
    'exilado.json',
    'experimento.json',
    'forasteiro.json',
    'ginasta.json',
    'herdeiro.json',
    'inventor.json',
    'jornalista.json',
    'militar.json',
    'motorista.json',
    'programador.json',
    'profeta.json',
    'psicologo.json',
    'religioso.json',
    'servente.json',
    'universitario.json',
    'vingativo.json'
];

// Arquivos de itens (catálogo)
const ARQUIVOS_ITENS_ARMAS = [
    // Originais
    'adaga.json',
    'arco-longo.json',
    'cajado-arcano.json',
    'espada-longa.json',
    // Armas de luta (Força)
    'soqueira.json',
    'machado.json',
    'nunchaku.json',
    'martelo.json',
    'lanca.json',
    'chicote.json',
    'clava.json',
    'tridente.json',
    'foice.json',
    'bastao.json',
    'maca.json',
    'alabarda.json',
    'mangual.json',
    'corrente.json',
    'taser.json',
    // Armas de Espadas (Força)
    // Espadas (Força)
    'espada.json',
    'katana.json',
    'punhal.json',
    'faca-espadas.json',
    'sabre.json',
    'cimitarra.json',
    'gladio.json',
    'naginata.json',
    'machete.json',
    'estoque.json',
    'lamina-escondida.json',
    // Armas de pontaria (Destreza)
    'faca.json',
    'taser-pontaria.json',
    'cartas.json',
    // Dardos (Destreza)
    'zarabatana.json',
    'dardos-conjunto.json',
    // Explosivos (Destreza)
    'lanca-chamas.json',
    'canhao-plasma.json',
    'arma-particulas.json',
    'arma-som.json',
    'granada.json',
    'mina-terrestre.json',
    // Improvisadas (Variável)
    'arma-improvisada.json',
    // Armadilhas (Destreza)
    'nanobots.json',
    'drone.json',
    'armadilhas-diversas.json',
    // Armas de fogo pequenas (Destreza)
    'pistola.json',
    'revolver.json',
    'submetralhadora.json'
    ,// Armas de fogo grandes (Destreza)
    'rifle.json',
    'escopeta.json',
    'carabina.json'
    ,// Arcos e bestas (Destreza)
    'besta.json',
    'arco-comum.json',
    'arco-composto.json'
];

const ARQUIVOS_ITENS_COMUNS = [
    'corda-seda.json',
    'kit-ferramentas.json',
    'mochila-aventureiro.json',
    'pocao-cura.json',
    'tocha.json',
    // Novos itens comuns
    'amuleto-teletransporte.json',
    'armadura.json',
    'escudo.json',
    'pedra-comunicacao.json',
    'oculos-infravermelho.json',
    'camera.json',
    'ervas-medicinais.json',
    'pergaminho-cura.json',
    'mascara-mil-rostos.json',
    'corda-prisao-perpetua.json',
    'mochila-sobrevivencia.json',
    'silenciador.json',
    'mira-laser.json',
    'laptop.json',
    'equipamentos-laboratorio.json',
    'celular.json',
    'manuscritos-religiosos.json',
    'livros-encantados.json',
    'mapa-astral.json',
    'bolsa-acampamento.json',
    'batom-vermelho.json'
];

const ARQUIVOS_ITENS_RACA = [
    'asas-anjo.json',
    'cauda-kitsune.json',
    'garras-lobisomem.json',
    'presas-vampiro.json'
];

const ARQUIVOS_ITENS_CLASSE = [
    'baralho-carteado.json',
    'ferramentas-tecnologico.json',
    'grimorio-mago.json',
    'kit-armadilhas.json',
    'simbolo-sagrado.json',
    // Novos itens de classe
    'bolsa-pedras-magicas.json',
    'certificado-licenca.json',
    'baralho-viciado.json',
    'nota-papel.json',
    'luva-aco.json',
    'bolsa-vacinas.json',
    'dicionario-infernal.json',
    'pacote-racao.json',
    'anel-passo-silencioso.json',
    'oculos-investigador.json',
    'chapeu-mago.json',
    'pacote-chiclete-magico.json',
    'chave-fenda.json',
    'coldre.json'
];

const ARQUIVOS_ITENS_ORIGEM = [
    'diario-jornalista.json',
    'equipamento-militar.json',
    'ferramentas-artista.json',
    'kit-sobrevivencia.json',
    'laptop-programador.json'
];

/**
 * Carrega um arquivo JSON individual
 * @param {string} caminho - Caminho do arquivo JSON
 * @returns {Promise<Object>} - Dados do arquivo
 */
async function carregarArquivoJSON(caminho) {
    try {
        const resposta = await fetch(caminho);
        if (!resposta.ok) {
            throw new Error(`Erro ao carregar ${caminho}: ${resposta.status}`);
        }
        const dados = await resposta.json();
        return dados;
    } catch (error) {
        console.error(`Erro ao carregar arquivo ${caminho}:`, error);
        return null;
    }
}

/**
 * Carrega todos os arquivos de uma pasta
 * @param {string} pasta - Nome da pasta (classes, racas, origens)
 * @param {string[]} arquivos - Lista de nomes de arquivos
 * @returns {Promise<Array>} - Array com todos os dados carregados
 */
async function carregarPasta(pasta, arquivos) {
    const dados = [];
    
    for (const arquivo of arquivos) {
        const caminho = `data/${pasta}/${arquivo}`;
        const dadosArquivo = await carregarArquivoJSON(caminho);
        
        if (dadosArquivo) {
            dados.push(dadosArquivo);
        }
    }
    
    // Ordena por nome
    dados.sort((a, b) => a.nome.localeCompare(b.nome));
    
    return dados;
}

/**
 * Carrega todos os dados (classes, raças, origens)
 * @returns {Promise<Object>} - Objeto com todos os dados carregados
 */
async function carregarTodosDados() {
    try {
        const [classes, racas, origens, itensArmas, itensComuns, itensRaca, itensClasse, itensOrigem] = await Promise.all([
            carregarPasta('classes', ARQUIVOS_CLASSES),
            carregarPasta('racas', ARQUIVOS_RACAS),
            carregarPasta('origens', ARQUIVOS_ORIGENS),
            carregarPasta('itens/armas', ARQUIVOS_ITENS_ARMAS),
            carregarPasta('itens/comuns', ARQUIVOS_ITENS_COMUNS),
            carregarPasta('itens/raca', ARQUIVOS_ITENS_RACA),
            carregarPasta('itens/classe', ARQUIVOS_ITENS_CLASSE),
            carregarPasta('itens/origem', ARQUIVOS_ITENS_ORIGEM)
        ]);
        
        dadosCache = {
            classes: classes,
            racas: racas,
            origens: origens,
            itens: {
                armas: itensArmas,
                comuns: itensComuns,
                raca: itensRaca,
                classe: itensClasse,
                origem: itensOrigem
            }
        };
        
        console.log('Dados carregados:', {
            classes: classes.length,
            racas: racas.length,
            origens: origens.length,
            itens: {
                armas: itensArmas.length,
                comuns: itensComuns.length,
                raca: itensRaca.length,
                classe: itensClasse.length,
                origem: itensOrigem.length
            }
        });
        
        return dadosCache;
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        return dadosCache;
    }
}

/**
 * Carrega dados dinamicamente descobrindo arquivos (método alternativo)
 * Nota: Requer um arquivo index.json ou lista de arquivos
 */
async function carregarDadosDinamicos() {
    // Método alternativo: tenta descobrir arquivos automaticamente
    // Por enquanto, usa a lista conhecida
    return await carregarTodosDados();
}

/**
 * Obtém dados do cache
 * @param {string} tipo - 'classes', 'racas' ou 'origens'
 * @returns {Array} - Array de dados
 */
function obterDados(tipo) {
    return dadosCache[tipo] || [];
}

/**
 * Obtém um item específico por ID
 * @param {string} tipo - 'classes', 'racas' ou 'origens'
 * @param {string} id - ID do item
 * @returns {Object|null} - Dados do item ou null
 */
function obterItemPorId(tipo, id) {
    const dados = obterDados(tipo);
    return dados.find(item => item.id === id) || null;
}

/**
 * Obtém itens do catálogo por categoria
 * @param {'armas'|'comuns'|'raca'|'classe'|'origem'} categoria
 * @returns {Array}
 */
function obterItensPorCategoria(categoria) {
    if (!dadosCache.itens) return [];
    return dadosCache.itens[categoria] || [];
}

/**
 * Obtém item específico do catálogo por categoria e id
 */
function obterItemCatalogo(categoria, id) {
    const lista = obterItensPorCategoria(categoria);
    return lista.find(i => i.id === id) || null;
}

/**
 * Inicializa o carregamento de dados
 */
async function inicializarDados() {
    await carregarTodosDados();
    return dadosCache;
}

// Exporta funções para uso global
window.DadosLoader = {
    carregarTodos: carregarTodosDados,
    carregarDadosDinamicos: carregarDadosDinamicos,
    obterDados: obterDados,
    obterItemPorId: obterItemPorId,
    inicializar: inicializarDados,
    getCache: () => dadosCache,
    obterItensPorCategoria,
    obterItemCatalogo
};

