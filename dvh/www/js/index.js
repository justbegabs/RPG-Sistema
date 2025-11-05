/**
 * Sistema de Fichas RPG - JavaScript Principal
 * Gerencia a interação do usuário com o sistema de fichas
 */

// Aguarda o evento deviceready do Cordova (se disponível)
if (typeof cordova !== 'undefined') {
    document.addEventListener('deviceready', onDeviceReady, false);
} else {
    // Se não estiver no Cordova, inicializa diretamente
    document.addEventListener('DOMContentLoaded', onDeviceReady);
}

function onDeviceReady() {
    console.log('Sistema de Fichas RPG inicializado');
    
    // Inicializa o router
    if (window.Router) {
        Router.init();
    }
    
    // Inicializa o sistema
    init();
}

/**
 * Inicializa o sistema
 */
async function init() {
    // Carrega os dados de classes, raças e origens
    await carregarDados();
    
    // Popula os selects do formulário (inclui atributos)
    popularSelects();
    
    // Configura o formulário
    setupForm();
    
    // Carrega as fichas existentes
    loadFichas();
}

/**
 * Carrega os dados de classes, raças e origens
 */
async function carregarDados() {
    try {
        await DadosLoader.inicializar();
        console.log('Dados carregados com sucesso');
    } catch (error) {
        console.error('Erro ao carregar dados:', error);
        showMessage('Erro ao carregar dados. Verifique a conexão.', 'error');
    }
}

/**
 * Popula os selects do formulário com os dados carregados
 */
function popularSelects() {
    // Popula select de classes
    const selectClasse = document.getElementById('classe');
    if (selectClasse) {
        selectClasse.innerHTML = '<option value="">Selecione...</option>';
        const classes = DadosLoader.obterDados('classes');
        classes.forEach(classe => {
            const option = document.createElement('option');
            option.value = classe.id;
            option.textContent = classe.nome;
            selectClasse.appendChild(option);
        });
    }
    
    // Popula select de raças
    const selectRaca = document.getElementById('raca');
    if (selectRaca) {
        selectRaca.innerHTML = '<option value="">Selecione...</option>';
        const racas = DadosLoader.obterDados('racas');
        racas.forEach(raca => {
            const option = document.createElement('option');
            option.value = raca.id;
            option.textContent = raca.nome;
            selectRaca.appendChild(option);
        });
    }
    
    // Popula select de origens
    const selectOrigem = document.getElementById('origem');
    if (selectOrigem) {
        selectOrigem.innerHTML = '<option value="">Selecione...</option>';
        const origens = DadosLoader.obterDados('origens');
        origens.forEach(origem => {
            const option = document.createElement('option');
            option.value = origem.id;
            option.textContent = origem.nome;
            selectOrigem.appendChild(option);
        });
    }

    // Popula atributos na ficha
    popularAtributosFicha();
    
    // Popula perícias na ficha
    popularPericiasFicha();
}

/**
 * Popula os atributos no formulário da ficha
 */
function popularAtributosFicha() {
    // Carrega atributos salvos ou usa valores padrão
    const saved = localStorage.getItem('atributos_personagem');
    let valoresAtributos = {};
    
    if (saved) {
        valoresAtributos = JSON.parse(saved);
    }

    // Atributos de teste
    const containerTeste = document.getElementById('atributos-teste-ficha');
    if (containerTeste) {
        containerTeste.innerHTML = criarAtributosFichaHTML('teste', valoresAtributos);
        adicionarEventListenersFicha('teste');
    }

    // Atributos de sorte
    const containerSorte = document.getElementById('atributos-sorte-ficha');
    if (containerSorte) {
        containerSorte.innerHTML = criarAtributosFichaHTML('sorte', valoresAtributos);
        adicionarEventListenersFicha('sorte');
    }
}

/**
 * Cria HTML dos atributos para a ficha
 */
