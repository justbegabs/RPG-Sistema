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
    // Inicializa variáveis globais
    window.nivelFichaAtual = 0;
    
    // Restaura o nível do localStorage se houver
    const nivelStorage = localStorage.getItem('nivelFichaAtual');
    if (nivelStorage) {
        window.nivelFichaAtual = parseInt(nivelStorage) || 0;
    }
    
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
        // Adiciona event listener para aplicar bônus
        selectClasse.addEventListener('change', () => aplicarBonusSelecao('classe', selectClasse.value));
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
        // Adiciona event listener para aplicar bônus
        selectRaca.addEventListener('change', () => aplicarBonusSelecao('raca', selectRaca.value));
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
        // Adiciona event listener para aplicar bônus
        selectOrigem.addEventListener('change', () => aplicarBonusSelecao('origem', selectOrigem.value));
        // Botão para abrir modal de escolha de perícias (quando aplicável)
        const btnEscolher = document.getElementById('btn-escolher-origem-pericias');
        if (btnEscolher) {
            btnEscolher.addEventListener('click', () => {
                const id = selectOrigem.value;
                if (!id) return;
                const item = DadosLoader.obterItemPorId('origens', id);
                const escolherCount = item?.bonus?.escolher_pericias || 0;
                if (escolherCount && escolherCount > 0) {
                    abrirModalEscolherPericias(id, escolherCount);
                }
            });
        }
    }

    // Popula atributos na ficha
    popularAtributosFicha();
    
    // Popula perícias na ficha
    popularPericiasFicha();
    
    // Calcula estatísticas iniciais
    calcularEstatisticas();
    
    // Configura validação dos campos atuais
    configurarValidacaoEstatisticas();
    
    // Configura sincronização do nível (slider + input)
    configurarNivelSlider();
    
    // Inicializa estrutura de perícias
    inicializarPericias();
    
    // Aplica bônus se já houver seleções (após um pequeno delay para garantir que os dados estão carregados)
    setTimeout(() => {
        aplicarBonusSelecoesExistentes();
    }, 100);
}

/**
 * Inicializa a estrutura de perícias no localStorage
 */
function inicializarPericias() {
    const periciasSalvas = localStorage.getItem('pericias_estrutura');
    
    // Se já existe, não precisa fazer nada
    if (periciasSalvas) {
        return;
    }
    // Se existe armazenamento legado em pericias_personagem, migra os dados
    const legado = localStorage.getItem('pericias_personagem');
    if (legado) {
        try {
            const dadosLegado = JSON.parse(legado);
            const pericias = {};
            // Converte cada entrada legada em um objeto da nova estrutura
            Object.keys(dadosLegado).forEach(periciaId => {
                const valor = parseInt(dadosLegado[periciaId]) || 0;
                pericias[periciaId] = {
                    d6: 0,
                    // Coloca o valor legado em bonus_personagem para preservar pontos do jogador
                    bonus_personagem: Math.max(-5, Math.min(5, valor)),
                    bonus_origem: 0,
                    bonus_classe: 0,
                    bonus_raca: 0
                };
            });

            // Preenche perícias faltantes com zeros (garante consistência)
            if (window.Pericias) {
                Object.keys(window.Pericias.PERICIAS).forEach(atributoKey => {
                    const listaPericias = window.Pericias.PERICIAS[atributoKey];
                    listaPericias.forEach(pericia => {
                        if (!pericias[pericia.id]) {
                            pericias[pericia.id] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
                        }
                    });
                });
            }

            localStorage.setItem('pericias_estrutura', JSON.stringify(pericias));

            // Remove chave legada
            localStorage.removeItem('pericias_personagem');
            console.info('Migração: pericias_personagem -> pericias_estrutura concluída.');
            return;
        } catch (e) {
            console.error('Falha ao migrar pericias_personagem:', e);
            // Se falhar, continua e cria estrutura vazia abaixo
        }
    }

    // Cria estrutura inicial de perícias
    const pericias = {};
    if (window.Pericias) {
        Object.keys(window.Pericias.PERICIAS).forEach(atributoKey => {
            const listaPericias = window.Pericias.PERICIAS[atributoKey];
            listaPericias.forEach(pericia => {
                pericias[pericia.id] = {
                    d6: 0,
                    bonus_personagem: 0,
                    bonus_origem: 0,
                    bonus_classe: 0,
                    bonus_raca: 0
                };
            });
        });
    }

    localStorage.setItem('pericias_estrutura', JSON.stringify(pericias));
}

/**
 * Aplica os bônus das seleções existentes (se houver)
 */
