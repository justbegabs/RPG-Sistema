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
    
    // Atualiza o contador de D6
    if (window.atualizarContadorD6) {
        window.atualizarContadorD6();
    }
    
    // Atualiza o contador de Dados Adicionais
    if (window.atualizarContadorDadosAdicionais) {
        window.atualizarContadorDadosAdicionais();
    }
}

/**
 * Cria um card de perícia
 */
function criarCardPericia(pericia, atributoKey) {
    // Mostra breakdown no tooltip
    const saved = localStorage.getItem('pericias_estrutura');
    let d6 = 0, bp = 0, bo = 0, bc = 0, br = 0;
    if (saved) {
        const dados = JSON.parse(saved);
        const p = dados[pericia.id];
        if (p) {
            d6 = parseInt(p.d6) || 0;
            bp = parseInt(p.bonus_personagem) || 0;
            bo = parseInt(p.bonus_origem) || 0;
            bc = parseInt(p.bonus_classe) || 0;
            br = parseInt(p.bonus_raca) || 0;
        }
    }
    
    // Obtém dados adicionais (D4/D6/D8/D10)
    const savedDados = localStorage.getItem('pericias_dados_adicionais');
    let d4add = 0, d6add = 0, d8add = 0, d10add = 0;
    if (savedDados) {
        const dados = JSON.parse(savedDados);
        const p = dados[pericia.id];
        if (p) {
            d4add = parseInt(p.d4) || 0;
            d6add = parseInt(p.d6) || 0;
            d8add = parseInt(p.d8) || 0;
            d10add = parseInt(p.d10) || 0;
        }
    }
    
    const somaAdicionais = d4add + d6add + d8add + d10add;
    const valor = d6 + bp + bo + bc + br + somaAdicionais;
    const valorFormatado = valor >= 0 ? `+${valor}` : `${valor}`;
    const corClasse = valor > 0 ? 'positivo' : valor < 0 ? 'negativo' : 'neutro';
    
    let tooltip = `D6: ${d6 >= 0 ? '+' + d6 : d6}\nPessoal: ${bp >= 0 ? '+' + bp : bp}\nOrigem: ${bo >= 0 ? '+' + bo : bo}\nClasse: ${bc >= 0 ? '+' + bc : bc}\nRaça: ${br >= 0 ? '+' + br : br}`;
    if (somaAdicionais > 0) {
        tooltip += '\n\nDados Adicionais:';
        if (d4add > 0) tooltip += `\nD4: +${d4add}`;
        if (d6add > 0) tooltip += `\nD6+: +${d6add}`;
        if (d8add > 0) tooltip += `\nD8: +${d8add}`;
        if (d10add > 0) tooltip += `\nD10: +${d10add}`;
    }
    
    // Obtém dados disponíveis para este nível (via window se disponível)
    let dadosDisponiveis = { d4: null, d6: null, d8: null, d10: null };
    try {
        if (window.obterDadosDisponiveisPorNivel && window.obterNivelAtual) {
            const nivelAtual = window.obterNivelAtual();
            dadosDisponiveis = window.obterDadosDisponiveisPorNivel(nivelAtual);
        }
    } catch (e) {
        // Se não conseguir, usa valor padrão
    }
    
    // Monta botões de dados adicionais baseado no que está disponível
    let botoesAdicionais = '';
    if (dadosDisponiveis.d4) {
        botoesAdicionais += `<button class="btn-dado-adicional" title="D4: ${d4add}/4" onclick="window.rolarDadoAdicionalPericia('${pericia.id}', 'd4')" style="color: #90caf9;">D4${d4add > 0 ? ':' + d4add : ''}</button>`;
    }
    if (dadosDisponiveis.d6) {
        botoesAdicionais += `<button class="btn-dado-adicional" title="D6: ${d6add}/6" onclick="window.rolarDadoAdicionalPericia('${pericia.id}', 'd6')" style="color: #f48fb1;">D6${d6add > 0 ? ':' + d6add : ''}</button>`;
    }
    if (dadosDisponiveis.d8) {
        botoesAdicionais += `<button class="btn-dado-adicional" title="D8: ${d8add}/8" onclick="window.rolarDadoAdicionalPericia('${pericia.id}', 'd8')" style="color: #a1887f;">D8${d8add > 0 ? ':' + d8add : ''}</button>`;
    }
    if (dadosDisponiveis.d10) {
        botoesAdicionais += `<button class="btn-dado-adicional" title="D10: ${d10add}/10" onclick="window.rolarDadoAdicionalPericia('${pericia.id}', 'd10')" style="color: #ffeb3b;">D10${d10add > 0 ? ':' + d10add : ''}</button>`;
    }
    
    return `
        <div class="pericia-card ${corClasse}">
            <button class="pericia-btn" onclick="testarPericia('${pericia.id}', '${atributoKey}')" title="${tooltip}">
                <span class="pericia-nome">${pericia.nome}</span>
                <span class="pericia-valor ${corClasse}">${valorFormatado}</span>
            </button>
            <div class="pericia-controles">
                <button class="btn-controle" onclick="alterarPericia('${pericia.id}', -1)">-</button>
                <button class="btn-controle" onclick="alterarPericia('${pericia.id}', 1)">+</button>
            </div>
            ${botoesAdicionais ? `<div class="pericia-dados-adicionais">${botoesAdicionais}</div>` : ''}
        </div>
    `;
}

/**
 * Obtém o valor de uma perícia do localStorage
 */
