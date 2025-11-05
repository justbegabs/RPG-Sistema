/**
 * Sistema de Carregamento de Dados
 * Carrega automaticamente todos os arquivos JSON de classes, raças e origens
 */

// Cache dos dados carregados
let dadosCache = {
    classes: [],
    racas: [],
    origens: []
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
        const [classes, racas, origens] = await Promise.all([
            carregarPasta('classes', ARQUIVOS_CLASSES),
            carregarPasta('racas', ARQUIVOS_RACAS),
            carregarPasta('origens', ARQUIVOS_ORIGENS)
        ]);
        
        dadosCache = {
            classes: classes,
            racas: racas,
            origens: origens
        };
        
        console.log('Dados carregados:', {
            classes: classes.length,
            racas: racas.length,
            origens: origens.length
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
    getCache: () => dadosCache
};