function criarAtributosFichaHTML(tipo, valores) {
    const lista = tipo === 'teste' ? window.Atributos?.ATRIBUTOS_TESTE || [] : window.Atributos?.ATRIBUTOS_SORTE || [];
    
    return lista.map(attr => {
        const valor = valores[attr.id] !== undefined ? valores[attr.id] : 0;
        const valorFormatado = valor >= 0 ? `+${valor}` : `${valor}`;
        const corClasse = valor > 0 ? 'positivo' : valor < 0 ? 'negativo' : 'neutro';
        
        return `
            <div class="atributo-ficha-item">
                <label class="atributo-ficha-label" onclick="testarAtributoFicha('${attr.id}', '${tipo}')" title="Clique para fazer um teste">
                    ${attr.nome}
                </label>
                <div class="atributo-ficha-controles">
                    <button type="button" class="btn-controle-ficha" onclick="alterarAtributoFicha('${attr.id}', '${tipo}', -1)">-</button>
                    <input type="number" 
                           id="ficha-${attr.id}" 
                           name="${attr.id}" 
                           class="atributo-ficha-input ${corClasse}"
                           value="${valor}" 
                           min="-5" 
                           max="5" 
                           onchange="salvarAtributoFicha('${attr.id}', this.value)">
                    <button type="button" class="btn-controle-ficha" onclick="alterarAtributoFicha('${attr.id}', '${tipo}', 1)">+</button>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Adiciona event listeners aos atributos da ficha
 */
function adicionarEventListenersFicha(tipo) {
    // Os event listeners já estão nos onclick dos botões
}

/**
 * Altera atributo na ficha
 */
function alterarAtributoFicha(id, tipo, delta) {
    const input = document.getElementById(`ficha-${id}`);
    if (!input) return;
    
    const novoValor = parseInt(input.value) + delta;
    
    if (novoValor < -5 || novoValor > 5) {
        return;
    }
    
    input.value = novoValor;
    salvarAtributoFicha(id, novoValor);
    atualizarVisualAtributo(input, novoValor);
}

/**
 * Salva atributo individual
 */
function salvarAtributoFicha(id, valor) {
    const saved = localStorage.getItem('atributos_personagem');
    const dados = saved ? JSON.parse(saved) : {};
    dados[id] = parseInt(valor) || 0;
    localStorage.setItem('atributos_personagem', JSON.stringify(dados));
    
    // Atualiza o sistema de atributos se disponível
    if (window.Atributos) {
        const listaTeste = window.Atributos.ATRIBUTOS_TESTE || [];
        const listaSorte = window.Atributos.ATRIBUTOS_SORTE || [];
        const attr = [...listaTeste, ...listaSorte].find(a => a.id === id);
        if (attr) {
            attr.valor = parseInt(valor) || 0;
        }
    }
}

/**
 * Atualiza visual do atributo
 */
function atualizarVisualAtributo(input, valor) {
    input.classList.remove('positivo', 'negativo', 'neutro');
    if (valor > 0) {
        input.classList.add('positivo');
    } else if (valor < 0) {
        input.classList.add('negativo');
    } else {
        input.classList.add('neutro');
    }
}

/**
 * Testa atributo na ficha
 */
function testarAtributoFicha(id, tipo) {
    const input = document.getElementById(`ficha-${id}`);
    if (!input) return;
    
    const valor = parseInt(input.value) || 0;
    
    // Usa a mesma lógica de rolagem do sistema de atributos
    let quantidadeDados;
    let resultado;
    let dadosRolados = [];
    
    if (valor > 0) {
        quantidadeDados = valor;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = Math.floor(Math.random() * 20) + 1;
            dadosRolados.push(dado);
        }
        resultado = Math.max(...dadosRolados);
    } else if (valor === 0) {
        quantidadeDados = 2;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = Math.floor(Math.random() * 20) + 1;
            dadosRolados.push(dado);
        }
        resultado = Math.min(...dadosRolados);
    } else {
        quantidadeDados = Math.abs(valor) + 2;
        for (let i = 0; i < quantidadeDados; i++) {
            const dado = Math.floor(Math.random() * 20) + 1;
            dadosRolados.push(dado);
        }
        resultado = Math.min(...dadosRolados);
    }
    
    // Exibe resultado na ficha
    exibirResultadoFicha(id, valor, quantidadeDados, dadosRolados, resultado);
}

/**
 * Exibe resultado na ficha
 */
function exibirResultadoFicha(id, valorAtributo, quantidadeDados, dadosRolados, resultado) {
    const resultadoDiv = document.getElementById('resultado-rolagem-ficha');
    const conteudoDiv = document.getElementById('resultado-conteudo-ficha');
    
    if (!resultadoDiv || !conteudoDiv) return;
    
    // Busca nome do atributo
    const listaTeste = window.Atributos?.ATRIBUTOS_TESTE || [];
    const listaSorte = window.Atributos?.ATRIBUTOS_SORTE || [];
    const attr = [...listaTeste, ...listaSorte].find(a => a.id === id);
    const nomeAtributo = attr ? attr.nome : id;
    
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
 * Popula perícias na ficha
 */
function popularPericiasFicha() {
    const container = document.getElementById('pericias-ficha');
    if (!container || !window.Pericias) return;
    
    const saved = localStorage.getItem('pericias_personagem');
    const valores = saved ? JSON.parse(saved) : {};
    
    let html = '';
    
    // Itera sobre cada atributo
    Object.keys(window.Pericias.PERICIAS).forEach(atributoKey => {
        const nomeAtributo = window.Pericias.NOMES_ATRIBUTOS[atributoKey];
        const pericias = window.Pericias.PERICIAS[atributoKey];
        
        html += `
            <div class="pericias-grupo-ficha">
                <h4 class="pericias-grupo-title-ficha">${nomeAtributo}</h4>
                <div class="pericias-grid-ficha">
                    ${pericias.map(pericia => criarPericiaFichaHTML(pericia, atributoKey, valores)).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

/**
 * Cria HTML de uma perícia para a ficha
 */
function criarPericiaFichaHTML(pericia, atributoKey, valores) {
    const valor = valores[pericia.id] !== undefined ? valores[pericia.id] : 0;
    const corClasse = valor > 0 ? 'positivo' : valor < 0 ? 'negativo' : 'neutro';
    
    return `
        <div class="pericia-ficha-item">
            <label class="pericia-ficha-label" onclick="testarPericiaFicha('${pericia.id}', '${atributoKey}')" title="Clique para fazer um teste">
                ${pericia.nome}
            </label>
            <div class="pericia-ficha-controles">
                <button type="button" class="btn-controle-ficha" onclick="alterarPericiaFicha('${pericia.id}', -1)">-</button>
                <input type="number" 
                       id="ficha-pericia-${pericia.id}" 
                       name="pericia_${pericia.id}" 
                       class="atributo-ficha-input ${corClasse}"
                       value="${valor}" 
                       min="-5" 
                       max="5" 
                       onchange="salvarPericiaFicha('${pericia.id}', this.value)">
                <button type="button" class="btn-controle-ficha" onclick="alterarPericiaFicha('${pericia.id}', 1)">+</button>
            </div>
        </div>
    `;
}

/**
 * Altera perícia na ficha
 */
function alterarPericiaFicha(id, delta) {
    const input = document.getElementById(`ficha-pericia-${id}`);
    if (!input) return;
    
    const novoValor = parseInt(input.value) + delta;
    
    if (novoValor < -5 || novoValor > 5) {
        return;
    }
    
    input.value = novoValor;
    salvarPericiaFicha(id, novoValor);
    atualizarVisualAtributo(input, novoValor);
}

/**
 * Salva perícia individual
 */
function salvarPericiaFicha(id, valor) {
    const saved = localStorage.getItem('pericias_personagem');
    const dados = saved ? JSON.parse(saved) : {};
    dados[id] = parseInt(valor) || 0;
    localStorage.setItem('pericias_personagem', JSON.stringify(dados));
}

/**
 * Testa perícia na ficha
 */
function testarPericiaFicha(id, atributoKey) {
    if (!window.Pericias) return;
    
    const input = document.getElementById(`ficha-pericia-${id}`);
    if (!input) return;
    
    const valorPericia = parseInt(input.value) || 0;
    const valorAtributo = obterValorAtributoFicha(atributoKey);
    const valorTotal = valorAtributo + valorPericia;
    
    // Busca nome da perícia
    const pericia = Object.values(window.Pericias.PERICIAS).flat().find(p => p.id === id);
    const nomePericia = pericia ? pericia.nome : id;
    const nomeAtributo = window.Pericias.NOMES_ATRIBUTOS[atributoKey] || atributoKey;
    
    // Faz a rolagem
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
    
    exibirResultadoPericiaFicha(nomePericia, nomeAtributo, valorAtributo, valorPericia, valorTotal, quantidadeDados, dadosRolados, resultado);
}

/**
 * Obtém valor do atributo na ficha
 */
function obterValorAtributoFicha(atributoKey) {
    const input = document.getElementById(`ficha-${atributoKey}`);
    if (input) {
        return parseInt(input.value) || 0;
    }
    return 0;
}

/**
 * Exibe resultado de perícia na ficha
 */
function exibirResultadoPericiaFicha(nomePericia, nomeAtributo, valorAtributo, valorPericia, valorTotal, quantidadeDados, dadosRolados, resultado) {
    const resultadoDiv = document.getElementById('resultado-rolagem-pericias-ficha');
    const conteudoDiv = document.getElementById('resultado-conteudo-pericias-ficha');
    
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

// Torna as funções globais para uso nos onclick do HTML (após definição)
window.testarAtributoFicha = testarAtributoFicha;
window.alterarAtributoFicha = alterarAtributoFicha;
window.salvarAtributoFicha = salvarAtributoFicha;
window.popularAtributosFicha = popularAtributosFicha;
window.popularPericiasFicha = popularPericiasFicha;
window.alterarPericiaFicha = alterarPericiaFicha;
window.salvarPericiaFicha = salvarPericiaFicha;
window.testarPericiaFicha = testarPericiaFicha;

/**
 * Configura o evento de submit do formulário
 */
function setupForm() {
    const form = document.getElementById('ficha-form');
    
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Coleta os dados do formulário
            const formData = new FormData(form);
            
            // Obtém os IDs selecionados
            const classeId = formData.get('classe');
            const racaId = formData.get('raca');
            const origemId = formData.get('origem');
            
            // Busca os dados completos das seleções
            const classeData = DadosLoader.obterItemPorId('classes', classeId);
            const racaData = DadosLoader.obterItemPorId('racas', racaId);
            const origemData = DadosLoader.obterItemPorId('origens', origemId);
            
            // Coleta atributos do formulário
            const atributos = {};
            const listaTeste = window.Atributos?.ATRIBUTOS_TESTE || [];
            const listaSorte = window.Atributos?.ATRIBUTOS_SORTE || [];
            [...listaTeste, ...listaSorte].forEach(attr => {
                const valor = formData.get(attr.id);
                if (valor !== null) {
                    atributos[attr.id] = parseInt(valor) || 0;
                }
            });
            
            const ficha = {
                nome: formData.get('nome'),
                classe: classeData ? classeData.nome : classeId,
                classeId: classeId,
                classeData: classeData,
                raca: racaData ? racaData.nome : racaId,
                racaId: racaId,
                racaData: racaData,
                origem: origemData ? origemData.nome : origemId,
                origemId: origemId,
                origemData: origemData,
                nivel: parseInt(formData.get('nivel')) || 1,
                atributos: atributos,
                vida: parseInt(formData.get('vida')) || 10,
                mana: parseInt(formData.get('mana')) || 0,
                historia: formData.get('historia') || ''
            };
            
            // Mostra loading
            showMessage('Salvando ficha...', 'info');
            
            // Faz POST da ficha
            const resultado = await postFicha(ficha);
            
            if (resultado.success) {
                showMessage(resultado.message || 'Ficha salva com sucesso!', 'success');
                form.reset();
                // Recarrega a lista de fichas
                loadFichas();
                // Muda para a aba de listagem
                showTab('listar');
            } else {
                showMessage(resultado.message || 'Erro ao salvar ficha', 'error');
            }
        });
    }
}

/**
 * Carrega e exibe as fichas
 */
async function loadFichas() {
    const fichasList = document.getElementById('fichas-list');
    
    if (!fichasList) return;
    
    fichasList.innerHTML = '<p class="loading">Carregando fichas...</p>';
    
    const resultado = await getFichas();
    
    if (resultado.success && resultado.data && resultado.data.length > 0) {
        displayFichas(resultado.data);
    } else {
        fichasList.innerHTML = '<p class="empty">Nenhuma ficha cadastrada ainda. Crie sua primeira ficha!</p>';
    }
}

/**
 * Exibe as fichas na lista
 */
function displayFichas(fichas) {
    const fichasList = document.getElementById('fichas-list');
    
    if (!fichasList) return;
    
    fichasList.innerHTML = '';
    
    fichas.forEach(ficha => {
        const fichaCard = createFichaCard(ficha);
        fichasList.appendChild(fichaCard);
    });
}

/**
 * Cria um card HTML para uma ficha
 */
function createFichaCard(ficha) {
    const card = document.createElement('div');
    card.className = 'ficha-card';
    
    const modForca = Math.floor((ficha.forca - 10) / 2);
    const modDestreza = Math.floor((ficha.destreza - 10) / 2);
    const modConstituicao = Math.floor((ficha.constituicao - 10) / 2);
    const modInteligencia = Math.floor((ficha.inteligencia - 10) / 2);
    const modSabedoria = Math.floor((ficha.sabedoria - 10) / 2);
    const modCarisma = Math.floor((ficha.carisma - 10) / 2);
    
    // Cria links clicáveis para classe, raça e origem
    // Tenta encontrar IDs se não estiverem salvos (compatibilidade com fichas antigas)
    let classeId = ficha.classeId;
    let racaId = ficha.racaId;
    let origemId = ficha.origemId;
    
    if (!classeId && ficha.classe) {
        const classeItem = DadosLoader.obterDados('classes').find(c => c.nome === ficha.classe);
        classeId = classeItem ? classeItem.id : null;
    }
    
    if (!racaId && ficha.raca) {
        const racaItem = DadosLoader.obterDados('racas').find(r => r.nome === ficha.raca);
        racaId = racaItem ? racaItem.id : null;
    }
    
    if (!origemId && ficha.origem) {
        const origemItem = DadosLoader.obterDados('origens').find(o => o.nome === ficha.origem);
        origemId = origemItem ? origemItem.id : null;
    }
    
    // Cria o HTML base do card
    card.innerHTML = `
        <div class="ficha-header">
            <h3>${ficha.nome}</h3>
            <span class="ficha-nivel">Nível ${ficha.nivel}</span>
        </div>
        <div class="ficha-info">
            <div class="ficha-basica">
                <p><strong>Classe:</strong> <span class="data-link-placeholder classe-link">${ficha.classe}</span></p>
                <p><strong>Raça:</strong> <span class="data-link-placeholder raca-link">${ficha.raca}</span></p>
                ${ficha.origem ? `<p><strong>Origem:</strong> <span class="data-link-placeholder origem-link">${ficha.origem}</span></p>` : ''}
            </div>
            <div class="ficha-atributos">
                <h4>Atributos</h4>
                <div class="atributos-list">
                    <span>Força: ${ficha.forca} (${modForca >= 0 ? '+' : ''}${modForca})</span>
                    <span>Destreza: ${ficha.destreza} (${modDestreza >= 0 ? '+' : ''}${modDestreza})</span>
                    <span>Constituição: ${ficha.constituicao} (${modConstituicao >= 0 ? '+' : ''}${modConstituicao})</span>
                    <span>Inteligência: ${ficha.inteligencia} (${modInteligencia >= 0 ? '+' : ''}${modInteligencia})</span>
                    <span>Sabedoria: ${ficha.sabedoria} (${modSabedoria >= 0 ? '+' : ''}${modSabedoria})</span>
                    <span>Carisma: ${ficha.carisma} (${modCarisma >= 0 ? '+' : ''}${modCarisma})</span>
                </div>
            </div>
            <div class="ficha-stats">
                <p><strong>PV:</strong> ${ficha.vida}</p>
                <p><strong>PM:</strong> ${ficha.mana}</p>
            </div>
            ${ficha.historia ? `<div class="ficha-historia"><p>${ficha.historia}</p></div>` : ''}
        </div>
        <div class="ficha-actions">
            <button class="btn btn-danger btn-sm" onclick="deleteFichaById('${ficha.id}')">Excluir</button>
        </div>
    `;
    
    // Adiciona links clicáveis se houver IDs
    if (classeId) {
        const classeSpan = card.querySelector('.classe-link');
        if (classeSpan) {
            const link = Router.createDataLink('classe', classeId, ficha.classe);
            classeSpan.replaceWith(link);
        }
    }
    
    if (racaId) {
        const racaSpan = card.querySelector('.raca-link');
        if (racaSpan) {
            const link = Router.createDataLink('raca', racaId, ficha.raca);
            racaSpan.replaceWith(link);
        }
    }
    
    if (origemId && ficha.origem) {
        const origemSpan = card.querySelector('.origem-link');
        if (origemSpan) {
            const link = Router.createDataLink('origem', origemId, ficha.origem);
            origemSpan.replaceWith(link);
        }
    }
    
    return card;
}

/**
 * Deleta uma ficha por ID
 */
async function deleteFichaById(id) {
    if (!confirm('Tem certeza que deseja excluir esta ficha?')) {
        return;
    }
    
    const resultado = await deleteFicha(id);
    
    if (resultado.success) {
        showMessage(resultado.message || 'Ficha excluída com sucesso!', 'success');
        loadFichas();
    } else {
        showMessage('Erro ao excluir ficha', 'error');
    }
}

/**
 * Mostra mensagens para o usuário
 */
function showMessage(texto, tipo = 'info') {
    const mensagem = document.getElementById('mensagem');
    
    if (!mensagem) return;
    
    mensagem.className = `mensagem mensagem-${tipo}`;
    mensagem.textContent = texto;
    mensagem.style.display = 'block';
    
    // Remove a mensagem após 5 segundos
    setTimeout(() => {
        mensagem.style.display = 'none';
    }, 5000);
}

/**
 * Gerencia as abas da interface
 * @param {string} tabName - Nome da aba a mostrar ('criar' ou 'listar')
 */
function showTab(tabName) {
    // Esconde todas as abas
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Remove active de todos os botões
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Mostra a aba selecionada
    const tabContent = document.getElementById(`${tabName === 'criar' ? 'criar-ficha' : 'listar-fichas'}`);
    if (tabContent) {
        tabContent.classList.add('active');
    }
    
    // Ativa o botão correspondente
    const tabBtnsArray = Array.from(tabBtns);
    const tabBtn = tabBtnsArray.find(btn => {
        const onclick = btn.getAttribute('onclick');
        return onclick && onclick.includes(`showTab('${tabName}')`);
    });
    
    if (tabBtn) {
        tabBtn.classList.add('active');
    }
    
    // Se for a aba de listar, recarrega as fichas
    if (tabName === 'listar') {
        loadFichas();
    }
}
