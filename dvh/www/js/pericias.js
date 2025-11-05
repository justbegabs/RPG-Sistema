/**
 * Sistema de Perícias
 * Gerencia as perícias do personagem organizadas por atributo
 */

// Estrutura de perícias por atributo
const PERICIAS = {
    forca: [
        { nome: 'Acrobacia', id: 'acrobacia' },
        { nome: 'Espadas', id: 'espadas' },
        { nome: 'Luta', id: 'luta' },
        { nome: 'Escudos', id: 'escudos' }
    ],
    destreza: [
        { nome: 'Explosivos', id: 'explosivos' },
        { nome: 'Pontaria', id: 'pontaria' },
        { nome: 'Armas de Fogo (Grandes)', id: 'armas_fogo_grandes' },
        { nome: 'Armas de Fogo (Pequenas)', id: 'armas_fogo_pequenas' },
        { nome: 'Arcos', id: 'arcos' },
        { nome: 'Armadilhas', id: 'armadilhas' },
        { nome: 'Dardos', id: 'dardos' },
        { nome: 'Pilotagem', id: 'pilotagem' },
        { nome: 'Reflexos', id: 'reflexos' },
        { nome: 'Furtividade', id: 'furtividade' },
        { nome: 'Iniciativa', id: 'iniciativa' }
    ],
    intelecto: [
        { nome: 'Investigação', id: 'investigacao' },
        { nome: 'Tecnologia', id: 'tecnologia' },
        { nome: 'Forense', id: 'forense' },
        { nome: 'Genealogia', id: 'genealogia' },
        { nome: 'Ciências', id: 'ciencias' },
        { nome: 'Trapaça', id: 'trapaca' },
        { nome: 'Crime', id: 'crime' },
        { nome: 'Medicina', id: 'medicina' },
        { nome: 'Psicologia', id: 'psicologia' }
    ],
    sabedoria: [
        { nome: 'Percepção', id: 'percepcao' },
        { nome: 'Raciocínio', id: 'raciocinio' },
        { nome: 'Enganação', id: 'enganacao' },
        { nome: 'Diplomacia', id: 'diplomacia' },
        { nome: 'Vontade', id: 'vontade' },
        { nome: 'Artes', id: 'artes' },
        { nome: 'Cozinhar', id: 'cozinhar' },
        { nome: 'Alquimia', id: 'alquimia' },
        { nome: 'Atualidades', id: 'atualidades' },
        { nome: 'Antropologia', id: 'antropologia' },
        { nome: 'História', id: 'historia' },
        { nome: 'Herbologia', id: 'herbologia' }
    ],
    magia: [
        { nome: 'Religião', id: 'religiao' },
        { nome: 'Conhecimento Arcano', id: 'conhecimento_arcano' },
        { nome: 'Conjuração', id: 'conjuracao' },
        { nome: 'Encantamento', id: 'encantamento' },
        { nome: 'Ilusão', id: 'ilusao' },
        { nome: 'Necromancia', id: 'necromancia' },
        { nome: 'Exorcismo', id: 'exorcismo' },
        { nome: 'Runas', id: 'runas' },
        { nome: 'Demonologia', id: 'demonologia' },
        { nome: 'Astrologia', id: 'astrologia' }
    ],
    constituicao: [
        { nome: 'Sobrevivência', id: 'sobrevivencia' },
        { nome: 'Atletismo', id: 'atletismo' },
        { nome: 'Fortitude', id: 'fortitude' }
    ],
    carisma: [
        { nome: 'Intimidação', id: 'intimidacao' },
        { nome: 'Empatia', id: 'empatia' },
        { nome: 'Sedução', id: 'seducao' },
        { nome: 'Lábia', id: 'labia' }
    ]
};

// Nomes dos atributos para exibição
const NOMES_ATRIBUTOS = {
    forca: 'Força',
    destreza: 'Destreza',
    intelecto: 'Intelecto',
    sabedoria: 'Sabedoria',
    magia: 'Magia',
    constituicao: 'Constituição',
    carisma: 'Carisma'
};

/**
 * Inicializa a página de perícias
 */
function initPericias() {
    renderizarPericias();
}