function aplicarBonusSelecoesExistentes() {
    const selectClasse = document.getElementById('classe');
    const selectRaca = document.getElementById('raca');
    const selectOrigem = document.getElementById('origem');
    
    if (selectClasse && selectClasse.value) {
        aplicarBonusSelecao('classe', selectClasse.value);
    }
    
    if (selectRaca && selectRaca.value) {
        aplicarBonusSelecao('raca', selectRaca.value);
    }
    
    if (selectOrigem && selectOrigem.value) {
        aplicarBonusSelecao('origem', selectOrigem.value);
        // Se houver escolhas salvas para essa origem, aplique-as
        const origemId = selectOrigem.value;
        const escolhas = JSON.parse(localStorage.getItem('origem_escolhas') || '{}');
        if (escolhas[origemId]) {
            aplicarPericiasEscolhidasParaOrigem(origemId, escolhas[origemId]);
        }
    }
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
    // Atualiza os contadores compartilhados
    if (window.Atributos && typeof window.Atributos.atualizarContadores === 'function') {
        window.Atributos.atualizarContadores();
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

    // If increasing, check shared pool availability
    if (delta > 0 && window.Atributos && typeof window.Atributos.calcularRestante === 'function') {
        const restante = window.Atributos.calcularRestante();
        if (restante < delta) {
            showMessage(`Pontos insuficientes. Restam ${restante}.`, 'error');
            return;
        }
    }

    input.value = novoValor;
    salvarAtributoFicha(id, novoValor);
    atualizarVisualAtributo(input, novoValor);

    // Atualiza contadores compartilhados
    if (window.Atributos && typeof window.Atributos.atualizarContadores === 'function') {
        window.Atributos.atualizarContadores();
    }

    // Recalcula estatísticas quando atributos mudam
    calcularEstatisticas();
}

/**
 * Salva atributo individual
 */
function salvarAtributoFicha(id, valor) {
    const saved = localStorage.getItem('atributos_personagem');
    const dados = saved ? JSON.parse(saved) : {};
    const novo = parseInt(valor) || 0;

    // Enforce shared pool: compute current total and check if this increase is allowed
    if (window.Atributos && typeof window.Atributos.calcularRestante === 'function') {
        // obtain current value for this attr
        const listaTeste = window.Atributos.ATRIBUTOS_TESTE || [];
        const listaSorte = window.Atributos.ATRIBUTOS_SORTE || [];
        const attr = [...listaTeste, ...listaSorte].find(a => a.id === id);
        const atual = attr ? (parseInt(attr.valor) || 0) : (parseInt(dados[id]) || 0);
        const delta = novo - atual;
        if (delta > 0) {
            const restante = window.Atributos.calcularRestante();
            if (restante < delta) {
                showMessage(`Pontos insuficientes. Restam ${restante}.`, 'error');
                // revert UI value to previous
                const input = document.getElementById(`ficha-${id}`);
                if (input) input.value = atual;
                return;
            }
        }
    }

    dados[id] = novo;
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
    
    // Recalcula estatísticas quando atributos mudam
    calcularEstatisticas();
    // Atualiza contadores compartilhados
    if (window.Atributos && typeof window.Atributos.atualizarContadores === 'function') {
        window.Atributos.atualizarContadores();
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
    const modal = document.getElementById('modal-resultado-atributo');
    const titulo = document.getElementById('modal-resultado-titulo');
    const corpo = document.getElementById('modal-resultado-corpo');
    const btnFechar = document.getElementById('modal-resultado-fechar');
    
    if (!modal || !titulo || !corpo || !btnFechar) {
        console.error('Modal elements not found (exibirResultadoFicha):', { modal, titulo, corpo, btnFechar });
        return;
    }

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

    titulo.textContent = `${nomeAtributo} — Resultado`;
    corpo.innerHTML = `
        <p style="margin:6px 0;">Valor do atributo: <strong>${valorFormatado}</strong></p>
        <p class="resultado-descricao" style="margin:6px 0;">${descricao}</p>
        <div style="margin-top:8px;">
            <strong>Dados rolados:</strong>
            <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin-top:6px;">
                ${dadosRolados.map(dado => `
                    <span style="padding:6px 8px; border-radius:6px; background:#eee; ${dado===resultado? 'box-shadow:0 0 6px #ffd54f; font-weight:700;': ''}">${dado}</span>
                `).join('')}
            </div>
        </div>
        <div style="margin-top:12px; font-size:18px;">
            <strong>Resultado Final: <span style="color:#d32;">${resultado}</span></strong>
        </div>
    `;

    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    btnFechar.onclick = () => { 
        modal.style.display = 'none'; 
        btnFechar.onclick = null; 
    };
}

/**
 * Popula perícias na ficha
 */
function popularPericiasFicha() {
    const container = document.getElementById('pericias-ficha');
    if (!container || !window.Pericias) return;
    
    const pericias = obterTodasPericias();
    const nivelAtual = obterNivelAtual();
    
    console.log('popularPericiasFicha - Nível detectado:', nivelAtual);
    
    let html = '';
    
    // Itera sobre cada atributo
    Object.keys(window.Pericias.PERICIAS).forEach(atributoKey => {
        const nomeAtributo = window.Pericias.NOMES_ATRIBUTOS[atributoKey];
        const listaPericias = window.Pericias.PERICIAS[atributoKey];
        
        html += `
            <div class="pericias-grupo-ficha">
                <h4 class="pericias-grupo-title-ficha" onclick="togglePericiasGrupo('${atributoKey}')">
                    <span class="pericias-toggle-icon">▶</span>
                    ${nomeAtributo}
                </h4>
                <div class="pericias-grid-ficha" id="pericias-grid-${atributoKey}" style="display: none;">
                    ${listaPericias.map(pericia => criarPericiaFichaHTML(pericia, atributoKey, pericias, nivelAtual)).join('')}
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
    
    // Atualiza o contador de D6
    atualizarContadorD6();
    
    // Atualiza o contador de Dados Adicionais
    atualizarContadorDadosAdicionais();
}

/**
 * Cria HTML de uma perícia para a ficha com d6 e bônus separados
 */
function criarPericiaFichaHTML(pericia, atributoKey, pericias, nivelPassed) {
    const periciaData = pericias[pericia.id] || { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
    const dadosAdicionais = obterDadosAdicionaisPericias();
    const periciaAdicionais = dadosAdicionais[pericia.id] || { d4: 0, d6: 0, d8: 0, d10: 0 };
    
    // Obtém dados disponíveis para este nível ANTES de calcular o total
    const nivel = nivelPassed !== undefined ? nivelPassed : obterNivelAtual();
    const disponivel = obterDadosDisponiveisPorNivel(nivel);
    
    // Soma apenas os dados que estão disponíveis neste nível
    let somaAdicionais = 0;
    if (disponivel.d4) somaAdicionais += (parseInt(periciaAdicionais.d4) || 0);
    if (disponivel.d6) somaAdicionais += (parseInt(periciaAdicionais.d6) || 0);
    if (disponivel.d8) somaAdicionais += (parseInt(periciaAdicionais.d8) || 0);
    if (disponivel.d10) somaAdicionais += (parseInt(periciaAdicionais.d10) || 0);
    
    const total = periciaData.d6 + periciaData.bonus_personagem + periciaData.bonus_origem + periciaData.bonus_classe + periciaData.bonus_raca + somaAdicionais;
    const corClasse = total > 0 ? 'positivo' : total < 0 ? 'negativo' : 'neutro';
    
    console.log('criarPericiaFichaHTML - Perícia:', pericia.nome, 'Nível:', nivel, 'Dados disponíveis:', disponivel);
    
    // Monta campos de dados adicionais
    let camposDadosAdicionais = '';
    
    if (disponivel.d4) {
        camposDadosAdicionais += `
                <div class="pericia-campo">
                    <span class="pericia-label" title="D4 (até ${disponivel.d4.max})">D4</span>
                    <input type="number" 
                           id="pericia-d4-${pericia.id}" 
                           class="pericia-input"
                           value="${periciaAdicionais.d4}" 
                           min="0" 
                           max="4" 
                           readonly>
                    <button type="button" class="btn-rolar" onclick="rolarDadoAdicionalPericia('${pericia.id}', 'd4')">🎲</button>
                </div>`;
    }
    
    if (disponivel.d6) {
        camposDadosAdicionais += `
                <div class="pericia-campo">
                    <span class="pericia-label" title="D6 adicional (até ${disponivel.d6.max})">D6+</span>
                    <input type="number" 
                           id="pericia-d6-add-${pericia.id}" 
                           class="pericia-input"
                           value="${periciaAdicionais.d6}" 
                           min="0" 
                           max="6" 
                           readonly>
                    <button type="button" class="btn-rolar" onclick="rolarDadoAdicionalPericia('${pericia.id}', 'd6')">🎲</button>
                </div>`;
    }
    
    if (disponivel.d8) {
        camposDadosAdicionais += `
                <div class="pericia-campo">
                    <span class="pericia-label" title="D8 (até ${disponivel.d8.max})">D8</span>
                    <input type="number" 
                           id="pericia-d8-${pericia.id}" 
                           class="pericia-input"
                           value="${periciaAdicionais.d8}" 
                           min="0" 
                           max="8" 
                           readonly>
                    <button type="button" class="btn-rolar" onclick="rolarDadoAdicionalPericia('${pericia.id}', 'd8')">🎲</button>
                </div>`;
    }
    
    if (disponivel.d10) {
        camposDadosAdicionais += `
                <div class="pericia-campo">
                    <span class="pericia-label" title="D10 (até ${disponivel.d10.max})">D10</span>
                    <input type="number" 
                           id="pericia-d10-${pericia.id}" 
                           class="pericia-input"
                           value="${periciaAdicionais.d10}" 
                           min="0" 
                           max="10" 
                           readonly>
                    <button type="button" class="btn-rolar" onclick="rolarDadoAdicionalPericia('${pericia.id}', 'd10')">🎲</button>
                </div>`;
    }
    
    return `
        <div class="pericia-ficha-item">
            <label class="pericia-ficha-label" title="${pericia.nome}" onclick="testarPericiaFicha('${pericia.id}', '${atributoKey}')">
                ${pericia.nome}
            </label>
            <div class="pericia-detalhes">
                <div class="pericia-campo">
                    <span class="pericia-label">D6</span>
                    <input type="number" 
                           id="pericia-d6-${pericia.id}" 
                           class="pericia-input"
                           value="${periciaData.d6}" 
                           min="0" 
                           max="6" 
                           onchange="rolarD6Pericia('${pericia.id}')">
                    <button type="button" class="btn-rolar" onclick="rolarD6Pericia('${pericia.id}')">🎲</button>
                </div>
                ${camposDadosAdicionais}
                <div class="pericia-campo">
                    <span class="pericia-label">Orig</span>
                        <input type="number" 
                               id="pericia-origem-${pericia.id}" 
                               class="pericia-input"
                               value="${periciaData.bonus_origem}" 
                               min="-5" 
                               max="5" 
                               readonly>
                </div>
                <div class="pericia-campo">
                    <span class="pericia-label">Classe</span>
                    <input type="number" 
                           id="pericia-classe-${pericia.id}" 
                           class="pericia-input"
                           value="${periciaData.bonus_classe}" 
                           min="-5" 
                           max="5" 
                           readonly>
                </div>
                <div class="pericia-campo">
                    <span class="pericia-label">Raça</span>
                    <input type="number" 
                           id="pericia-raca-${pericia.id}" 
                           class="pericia-input"
                           value="${periciaData.bonus_raca}" 
                           min="-5" 
                           max="5" 
                           readonly>
                </div>
                <div class="pericia-campo total">
                    <span class="pericia-label">Total</span>
                    <input type="number" 
                           id="pericia-total-${pericia.id}" 
                           class="pericia-input ${corClasse}"
                           value="${total}" 
                           readonly>
                </div>
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
    
    // Recalcula estatísticas quando perícias mudam
    calcularEstatisticas();
}

/**
 * Rola dados adicionais (D4/D6/D8/D10) para uma perícia
 * Dados são independentes e todos podem estar ativos simultaneamente
 * Estrutura: { periciaId: { d4: valor, d6: valor, d8: valor, d10: valor } }
 */
function rolarDadoAdicionalPericia(periciaId, tipoDado) {
    const nivel = obterNivelAtual();
    
    // Verifica quais dados estão disponíveis neste nível
    const disponivel = obterDadosDisponiveisPorNivel(nivel);
    
    if (!disponivel[tipoDado]) {
        alert(`⚠️ ${tipoDado} não está disponível neste nível!`);
        return;
    }
    
    const dadosAdicionais = obterDadosAdicionaisPericias();
    if (!dadosAdicionais[periciaId]) {
        dadosAdicionais[periciaId] = { d4: 0, d6: 0, d8: 0, d10: 0 };
    }
    
    // Se já tem um valor para este dado, remove
    if (dadosAdicionais[periciaId][tipoDado] > 0) {
        dadosAdicionais[periciaId][tipoDado] = 0;
        salvarDadosAdicionaisPericias(dadosAdicionais);
        
        // D6 adicional tem ID diferente para não conflitar com D6 base
        const idCampo = tipoDado === 'd6' ? `pericia-d6-add-${periciaId}` : `pericia-${tipoDado}-${periciaId}`;
        const campoDado = document.getElementById(idCampo);
        if (campoDado) {
            campoDado.value = 0;
        }
        
        atualizarTotalPericia(periciaId);
        atualizarContadorDadosAdicionais();
        return;
    }
    
    // Conta quantas perícias já têm este dado
    const maxDado = disponivel[tipoDado].max;
    const periciasComDado = Object.values(dadosAdicionais).filter(p => (parseInt(p[tipoDado]) || 0) > 0).length;
    
    if (periciasComDado >= maxDado) {
        alert(`⚠️ Limite de ${maxDado} perícias com ${tipoDado.toUpperCase()} atingido!\n\nRemova uma perícia existente para adicionar outra.`);
        return;
    }
    
    // Rola o dado
    const maxValue = parseInt(tipoDado.substring(1)); // D4 -> 4, D6 -> 6, etc
    const resultado = Math.floor(Math.random() * maxValue) + 1;
    
    // Atualiza o campo (D6 adicional tem ID diferente para não conflitar com D6 base)
    const idCampo = tipoDado === 'd6' ? `pericia-d6-add-${periciaId}` : `pericia-${tipoDado}-${periciaId}`;
    const campoDado = document.getElementById(idCampo);
    if (campoDado) {
        campoDado.value = resultado;
    }
    
    // Salva os dados
    dadosAdicionais[periciaId][tipoDado] = resultado;
    salvarDadosAdicionaisPericias(dadosAdicionais);
    
    // Atualiza o total
    atualizarTotalPericia(periciaId);
    atualizarContadorDadosAdicionais();
}

/**
 * Obtém quais dados estão disponíveis para o nível atual
 * Retorna { d4: { max: 5 }, d6: { max: 6 }, ... }
 */
function obterDadosDisponiveisPorNivel(nivel) {
    nivel = parseInt(nivel) || 0;
    
    const disponivel = {
        d4: null,
        d6: null,
        d8: null,
        d10: null
    };
    
    // 15%: 5 perícias com D4
    if (nivel >= 15) disponivel.d4 = { max: 5 };
    
    // 45%: 6 perícias com D6
    if (nivel >= 45) disponivel.d6 = { max: 6 };
    
    // 75%: 7 perícias com D8
    if (nivel >= 75) disponivel.d8 = { max: 7 };
    
    // 100%: 8 perícias com D10
    if (nivel >= 100) disponivel.d10 = { max: 8 };
    
    return disponivel;
}

/**
 * Atualiza os contadores de perícias com dados adicionais
 * Mostra contador para cada tipo de dado (D4, D6, D8, D10) se disponível
 */
function atualizarContadorDadosAdicionais() {
    const nivel = obterNivelAtual();
    const disponivel = obterDadosDisponiveisPorNivel(nivel);
    
    const dadosAdicionais = obterDadosAdicionaisPericias();
    
    // Conta perícias para cada tipo de dado
    const contadores = {};
    Object.keys(disponivel).forEach(tipoDado => {
        if (disponivel[tipoDado]) {
            const max = disponivel[tipoDado].max;
            const count = Object.values(dadosAdicionais).filter(p => (parseInt(p[tipoDado]) || 0) > 0).length;
            contadores[tipoDado] = { count, max };
        }
    });
    
    // Monta texto do contador (ex: "D4: 2/5, D6: 1/6")
    let textoContador = Object.entries(contadores)
        .map(([tipo, { count, max }]) => `${tipo.toUpperCase()}: ${count}/${max}`)
        .join(', ');
    
    // Se nenhum dado disponível, mostra mensagem
    if (!textoContador) {
        textoContador = 'Sem dados adicionais';
    }
    
    // Atualiza contador na página de perícias
    const contador = document.getElementById('contador-dados-adicionais');
    if (contador) {
        contador.textContent = textoContador;
        contador.style.color = '#4caf50';
        contador.style.fontWeight = 'normal';
    }
    
    // Atualiza contador na ficha
    const contadorFicha = document.getElementById('contador-dados-adicionais-ficha');
    if (contadorFicha) {
        contadorFicha.textContent = textoContador;
        contadorFicha.style.color = '#4caf50';
        contadorFicha.style.fontWeight = 'normal';
    }
}

/**
 * Rola um d6 para a perícia
 */
/**
 * Calcula dados adicionais (D4/D6/D8/D10) baseado no nível
 * Retorna { count: número de perícias, dados: tipo de dado }
 */

/**
 * Obtém o storage dos dados adicionais
 */
function obterDadosAdicionaisPericias() {
    const saved = localStorage.getItem('pericias_dados_adicionais');
    return saved ? JSON.parse(saved) : {};
}

/**
 * Salva os dados adicionais no storage
 */
function salvarDadosAdicionaisPericias(dados) {
    localStorage.setItem('pericias_dados_adicionais', JSON.stringify(dados));
}

/**
 * Calcula o limite de perícias com D6 baseado no nível
 */
function calcularLimiteD6(nivel) {
    nivel = parseInt(nivel) || 0;
    
    if (nivel >= 100) return 25;
    if (nivel >= 95) return 23;
    if (nivel >= 75) return 21;
    if (nivel >= 55) return 19;
    if (nivel >= 35) return 17;
    if (nivel >= 15) return 15;
    if (nivel >= 5) return 13;
    return 10;
}

/**
 * Obtém o nível atual do personagem
 */
function obterNivelAtual() {
    // Tenta múltiplas fontes para obter o nível
    
    // Fonte 0: Variável global (definida quando ficha é aberta/salva)
    if (window.nivelFichaAtual && window.nivelFichaAtual > 0) {
        return window.nivelFichaAtual;
    }
    
    // Fonte 0.5: localStorage (persistência entre recarregamentos)
    const nivelStorage = localStorage.getItem('nivelFichaAtual');
    if (nivelStorage) {
        const nivel = parseInt(nivelStorage) || 0;
        if (nivel > 0) {
            window.nivelFichaAtual = nivel; // Restaura para variável global
            return nivel;
        }
    }
    
    // Fonte 1: Input de nível (quando editando ficha)
    const inputNivel = document.getElementById('nivel');
    if (inputNivel && inputNivel.value) {
        const nivel = parseInt(inputNivel.value) || 0;
        if (nivel > 0) {
            // Armazena no localStorage para usar depois
            localStorage.setItem('nivelFichaAtual', nivel);
            window.nivelFichaAtual = nivel;
            return nivel;
        }
    }
    
    // Fonte 2: Slider de nível
    const sliderNivel = document.getElementById('nivel-slider');
    if (sliderNivel && sliderNivel.value) {
        const nivel = parseInt(sliderNivel.value) || 0;
        if (nivel > 0) {
            // Armazena no localStorage para usar depois
            localStorage.setItem('nivelFichaAtual', nivel);
            window.nivelFichaAtual = nivel;
            return nivel;
        }
    }
    
    // Fonte 3: Procura qualquer input com atributo de nível no DOM
    const allInputs = document.querySelectorAll('input[id*="nivel"], input[name*="nivel"]');
    for (let input of allInputs) {
        const valor = parseInt(input.value) || 0;
        if (valor > 0) {
            // Armazena no localStorage para usar depois
            localStorage.setItem('nivelFichaAtual', valor);
            window.nivelFichaAtual = valor;
            return valor;
        }
    }
    
    // Fonte 4: Procura no localStorage se houver personagem carregado
    let fichasJSON = localStorage.getItem('rpg_fichas');
    if (!fichasJSON) {
        fichasJSON = localStorage.getItem('fichas');
    }
    
    if (fichasJSON) {
        try {
            const fichas = JSON.parse(fichasJSON);
            // Pega a última ficha carregada ou a primeira disponível
            const fichasArray = Array.isArray(fichas) ? fichas : Object.values(fichas);
            if (fichasArray.length > 0) {
                const ultimaFicha = fichasArray[fichasArray.length - 1];
                if (ultimaFicha && ultimaFicha.nivel) {
                    const nivel = parseInt(ultimaFicha.nivel) || 0;
                    // Armazena no localStorage para usar depois
                    localStorage.setItem('nivelFichaAtual', nivel);
                    window.nivelFichaAtual = nivel;
                    return nivel;
                }
            }
        } catch (e) {
            console.error('Erro ao parsear fichas:', e);
        }
    }
    
    // Se nenhuma fonte tiver um valor válido, retorna 0
    return 0;
}

/**
 * Rola D6 para uma perícia com validação de limite
 */
function rolarD6Pericia(periciaId) {
    const pericias = obterTodasPericias();
    const periciaData = pericias[periciaId] || { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
    
    // Se já tem D6, remove (limpa para 0)
    if (periciaData.d6 > 0) {
        periciaData.d6 = 0;
        pericias[periciaId] = periciaData;
        localStorage.setItem('pericias_estrutura', JSON.stringify(pericias));
        
        const campoD6 = document.getElementById(`pericia-d6-${periciaId}`);
        if (campoD6) {
            campoD6.value = 0;
        }
        
        atualizarTotalPericia(periciaId);
        atualizarContadorD6();
        return;
    }
    
    // Se D6 é 0, tenta rolar um novo
    // Conta quantas perícias já têm D6 ativo
    const periciasComD6 = Object.values(pericias).filter(p => (parseInt(p.d6) || 0) > 0).length;
    
    // Obtém o limite baseado no nível
    const nivel = obterNivelAtual();
    const limiteD6 = calcularLimiteD6(nivel);
    
    if (periciasComD6 >= limiteD6) {
        // Alerta: limite atingido
        alert(`⚠️ Limite de ${limiteD6} perícias com D6 atingido (nível ${nivel}%)!\n\nRemova uma perícia existente para adicionar outra.`);
        return;
    }
    
    // Gera um número aleatório de 1 a 6
    const resultado = Math.floor(Math.random() * 6) + 1;
    
    // Atualiza o campo d6
    const campoD6 = document.getElementById(`pericia-d6-${periciaId}`);
    if (campoD6) {
        campoD6.value = resultado;
    }
    
    // Atualiza a perícia com o novo d6
    periciaData.d6 = resultado;
    pericias[periciaId] = periciaData;
    
    // Salva no localStorage
    localStorage.setItem('pericias_estrutura', JSON.stringify(pericias));
    
    // Atualiza o total
    atualizarTotalPericia(periciaId);
    atualizarContadorD6();
}

/**
 * Atualiza o total de uma perícia
 */
function atualizarTotalPericia(periciaId) {
    const pericias = obterTodasPericias();
    const periciaData = pericias[periciaId] || {};

    // Safely coerce values to integers, fallback to 0 to avoid NaN or missing fields
    const d6 = parseInt(periciaData.d6) || 0;
    const bp = parseInt(periciaData.bonus_personagem) || 0;
    const bo = parseInt(periciaData.bonus_origem) || 0;
    const bc = parseInt(periciaData.bonus_classe) || 0;
    const br = parseInt(periciaData.bonus_raca) || 0;

    // Obtém dados disponíveis para o nível atual
    const nivel = obterNivelAtual();
    const disponivel = obterDadosDisponiveisPorNivel(nivel);

    // Soma apenas os dados adicionais que estão disponíveis neste nível
    const dadosAdicionais = obterDadosAdicionaisPericias();
    const periciaAdicionais = dadosAdicionais[periciaId] || { d4: 0, d6: 0, d8: 0, d10: 0 };
    
    let somaAdicionais = 0;
    if (disponivel.d4) somaAdicionais += (parseInt(periciaAdicionais.d4) || 0);
    if (disponivel.d6) somaAdicionais += (parseInt(periciaAdicionais.d6) || 0);
    if (disponivel.d8) somaAdicionais += (parseInt(periciaAdicionais.d8) || 0);
    if (disponivel.d10) somaAdicionais += (parseInt(periciaAdicionais.d10) || 0);

    const total = d6 + bp + bo + bc + br + somaAdicionais;
    
    const campoTotal = document.getElementById(`pericia-total-${periciaId}`);
    if (campoTotal) {
        campoTotal.value = total;
        // Atualiza cor
        campoTotal.className = total > 0 ? 'pericia-input positivo' : total < 0 ? 'pericia-input negativo' : 'pericia-input neutro';
    }
}

/**
 * Atualiza o total de todas as perícias
 * Útil quando o nível muda e alguns dados ficam indisponíveis
 */
function atualizarTodosTotaisPericias() {
    if (!window.Pericias) return;
    
    const pericias = obterTodasPericias();
    
    // Atualiza o total de cada perícia
    Object.keys(pericias).forEach(periciaId => {
        atualizarTotalPericia(periciaId);
    });
}

/**
 * Atualiza o contador de perícias com D6 ativo
 */
function atualizarContadorD6() {
    const pericias = obterTodasPericias();
    const periciasComD6 = Object.values(pericias).filter(p => (parseInt(p.d6) || 0) > 0).length;
    const nivel = obterNivelAtual();
    const limiteD6 = calcularLimiteD6(nivel);
    
    // Atualiza contador na página de perícias
    const contador = document.getElementById('contador-pericias-d6');
    if (contador) {
        contador.textContent = `${periciasComD6}/${limiteD6}`;
        // Muda cor se estiver no limite
        if (periciasComD6 >= limiteD6) {
            contador.style.color = '#d32';
            contador.style.fontWeight = 'bold';
        } else if (periciasComD6 > limiteD6 * 0.7) {
            contador.style.color = '#ff9800';
            contador.style.fontWeight = 'normal';
        } else {
            contador.style.color = '#4caf50';
            contador.style.fontWeight = 'normal';
        }
    }
    
    // Atualiza contador na ficha
    const contadorFicha = document.getElementById('contador-pericias-d6-ficha');
    if (contadorFicha) {
        contadorFicha.textContent = `${periciasComD6}/${limiteD6}`;
        // Muda cor se estiver no limite
        if (periciasComD6 >= limiteD6) {
            contadorFicha.style.color = '#d32';
            contadorFicha.style.fontWeight = 'bold';
        } else if (periciasComD6 > limiteD6 * 0.7) {
            contadorFicha.style.color = '#ff9800';
            contadorFicha.style.fontWeight = 'normal';
        } else {
            contadorFicha.style.color = '#4caf50';
            contadorFicha.style.fontWeight = 'normal';
        }
    }
}

/**
 * Salva perícia individual
 */
function salvarPericiaFicha(id, valor) {
    // Salva no novo formato pericias_estrutura (mapeando o valor recebido para bonus_origem)
    const saved = localStorage.getItem('pericias_estrutura');
    const dados = saved ? JSON.parse(saved) : {};
    if (!dados[id]) {
        dados[id] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
    }
    dados[id].bonus_personagem = Math.max(-5, Math.min(5, parseInt(valor) || 0));
    localStorage.setItem('pericias_estrutura', JSON.stringify(dados));

    // Atualiza total na interface
    atualizarTotalPericia(id);

    // Recalcula estatísticas quando perícias mudam
    calcularEstatisticas();
}

// Flag para controlar se é a primeira vez calculando estatísticas
let primeiraVezCalculandoEstatisticas = true;

/**
 * Calcula todas as estatísticas automaticamente (nível 0%)
 */
function calcularEstatisticas() {
    // Obtém valores dos atributos (nível 0%)
    const atributos = obterTodosAtributos();
    
    // Obtém valores das perícias (nível 0%)
    const pericias = obterTodasPericias();
    
    // Calcula Vida Total: Resiliência × 3 + 10
    const vidaTotal = (atributos.resiliencia || 0) * 3 + 10;
    atualizarCampoEstatisticaComAjuste('vida-total', 'vida-atual', Math.max(1, vidaTotal), primeiraVezCalculandoEstatisticas);
    
    // Calcula Mana Total: Magia × 5 + 15
    const manaTotal = (atributos.magia || 0) * 5 + 15;
    atualizarCampoEstatisticaComAjuste('mana-total', 'mana-atual', Math.max(0, manaTotal), primeiraVezCalculandoEstatisticas);
    
    // Calcula Sanidade Total: Intelecto × 5 + Carisma × 3 + 10
    const sanidadeTotal = (atributos.intelecto || 0) * 5 + (atributos.carisma || 0) * 3 + 10;
    atualizarCampoEstatisticaComAjuste('sanidade-total', 'sanidade-atual', Math.max(0, sanidadeTotal), primeiraVezCalculandoEstatisticas);
    
    // Calcula Alma Total: Magia × 5 + Resiliência × 3 + Intelecto × 2 + 15 + bônus de raça
    let bonusAlma = 0;
    let almaZerada = false; // Flag para saber se alma foi zerada pela raça
    
    if (bonusAplicados.raca && bonusAplicados.raca.alma !== undefined) {
        bonusAlma = bonusAplicados.raca.alma;
        // Apenas a raça 'demonio' deve zerar completamente a alma quando definida como 0
        if (bonusAplicados.raca.alma === 0 && selecionadosIds.raca === 'demonio') {
            almaZerada = true;
        }
    }
    
    let almaTotal;
    if (almaZerada) {
        almaTotal = 0; // Se alma for zerada pela raça, fica 0
    } else {
        almaTotal = (atributos.magia || 0) * 5 + (atributos.resiliencia || 0) * 3 + (atributos.intelecto || 0) * 2 + 15 + bonusAlma;
    }
    
    const campoAlmaTotal = document.getElementById('alma-total');
    const campoAlmaAtual = document.getElementById('alma-atual');
    if (campoAlmaTotal) {
        campoAlmaTotal.value = Math.max(0, almaTotal);
    }
    if (campoAlmaAtual) {
        campoAlmaAtual.value = Math.max(0, almaTotal);
    }
    
    // Calcula Defesa: Constituição + 10
    const defesa = (atributos.constituicao || 0) + 10;
    atualizarCampoEstatistica('defesa', Math.max(0, defesa));
    
    // Calcula Esquiva: Defesa + Perícia Reflexos + Destreza
    // Obtém valor numérico da perícia 'reflexos' (pode vir do helper em pericias.js ou do storage)
    let reflexos = 0;
    if (typeof obterValorPericia === 'function') {
        try {
            reflexos = obterValorPericia('reflexos') || 0;
        } catch (e) {
            reflexos = 0;
        }
    } else {
        const reflexosData = pericias['reflexos'];
        if (reflexosData) {
            reflexos = (parseInt(reflexosData.d6) || 0) + (parseInt(reflexosData.bonus_personagem) || 0) + (parseInt(reflexosData.bonus_origem) || 0) + (parseInt(reflexosData.bonus_classe) || 0) + (parseInt(reflexosData.bonus_raca) || 0);
        }
    }
    const destreza = atributos.destreza || 0;
    const esquiva = defesa + reflexos + destreza;
    atualizarCampoEstatistica('esquiva', Math.max(0, esquiva));
    
    // Calcula Bloqueio: Constituição × 2 + Metade da Fortitude (arredondado para cima)
    // Obtém valor numérico da perícia 'fortitude'
    let fortitude = 0;
    if (typeof obterValorPericia === 'function') {
        try {
            fortitude = obterValorPericia('fortitude') || 0;
        } catch (e) {
            fortitude = 0;
        }
    } else {
        const fortData = pericias['fortitude'];
        if (fortData) {
            fortitude = (parseInt(fortData.d6) || 0) + (parseInt(fortData.bonus_personagem) || 0) + (parseInt(fortData.bonus_origem) || 0) + (parseInt(fortData.bonus_classe) || 0) + (parseInt(fortData.bonus_raca) || 0);
        }
    }
    const metadeFortitude = Math.ceil(fortitude / 2);
    const bloqueio = (atributos.constituicao || 0) * 2 + metadeFortitude;
    atualizarCampoEstatistica('bloqueio', Math.max(0, bloqueio));
    
    // Marca que já calculou pela primeira vez
    primeiraVezCalculandoEstatisticas = false;
}

/**
 * Obtém todos os valores de atributos
 */
function obterTodosAtributos() {
    const saved = localStorage.getItem('atributos_personagem');
    if (saved) {
        return JSON.parse(saved);
    }
    return {};
}

/**
 * Obtém todos os valores de perícias com a nova estrutura
 */
function obterTodasPericias() {
    const saved = localStorage.getItem('pericias_estrutura');
    if (saved) {
        return JSON.parse(saved);
    }
    return {};
}

/**
 * Obtém a perícia com todos os seus dados
 */
function obterPericia(periciaId) {
    const pericias = obterTodasPericias();
    return pericias[periciaId] || { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
}

/**
 * Atualiza um campo de estatística
 */
function atualizarCampoEstatistica(id, valor) {
    const campo = document.getElementById(id);
    if (campo) {
        campo.value = valor;
    }
}

/**
 * Atualiza um campo de estatística total e ajusta o atual se necessário
 */
function atualizarCampoEstatisticaComAjuste(idTotal, idAtual, valorTotal, inicializar = false) {
    const campoTotal = document.getElementById(idTotal);
    const campoAtual = document.getElementById(idAtual);
    
    if (campoTotal) {
        campoTotal.value = valorTotal;
        
        if (campoAtual) {
            const valorAtualAnterior = parseInt(campoAtual.value) || 0;
            
            // Se o valor atual for maior que o novo total, ajusta para o total
            if (valorAtualAnterior > valorTotal) {
                campoAtual.value = valorTotal;
            }
            // Se for a primeira vez calculando, inicializa o atual com o total
            else if (inicializar && valorAtualAnterior === 0 && valorTotal > 0) {
                campoAtual.value = valorTotal;
            }
        }
    }
}

// Armazena os bônus aplicados anteriormente para poder removê-los
let bonusAplicados = {
    classe: null,
    raca: null,
    origem: null
};

// Armazena os ids selecionados atualmente (classe, raca, origem)
let selecionadosIds = {
    classe: null,
    raca: null,
    origem: null
};

/**
 * Aplica os bônus de classe, raça ou origem aos atributos
 */
function aplicarBonusSelecao(tipo, id) {
    if (!id) {
        // Se não houver seleção, remove os bônus anteriores deste tipo
        removerBonus(tipo);
        if (tipo === 'origem') atualizarEstadoEscolhaOrigem(null);
        return;
    }
    
    // Obtém os dados do item selecionado
    const item = DadosLoader.obterItemPorId(tipo === 'classe' ? 'classes' : tipo === 'raca' ? 'racas' : 'origens', id);
    
    if (!item) return;
    
    // Remove os bônus anteriores deste tipo
    removerBonus(tipo);
    
    // Verifica se há bônus estruturados (pericias) ou outros formatos
    let bonusTraduzido = {};

    if (item.bonus) {
        // Preferência: objeto completo que já contenha 'pericias'
        if (item.bonus.pericias && typeof item.bonus.pericias === 'object') {
            // Usa o próprio objeto bonus (contendo pericias, pericias_penalidade, alma, etc.)
            bonusTraduzido = item.bonus;
        }
        // Compatibilidade com formatos antigos/traduzidos
        else if (item.bonus.traduzido) {
            bonusTraduzido = item.bonus.traduzido;
        } else if (item.bonus.atributos) {
            bonusTraduzido = item.bonus.atributos;
        }
    }
    
    // Aplica os bônus se existirem
    if (typeof bonusTraduzido === 'object') {
        aplicarBonusCompleto(bonusTraduzido, tipo);
        // Salva os bônus aplicados para poder removê-los depois
        bonusAplicados[tipo] = bonusTraduzido;
        // Salva o id selecionado (útil para regras específicas como alma zerada apenas para demônio)
        selecionadosIds[tipo] = id;
        
        // Atualiza a interface após aplicar bônus
        popularAtributosFicha();
        popularPericiasFicha();
    }
    
    // Recalcula estatísticas após aplicar bônus
    calcularEstatisticas();
    
    // Se for origem e a origem permite escolher perícias, atualiza estado do botão/hint
    if (tipo === 'origem') {
        atualizarEstadoEscolhaOrigem(id);
        // Se houver escolhas salvas, aplique-as (garante aplicação ao trocar de origem)
        const escolhas = JSON.parse(localStorage.getItem('origem_escolhas') || '{}');
        if (escolhas[id] && escolhas[id].length > 0) {
            aplicarPericiasEscolhidasParaOrigem(id, escolhas[id]);
        }
    }
}

/**
 * Aplica bônus completos (apenas perícias e alma, sem atributos)
 * Tipo: 'raca', 'classe' ou 'origem'
 */
function aplicarBonusCompleto(bonus, tipo) {
    const pericias = obterTodasPericias();
    const mapaTipo = {
        'raca': 'bonus_raca',
        'classe': 'bonus_classe',
        'origem': 'bonus_origem'
    };
    const campoBonusChave = mapaTipo[tipo];
    
    if (!campoBonusChave) return;
    
    // Aplica bônus de perícias
    if (bonus.pericias && typeof bonus.pericias === 'object') {
        Object.keys(bonus.pericias).forEach(periciaId => {
            const bonusValor = bonus.pericias[periciaId];
            if (typeof bonusValor === 'number') {
                // Inicializa perícia se não existir
                if (!pericias[periciaId]) {
                    pericias[periciaId] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
                }
                
                // Adiciona o bônus ao campo específico
                const valorAtual = pericias[periciaId][campoBonusChave] || 0;
                const novoValor = valorAtual + bonusValor;
                
                // Limita entre -5 e +5
                const valorLimitado = Math.max(-5, Math.min(5, novoValor));
                pericias[periciaId][campoBonusChave] = valorLimitado;
                
                // Atualiza na interface
                const campoInput = document.getElementById(`pericia-${tipo}-${periciaId}`);
                if (campoInput) {
                    campoInput.value = valorLimitado;
                }
            }
        });
    }
    
    // Aplica penalidades de perícias (se houver)
    if (bonus.pericias_penalidade && typeof bonus.pericias_penalidade === 'object') {
        Object.keys(bonus.pericias_penalidade).forEach(periciaId => {
            const bonusValor = bonus.pericias_penalidade[periciaId];
            if (typeof bonusValor === 'number') {
                // Inicializa perícia se não existir
                if (!pericias[periciaId]) {
                    pericias[periciaId] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
                }
                
                // Adiciona a penalidade (bonusValor é negativo)
                const valorAtual = pericias[periciaId][campoBonusChave] || 0;
                const novoValor = valorAtual + bonusValor;
                
                // Limita entre -5 e +5
                const valorLimitado = Math.max(-5, Math.min(5, novoValor));
                pericias[periciaId][campoBonusChave] = valorLimitado;
                
                // Atualiza na interface
                const campoInput = document.getElementById(`pericia-${tipo}-${periciaId}`);
                if (campoInput) {
                    campoInput.value = valorLimitado;
                }
            }
        });
    }
    
    // Atualiza totais de todas as perícias afetadas
    Object.keys(pericias).forEach(periciaId => {
        atualizarTotalPericia(periciaId);
    });
    // Atualiza interface dos cards principais (pericias.js) se existir
    if (window.Pericias && typeof window.Pericias.init === 'function') {
        window.Pericias.init();
    }
    
    // Salva as perícias atualizadas
    localStorage.setItem('pericias_estrutura', JSON.stringify(pericias));

    // Atualiza registro de bônus aplicados (útil para remover depois)
    bonusAplicados[tipo] = bonus;
    // selecionadosIds não é alterado aqui, chama a função que iniciou a aplicação para definir se necessário
}

/**
 * Abre modal para escolher perícias para uma origem
 */
function abrirModalEscolherPericias(origemId, maxEscolhas) {
    const modal = document.getElementById('modal-escolher-pericias');
    const list = document.getElementById('modal-escolher-list');
    const title = document.getElementById('modal-escolher-title');
    const desc = document.getElementById('modal-escolher-desc');
    const search = document.getElementById('modal-escolher-search');

    if (!modal || !list) return;

    title.textContent = `Escolher ${maxEscolhas} perícia${maxEscolhas>1?'s':''}`;
    desc.textContent = `Escolha até ${maxEscolhas} perícia${maxEscolhas>1?'s':''}. Você pode buscar por nome.`;

    // Build list of pericias
    const periciasObj = window.Pericias?.PERICIAS || {};
    const periciasFlat = Object.values(periciasObj).flat();

    // Load previously saved choices for this origem
    const escolhasAll = JSON.parse(localStorage.getItem('origem_escolhas') || '{}');
    // copy to avoid mutating stored structure accidentally
    const escolhasAtuais = (escolhasAll[origemId] || []).slice();

    function renderList(filter='') {
        list.innerHTML = '';
        const filtro = filter.trim().toLowerCase();
        periciasFlat.forEach(p => {
            if (filtro && p.nome.toLowerCase().indexOf(filtro) === -1) return;
            const checked = escolhasAtuais.indexOf(p.id) !== -1;
            const item = document.createElement('label');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '8px';
            item.style.padding = '6px';
            item.style.border = '1px solid #eee';
            item.style.borderRadius = '4px';
            item.style.cursor = 'pointer';
            item.innerHTML = `
                <input type="checkbox" data-pericia-id="${p.id}" ${checked ? 'checked' : ''}>
                <span style="flex:1">${p.nome}</span>
                <small style="color:#666">${p.id}</small>
            `;
            const cb = item.querySelector('input');
            // set initial disabled state if already at max
            cb.disabled = (!checked && escolhasAtuais.length >= maxEscolhas);
            cb.onchange = () => {
                if (cb.checked) {
                    if (escolhasAtuais.length >= maxEscolhas) {
                        // revert and inform
                        cb.checked = false;
                        showMessage(`Você só pode escolher ${maxEscolhas} perícia${maxEscolhas>1?'s':''}.`, 'error');
                        return;
                    }
                    escolhasAtuais.push(p.id);
                } else {
                    const idx = escolhasAtuais.indexOf(p.id);
                    if (idx !== -1) escolhasAtuais.splice(idx, 1);
                }
                // update disabled state of other checkboxes
                const inputs = list.querySelectorAll('input[type=checkbox]');
                inputs.forEach(i => {
                    if (!i.checked) {
                        i.disabled = (escolhasAtuais.length >= maxEscolhas);
                    } else {
                        i.disabled = false;
                    }
                });
            };
            list.appendChild(item);
        });
    }

    renderList('');

    // Search handler
    search.value = '';
    search.oninput = () => renderList(search.value);

    // Show modal
    modal.style.display = 'flex';

    // Close handlers
    const close = document.getElementById('modal-escolher-close');
    const cancel = document.getElementById('modal-escolher-cancel');
    const confirm = document.getElementById('modal-escolher-confirm');

    function fechar() {
        modal.style.display = 'none';
        // cleanup handlers
        close.removeEventListener('click', fechar);
        cancel.removeEventListener('click', fechar);
        confirm.removeEventListener('click', onConfirm);
    }

    function onConfirm() {
        // Apply choices
        aplicarPericiasEscolhidasParaOrigem(origemId, escolhasAtuais);
        // Save escolhas
        const todas = JSON.parse(localStorage.getItem('origem_escolhas') || '{}');
        todas[origemId] = escolhasAtuais;
        localStorage.setItem('origem_escolhas', JSON.stringify(todas));
        // Update hint/button state
        atualizarEstadoEscolhaOrigem(origemId);
        fechar();
    }

    close.addEventListener('click', fechar);
    cancel.addEventListener('click', fechar);
    confirm.addEventListener('click', onConfirm);
}

/**
 * Aplica as perícias escolhidas para a origem (adiciona +2 em bonus_origem)
 */
function aplicarPericiasEscolhidasParaOrigem(origemId, periciaIds) {
    if (!Array.isArray(periciaIds) || periciaIds.length === 0) return;
    // Remove quaisquer bônus anteriores de origem
    removerBonus('origem');

    const bonus = { pericias: {} };
    periciaIds.forEach(id => {
        bonus.pericias[id] = 2;
    });

    // Aplica via a rotina existente
    aplicarBonusCompleto(bonus, 'origem');

    // Marca como aplicados e selecionado
    bonusAplicados['origem'] = bonus;
    selecionadosIds['origem'] = origemId;

    // Atualiza interfaces
    popularPericiasFicha();
    if (window.Pericias && typeof window.Pericias.init === 'function') window.Pericias.init();
}

/**
 * Atualiza o estado do botão/hint de escolha para a origem atual
 */
function atualizarEstadoEscolhaOrigem(origemId) {
    const btn = document.getElementById('btn-escolher-origem-pericias');
    const hint = document.getElementById('origem-escolha-hint');
    if (!origemId) {
        if (btn) btn.disabled = true;
        if (hint) hint.textContent = '';
        return;
    }
    const item = DadosLoader.obterItemPorId('origens', origemId);
    const escolherCount = item?.bonus?.escolher_pericias || 0;
    if (escolherCount && escolherCount > 0) {
        if (btn) btn.disabled = false;
        const escolhas = JSON.parse(localStorage.getItem('origem_escolhas') || '{}');
        const escolhidas = escolhas[origemId] || [];
        if (escolhidas.length > 0) {
            // Mapear ids para nomes amigáveis quando possível
            const periciasMap = window.Pericias?.PERICIAS || {};
            const flat = Object.values(periciasMap).flat();
            const nomes = escolhidas.map(id => {
                const p = flat.find(x => x.id === id);
                return p ? p.nome : id;
            });
            if (hint) hint.textContent = `Perícias escolhidas: ${nomes.join(', ')} (clique em 'Escolher perícias' para alterar)`;
        } else {
            if (hint) hint.textContent = `Esta origem permite escolher ${escolherCount} perícia(s). Clique em 'Escolher perícias' para selecionar agora ou faça depois.`;
        }
    } else {
        if (btn) btn.disabled = true;
        if (hint) hint.textContent = '';
    }
}

/**
 * Remove os bônus aplicados anteriormente de um tipo específico
 */
function removerBonus(tipo) {
    if (!bonusAplicados[tipo]) return;
    
    const bonus = bonusAplicados[tipo];
    const pericias = obterTodasPericias();
    
    const mapaTipo = {
        'raca': 'bonus_raca',
        'classe': 'bonus_classe',
        'origem': 'bonus_origem'
    };
    const campoBonusChave = mapaTipo[tipo];
    
    if (!campoBonusChave) return;
    
    // Remove bônus de perícias
    if (bonus.pericias && typeof bonus.pericias === 'object') {
        Object.keys(bonus.pericias).forEach(periciaId => {
            const bonusValor = bonus.pericias[periciaId];
            if (typeof bonusValor === 'number') {
                if (!pericias[periciaId]) {
                    pericias[periciaId] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
                }
                
                // Remove o bônus do campo específico
                const valorAtual = pericias[periciaId][campoBonusChave] || 0;
                const novoValor = valorAtual - bonusValor;
                
                // Limita entre -5 e +5
                const valorLimitado = Math.max(-5, Math.min(5, novoValor));
                pericias[periciaId][campoBonusChave] = valorLimitado;
                
                // Atualiza na interface
                const campoInput = document.getElementById(`pericia-${tipo}-${periciaId}`);
                if (campoInput) {
                    campoInput.value = valorLimitado;
                }
            }
        });
    }
    
    // Remove penalidades de perícias
    if (bonus.pericias_penalidade && typeof bonus.pericias_penalidade === 'object') {
        Object.keys(bonus.pericias_penalidade).forEach(periciaId => {
            const bonusValor = bonus.pericias_penalidade[periciaId];
            if (typeof bonusValor === 'number') {
                if (!pericias[periciaId]) {
                    pericias[periciaId] = { d6: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
                }
                
                // Remove a penalidade
                const valorAtual = pericias[periciaId][campoBonusChave] || 0;
                const novoValor = valorAtual - bonusValor;
                
                // Limita entre -5 e +5
                const valorLimitado = Math.max(-5, Math.min(5, novoValor));
                pericias[periciaId][campoBonusChave] = valorLimitado;
                
                // Atualiza na interface
                const campoInput = document.getElementById(`pericia-${tipo}-${periciaId}`);
                if (campoInput) {
                    campoInput.value = valorLimitado;
                }
            }
        });
    }
    
    // Atualiza totais de todas as perícias afetadas
    Object.keys(pericias).forEach(periciaId => {
        atualizarTotalPericia(periciaId);
    });
    
    // Salva as perícias atualizadas
    localStorage.setItem('pericias_estrutura', JSON.stringify(pericias));
    
    // Limpa o registro dos bônus e o id selecionado
    bonusAplicados[tipo] = null;
    selecionadosIds[tipo] = null;
    
    // Atualiza a interface após remover bônus
    popularAtributosFicha();
    popularPericiasFicha();
}

/**
 * Configura sincronização entre o slider e o input numérico do nível
 */
function configurarNivelSlider() {
    const nivelSlider = document.getElementById('nivel-slider');
    const nivelInput = document.getElementById('nivel');
    
    if (nivelSlider && nivelInput) {
        // Quando o slider mudar, atualiza o input
        nivelSlider.addEventListener('input', () => {
            nivelInput.value = nivelSlider.value;
            
            // Salva o nível no localStorage IMEDIATAMENTE
            const nivel = parseInt(nivelSlider.value) || 0;
            localStorage.setItem('nivelFichaAtual', nivel);
            window.nivelFichaAtual = nivel;
            
            // Atualiza contadores dependentes do nível
            if (window.Atributos && typeof window.Atributos.atualizarContadores === 'function') {
                window.Atributos.atualizarContadores();
            }
            // Atualiza limite de D6 conforme o nível
            atualizarContadorD6();
            // Atualiza dados adicionais conforme o nível
            atualizarContadorDadosAdicionais();
            
            // Atualiza todos os totais das perícias para refletir dados disponíveis no novo nível
            atualizarTodosTotaisPericias();
            
            // Atualiza a página de ficha se estiver visível
            if (typeof popularPericiasFicha === 'function' && document.getElementById('pericias-ficha')) {
                popularPericiasFicha();
            }
            
            // Atualiza a página de perícias principal se estiver visível
            if (window.Pericias && typeof window.Pericias.renderizar === 'function' && document.getElementById('pericias-list')) {
                window.Pericias.renderizar();
            }
        });
        
        // Quando o input mudar, atualiza o slider
        nivelInput.addEventListener('input', () => {
            let valor = parseInt(nivelInput.value) || 0;
            
            // Limita o valor entre 0 e 100
            if (valor < 0) {
                valor = 0;
                nivelInput.value = 0;
            } else if (valor > 100) {
                valor = 100;
                nivelInput.value = 100;
            }
            
            nivelSlider.value = valor;
            
            // Salva o nível no localStorage IMEDIATAMENTE
            localStorage.setItem('nivelFichaAtual', valor);
            window.nivelFichaAtual = valor;
            
            // Atualiza contadores dependentes do nível
            if (window.Atributos && typeof window.Atributos.atualizarContadores === 'function') {
                window.Atributos.atualizarContadores();
            }
            // Atualiza limite de D6 conforme o nível
            atualizarContadorD6();
            // Atualiza dados adicionais conforme o nível
            atualizarContadorDadosAdicionais();
            
            // Atualiza todos os totais das perícias para refletir dados disponíveis no novo nível
            atualizarTodosTotaisPericias();
            
            // Atualiza a página de perícias se estiver visível
            if (typeof popularPericiasFicha === 'function' && document.getElementById('pericias-ficha')) {
                popularPericiasFicha();
            }
            
            // Atualiza a página de perícias principal se estiver visível
            if (window.Pericias && typeof window.Pericias.renderizar === 'function' && document.getElementById('pericias-list')) {
                window.Pericias.renderizar();
            }
        });
        
        // Sincroniza valores iniciais
        nivelSlider.value = nivelInput.value || 0;
        nivelInput.value = nivelSlider.value;
        
        // Carrega o nível do localStorage se houver
        const nivelStored = localStorage.getItem('nivelFichaAtual');
        if (nivelStored && parseInt(nivelStored) > 0) {
            nivelSlider.value = nivelStored;
            nivelInput.value = nivelStored;
            window.nivelFichaAtual = parseInt(nivelStored);
        }
    }
}

/**
 * Configura validação para os campos de estatísticas atuais
 */
function configurarValidacaoEstatisticas() {
    const camposAtuais = [
        { atual: 'vida-atual', total: 'vida-total' },
        { atual: 'mana-atual', total: 'mana-total' },
        { atual: 'sanidade-atual', total: 'sanidade-total' },
        { atual: 'alma-atual', total: 'alma-total' }
    ];
    
    camposAtuais.forEach(({ atual, total }) => {
        const campoAtual = document.getElementById(atual);
        const campoTotal = document.getElementById(total);
        
        if (campoAtual && campoTotal) {
            campoAtual.addEventListener('input', () => {
                const valorAtual = parseInt(campoAtual.value) || 0;
                const valorTotal = parseInt(campoTotal.value) || 0;
                
                // Limita o valor atual ao máximo do total
                if (valorAtual > valorTotal) {
                    campoAtual.value = valorTotal;
                }
                
                // Garante que não seja negativo
                if (valorAtual < 0) {
                    campoAtual.value = 0;
                }
            });
            
            campoAtual.addEventListener('change', () => {
                const valorAtual = parseInt(campoAtual.value) || 0;
                const valorTotal = parseInt(campoTotal.value) || 0;
                
                // Limita o valor atual ao máximo do total
                if (valorAtual > valorTotal) {
                    campoAtual.value = valorTotal;
                }
                
                // Garante que não seja negativo
                if (valorAtual < 0) {
                    campoAtual.value = 0;
                }
            });
        }
    });
}

/**
 * Testa perícia na ficha
 */
function testarPericiaFicha(id, atributoKey) {
    if (!window.Pericias) return;
    // Obtém dados da perícia no novo formato
    const pericias = obterTodasPericias();
    if (!pericias) return;
    if (!pericias[id]) pericias[id] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
    const periciaData = pericias[id];

    // NÃO rola um D6 aqui. D6 só é gerado quando clicar no botão D6.
    // Usa o D6 atual (pode ser 0 se nunca foi gerado)
    const d6 = parseInt(periciaData.d6) || 0;

    // Calcula os componentes (incluindo D6 atual, que pode ser 0)
    const bp = parseInt(periciaData.bonus_personagem) || 0;
    const bo = parseInt(periciaData.bonus_origem) || 0;
    const bc = parseInt(periciaData.bonus_classe) || 0;
    const br = parseInt(periciaData.bonus_raca) || 0;
    const totalPericia = d6 + bp + bo + bc + br;

    // Usa apenas o atributo para determinar o pool de D20
    const valorAtributo = obterValorAtributoFicha(atributoKey);

    // Busca nome da perícia e do atributo
    const pericia = Object.values(window.Pericias.PERICIAS).flat().find(p => p.id === id);
    const nomePericia = pericia ? pericia.nome : id;
    const nomeAtributo = window.Pericias.NOMES_ATRIBUTOS[atributoKey] || atributoKey;

    // Calcula valor total (atributo + perícia)
    const valorTotal = valorAtributo + totalPericia;

    // Rola pool de D20 com base no atributo
    let quantidadeDados;
    let resultadoPool;
    let dadosRolados = [];

    if (valorAtributo > 0) {
        quantidadeDados = valorAtributo;
    } else if (valorAtributo === 0) {
        quantidadeDados = 2;
    } else {
        quantidadeDados = Math.abs(valorAtributo) + 2;
    }
    for (let i = 0; i < quantidadeDados; i++) {
        const dado = Math.floor(Math.random() * 20) + 1;
        dadosRolados.push(dado);
    }

    // Decide se pega maior ou menor com base no valorTotal
    if (valorTotal > 0) {
        resultadoPool = Math.max(...dadosRolados);
    } else if (valorTotal === 0) {
        resultadoPool = Math.min(...dadosRolados);
    } else {
        resultadoPool = Math.min(...dadosRolados);
    }

    // Resultado final: pool do atributo + total da perícia
    const resultadoFinal = resultadoPool + totalPericia;

    // Exibe resultado na ficha
    exibirResultadoPericiaFicha(nomePericia, nomeAtributo, valorAtributo, periciaData, totalPericia, valorTotal, quantidadeDados, dadosRolados, resultadoPool, resultadoFinal);
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
function exibirResultadoPericiaFicha(nomePericia, nomeAtributo, valorAtributo, periciaData, totalPericia, valorTotal, quantidadeDados, dadosRolados, resultadoPool, resultadoFinal) {
    // Use the shared modal overlay for results
    const modal = document.getElementById('modal-resultado-atributo');
    const titulo = document.getElementById('modal-resultado-titulo');
    const corpo = document.getElementById('modal-resultado-corpo');
    const btnFechar = document.getElementById('modal-resultado-fechar');
    
    if (!modal || !titulo || !corpo || !btnFechar) {
        console.error('Modal elements not found (exibirResultadoPericiaFicha):', { modal, titulo, corpo, btnFechar });
        return;
    }

    const valorAtributoFormatado = valorAtributo >= 0 ? `+${valorAtributo}` : `${valorAtributo}`;
    const d6 = periciaData ? (parseInt(periciaData.d6) || 0) : 0;
    const bp = periciaData ? (parseInt(periciaData.bonus_personagem) || 0) : 0;
    const bo = periciaData ? (parseInt(periciaData.bonus_origem) || 0) : 0;
    const bc = periciaData ? (parseInt(periciaData.bonus_classe) || 0) : 0;
    const br = periciaData ? (parseInt(periciaData.bonus_raca) || 0) : 0;

    const totalPericiaFormatado = totalPericia >= 0 ? `+${totalPericia}` : `${totalPericia}`;
    const valorTotalFormatado = valorTotal >= 0 ? `+${valorTotal}` : `${valorTotal}`;

    let descricao = '';
    if (valorTotal > 0) {
        descricao = `Rolou ${quantidadeDados} dado${quantidadeDados > 1 ? 's' : ''} D20 e pegou o <strong>maior</strong> valor.`;
    } else if (valorTotal === 0) {
        descricao = `Rolou 2 dados D20 e pegou o <strong>pior</strong> valor.`;
    } else {
        descricao = `Rolou ${quantidadeDados} dados D20 e pegou o <strong>pior</strong> valor.`;
    }

    titulo.textContent = `${nomePericia} — Resultado`;
    corpo.innerHTML = `
        <p style="margin:6px 0;"><strong>Atributo Base (${nomeAtributo}):</strong> ${valorAtributoFormatado}</p>
        <p style="margin:6px 0;"><strong>D6 da Perícia:</strong> ${d6 >= 0 ? `+${d6}` : d6}</p>
        <p style="margin:6px 0;"><strong>Bônus (personagem):</strong> ${bp >= 0 ? `+${bp}` : bp}</p>
        <p style="margin:6px 0;"><strong>Bônus (origem):</strong> ${bo >= 0 ? `+${bo}` : bo}</p>
        <p style="margin:6px 0;"><strong>Bônus (classe):</strong> ${bc >= 0 ? `+${bc}` : bc}</p>
        <p style="margin:6px 0;"><strong>Bônus (raça):</strong> ${br >= 0 ? `+${br}` : br}</p>
        <p style="margin:6px 0;"><strong>Total de Perícia (D6 + bônus):</strong> ${totalPericiaFormatado}</p>
        <p class="resultado-descricao" style="margin:6px 0;"><strong>Total Geral (atributo + perícia):</strong> ${valorTotalFormatado}</p>
        <p class="resultado-descricao" style="margin:6px 0;">${descricao}</p>
        <div style="margin-top:8px;">
            <strong>Dados D20 rolados:</strong>
            <div style="display:flex; gap:6px; justify-content:center; flex-wrap:wrap; margin-top:6px;">
                ${dadosRolados.map(dado => `
                    <span style="padding:6px 8px; border-radius:6px; background:#eee; ${dado===resultadoPool? 'box-shadow:0 0 6px #ffd54f; font-weight:700;': ''}">${dado}</span>
                `).join('')}
            </div>
        </div>
        <div style="margin-top:12px; font-size:18px;">
            <strong>Resultado do Pool: <span style="color:#d32;">${resultadoPool}</span></strong>
            <div>Resultado Final (pool + perícia): <strong>${resultadoFinal >= 0 ? `+${resultadoFinal}` : resultadoFinal}</strong></div>
        </div>
    `;

    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    btnFechar.onclick = () => { 
        modal.style.display = 'none'; 
        btnFechar.onclick = null; 
    };
}

// Torna as funções globais para uso nos onclick do HTML (após definição)
/**
 * Alterna a visibilidade de um grupo de perícias
 */
function togglePericiasGrupo(atributoKey) {
    const grid = document.getElementById(`pericias-grid-${atributoKey}`);
    if (!grid) return;
    
    const grupo = grid.closest('.pericias-grupo-ficha');
    if (!grupo) return;
    
    const title = grupo.querySelector('.pericias-grupo-title-ficha');
    if (!title) return;
    
    const isHidden = grid.style.display === 'none';
    grid.style.display = isHidden ? 'grid' : 'none';
    
    // Atualiza o ícone
    const icon = title.querySelector('.pericias-toggle-icon');
    if (icon) {
        icon.textContent = isHidden ? '▼' : '▶';
    }
    
    // Adiciona/remove classe para indicar estado
    if (isHidden) {
        grupo.classList.add('pericias-grupo-aberto');
    } else {
        grupo.classList.remove('pericias-grupo-aberto');
    }
}

/**
 * Limpa apenas atributos e perícias, mantendo os valores atuais das estatísticas
 */
function limparAtributosEPericias() {
    // Salva os valores atuais das estatísticas antes de limpar
    const vidaAtual = document.getElementById('vida-atual')?.value || 0;
    const manaAtual = document.getElementById('mana-atual')?.value || 0;
    const sanidadeAtual = document.getElementById('sanidade-atual')?.value || 0;
    const almaAtual = document.getElementById('alma-atual')?.value || 0;
    
    // Remove todos os bônus aplicados
    removerBonus('classe');
    removerBonus('raca');
    removerBonus('origem');
    
    // Limpa atributos do localStorage
    localStorage.removeItem('atributos_personagem');
    
    // Limpa perícias do localStorage
    localStorage.removeItem('pericias_estrutura');
    
    // Reseta os campos de atributos e perícias na interface
    popularAtributosFicha();
    popularPericiasFicha();
    
    // Recalcula apenas os totais das estatísticas (baseados nos atributos/perícias zerados)
    // Mas não inicializa os valores atuais
    primeiraVezCalculandoEstatisticas = false; // Não inicializa os atuais
    calcularEstatisticas();
    
    // Restaura os valores atuais das estatísticas que foram salvos
    if (document.getElementById('vida-atual')) {
        document.getElementById('vida-atual').value = vidaAtual;
    }
    if (document.getElementById('mana-atual')) {
        document.getElementById('mana-atual').value = manaAtual;
    }
    if (document.getElementById('sanidade-atual')) {
        document.getElementById('sanidade-atual').value = sanidadeAtual;
    }
    if (document.getElementById('alma-atual')) {
        document.getElementById('alma-atual').value = almaAtual;
    }
    
    showMessage('Atributos e perícias limpos. Valores atuais das estatísticas mantidos.', 'success');
}

window.testarAtributoFicha = testarAtributoFicha;
window.alterarAtributoFicha = alterarAtributoFicha;
window.salvarAtributoFicha = salvarAtributoFicha;
window.popularAtributosFicha = popularAtributosFicha;
window.popularPericiasFicha = popularPericiasFicha;
window.alterarPericiaFicha = alterarPericiaFicha;
window.salvarPericiaFicha = salvarPericiaFicha;
window.rolarD6Pericia = rolarD6Pericia;
window.atualizarTotalPericia = atualizarTotalPericia;
window.atualizarContadorD6 = atualizarContadorD6;
window.atualizarContadorDadosAdicionais = atualizarContadorDadosAdicionais;
window.rolarDadoAdicionalPericia = rolarDadoAdicionalPericia;
window.obterDadosDisponiveisPorNivel = obterDadosDisponiveisPorNivel;
window.obterNivelAtual = obterNivelAtual;
window.testarPericiaFicha = testarPericiaFicha;
window.togglePericiasGrupo = togglePericiasGrupo;
window.calcularEstatisticas = calcularEstatisticas;
window.limparAtributosEPericias = limparAtributosEPericias;

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
                nivel: parseInt(formData.get('nivel')) || 0,
                atributos: atributos,
                vidaTotal: parseInt(formData.get('vida-total')) || 10,
                vidaAtual: parseInt(formData.get('vida-atual')) || 10,
                manaTotal: parseInt(formData.get('mana-total')) || 0,
                manaAtual: parseInt(formData.get('mana-atual')) || 0,
                sanidadeTotal: parseInt(formData.get('sanidade-total')) || 0,
                sanidadeAtual: parseInt(formData.get('sanidade-atual')) || 0,
                almaTotal: parseInt(formData.get('alma-total')) || 0,
                almaAtual: parseInt(formData.get('alma-atual')) || 0,
                defesa: parseInt(formData.get('defesa')) || 0,
                esquiva: parseInt(formData.get('esquiva')) || 0,
                bloqueio: parseInt(formData.get('bloqueio')) || 0,
                historia: formData.get('historia') || ''
            };
            
            // Armazena o nível na variável global para uso em outras páginas
            window.nivelFichaAtual = ficha.nivel;
            
            // Armazena o nível no localStorage para persistência
            localStorage.setItem('nivelFichaAtual', ficha.nivel);
            
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
