/**
 * Sistema de Atributos e Testes de Dados
 * Gerencia os atributos e rolagens de dados D20
 */

// Atributos de teste
const ATRIBUTOS_TESTE = [
    { nome: 'Força', id: 'forca', valor: 0 },
    { nome: 'Destreza', id: 'destreza', valor: 0 },
    { nome: 'Intelecto', id: 'intelecto', valor: 0 },
    { nome: 'Sabedoria', id: 'sabedoria', valor: 0 },
    { nome: 'Carisma', id: 'carisma', valor: 0 },
    { nome: 'Magia', id: 'magia', valor: 0 },
    { nome: 'Constituição', id: 'constituicao', valor: 0 }
];

// Atributos de sorte
const ATRIBUTOS_SORTE = [
    { nome: 'Sorte', id: 'sorte', valor: 0 },
    { nome: 'Fama', id: 'fama', valor: 0 },
    { nome: 'Resiliência', id: 'resiliencia', valor: 0 },
    { nome: 'Fé', id: 'fe', valor: 0 },
    { nome: 'Criatividade', id: 'criatividade', valor: 0 }
];

// Limites de atributos (nível 0)
const LIMITE_MIN = -5;
const LIMITE_MAX = 5;

/**
 * Inicializa a página de atributos
 */
function initAtributos() {
    carregarAtributos();
    renderizarAtributos();
}

/**
 * Carrega os atributos do localStorage
 */
function carregarAtributos() {
    const saved = localStorage.getItem('atributos_personagem');
    if (saved) {
        const dados = JSON.parse(saved);
        
        // Atualiza atributos de teste
        ATRIBUTOS_TESTE.forEach(attr => {
            if (dados[attr.id] !== undefined) {
                attr.valor = parseInt(dados[attr.id]) || 0;
            }
        });
        
        // Atualiza atributos de sorte
        ATRIBUTOS_SORTE.forEach(attr => {
            if (dados[attr.id] !== undefined) {
                attr.valor = parseInt(dados[attr.id]) || 0;
            }
        });
    }
}

/**
 * Salva os atributos no localStorage
 */
function salvarAtributos() {
    const dados = {};
    
    ATRIBUTOS_TESTE.forEach(attr => {
        dados[attr.id] = attr.valor;
    });
    
    ATRIBUTOS_SORTE.forEach(attr => {
        dados[attr.id] = attr.valor;
    });
    
    localStorage.setItem('atributos_personagem', JSON.stringify(dados));
}

/**
 * Renderiza os atributos na interface
 */
function renderizarAtributos() {
    const containerTeste = document.getElementById('atributos-teste');
    const containerSorte = document.getElementById('atributos-sorte');
    
    if (!containerTeste || !containerSorte) return;
    
    // Renderiza atributos de teste
    containerTeste.innerHTML = ATRIBUTOS_TESTE.map(attr => 
        criarCardAtributo(attr, 'teste')
    ).join('');
    
    // Renderiza atributos de sorte
    containerSorte.innerHTML = ATRIBUTOS_SORTE.map(attr => 
        criarCardAtributo(attr, 'sorte')
    ).join('');
    
    // Adiciona event listeners
    adicionarEventListeners();
}

/**
 * Cria o HTML de um card de atributo
 */
function criarCardAtributo(attr, tipo) {
    const valorFormatado = attr.valor >= 0 ? `+${attr.valor}` : `${attr.valor}`;
    const corClasse = attr.valor > 0 ? 'positivo' : attr.valor < 0 ? 'negativo' : 'neutro';
    
    return `
        <div class="atributo-card ${corClasse}">
            <button class="atributo-btn" onclick="testarAtributo('${attr.id}', '${tipo}')" title="Clique para fazer um teste">
                <span class="atributo-nome">${attr.nome}</span>
                <span class="atributo-valor ${corClasse}">${valorFormatado}</span>
            </button>
            <div class="atributo-controles">
                <button class="btn-controle" onclick="alterarAtributo('${attr.id}', ${tipo === 'teste' ? 'true' : 'false'}, -1)" title="Diminuir">-</button>
                <button class="btn-controle" onclick="alterarAtributo('${attr.id}', ${tipo === 'teste' ? 'true' : 'false'}, 1)" title="Aumentar">+</button>
            </div>
        </div>
    `;
}