/**
 * Renderiza as perícias na interface
 */
function renderizarPericias() {
    const container = document.getElementById('pericias-content');
    if (!container) return;
    
    let html = '';
    
    // Itera sobre cada atributo
    Object.keys(PERICIAS).forEach(atributoKey => {
        const nomeAtributo = NOMES_ATRIBUTOS[atributoKey];
        const pericias = PERICIAS[atributoKey];
        
        html += `
            <div class="pericias-grupo">
                <h3 class="pericias-grupo-title">${nomeAtributo}</h3>
                <div class="pericias-grid">
                    ${pericias.map(pericia => criarCardPericia(pericia, atributoKey)).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    adicionarEventListenersPericias();
}

/**
 * Cria um card de perícia
 */
function criarCardPericia(pericia, atributoKey) {
    const valor = obterValorPericia(pericia.id);
    const valorFormatado = valor >= 0 ? `+${valor}` : `${valor}`;
    const corClasse = valor > 0 ? 'positivo' : valor < 0 ? 'negativo' : 'neutro';
    
    return `
        <div class="pericia-card ${corClasse}">
            <button class="pericia-btn" onclick="testarPericia('${pericia.id}', '${atributoKey}')" title="Clique para fazer um teste">
                <span class="pericia-nome">${pericia.nome}</span>
                <span class="pericia-valor ${corClasse}">${valorFormatado}</span>
            </button>
            <div class="pericia-controles">
                <button class="btn-controle" onclick="alterarPericia('${pericia.id}', -1)">-</button>
                <button class="btn-controle" onclick="alterarPericia('${pericia.id}', 1)">+</button>
            </div>
        </div>
    `;
}

/**
 * Obtém o valor de uma perícia do localStorage
 */
function obterValorPericia(id) {
    const saved = localStorage.getItem('pericias_personagem');
    if (saved) {
        const dados = JSON.parse(saved);
        return dados[id] !== undefined ? parseInt(dados[id]) : 0;
    }
    return 0;
}

/**
 * Salva todas as perícias no localStorage
 */
function salvarPericias() {
    const dados = {};
    
    Object.values(PERICIAS).flat().forEach(pericia => {
        dados[pericia.id] = obterValorPericia(pericia.id);
    });
    
    localStorage.setItem('pericias_personagem', JSON.stringify(dados));
}

/**
 * Altera o valor de uma perícia
 */
function alterarPericia(id, delta) {
    const valorAtual = obterValorPericia(id);
    const novoValor = valorAtual + delta;
    
    // Limite de -5 a +5 (pode ser ajustado)
    if (novoValor < -5 || novoValor > 5) {
        return;
    }
    
    const saved = localStorage.getItem('pericias_personagem');
    const dados = saved ? JSON.parse(saved) : {};
    dados[id] = novoValor;
    localStorage.setItem('pericias_personagem', JSON.stringify(dados));
    
    // Re-renderiza
    renderizarPericias();
}

/**
 * Testa uma perícia (rolagem de dados)
 */
function testarPericia(id, atributoKey) {
    // Obtém o valor da perícia
    const valorPericia = obterValorPericia(id);
    
    // Obtém o valor do atributo base
    const valorAtributo = obterValorAtributo(atributoKey);
    
    // Valor total = atributo + perícia
    const valorTotal = valorAtributo + valorPericia;
    
    // Busca nome da perícia
    const pericia = Object.values(PERICIAS).flat().find(p => p.id === id);
    const nomePericia = pericia ? pericia.nome : id;
    const nomeAtributo = NOMES_ATRIBUTOS[atributoKey] || atributoKey;
    
    // Faz a rolagem usando o valor total
    let quantidadeDados;
    let resultado;
    let dadosRolados = [];
    
    if (valorTotal > 0) {
        quantidadeDados = valorTotal;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = Math.floor(Math.random() * 20) + 1;
            dadosRolados.push(dado);
        }
        resultado = Math.max(...dadosRolados);
    } else if (valorTotal === 0) {
        quantidadeDados = 2;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = Math.floor(Math.random() * 20) + 1;
            dadosRolados.push(dado);
        }
        resultado = Math.min(...dadosRolados);
    } else {
        quantidadeDados = Math.abs(valorTotal) + 2;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = Math.floor(Math.random() * 20) + 1;
            dadosRolados.push(dado);
        }
        resultado = Math.min(...dadosRolados);
    }
    
    exibirResultadoPericia(nomePericia, nomeAtributo, valorAtributo, valorPericia, valorTotal, quantidadeDados, dadosRolados, resultado);
}

/**
 * Obtém o valor de um atributo
 */
function obterValorAtributo(atributoKey) {
    const saved = localStorage.getItem('atributos_personagem');
    if (saved) {
        const dados = JSON.parse(saved);
        // Mapeia nomes de atributos
        const map = {
            'forca': 'forca',
            'destreza': 'destreza',
            'intelecto': 'intelecto',
            'sabedoria': 'sabedoria',
            'magia': 'magia',
            'constituicao': 'constituicao',
            'carisma': 'carisma'
        };
        
        const idAtributo = map[atributoKey];
        return dados[idAtributo] !== undefined ? parseInt(dados[idAtributo]) : 0;
    }
    return 0;
}

/**
 * Exibe resultado do teste de perícia
 */
function exibirResultadoPericia(nomePericia, nomeAtributo, valorAtributo, valorPericia, valorTotal, quantidadeDados, dadosRolados, resultado) {
    const resultadoDiv = document.getElementById('resultado-rolagem-pericias');
    const conteudoDiv = document.getElementById('resultado-conteudo-pericias');
    
    if (!resultadoDiv || !conteudoDiv) return;
    
    const valorTotalFormatado = valorTotal >= 0 ? `+${valorTotal}` : `${valorTotal}`;
    const valorAtributoFormatado = valorAtributo >= 0 ? `+${valorAtributo}` : `${valorAtributo}`;
    const valorPericiaFormatado = valorPericia >= 0 ? `+${valorPericia}` : `${valorPericia}`;
    
    let descricao = '';
    
    if (valorTotal > 0) {
        descricao = `Rolou ${quantidadeDados} dado${quantidadeDados > 1 ? 's' : ''} D20 e pegou o <strong>maior</strong> valor.`;
    } else if (valorTotal === 0) {
        descricao = `Rolou 2 dados D20 e pegou o <strong>pior</strong> valor.`;
    } else {
        descricao = `Rolou ${quantidadeDados} dados D20 e pegou o <strong>pior</strong> valor.`;
    }
    
    conteudoDiv.innerHTML = `
        <div class="resultado-header">
            <span class="resultado-atributo">${nomePericia}</span>
            <span class="resultado-valor-atributo">${valorTotalFormatado}</span>
        </div>
        <div class="resultado-info">
            <p><strong>Atributo Base (${nomeAtributo}):</strong> ${valorAtributoFormatado}</p>
            <p><strong>Bônus de Perícia:</strong> ${valorPericiaFormatado}</p>
            <p><strong>Total:</strong> ${valorTotalFormatado}</p>
        </div>
        <p class="resultado-descricao">${descricao}</p>
        <div class="resultado-dados">
            <div class="dados-rolados">
                <strong>Dados rolados:</strong>
                <div class="dados-lista">
                    ${dadosRolados.map(dado => `
                        <span class="dado-valor ${dado === resultado ? 'dado-resultado' : ''}">${dado}</span>
                    `).join('')}
                </div>
            </div>
        </div>
        <div class="resultado-final">
            <strong>Resultado Final: <span class="resultado-numero">${resultado}</span></strong>
        </div>
    `;
    
    resultadoDiv.style.display = 'block';
    resultadoDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Adiciona event listeners
 */
function adicionarEventListenersPericias() {
    // Event listeners já estão nos onclick dos botões
}

// Exporta para uso global
window.Pericias = {
    init: initPericias,
    PERICIAS: PERICIAS,
    NOMES_ATRIBUTOS: NOMES_ATRIBUTOS,
    testar: testarPericia,
    alterar: alterarPericia
};

// Torna funções globais
window.testarPericia = testarPericia;
window.alterarPericia = alterarPericia;