function obterValorPericia(id) {
    const saved = localStorage.getItem('pericias_estrutura');
    if (saved) {
        const dados = JSON.parse(saved);
        const p = dados[id];
        if (p) {
                const d6 = parseInt(p.d6) || 0;
                const bp = parseInt(p.bonus_personagem) || 0;
                const bo = parseInt(p.bonus_origem) || 0;
                const bc = parseInt(p.bonus_classe) || 0;
                const br = parseInt(p.bonus_raca) || 0;
                return d6 + bp + bo + bc + br;
        }
    }
    return 0;
}

/**
 * Salva todas as perícias no localStorage
 */
function salvarPericias() {
    // Garante que a estrutura de perícias existe e salva-a (no novo formato)
    const saved = localStorage.getItem('pericias_estrutura');
    if (saved) {
        // reescreve para forçar persistência
        localStorage.setItem('pericias_estrutura', saved);
        return;
    }
    // Se não existe, cria entradas padrão
    const dados = {};
    Object.values(PERICIAS).flat().forEach(pericia => {
        dados[pericia.id] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
    });
    localStorage.setItem('pericias_estrutura', JSON.stringify(dados));
}

/**
 * Altera o valor de uma perícia
 */
function alterarPericia(id, delta) {
    // Atualiza o campo bonus_origem da perícia no novo formato
    const saved = localStorage.getItem('pericias_estrutura');
    const dados = saved ? JSON.parse(saved) : {};
    if (!dados[id]) {
        dados[id] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
    }
    const atual = parseInt(dados[id].bonus_personagem) || 0;
    const novo = atual + delta;
    if (novo < -5 || novo > 5) return;
    dados[id].bonus_personagem = novo;
    localStorage.setItem('pericias_estrutura', JSON.stringify(dados));

    // Re-renderiza
    renderizarPericias();
}

/**
 * Testa uma perícia (rolagem de dados)
 */
function testarPericia(id, atributoKey) {
    // Obtém dados da perícia diretamente (d6 e bônus separados)
    const saved = localStorage.getItem('pericias_estrutura');
    let d6 = 0, bp = 0, bo = 0, bc = 0, br = 0;
    const dadosAll = saved ? JSON.parse(saved) : {};
    if (dadosAll[id]) {
        const p = dadosAll[id];
        d6 = parseInt(p.d6) || 0;
        bp = parseInt(p.bonus_personagem) || 0;
        bo = parseInt(p.bonus_origem) || 0;
        bc = parseInt(p.bonus_classe) || 0;
        br = parseInt(p.bonus_raca) || 0;
    }

    // NÃO gera D6 automaticamente aqui. D6 só é gerado quando clicar no botão D6.
    // Usa o D6 atual (pode ser 0 se nunca foi gerado)

    // Total da perícia inclui o D6 atual (que pode ser 0)
    const totalPericia = d6 + bp + bo + bc + br;

    // Obtém o valor do atributo base (número de dados a rolar)
    const valorAtributo = obterValorAtributo(atributoKey);

    // Busca nome da perícia
    const pericia = Object.values(PERICIAS).flat().find(p => p.id === id);
    const nomePericia = pericia ? pericia.nome : id;
    const nomeAtributo = NOMES_ATRIBUTOS[atributoKey] || atributoKey;

    // Calcula valor total (atributo + totalPericia) — usado para decidir se pega maior/pior
    const valorTotal = valorAtributo + totalPericia;

    // Faz a rolagem usando a quantidade do atributo (não inclui D6 na quantidade)
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

    // Resultado final: resultado do pool de atributo + total da perícia (inclui D6)
    const resultadoFinal = resultadoPool + totalPericia;

    // Exibe resultado com breakdown (inclui D6 e totals)
    exibirResultadoPericia(nomePericia, nomeAtributo, valorAtributo, dadosAll[id], totalPericia, valorTotal, quantidadeDados, dadosRolados, resultadoPool, resultadoFinal);
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
function exibirResultadoPericia(nomePericia, nomeAtributo, valorAtributo, periciaData, totalPericia, valorTotal, quantidadeDados, dadosRolados, resultadoPool, resultadoFinal) {
    // Reuse the shared modal overlay for consistency with ficha
    const modal = document.getElementById('modal-resultado-atributo');
    const titulo = document.getElementById('modal-resultado-titulo');
    const corpo = document.getElementById('modal-resultado-corpo');
    const btnFechar = document.getElementById('modal-resultado-fechar');
    
    if (!modal || !titulo || !corpo || !btnFechar) {
        console.error('Modal elements not found:', { modal, titulo, corpo, btnFechar });
        return;
    }

    const valorAtributoFormatado = valorAtributo >= 0 ? `+${valorAtributo}` : `${valorAtributo}`;
    const d6Real = periciaData ? (parseInt(periciaData.d6) || 0) : 0;
    const bpReal = periciaData ? (parseInt(periciaData.bonus_personagem) || 0) : 0;
    const boReal = periciaData ? (parseInt(periciaData.bonus_origem) || 0) : 0;
    const bcReal = periciaData ? (parseInt(periciaData.bonus_classe) || 0) : 0;
    const brReal = periciaData ? (parseInt(periciaData.bonus_raca) || 0) : 0;

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
        <p style="margin:6px 0;"><strong>D6 da Perícia:</strong> ${d6Real >= 0 ? `+${d6Real}` : d6Real}</p>
        <p style="margin:6px 0;"><strong>Bônus (personagem):</strong> ${bpReal >= 0 ? `+${bpReal}` : bpReal}</p>
        <p style="margin:6px 0;"><strong>Bônus (origem):</strong> ${boReal >= 0 ? `+${boReal}` : boReal}</p>
        <p style="margin:6px 0;"><strong>Bônus (classe):</strong> ${bcReal >= 0 ? `+${bcReal}` : bcReal}</p>
        <p style="margin:6px 0;"><strong>Bônus (raça):</strong> ${brReal >= 0 ? `+${brReal}` : brReal}</p>
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