/**
 * Adiciona event listeners aos controles
 */
function adicionarEventListeners() {
    // Os event listeners já estão nos onclick dos botões
}

/**
 * Altera o valor de um atributo
 */
function alterarAtributo(id, isTeste, delta) {
    const lista = isTeste ? ATRIBUTOS_TESTE : ATRIBUTOS_SORTE;
    const attr = lista.find(a => a.id === id);
    
    if (!attr) return;
    
    const novoValor = attr.valor + delta;
    
    // Verifica limites
    if (novoValor < LIMITE_MIN || novoValor > LIMITE_MAX) {
        showAtributoMessage(`Valor deve estar entre ${LIMITE_MIN} e ${LIMITE_MAX}`, 'error');
        return;
    }
    
    attr.valor = novoValor;
    salvarAtributos();
    renderizarAtributos();
}

/**
 * Faz um teste de atributo (rolagem de dados)
 */
function testarAtributo(id, tipo) {
    const lista = tipo === 'teste' ? ATRIBUTOS_TESTE : ATRIBUTOS_SORTE;
    const attr = lista.find(a => a.id === id);
    
    if (!attr) return;
    
    const valor = attr.valor;
    let quantidadeDados;
    let resultado;
    let dadosRolados = [];
    
    if (valor > 0) {
        // Valor positivo: rola N dados D20 e pega o maior
        quantidadeDados = valor;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = rolarD20();
            dadosRolados.push(dado);
        }
        resultado = Math.max(...dadosRolados);
    } else if (valor === 0) {
        // Valor 0: rola 2 dados D20 e pega o pior
        quantidadeDados = 2;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = rolarD20();
            dadosRolados.push(dado);
        }
        resultado = Math.min(...dadosRolados);
    } else {
        // Valor negativo: rola |N|+2 dados D20 e pega o pior
        quantidadeDados = Math.abs(valor) + 2;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = rolarD20();
            dadosRolados.push(dado);
        }
        resultado = Math.min(...dadosRolados);
    }
    
    exibirResultado(attr.nome, valor, quantidadeDados, dadosRolados, resultado);
}

/**
 * Rola um dado D20
 */
function rolarD20() {
    return Math.floor(Math.random() * 20) + 1;
}

/**
 * Exibe o resultado da rolagem
 */
function exibirResultado(nomeAtributo, valorAtributo, quantidadeDados, dadosRolados, resultado) {
    const resultadoDiv = document.getElementById('resultado-rolagem');
    const conteudoDiv = document.getElementById('resultado-conteudo');
    
    if (!resultadoDiv || !conteudoDiv) return;
    
    const valorFormatado = valorAtributo >= 0 ? `+${valorAtributo}` : `${valorAtributo}`;
    let descricao = '';
    
    if (valorAtributo > 0) {
        descricao = `Rolou ${quantidadeDados} dado${quantidadeDados > 1 ? 's' : ''} D20 e pegou o <strong>maior</strong> valor.`;
    } else if (valorAtributo === 0) {
        descricao = `Rolou 2 dados D20 e pegou o <strong>pior</strong> valor.`;
    } else {
        descricao = `Rolou ${quantidadeDados} dados D20 e pegou o <strong>pior</strong> valor.`;
    }
    
    conteudoDiv.innerHTML = `
        <div class="resultado-header">
            <span class="resultado-atributo">${nomeAtributo}</span>
            <span class="resultado-valor-atributo">${valorFormatado}</span>
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
 * Mostra mensagem de feedback
 */
function showAtributoMessage(texto, tipo = 'info') {
    // Pode usar a função showMessage existente ou criar uma específica
    if (typeof showMessage === 'function') {
        showMessage(texto, tipo);
    } else {
        alert(texto);
    }
}

// Exporta para uso global
window.Atributos = {
    init: initAtributos,
    testar: testarAtributo,
    alterar: alterarAtributo,
    ATRIBUTOS_TESTE: ATRIBUTOS_TESTE,
    ATRIBUTOS_SORTE: ATRIBUTOS_SORTE
};

