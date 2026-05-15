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
    try { setupOverlayBindings(); } catch (e) {}
}

/**
 * Inicializa o sistema
 */
async function init() {
    // Inicializa variáveis globais
    window.nivelFichaAtual = 0;
    // Mapas de regras por classe (progressão por 5% e escolhas de bônus de perícia)
    window.CLASSE_PROGRESSO = {
        // vida/sanidade/mana: { attr: 'atributo', mult: numero }
        mago: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'magia', mult: 2 }, mana: { attr: 'magia', mult: 3 } },
        atirador: { vida: { attr: 'resiliencia', mult: 3 }, sanidade: { attr: 'carisma', mult: 2 }, mana: { attr: 'magia', mult: 2 } },
        armadilheiro: { vida: { attr: 'resiliencia', mult: 3 }, sanidade: { attr: 'carisma', mult: 2 }, mana: { attr: 'magia', mult: 2 } },
        combatente: { vida: { attr: 'resiliencia', mult: 4 }, sanidade: { attr: 'carisma', mult: 2 }, mana: { attr: 'magia', mult: 2 } },
        investigador: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'carisma', mult: 3 }, mana: { attr: 'magia', mult: 2 } },
        curandeiro: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'magia', mult: 2 }, mana: { attr: 'magia', mult: 3 } },
        suporte: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'carisma', mult: 3 }, mana: { attr: 'magia', mult: 2 } },
        tecnologico: { vida: { attr: 'resiliencia', mult: 3 }, sanidade: { attr: 'carisma', mult: 3 }, mana: { attr: 'magia', mult: 2 } },
        clerigo: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'carisma', mult: 3 }, mana: { attr: 'magia', mult: 2 } },
        demonologista: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'carisma', mult: 2 }, mana: { attr: 'magia', mult: 3 } },
        domador: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'carisma', mult: 2 }, mana: { attr: 'magia', mult: 3 } },
        espiao: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'carisma', mult: 3 }, mana: { attr: 'magia', mult: 2 } },
        carteado: { vida: { attr: 'resiliencia', mult: 2 }, sanidade: { attr: 'carisma', mult: 2 }, mana: { attr: 'magia', mult: 3 } },
        arsenalhumano: { vida: { attr: 'resiliencia', mult: 3 }, sanidade: { attr: 'carisma', mult: 2 }, mana: { attr: 'magia', mult: 2 } }
    };
    window.CLASSE_ESCOLHAS = {
        mago: { ids: ['encantamento', 'runas'], bonus: 7 },
        atirador: { ids: ['armas_fogo_grandes', 'arcos'], bonus: 7 },
        armadilheiro: { ids: ['armadilhas', 'explosivos'], bonus: 7 },
        combatente: { ids: ['luta', 'espadas'], bonus: 5 },
        investigador: { ids: ['investigacao', 'forense'], bonus: 7 },
        curandeiro: { ids: ['alquimia', 'medicina'], bonus: 7 },
        suporte: { ids: ['exorcismo', 'vontade'], bonus: 7 },
        tecnologico: { ids: ['tecnologia', 'explosivos'], bonus: 7 },
        clerigo: { ids: ['conhecimento_arcano', 'religiao'], bonus: 7 },
        demonologista: { ids: ['necromancia', 'demonologia'], bonus: 7 },
        domador: { ids: ['conjuracao', 'demonologia'], bonus: 7 },
        espiao: { ids: ['trapaca', 'furtividade'], bonus: 7 },
        carteado: { ids: ['pontaria', 'armadilhas'], bonus: 7 },
        arsenalhumano: { ids: ['espadas', 'luta'], bonus: 7 }
    };
    
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
    setupEscolhasMagiasHabilidades();
    setupSelectsMagiasHabilidades();
    // Preenche selects de magias/habilidades com opções do JSON da raça selecionada e impede repetição
    function setupSelectsMagiasHabilidades() {
        const form = document.getElementById('raca-habilidades-magias-form');
        if (!form) return;
        const selectRaca = document.getElementById('raca');
        function getRacaSelecionada() {
            if (!selectRaca) return null;
            const id = selectRaca.value;
            if (!id) return null;
            return window.DadosLoader?.obterItemPorId('racas', id);
        }
        function preencherSelects() {
            const raca = getRacaSelecionada();
            if (!raca) return;
            // Habilidades
            const habs = [
                ...(raca.habilidadesNivel0 || []),
                ...(raca.habilidadesNivel25 || []),
                ...(raca.habilidadesNivel70 || []),
                ...(raca.habilidadesNivel90 || []),
                ...(raca.habilidadesNivel100 || [])
            ].filter(h => h && h.trim() !== '');
            // Magias
            const magias = [
                ...(raca.magiasNivel0 || []),
                ...(raca.magiasNivel25 || []),
                ...(raca.magiasNivel80 || []),
                ...(raca.magiasNivel100 || [])
            ].filter(m => m && m.trim() !== '');

            // Preencher selects de habilidades
            const selectsHab = form.querySelectorAll('select.select-hab');
            selectsHab.forEach(sel => {
                const val = sel.value;
                sel.innerHTML = '<option value="">Selecione...</option>' + habs.map(h => `<option value="${h}">${h}</option>`).join('');
                if (val && habs.includes(val)) sel.value = val;
            });
            // Preencher selects de magias
            const selectsMagia = form.querySelectorAll('select.select-magia');
            selectsMagia.forEach(sel => {
                const val = sel.value;
                sel.innerHTML = '<option value="">Selecione...</option>' + magias.map(m => `<option value="${m}">${m}</option>`).join('');
                if (val && magias.includes(val)) sel.value = val;
            });
        }
        // Impede seleção repetida
        function impedirRepeticao() {
            // Habilidades
            const selectsHab = Array.from(form.querySelectorAll('select.select-hab'));
            const habSelecionadas = selectsHab.map(sel => sel.value).filter(v => v);
            selectsHab.forEach(sel => {
                Array.from(sel.options).forEach(opt => {
                    if (!opt.value) return;
                    opt.disabled = habSelecionadas.includes(opt.value) && sel.value !== opt.value;
                });
            });
            // Magias
            const selectsMagia = Array.from(form.querySelectorAll('select.select-magia'));
            const magiasSelecionadas = selectsMagia.map(sel => sel.value).filter(v => v);
            selectsMagia.forEach(sel => {
                Array.from(sel.options).forEach(opt => {
                    if (!opt.value) return;
                    opt.disabled = magiasSelecionadas.includes(opt.value) && sel.value !== opt.value;
                });
            });
        }
        // Atualiza selects ao trocar raça
        if (selectRaca) selectRaca.addEventListener('change', () => { preencherSelects(); impedirRepeticao(); });
        // Atualiza ao abrir
        preencherSelects(); impedirRepeticao();
        // Atualiza ao mudar qualquer select
        form.addEventListener('change', e => {
            if (e.target && (e.target.classList.contains('select-hab') || e.target.classList.contains('select-magia'))) {
                impedirRepeticao();
            }
        });
    }
    // Lógica dinâmica para magias/habilidades por faixa de nível
    function setupEscolhasMagiasHabilidades() {
        const form = document.getElementById('raca-habilidades-magias-form');
        if (!form) return;

        // Função para atualizar bloqueios e destaques
        function atualizarCampos() {
            // Nível atual
            let nivel = 0;
            const inputNivel = document.getElementById('nivel');
            if (inputNivel && inputNivel.value) nivel = parseInt(inputNivel.value) || 0;
            else if (window.nivelFichaAtual) nivel = window.nivelFichaAtual;

            // HABILIDADES
            // 1 de 0-25, 2 de 25-70, 3 de 70-90, 4 em 100 + 1 de raça obrigatória
            const hab0 = form.querySelector('input[name="hab-nv0-1"]');
            const hab25 = [form.querySelector('input[name="hab-nv25-1"]'), form.querySelector('input[name="hab-nv25-2"]')];
            const hab70 = [form.querySelector('input[name="hab-nv70-1"]'), form.querySelector('input[name="hab-nv70-2"]'), form.querySelector('input[name="hab-nv70-3"]')];
            const hab100 = [form.querySelector('input[name="hab-nv100-1"]'), form.querySelector('input[name="hab-nv100-2"]'), form.querySelector('input[name="hab-nv100-3"]'), form.querySelector('input[name="hab-nv100-4"]')];

            // MAGIAS
            // 1 de 0-25, 2 de 25-80, 3 de 80-95, 4 em 100
            const mag0 = form.querySelector('input[name="magia-nv0-1"]');
            const mag25 = [form.querySelector('input[name="magia-nv25-1"]'), form.querySelector('input[name="magia-nv25-2"]')];
            const mag80 = [form.querySelector('input[name="magia-nv80-1"]'), form.querySelector('input[name="magia-nv80-2"]'), form.querySelector('input[name="magia-nv80-3"]')];
            const mag100 = [form.querySelector('input[name="magia-nv100-1"]'), form.querySelector('input[name="magia-nv100-2"]'), form.querySelector('input[name="magia-nv100-3"]'), form.querySelector('input[name="magia-nv100-4"]')];

            // HABILIDADE DE RAÇA sempre obrigatória
            const habRaca = form.querySelector('textarea[name="habilidade-raca"]');
            if (habRaca) {
                habRaca.required = true;
                habRaca.style.border = '2px solid #d32';
            }

            // HABILIDADES
            if (hab0) {
                hab0.required = true;
                hab0.disabled = nivel < 0;
                hab0.style.border = '2px solid #1976d2';
            }
            hab25.forEach((el, i) => {
                if (el) {
                    el.required = nivel >= 25;
                    el.disabled = nivel < 25;
                    el.style.border = nivel >= 25 ? '2px solid #1976d2' : '';
                }
            });
            hab70.forEach((el, i) => {
                if (el) {
                    el.required = nivel >= 70;
                    el.disabled = nivel < 70;
                    el.style.border = nivel >= 70 ? '2px solid #1976d2' : '';
                }
            });
            hab100.forEach((el, i) => {
                if (el) {
                    el.required = nivel >= 100;
                    el.disabled = nivel < 100;
                    el.style.border = nivel >= 100 ? '2px solid #1976d2' : '';
                }
            });

            // MAGIAS
            if (mag0) {
                mag0.required = true;
                mag0.disabled = nivel < 0;
                mag0.style.border = '2px solid #1976d2';
            }
            mag25.forEach((el, i) => {
                if (el) {
                    el.required = nivel >= 25;
                    el.disabled = nivel < 25;
                    el.style.border = nivel >= 25 ? '2px solid #1976d2' : '';
                }
            });
            mag80.forEach((el, i) => {
                if (el) {
                    el.required = nivel >= 80;
                    el.disabled = nivel < 80;
                    el.style.border = nivel >= 80 ? '2px solid #1976d2' : '';
                }
            });
            mag100.forEach((el, i) => {
                if (el) {
                    el.required = nivel >= 100;
                    el.disabled = nivel < 100;
                    el.style.border = nivel >= 100 ? '2px solid #1976d2' : '';
                }
            });
        }

        // Atualiza ao abrir e ao mudar nível
        atualizarCampos();
        const inputNivel = document.getElementById('nivel');
        if (inputNivel) inputNivel.addEventListener('input', atualizarCampos);
    }
    
    // Carrega as fichas existentes
    loadFichas();

    // Liga overlay OBS aos campos
    try { setupOverlayBindings(); } catch (e) {}
}

/**
 * Carrega os dados de classes, raças e origens
 */
async function carregarDados() {
    try {
        await DadosLoader.inicializar();
        console.log('Dados carregados com sucesso');
        if (typeof renderizarCatalogoItens === 'function') {
            renderizarCatalogoItens();
        }
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
        // Adiciona event listener para aplicar bônus e salvar seleção
        selectClasse.addEventListener('change', () => {
            localStorage.setItem('classe_selecionada', selectClasse.value);
            aplicarBonusSelecao('classe', selectClasse.value);
            atualizarEstadoEscolhaClasse(selectClasse.value);
            atualizarInfoPersonagem();
        });
        
        // Restaura seleção anterior se existir
        const classeSalva = localStorage.getItem('classe_selecionada');
        if (classeSalva) {
            selectClasse.value = classeSalva;
            aplicarBonusSelecao('classe', classeSalva);
            atualizarEstadoEscolhaClasse(classeSalva);
            atualizarInfoPersonagem();
        }
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
        // Adiciona event listener para aplicar bônus e salvar seleção
        selectRaca.addEventListener('change', () => {
            localStorage.setItem('raca_selecionada', selectRaca.value);
            aplicarBonusSelecao('raca', selectRaca.value);
            atualizarInfoPersonagem();
        });
        
        // Restaura seleção anterior se existir
        const racaSalva = localStorage.getItem('raca_selecionada');
        if (racaSalva) {
            selectRaca.value = racaSalva;
            aplicarBonusSelecao('raca', racaSalva);
            atualizarInfoPersonagem();
        }
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
        // Adiciona event listener para aplicar bônus e salvar seleção
        selectOrigem.addEventListener('change', () => {
            localStorage.setItem('origem_selecionada', selectOrigem.value);
            aplicarBonusSelecao('origem', selectOrigem.value);
            atualizarInfoPersonagem();

            // Para origens com bônus por escolha de perícias, abre o modal automaticamente
            // quando ainda não houver escolhas salvas para a origem selecionada.
            if (!selectOrigem.value) return;
            const origemSelecionada = DadosLoader.obterItemPorId('origens', selectOrigem.value);
            const escolherCount = origemSelecionada?.bonus?.escolher_pericias || 0;
            if (escolherCount > 0) {
                const escolhas = JSON.parse(localStorage.getItem('origem_escolhas') || '{}');
                const escolhidas = Array.isArray(escolhas[selectOrigem.value]) ? escolhas[selectOrigem.value] : [];
                if (escolhidas.length === 0) {
                    setTimeout(() => abrirModalEscolherPericias(selectOrigem.value, escolherCount), 0);
                }
            }
        });
        
        // Restaura seleção anterior se existir
        const origemSalva = localStorage.getItem('origem_selecionada');
        if (origemSalva) {
            selectOrigem.value = origemSalva;
            aplicarBonusSelecao('origem', origemSalva);
            atualizarInfoPersonagem();
        }
        
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

        // Botão para abrir modal de escolha de bônus de classe
        const btnClasseEscolha = document.getElementById('btn-escolher-classe-bonus');
        if (btnClasseEscolha && selectClasse) {
            btnClasseEscolha.addEventListener('click', () => {
                const classeId = selectClasse.value;
                if (!classeId) return;
                abrirModalEscolherPericiaClasse(classeId);
            });
        }
    }

    // Popula atributos na ficha
    popularAtributosFicha();
    
    // Popula perícias na ficha
    popularPericiasFicha();
    
    // Restaura bônus de bolsa do localStorage
    const bonusBolsaSalvo = localStorage.getItem('bonus_bolsa');
    if (bonusBolsaSalvo && document.getElementById('bonus-bolsa')) {
        document.getElementById('bonus-bolsa').value = bonusBolsaSalvo;
    }
    
    // Calcula estatísticas iniciais
    calcularEstatisticas();
    
    // Configura validação dos campos atuais
    configurarValidacaoEstatisticas();
    
    // Configura sincronização do nível (slider + input)
    configurarNivelSlider();
    
    // Inicializa estrutura de perícias
    inicializarPericias();
    
    // Inicializa sistema de inventário
    inicializarInventario();

    // Garante binding do botão de reset total mesmo se inline estiver desativado (suporta mobile)
    const btnResetTotal = document.getElementById('btn-reset-total');
    if (btnResetTotal) {
        const handler = (e) => {
            if (typeof limparFormularioCompleto === 'function') {
                limparFormularioCompleto();
            } else {
                console.error('Função limparFormularioCompleto não encontrada!');
            }
        };
        ['click','touchend','pointerup'].forEach(evt => btnResetTotal.addEventListener(evt, handler, { once: false }));
    } else {
        console.error('Botão btn-reset-total não encontrado!');
    }
    
    // Aplica bônus se já houver seleções (após um pequeno delay para garantir que os dados estão carregados)
    setTimeout(() => {
        aplicarBonusSelecoesExistentes();
        // Atualiza display de informações do personagem após carregar
        atualizarInfoPersonagem();
    }, 100);
}

/**
 * Atualiza os campos de exibição de informações do personagem
 */
function atualizarInfoPersonagem() {
    // Atualiza display de Raça
    const selectRaca = document.getElementById('raca');
    const displayRaca = document.getElementById('info-raca-display');
    if (selectRaca && displayRaca) {
        const racaId = selectRaca.value;
        if (racaId) {
            const raca = DadosLoader.obterItemPorId('racas', racaId);
            displayRaca.value = raca ? raca.nome : 'Raça';
            displayRaca.style.color = raca ? '#333' : '#666';
        } else {
            displayRaca.value = 'Raça';
            displayRaca.style.color = '#666';
        }
    }
    
    // Atualiza display de Classe
    const selectClasse = document.getElementById('classe');
    const displayClasse = document.getElementById('info-classe-display');
    if (selectClasse && displayClasse) {
        const classeId = selectClasse.value;
        if (classeId) {
            const classe = DadosLoader.obterItemPorId('classes', classeId);
            displayClasse.value = classe ? classe.nome : 'Classe';
            displayClasse.style.color = classe ? '#333' : '#666';
        } else {
            displayClasse.value = 'Classe';
            displayClasse.style.color = '#666';
        }
    }
    
    // Atualiza display de Origem
    const selectOrigem = document.getElementById('origem');
    const displayOrigem = document.getElementById('info-origem-display');
    if (selectOrigem && displayOrigem) {
        const origemId = selectOrigem.value;
        if (origemId) {
            const origem = DadosLoader.obterItemPorId('origens', origemId);
            displayOrigem.value = origem ? origem.nome : 'Origem';
            displayOrigem.style.color = origem ? '#333' : '#666';
        } else {
            displayOrigem.value = 'Origem';
            displayOrigem.style.color = '#666';
        }
    }
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
    resetarBonusesAutomaticosPericias();

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
 * Zera bônus automáticos (origem/classe/raça) para evitar acúmulo ao reaplicar seleções.
 * Mantém D6 e bônus do personagem intactos.
 */
function resetarBonusesAutomaticosPericias() {
    const pericias = obterTodasPericias();
    if (!pericias || typeof pericias !== 'object') return;

    Object.keys(pericias).forEach(periciaId => {
        if (!pericias[periciaId]) {
            pericias[periciaId] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
            return;
        }
        pericias[periciaId].bonus_origem = 0;
        pericias[periciaId].bonus_classe = 0;
        pericias[periciaId].bonus_raca = 0;
    });

    localStorage.setItem('pericias_estrutura', JSON.stringify(pericias));

    bonusAplicados.classe = null;
    bonusAplicados.raca = null;
    bonusAplicados.origem = null;
    bonusAplicados.classe_escolha = null;
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
                    <span style="padding:6px 8px; border-radius:6px; background:#fff3e0; color:#e65100; border:2px solid #ffb74d; ${dado===resultado? 'box-shadow:0 0 8px #ff8c00; font-weight:700; background:#ffe0b2; border-color:#ff8c00;': ''}">${dado}</span>
                `).join('')}
            </div>
        </div>
        <div style="margin-top:12px; font-size:18px;">
            <strong>Resultado Final: <span style="color:#ff6b35;">${resultado}</span></strong>
        </div>
    `;

    // Atualiza overlay (OBS) com último resultado de atributo
    try {
        localStorage.setItem('overlay_last_roll', JSON.stringify({
            tipo: 'atributo',
            titulo: nomeAtributo,
            resultado,
            dados: dadosRolados,
            ts: Date.now()
        }));
    } catch (e) { /* noop */ }

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
                           onchange="salvarDadoAdicionalPericia('${pericia.id}', 'd4', this.value)">
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
                           onchange="salvarDadoAdicionalPericia('${pericia.id}', 'd6', this.value)">
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
                           onchange="salvarDadoAdicionalPericia('${pericia.id}', 'd8', this.value)">
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
                           onchange="salvarDadoAdicionalPericia('${pericia.id}', 'd10', this.value)">
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
                           onchange="salvarD6Pericia('${pericia.id}', this.value)">
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

function salvarDadoAdicionalPericia(periciaId, tipoDado, valor) {
    const nivel = obterNivelAtual();
    const disponivel = obterDadosDisponiveisPorNivel(nivel);
    if (!disponivel[tipoDado]) {
        return;
    }

    const maximoValor = parseInt(tipoDado.substring(1)) || 0;
    const novoValor = Math.max(0, Math.min(maximoValor, parseInt(valor) || 0));
    const dadosAdicionais = obterDadosAdicionaisPericias();
    if (!dadosAdicionais[periciaId]) {
        dadosAdicionais[periciaId] = { d4: 0, d6: 0, d8: 0, d10: 0 };
    }

    const valorAnterior = parseInt(dadosAdicionais[periciaId][tipoDado]) || 0;
    if (valorAnterior <= 0 && novoValor > 0) {
        const periciasComDado = Object.entries(dadosAdicionais)
            .filter(([id, p]) => id !== periciaId && (parseInt(p[tipoDado]) || 0) > 0)
            .length;
        const maxDado = disponivel[tipoDado].max;
        if (periciasComDado >= maxDado) {
            const idCampo = tipoDado === 'd6' ? `pericia-d6-add-${periciaId}` : `pericia-${tipoDado}-${periciaId}`;
            const campoDado = document.getElementById(idCampo);
            if (campoDado) {
                campoDado.value = valorAnterior;
            }
            alert(`⚠️ Limite de ${maxDado} perícias com ${tipoDado.toUpperCase()} atingido!`);
            return;
        }
    }

    dadosAdicionais[periciaId][tipoDado] = novoValor;
    salvarDadosAdicionaisPericias(dadosAdicionais);

    const idCampo = tipoDado === 'd6' ? `pericia-d6-add-${periciaId}` : `pericia-${tipoDado}-${periciaId}`;
    const campoDado = document.getElementById(idCampo);
    if (campoDado) {
        campoDado.value = novoValor;
    }

    atualizarTotalPericia(periciaId);
    atualizarContadorDadosAdicionais();
    calcularEstatisticas();
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
    
    let limite = 10; // Valor base
    
    if (nivel >= 100) limite = 25;
    else if (nivel >= 95) limite = 23;
    else if (nivel >= 75) limite = 21;
    else if (nivel >= 55) limite = 19;
    else if (nivel >= 35) limite = 17;
    else if (nivel >= 15) limite = 15;
    else if (nivel >= 5) limite = 13;
    
    // Adiciona bônus da classe (Investigador e Tecnológico ganham +2)
    const bonusClasse = obterBonusClasse();
    limite += bonusClasse.periciasD6Extras;
    
    return limite;
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
 * Salva manualmente o valor de D6 de uma perícia
 */
function salvarD6Pericia(periciaId, valor) {
    const pericias = obterTodasPericias();
    const periciaData = pericias[periciaId] || { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
    const valorAnterior = parseInt(periciaData.d6) || 0;
    const novoValor = Math.max(0, Math.min(6, parseInt(valor) || 0));

    if (valorAnterior <= 0 && novoValor > 0) {
        const periciasComD6 = Object.entries(pericias)
            .filter(([id, p]) => id !== periciaId && (parseInt(p.d6) || 0) > 0)
            .length;
        const limiteD6 = calcularLimiteD6(obterNivelAtual());
        if (periciasComD6 >= limiteD6) {
            const campoD6 = document.getElementById(`pericia-d6-${periciaId}`);
            if (campoD6) {
                campoD6.value = valorAnterior;
            }
            alert(`⚠️ Limite de ${limiteD6} perícias com D6 atingido!`);
            return;
        }
    }

    periciaData.d6 = novoValor;
    pericias[periciaId] = periciaData;
    localStorage.setItem('pericias_estrutura', JSON.stringify(pericias));

    const campoD6 = document.getElementById(`pericia-d6-${periciaId}`);
    if (campoD6) {
        campoD6.value = novoValor;
    }

    atualizarTotalPericia(periciaId);
    atualizarContadorD6();
    calcularEstatisticas();
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
    // Salva o bônus manual do personagem na perícia
    const saved = localStorage.getItem('pericias_estrutura');
    const dados = saved ? JSON.parse(saved) : {};
    if (!dados[id]) {
        dados[id] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
    }
    dados[id].bonus_personagem = Math.max(-5, Math.min(5, parseInt(valor) || 0));
    localStorage.setItem('pericias_estrutura', JSON.stringify(dados));

    const campoPersonagem = document.getElementById(`pericia-personagem-${id}`);
    if (campoPersonagem) {
        campoPersonagem.value = dados[id].bonus_personagem;
    }

    // Atualiza total na interface
    atualizarTotalPericia(id);

    // Recalcula estatísticas quando perícias mudam
    calcularEstatisticas();
}

// Flag para controlar se é a primeira vez calculando estatísticas
let primeiraVezCalculandoEstatisticas = true;

/**
 * Obtém os bônus da classe selecionada
 * @returns {Object} Objeto com os bônus: { vida, mana, defesa, sanidade, periciasD6Extras }
 */
function obterBonusClasse() {
    const classeSelect = document.getElementById('classe');
    if (!classeSelect || !classeSelect.value) {
        console.log('obterBonusClasse: Nenhuma classe selecionada');
        return { vida: 0, mana: 0, defesa: 0, sanidade: 0, periciasD6Extras: 0 };
    }
    
    const classeId = classeSelect.value;
    console.log('obterBonusClasse: Classe selecionada:', classeId);
    
    // Obtém os dados da classe do DadosLoader
    const classeData = DadosLoader.obterItemPorId('classes', classeId);
    console.log('obterBonusClasse: Dados da classe:', classeData);
    
    if (classeData && classeData.bonus) {
        const bonus = classeData.bonus;
        const resultado = {
            vida: bonus.vida || 0,
            mana: bonus.mana || 0,
            defesa: bonus.defesa || 0,
            sanidade: bonus.sanidade || 0,
            periciasD6Extras: bonus.periciasD6Extras || 0
        };
        console.log('obterBonusClasse: Bônus encontrados:', resultado);
        return resultado;
    }
    
    console.log('obterBonusClasse: Nenhum bônus encontrado');
    return { vida: 0, mana: 0, defesa: 0, sanidade: 0, periciasD6Extras: 0 };
}

/**
 * Calcula todas as estatísticas automaticamente (nível 0%)
 */
function calcularEstatisticas() {
    // Obtém valores dos atributos (nível 0%)
    const atributos = obterTodosAtributos();
    
    // Obtém valores das perícias (nível 0%)
    const pericias = obterTodasPericias();
    
    // Obtém bônus da classe
    const bonusClasse = obterBonusClasse();
    
    console.log('Bônus de classe aplicados:', bonusClasse);
    
    // Calcula Vida Total: Resiliência × 3 + 10 + Bônus de Classe + progressão por nível da classe
    let vidaTotal = (atributos.resiliencia || 0) * 3 + 10 + bonusClasse.vida;
    let manaTotal = (atributos.magia || 0) * 5 + 15 + bonusClasse.mana;
    let sanidadeTotal = (atributos.intelecto || 0) * 5 + (atributos.carisma || 0) * 3 + 10 + bonusClasse.sanidade;

    // Progressão a cada 5% por classe
    const nivelAtual = obterNivelAtual();
    const steps = Math.floor((parseInt(nivelAtual) || 0) / 5);
    const selectClasse = document.getElementById('classe');
    const classeIdAtual = selectClasse && selectClasse.value ? selectClasse.value : null;
    const prog = classeIdAtual ? (window.CLASSE_PROGRESSO?.[classeIdAtual] || null) : null;
    if (prog && steps > 0) {
        const get = (attr) => parseInt(atributos[attr]) || 0;
        vidaTotal += steps * (get(prog.vida.attr) * prog.vida.mult);
        sanidadeTotal += steps * (get(prog.sanidade.attr) * prog.sanidade.mult);
    }
    atualizarCampoEstatisticaComAjuste('vida-total', 'vida-atual', Math.max(1, vidaTotal), primeiraVezCalculandoEstatisticas);
    atualizarCampoEstatisticaComAjuste('mana-total', 'mana-atual', Math.max(0, manaTotal), primeiraVezCalculandoEstatisticas);
    atualizarCampoEstatisticaComAjuste('sanidade-total', 'sanidade-atual', Math.max(0, sanidadeTotal), primeiraVezCalculandoEstatisticas);
    try { if (typeof pushOverlayState === 'function') pushOverlayState(); } catch (e) {}
    
    // Calcula Alma Total: Magia × 5 + Resiliência × 3 + Intelecto × 2 + 15 + bônus de raça + efeitos de classe
    let bonusAlma = 0;
    let almaZerada = false; // Flag para saber se alma foi zerada pela raça
    
    if (bonusAplicados.raca && bonusAplicados.raca.alma !== undefined) {
        bonusAlma = bonusAplicados.raca.alma;
        // Apenas a raça 'demonio' deve zerar completamente a alma quando definida como 0
        if (bonusAplicados.raca.alma === 0 && selecionadosIds.raca === 'demonio') {
            almaZerada = true;
        }
    }
    
    // Penalidade de classe: Demonologista tira 3 pontos de Alma
    let bonusAlmaClasse = 0;
    try {
        const classeSel = document.getElementById('classe');
        const classeIdSel = classeSel && classeSel.value ? classeSel.value : null;
        if (classeIdSel === 'demonologista') {
            bonusAlmaClasse -= 3;
        }
    } catch (e) {}

    let almaTotal;
    if (almaZerada) {
        almaTotal = 0; // Se alma for zerada pela raça, fica 0
    } else {
        almaTotal = (atributos.magia || 0) * 5 + (atributos.resiliencia || 0) * 3 + (atributos.intelecto || 0) * 2 + 15 + bonusAlma + bonusAlmaClasse;
    }
    
    const campoAlmaTotal = document.getElementById('alma-total');
    const campoAlmaAtual = document.getElementById('alma-atual');
    if (campoAlmaTotal) {
        campoAlmaTotal.value = Math.max(0, almaTotal);
    }
    if (campoAlmaAtual) {
        campoAlmaAtual.value = Math.max(0, almaTotal);
    }
    
    // Calcula Defesa: Constituição + 10 + Bônus de Classe
    const defesa = (atributos.constituicao || 0) + 10 + bonusClasse.defesa;
    atualizarCampoEstatistica('defesa', Math.max(0, defesa));
    
    // Calcula Esquiva: Defesa + Perícia Reflexos + Destreza
    // Usa o total completo de Reflexos, incluindo dados adicionais disponíveis no nível.
    let reflexos = 0;
    const reflexosData = pericias['reflexos'];
    if (reflexosData) {
        reflexos = (parseInt(reflexosData.d6) || 0)
            + (parseInt(reflexosData.bonus_personagem) || 0)
            + (parseInt(reflexosData.bonus_origem) || 0)
            + (parseInt(reflexosData.bonus_classe) || 0)
            + (parseInt(reflexosData.bonus_raca) || 0);

        try {
            const dadosAdicionais = obterDadosAdicionaisPericias();
            const reflexosAdicionais = dadosAdicionais['reflexos'] || { d4: 0, d6: 0, d8: 0, d10: 0 };
            const disponivel = obterDadosDisponiveisPorNivel(obterNivelAtual());
            if (disponivel.d4) reflexos += (parseInt(reflexosAdicionais.d4) || 0);
            if (disponivel.d6) reflexos += (parseInt(reflexosAdicionais.d6) || 0);
            if (disponivel.d8) reflexos += (parseInt(reflexosAdicionais.d8) || 0);
            if (disponivel.d10) reflexos += (parseInt(reflexosAdicionais.d10) || 0);
        } catch (e) {
            // Se algo falhar ao ler dados adicionais, mantém cálculo com base principal da perícia.
        }
    }
    const destreza = atributos.destreza || 0;
    const esquiva = defesa + reflexos + destreza;
    atualizarCampoEstatistica('esquiva', Math.max(0, esquiva));
    
    // Calcula Bloqueio: Constituição × 2 + Metade da Fortitude (arredondado para cima)
    // Usa o total completo da perícia Fortitude, incluindo dados adicionais disponíveis no nível.
    let fortitude = 0;
    const fortData = pericias['fortitude'];
    if (fortData) {
        fortitude = (parseInt(fortData.d6) || 0)
            + (parseInt(fortData.bonus_personagem) || 0)
            + (parseInt(fortData.bonus_origem) || 0)
            + (parseInt(fortData.bonus_classe) || 0)
            + (parseInt(fortData.bonus_raca) || 0);

        try {
            const dadosAdicionais = obterDadosAdicionaisPericias();
            const fortAdicionais = dadosAdicionais['fortitude'] || { d4: 0, d6: 0, d8: 0, d10: 0 };
            const disponivel = obterDadosDisponiveisPorNivel(obterNivelAtual());
            if (disponivel.d4) fortitude += (parseInt(fortAdicionais.d4) || 0);
            if (disponivel.d6) fortitude += (parseInt(fortAdicionais.d6) || 0);
            if (disponivel.d8) fortitude += (parseInt(fortAdicionais.d8) || 0);
            if (disponivel.d10) fortitude += (parseInt(fortAdicionais.d10) || 0);
        } catch (e) {
            // Se algo falhar ao ler dados adicionais, mantém cálculo com base principal da perícia.
        }
    }
    const metadeFortitude = Math.ceil(fortitude / 2);
    const bloqueio = (atributos.constituicao || 0) * 2 + metadeFortitude;
    atualizarCampoEstatistica('bloqueio', Math.max(0, bloqueio));
    
    // Calcula Inventário: Força × 2 + 3 + Bônus de Bolsa
    const forca = atributos.forca || 0;
    const bonusBolsaInput = document.getElementById('bonus-bolsa');
    const bonusBolsa = bonusBolsaInput ? (parseInt(bonusBolsaInput.value) || 0) : 0;
    const inventario = forca * 2 + 3 + bonusBolsa;
    atualizarCampoEstatistica('inventario', Math.max(0, inventario));
    
    // Atualiza display do inventário
    if (typeof atualizarDisplayInventario === 'function') {
        atualizarDisplayInventario();
    }
    if (typeof atualizarDisplayInventarioModal === 'function') {
        atualizarDisplayInventarioModal();
    }
    
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
            // Sempre sincroniza o campo atual com o total durante os recálculos.
            // O usuário ainda pode editar manualmente o campo atual depois.
            campoAtual.value = valorTotal;
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
    // Se classe, também remove a escolha anterior de classe
    if (tipo === 'classe') {
        removerBonus('classe_escolha');
    }
    
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
    
    // Se for classe e houver opções de bônus, aplica escolha salva (ou habilita botão)
    if (tipo === 'classe') {
        atualizarEstadoEscolhaClasse(id);
        const conf = window.CLASSE_ESCOLHAS?.[id];
        if (conf) {
            // aplica escolha salva automaticamente se existir
            const todas = JSON.parse(localStorage.getItem('classe_escolha') || '{}');
            const escolhida = todas[id];
            if (escolhida && conf.ids.includes(escolhida)) {
                const bonus = { pericias: {} };
                bonus.pericias[escolhida] = conf.bonus;
                aplicarBonusCompleto(bonus, 'classe_escolha');
            } else {
                // força escolha do usuário
                abrirModalEscolherPericiaClasse(id);
            }
        }
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
        'origem': 'bonus_origem',
        'classe_escolha': 'bonus_classe'
    };
    const campoBonusChave = mapaTipo[tipo];
    const tipoCampoInput = tipo === 'classe_escolha' ? 'classe' : tipo;
    
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
                
                // Permite valores de bônus de classe configurados acima de +5 (ex.: +7)
                const valorLimitado = Math.max(-10, Math.min(10, novoValor));
                pericias[periciaId][campoBonusChave] = valorLimitado;
                
                // Atualiza na interface
                const campoInput = document.getElementById(`pericia-${tipoCampoInput}-${periciaId}`);
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
                
                // Permite valores de bônus de classe configurados acima de +5 (ex.: +7)
                const valorLimitado = Math.max(-10, Math.min(10, novoValor));
                pericias[periciaId][campoBonusChave] = valorLimitado;
                
                // Atualiza na interface
                const campoInput = document.getElementById(`pericia-${tipoCampoInput}-${periciaId}`);
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
 * Atualiza estado do botão/hint da escolha de classe
 */
function atualizarEstadoEscolhaClasse(classeId) {
    const btn = document.getElementById('btn-escolher-classe-bonus');
    const hint = document.getElementById('classe-escolha-hint');
    if (!btn || !hint) return;
    const conf = window.CLASSE_ESCOLHAS?.[classeId];
    if (!classeId || !conf) {
        btn.disabled = true;
        btn.style.display = 'none';
        hint.textContent = '';
        return;
    }
    btn.disabled = false;
    btn.style.display = 'inline-block';
    const escolhasAll = JSON.parse(localStorage.getItem('classe_escolha') || '{}');
    const escolhido = escolhasAll[classeId];
    if (escolhido) {
        // encontra nome
        let nome = escolhido;
        if (window.Pericias?.PERICIAS) {
            const lista = Object.values(window.Pericias.PERICIAS).flat();
            const p = lista.find(x => x.id === escolhido);
            if (p) nome = p.nome;
        }
        hint.textContent = `Bônus de classe aplicado: ${nome} +${conf.bonus}`;
    } else {
        hint.textContent = 'Você ainda não escolheu o bônus de classe.';
    }
}

/**
 * Abre modal para escolher a perícia de bônus da classe (1 escolha)
 */
function abrirModalEscolherPericiaClasse(classeId) {
    const modal = document.getElementById('modal-escolher-pericias');
    const list = document.getElementById('modal-escolher-list');
    const title = document.getElementById('modal-escolher-title');
    const desc = document.getElementById('modal-escolher-desc');
    const search = document.getElementById('modal-escolher-search');
    const conf = window.CLASSE_ESCOLHAS?.[classeId];
    if (!modal || !list || !conf) return;

    const maxEscolhas = 1;
    title.textContent = `Escolher 1 perícia para bônus da classe (+${conf.bonus})`;
    desc.textContent = 'Escolha exatamente 1 opção.';

    // Monta a lista limitada às opções
    const periciasObj = window.Pericias?.PERICIAS || {};
    const todas = Object.values(periciasObj).flat();
    const opcoes = todas.filter(p => conf.ids.includes(p.id));

    // Carrega escolha anterior
    const escolhasAll = JSON.parse(localStorage.getItem('classe_escolha') || '{}');
    const escolhasAtuais = [];
    if (escolhasAll[classeId]) escolhasAtuais.push(escolhasAll[classeId]);

    function renderList(filter='') {
        list.innerHTML = '';
        const filtro = filter.trim().toLowerCase();
        opcoes.forEach(p => {
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
            cb.disabled = (!checked && escolhasAtuais.length >= maxEscolhas);
            cb.onchange = () => {
                if (cb.checked) {
                    if (escolhasAtuais.length >= maxEscolhas) {
                        cb.checked = false;
                        showMessage(`Você só pode escolher ${maxEscolhas} perícia.`, 'error');
                        return;
                    }
                    escolhasAtuais.splice(0, escolhasAtuais.length, p.id);
                } else {
                    const idx = escolhasAtuais.indexOf(p.id);
                    if (idx !== -1) escolhasAtuais.splice(idx, 1);
                }
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
    search.value = '';
    search.oninput = () => renderList(search.value);
    modal.style.display = 'flex';

    const close = document.getElementById('modal-escolher-close');
    const cancel = document.getElementById('modal-escolher-cancel');
    const confirm = document.getElementById('modal-escolher-confirm');

    function fechar() {
        modal.style.display = 'none';
        close.removeEventListener('click', fechar);
        cancel.removeEventListener('click', fechar);
        confirm.removeEventListener('click', onConfirm);
    }

    function onConfirm() {
        if (escolhasAtuais.length !== 1) {
            showMessage('Escolha 1 perícia.', 'error');
            return;
        }
        const escolhida = escolhasAtuais[0];
        // Remove bônus anterior específico de escolha de classe
        removerBonus('classe_escolha');
        // Aplica novo bônus de classe na perícia escolhida
        const bonus = { pericias: { } };
        bonus.pericias[escolhida] = conf.bonus;
        aplicarBonusCompleto(bonus, 'classe_escolha');
        // Salva escolha
        const todas = JSON.parse(localStorage.getItem('classe_escolha') || '{}');
        todas[classeId] = escolhida;
        localStorage.setItem('classe_escolha', JSON.stringify(todas));
        atualizarEstadoEscolhaClasse(classeId);
        popularPericiasFicha();
        calcularEstatisticas();
        fechar();
    }

    close.addEventListener('click', fechar);
    cancel.addEventListener('click', fechar);
    confirm.addEventListener('click', onConfirm);
}

/**
 * Atualiza o estado do botão/hint de escolha para a origem atual
 */
function atualizarEstadoEscolhaOrigem(origemId) {
    const btn = document.getElementById('btn-escolher-origem-pericias');
    const hint = document.getElementById('origem-escolha-hint');
    if (!origemId) {
        if (btn) {
            btn.disabled = true;
            btn.style.display = 'none';
        }
        if (hint) hint.textContent = '';
        return;
    }
    const item = DadosLoader.obterItemPorId('origens', origemId);
    const escolherCount = item?.bonus?.escolher_pericias || 0;
    if (escolherCount && escolherCount > 0) {
        if (btn) {
            btn.disabled = false;
            btn.style.display = 'inline-block';
        }
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
        if (btn) {
            btn.disabled = true;
            btn.style.display = 'none';
        }
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
        'origem': 'bonus_origem',
        'classe_escolha': 'bonus_classe'
    };
    const campoBonusChave = mapaTipo[tipo];
    const tipoCampoInput = tipo === 'classe_escolha' ? 'classe' : tipo;
    
    if (!campoBonusChave) return;
    
    // Remove bônus de perícias
    if (bonus.pericias && typeof bonus.pericias === 'object') {
        Object.keys(bonus.pericias).forEach(periciaId => {
            const bonusValor = bonus.pericias[periciaId];
            if (typeof bonusValor === 'number') {
                if (!pericias[periciaId]) {
                    pericias[periciaId] = { d6: 0, bonus_personagem: 0, bonus_origem: 0, bonus_classe: 0, bonus_raca: 0 };
                }
                
                // Remove o bônus do campo específico, sem ultrapassar 0 (evita negativos por descompasso de estado)
                const valorAtual = pericias[periciaId][campoBonusChave] || 0;
                let novoValor = valorAtual - bonusValor;
                if (bonusValor > 0) {
                    // Removendo bônus positivo: não pode passar abaixo de 0
                    novoValor = Math.max(0, novoValor);
                } else if (bonusValor < 0) {
                    // Removendo penalidade (valor negativo): não pode passar acima de 0
                    novoValor = Math.min(0, novoValor);
                }
                
                // Permite reverter corretamente bônus aplicados acima de +5
                const valorLimitado = Math.max(-10, Math.min(10, novoValor));
                pericias[periciaId][campoBonusChave] = valorLimitado;
                
                // Atualiza na interface
                const campoInput = document.getElementById(`pericia-${tipoCampoInput}-${periciaId}`);
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
                
                // Remove a penalidade (bonusValor costuma ser negativo). Evita ultrapassar 0.
                const valorAtual = pericias[periciaId][campoBonusChave] || 0;
                let novoValor = valorAtual - bonusValor;
                if (bonusValor > 0) {
                    novoValor = Math.max(0, novoValor);
                } else if (bonusValor < 0) {
                    novoValor = Math.min(0, novoValor);
                }
                
                // Permite reverter corretamente bônus aplicados acima de +5
                const valorLimitado = Math.max(-10, Math.min(10, novoValor));
                pericias[periciaId][campoBonusChave] = valorLimitado;
                
                // Atualiza na interface
                const campoInput = document.getElementById(`pericia-${tipoCampoInput}-${periciaId}`);
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

            // Recalcula estatísticas (progressão por classe a cada 5%)
            calcularEstatisticas();
            
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

            // Recalcula estatísticas (progressão por classe a cada 5%)
            calcularEstatisticas();
            
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
    
    // Listener para bônus de bolsa recalcular inventário
    const bonusBolsaInput = document.getElementById('bonus-bolsa');
    if (bonusBolsaInput) {
        bonusBolsaInput.addEventListener('change', () => {
            localStorage.setItem('bonus_bolsa', bonusBolsaInput.value);
            calcularEstatisticas();
        });
    }
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
                    <span style="padding:6px 8px; border-radius:6px; background:#fff3e0; color:#e65100; border:2px solid #ffb74d; ${dado===resultadoPool? 'box-shadow:0 0 8px #ff8c00; font-weight:700; background:#ffe0b2; border-color:#ff8c00;': ''}">${dado}</span>
                `).join('')}
            </div>
        </div>
        <div style="margin-top:12px; font-size:18px;">
            <strong>Resultado do Pool: <span style="color:#ff6b35;">${resultadoPool}</span></strong>
            <div>Resultado Final (pool + perícia): <strong>${resultadoFinal >= 0 ? `+${resultadoFinal}` : resultadoFinal}</strong></div>
        </div>
    `;
    // Atualiza overlay (OBS) com último resultado de perícia
    try {
        localStorage.setItem('overlay_last_roll', JSON.stringify({
            tipo: 'pericia',
            titulo: `${nomePericia}`,
            resultado: resultadoFinal,
            dados: dadosRolados,
            ts: Date.now()
        }));
    } catch (e) { /* noop */ }

    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';
    
    btnFechar.onclick = () => { 
        modal.style.display = 'none'; 
        btnFechar.onclick = null; 
    };
}

// ===== Overlay (OBS) Bindings =====
function pushOverlayState() {
    try {
        const nome = document.getElementById('nome');
        const vidaA = document.getElementById('vida-atual');
        const vidaT = document.getElementById('vida-total');
        const sanA = document.getElementById('sanidade-atual');
        const sanT = document.getElementById('sanidade-total');
        const manaA = document.getElementById('mana-atual');
        const manaT = document.getElementById('mana-total');
        
        // Salva cada campo individualmente para o overlay ler
        if (nome) localStorage.setItem('overlay_nome', nome.value || '');
        if (vidaA) localStorage.setItem('vida-atual', vidaA.value || '0');
        if (vidaT) localStorage.setItem('vida-total', vidaT.value || '0');
        if (sanA) localStorage.setItem('sanidade-atual', sanA.value || '0');
        if (sanT) localStorage.setItem('sanidade-total', sanT.value || '0');
        if (manaA) localStorage.setItem('mana-atual', manaA.value || '0');
        if (manaT) localStorage.setItem('mana-total', manaT.value || '0');
    } catch (e) {}
}

function setupOverlayBindings() {
    const nome = document.getElementById('nome');
    const vidaA = document.getElementById('vida-atual');
    const vidaT = document.getElementById('vida-total');
    const sanA = document.getElementById('sanidade-atual');
    const sanT = document.getElementById('sanidade-total');
    const manaA = document.getElementById('mana-atual');
    const manaT = document.getElementById('mana-total');
    [nome, vidaA, vidaT, sanA, sanT, manaA, manaT].forEach(el => {
        if (!el) return;
        el.addEventListener('input', pushOverlayState);
        el.addEventListener('change', pushOverlayState);
    });
    pushOverlayState();
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

/**
 * Limpa TODO o formulário/ficha: atributos, perícias, seleções, nível, inventário e estatísticas.
 * Reseta também todas as chaves relevantes do localStorage.
 */
function limparFormularioCompleto() {
    // Usa modal customizado ao invés de confirm() nativo (pode ser bloqueado no Cordova)
    const modal = document.getElementById('modal-confirmar-limpar');
    const btnConfirmar = document.getElementById('modal-limpar-confirmar');
    const btnCancelar = document.getElementById('modal-limpar-cancelar');
    
    if (!modal || !btnConfirmar || !btnCancelar) {
        console.error('Modal de confirmação não encontrado!');
        showMessage('Erro: Modal de confirmação não disponível.', 'error');
        return;
    }
    
    // Mostra o modal
    modal.style.display = 'flex';
    modal.style.alignItems = 'center';
    modal.style.justifyContent = 'center';

    // Handlers auxiliares (overlay + ESC)
    const escHandler = (e) => { if (e.key === 'Escape') { cancelarHandler(); } };
    const overlayClickHandler = (e) => { if (e.target === modal) { cancelarHandler(); } };
    document.addEventListener('keydown', escHandler);
    modal.addEventListener('click', overlayClickHandler);
    
    // Handler para confirmar
    const confirmarHandler = () => {
        modal.style.display = 'none';
        btnConfirmar.removeEventListener('click', confirmarHandler);
        btnCancelar.removeEventListener('click', cancelarHandler);
        document.removeEventListener('keydown', escHandler);
        modal.removeEventListener('click', overlayClickHandler);
        executarLimpezaTotal();
    };
    
    // Handler para cancelar
    const cancelarHandler = () => {
        modal.style.display = 'none';
        btnConfirmar.removeEventListener('click', confirmarHandler);
        btnCancelar.removeEventListener('click', cancelarHandler);
        document.removeEventListener('keydown', escHandler);
        modal.removeEventListener('click', overlayClickHandler);
        showMessage('Ação cancelada. Nada foi alterado.', 'info');
    };
    
    btnConfirmar.addEventListener('click', confirmarHandler);
    btnCancelar.addEventListener('click', cancelarHandler);
}

/**
 * Executa a limpeza total da ficha
 */
function executarLimpezaTotal() {

    // Limpa seleções (classe/raça/origem) e escolhas
    removerBonus('classe');
    removerBonus('raca');
    removerBonus('origem');
    removerBonus('classe_escolha');

    // Remove chaves de ficha e configurações
    const chaves = [
        'classe_selecionada', 'raca_selecionada', 'origem_selecionada',
        'origem_escolhas', 'classe_escolha', 'nivelFichaAtual', 'atributos_personagem',
        'pericias_estrutura', 'pericias_dados_adicionais', 'bonus_bolsa',
        'rpg_fichas', 'fichas', 'inventario_itens'
    ];
    chaves.forEach(k => localStorage.removeItem(k));

    // Reseta nível
    window.nivelFichaAtual = 0;
    const nivelInput = document.getElementById('nivel');
    const nivelSlider = document.getElementById('nivel-slider');
    if (nivelInput) {
        nivelInput.value = 0;
        try { nivelInput.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    }
    if (nivelSlider) {
        nivelSlider.value = 0;
        try { nivelSlider.dispatchEvent(new Event('input', { bubbles: true })); } catch (e) {}
    }

    // Limpa inventário
    if (typeof inventarioAtual !== 'undefined') {
        inventarioAtual = [];
    }

    // Limpa UI de selects
    const selectClasse = document.getElementById('classe');
    const selectRaca = document.getElementById('raca');
    const selectOrigem = document.getElementById('origem');
    
    if (selectClasse) { 
        selectClasse.value = ''; 
        if (selectClasse.options && selectClasse.options.length) selectClasse.selectedIndex = 0; 
        try { selectClasse.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    }
    if (selectRaca) { 
        selectRaca.value = ''; 
        if (selectRaca.options && selectRaca.options.length) selectRaca.selectedIndex = 0; 
        try { selectRaca.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    }
    if (selectOrigem) { 
        selectOrigem.value = ''; 
        if (selectOrigem.options && selectOrigem.options.length) selectOrigem.selectedIndex = 0; 
        try { selectOrigem.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    }

    // Atualiza estado de botões/hints de escolha
    if (typeof atualizarEstadoEscolhaClasse === 'function') atualizarEstadoEscolhaClasse(null);
    if (typeof atualizarEstadoEscolhaOrigem === 'function') atualizarEstadoEscolhaOrigem(null);

    // Atualiza display de informações do personagem
    if (typeof atualizarInfoPersonagem === 'function') atualizarInfoPersonagem();

    // Limpa atributos/perícias recriando estrutura base
    popularAtributosFicha();
    popularPericiasFicha();

    // Reinicia estatísticas (marca como primeira vez para copiar total em atual)
    primeiraVezCalculandoEstatisticas = true;
    calcularEstatisticas();

    // Atualiza inventário visual se funções existirem
    if (typeof atualizarListaInventario === 'function') atualizarListaInventario();
    if (typeof atualizarDisplayInventario === 'function') atualizarDisplayInventario();
    if (typeof atualizarDisplayInventarioModal === 'function') atualizarDisplayInventarioModal();

    // Limpa memória de bônus aplicados
    if (typeof bonusAplicados !== 'undefined') {
        bonusAplicados = { classe: null, raca: null, origem: null };
    }
    // Limpa ids selecionados em memória
    if (typeof selecionadosIds !== 'undefined') {
        selecionadosIds = { classe: null, raca: null, origem: null };
    }

    showMessage('Ficha completamente limpa e reiniciada.', 'success');
}

window.limparFormularioCompleto = limparFormularioCompleto;

window.testarAtributoFicha = testarAtributoFicha;
window.alterarAtributoFicha = alterarAtributoFicha;
window.salvarAtributoFicha = salvarAtributoFicha;
window.popularAtributosFicha = popularAtributosFicha;
window.popularPericiasFicha = popularPericiasFicha;
window.alterarPericiaFicha = alterarPericiaFicha;
window.salvarPericiaFicha = salvarPericiaFicha;
window.salvarD6Pericia = salvarD6Pericia;
window.salvarDadoAdicionalPericia = salvarDadoAdicionalPericia;
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
// Delegação global como fallback: garante funcionamento do botão "Apagar Tudo" mesmo se o binding direto falhar
document.addEventListener('click', (ev) => {
    const btn = ev.target && (ev.target.id === 'btn-reset-total' ? ev.target : ev.target.closest ? ev.target.closest('#btn-reset-total') : null);
    if (btn) {
        ev.preventDefault();
        ev.stopPropagation();
        try {
            if (typeof limparFormularioCompleto === 'function') {
                // console.debug('[Reset] Clique em Apagar Tudo'); // opcional
                limparFormularioCompleto();
            }
        } catch (e) {
            console.error('Erro ao executar limparFormularioCompleto:', e);
        }
    }
});

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
                inventario: parseInt(formData.get('inventario')) || 0,
                bonusBolsa: parseInt(formData.get('bonus-bolsa')) || 0,
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

// =============================================================================
// SISTEMA DE INVENTÁRIO
// =============================================================================

/**
 * Estrutura de item do inventário:
 * {
 *   id: string (timestamp único),
 *   nome: string,
 *   categoria: 'armas' | 'itens-comuns' | 'itens-raca' | 'itens-classe' | 'itens-origem',
 *   peso: number,
 *   funcao: string
 * }
 */

let inventarioAtual = [];
let itemEditandoId = null;
let categoriaFiltroAtual = 'todos';

function ehItemManual(item) {
    if (!item) return false;
    if (item.fonte === 'manual') return true;
    if (item.fonte === 'catalogo') return false;
    // Compatibilidade com itens antigos: IDs numéricos eram criados manualmente.
    return /^\d+$/.test(String(item.id || ''));
}

function renderizarItensManuaisPagina() {
    const container = document.getElementById('itens-manuais-page');
    if (!container) return;

    const manuais = inventarioAtual.filter(ehItemManual);
    if (!manuais.length) {
        container.innerHTML = '<p style="text-align:center; color:#999; padding:8px;">Nenhum item manual cadastrado ainda.</p>';
        return;
    }

    const ordemCategorias = [
        { key: 'armas', nome: '⚔️ Armas' },
        { key: 'itens-comuns', nome: '🔧 Itens Comuns' },
        { key: 'itens-raca', nome: '👥 Itens de Raça' },
        { key: 'itens-classe', nome: '⚔️ Itens de Classe' },
        { key: 'itens-origem', nome: '🌍 Itens de Origem' }
    ];

    const html = ordemCategorias.map(categoriaInfo => {
        const itensCategoria = manuais.filter(item => item.categoria === categoriaInfo.key);
        const lista = itensCategoria.length
            ? itensCategoria.map(item => `
                <div style="border:1px solid #e0e0e0; border-radius:8px; padding:10px; background:#fff; display:flex; gap:10px; align-items:start;">
                    <div style="flex:1;">
                        <div style="font-weight:bold;">${item.nome}</div>
                        <div style="font-size:12px; color:#666;">Peso: ${item.peso}</div>
                        ${item.funcao ? `<div style="font-size:12px; color:#444; margin-top:4px;">${item.funcao}</div>` : ''}
                    </div>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        <button type="button" onclick="window.abrirModalItem('${String(item.id).replace(/'/g, "\\'")}')" class="btn" style="padding:4px 8px; font-size:12px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer;">✏️</button>
                        <button type="button" onclick="window.removerItem('${String(item.id).replace(/'/g, "\\'")}')" class="btn" style="padding:4px 8px; font-size:12px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer;">🗑️</button>
                    </div>
                </div>
            `).join('')
            : '<p style="margin:0; color:#888; font-size:13px;">Sem itens manuais nesta categoria.</p>';

        return `
            <div style="border:1px solid #ddd; border-radius:8px; overflow:hidden;">
                <div style="background:#f7f7f7; padding:8px 12px; font-weight:bold;">${categoriaInfo.nome} (${itensCategoria.length})</div>
                <div style="padding:10px; display:grid; gap:8px;">${lista}</div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

/**
 * Inicializa o sistema de inventário
 */
function inicializarInventario() {
    // Carrega inventário do localStorage
    const inventarioSalvo = localStorage.getItem('inventario_itens');
    if (inventarioSalvo) {
        try {
            inventarioAtual = JSON.parse(inventarioSalvo);
        } catch (e) {
            console.error('Erro ao carregar inventário:', e);
            inventarioAtual = [];
        }
    }
    
    // Configura event listeners dos modais
    const modalInventario = document.getElementById('modal-inventario');
    const modalInventarioClose = document.getElementById('modal-inventario-close');
    const modalInventarioFechar = document.getElementById('modal-inventario-fechar');
    const modalItem = document.getElementById('modal-item');
    const modalItemClose = document.getElementById('modal-item-close');
    const modalItemCancelar = document.getElementById('modal-item-cancelar');
    const modalItemSalvar = document.getElementById('modal-item-salvar');
    const btnAdicionarItem = document.getElementById('btn-adicionar-item');
    const btnAdicionarItemPage = document.getElementById('btn-adicionar-item-page');
    
    // Fechar modal de inventário
    if (modalInventarioClose) {
        modalInventarioClose.addEventListener('click', fecharModalInventario);
    }
    if (modalInventarioFechar) {
        modalInventarioFechar.addEventListener('click', fecharModalInventario);
    }
    
    // Fechar modal de item
    if (modalItemClose) {
        modalItemClose.addEventListener('click', fecharModalItem);
    }
    if (modalItemCancelar) {
        modalItemCancelar.addEventListener('click', fecharModalItem);
    }
    
    // Salvar item
    if (modalItemSalvar) {
        modalItemSalvar.addEventListener('click', salvarItem);
    }
    
    // Adicionar novo item
    if (btnAdicionarItem) {
        btnAdicionarItem.addEventListener('click', () => abrirModalItem());
    }
    if (btnAdicionarItemPage) {
        btnAdicionarItemPage.addEventListener('click', () => abrirModalItem());
    }
    
    // Configurar abas de categoria
    const tabs = document.querySelectorAll('.inventario-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const categoria = tab.getAttribute('data-categoria');
            filtrarPorCategoria(categoria);
        });
    });
    
    // Sincronizar campo de bônus de bolsa no modal
    const modalBonusBolsa = document.getElementById('modal-bonus-bolsa');
    if (modalBonusBolsa) {
        // Carrega valor atual
        const bonusBolsaAtual = localStorage.getItem('bonus_bolsa') || '0';
        modalBonusBolsa.value = bonusBolsaAtual;
        
        // Sincroniza ao mudar
        modalBonusBolsa.addEventListener('change', () => {
            const valor = modalBonusBolsa.value;
            const bonusBolsaHidden = document.getElementById('bonus-bolsa');
            if (bonusBolsaHidden) {
                bonusBolsaHidden.value = valor;
            }
            localStorage.setItem('bonus_bolsa', valor);
            calcularEstatisticas();
            atualizarDisplayInventarioModal();
        });
    }
    
    // Fechar modais ao clicar fora
    if (modalInventario) {
        modalInventario.addEventListener('click', (e) => {
            if (e.target === modalInventario) {
                fecharModalInventario();
            }
        });
    }
    if (modalItem) {
        modalItem.addEventListener('click', (e) => {
            if (e.target === modalItem) {
                fecharModalItem();
            }
        });
    }
    
    // Atualiza display inicial
    atualizarDisplayInventario();
    renderizarItensManuaisPagina();

    // Renderiza catálogo
    renderizarCatalogoItens();
    
    // Configura busca no catálogo (modal e página)
    const camposBusca = [
        document.getElementById('catalogo-busca'),
        document.getElementById('catalogo-busca-page')
    ].filter(Boolean);
    camposBusca.forEach(campo => {
        campo.addEventListener('input', (e) => {
            filtrarCatalogoPorNome(e.target.value);
        });
    });
}

/**
 * Abre o modal de inventário
 */
function abrirModalInventario() {
    const modal = document.getElementById('modal-inventario');
    if (modal) {
        modal.style.display = 'flex';
        categoriaFiltroAtual = 'todos';
        
        // Sincroniza o valor do bônus de bolsa no modal
        const modalBonusBolsa = document.getElementById('modal-bonus-bolsa');
        const bonusBolsaHidden = document.getElementById('bonus-bolsa');
        if (modalBonusBolsa && bonusBolsaHidden) {
            modalBonusBolsa.value = bonusBolsaHidden.value || '0';
        }
        
        atualizarListaInventario();
        atualizarDisplayInventarioModal();
    }
}

/**
 * Fecha o modal de inventário
 */
function fecharModalInventario() {
    const modal = document.getElementById('modal-inventario');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Abre o modal para adicionar/editar item
 */
function abrirModalItem(itemId = null) {
    const modal = document.getElementById('modal-item');
    const titulo = document.getElementById('modal-item-titulo');
    const nomeInput = document.getElementById('item-nome');
    const categoriaSelect = document.getElementById('item-categoria');
    const pesoInput = document.getElementById('item-peso');
    const funcaoTextarea = document.getElementById('item-funcao');
    
    if (!modal) return;
    
    itemEditandoId = itemId;
    
    if (itemId) {
        // Modo edição
        const item = inventarioAtual.find(i => i.id === itemId);
        if (item) {
            titulo.textContent = '✏️ Editar Item';
            nomeInput.value = item.nome;
            categoriaSelect.value = item.categoria;
            pesoInput.value = item.peso;
            funcaoTextarea.value = item.funcao || '';
        }
    } else {
        // Modo criação
        titulo.textContent = '➕ Adicionar Item';
        nomeInput.value = '';
        categoriaSelect.value = 'itens-comuns';
        pesoInput.value = '1';
        funcaoTextarea.value = '';
    }
    
    modal.style.display = 'flex';
    nomeInput.focus();
}

/**
 * Fecha o modal de item
 */
function fecharModalItem() {
    const modal = document.getElementById('modal-item');
    if (modal) {
        modal.style.display = 'none';
        itemEditandoId = null;
        // Limpa os campos do formulário para evitar dados residuais
        const nomeInput = document.getElementById('item-nome');
        const categoriaSelect = document.getElementById('item-categoria');
        const pesoInput = document.getElementById('item-peso');
        const funcaoTextarea = document.getElementById('item-funcao');
        if (nomeInput) nomeInput.value = '';
        if (categoriaSelect) categoriaSelect.value = 'itens-comuns';
        if (pesoInput) pesoInput.value = '1';
        if (funcaoTextarea) funcaoTextarea.value = '';
    }
}

/**
 * Salva um item (novo ou editado)
 */
function salvarItem() {
    const nomeInput = document.getElementById('item-nome');
    const categoriaSelect = document.getElementById('item-categoria');
    const pesoInput = document.getElementById('item-peso');
    const funcaoTextarea = document.getElementById('item-funcao');
    
    const nome = nomeInput.value.trim();
    const categoria = categoriaSelect.value;
    const peso = parseFloat(pesoInput.value) || 0;
    const funcao = funcaoTextarea.value.trim();
    
    if (!nome) {
        alert('Por favor, insira um nome para o item.');
        nomeInput.focus();
        return;
    }
    
    if (peso < 0) {
        alert('O peso não pode ser negativo.');
        pesoInput.focus();
        return;
    }
    
    // Calcula o total atual sem o item sendo editado
    const pesoAtualSemItem = inventarioAtual
        .filter(i => i.id !== itemEditandoId)
        .reduce((total, i) => total + (parseFloat(i.peso) || 0), 0);
    
    const capacidadeTotal = calcularCapacidadeInventario();
    
    if (pesoAtualSemItem + peso > capacidadeTotal) {
        alert(`Não há espaço suficiente no inventário! Espaço disponível: ${capacidadeTotal - pesoAtualSemItem}`);
        return;
    }
    
    if (itemEditandoId) {
        // Editar item existente
        const index = inventarioAtual.findIndex(i => i.id === itemEditandoId);
        if (index !== -1) {
            inventarioAtual[index] = {
                ...inventarioAtual[index],
                nome,
                categoria,
                peso,
                funcao,
                fonte: inventarioAtual[index].fonte || 'manual'
            };
        }
    } else {
        // Adicionar novo item
        const novoItem = {
            id: Date.now().toString(),
            nome,
            categoria,
            peso,
            funcao,
            fonte: 'manual'
        };
        inventarioAtual.push(novoItem);
    }
    
    salvarInventarioLocalStorage();
    atualizarListaInventario();
    atualizarDisplayInventario();
    atualizarDisplayInventarioModal();
    renderizarItensManuaisPagina();
    fecharModalItem();
}

/**
 * Remove um item do inventário
 */
function removerItem(itemId) {
    console.log('removerItem chamado com ID:', itemId);
    console.log('Inventário antes:', inventarioAtual.length, inventarioAtual);
    const item = inventarioAtual.find(i => i.id === itemId);
    if (!item) {
        console.error('Item não encontrado:', itemId);
        return;
    }
    // Remove sem confirmação para evitar bloqueios de UI em alguns ambientes
    // Remove mutando o array (mantém a mesma referência)
    const idx = inventarioAtual.findIndex(i => i.id === itemId);
    if (idx !== -1) {
        inventarioAtual.splice(idx, 1);
    }
    console.log('Inventário depois:', inventarioAtual.length, inventarioAtual);
    salvarInventarioLocalStorage();

    // Fecha/limpa o formulário se estava editando esse item
    if (itemEditandoId === itemId) {
        fecharModalItem();
    }

    // Se removeu o último item da categoria filtrada, volta para "todos"
    if (categoriaFiltroAtual !== 'todos') {
        const temItensNaCategoria = inventarioAtual.some(i => i.categoria === categoriaFiltroAtual);
        if (!temItensNaCategoria) {
            console.log('Último item da categoria removido, voltando para "todos"');
            filtrarPorCategoria('todos');
            return;
        }
    }

    console.log('Atualizando lista...');
    atualizarListaInventario();
    console.log('Atualizando displays...');
    atualizarDisplayInventario();
    atualizarDisplayInventarioModal();
    renderizarItensManuaisPagina();
    console.log('Remoção concluída');
}

/**
 * Filtra itens por categoria
 */
function filtrarPorCategoria(categoria) {
    // Mapeamento das abas para as chaves do catálogo
    const mapaCategorias = {
        'itens-comuns': 'comuns',
        'itens-classe': 'classe',
        'itens-raca': 'raca',
        'itens-origem': 'origem',
        'armas': 'armas',
        'todos': 'todos'
    };
    categoriaFiltroAtual = mapaCategorias[categoria] || categoria;
    
    // Atualiza visual das abas
    const tabs = document.querySelectorAll('.inventario-tab-btn');
    tabs.forEach(tab => {
        if (tab.getAttribute('data-categoria') === categoria) {
            tab.style.background = '#4CAF50';
            tab.style.color = 'white';
            tab.classList.add('active');
        } else {
            tab.style.background = '#f5f5f5';
            tab.style.color = '#333';
            tab.classList.remove('active');
        }
    });
    
    atualizarListaInventario();
}

/**
 * Atualiza a lista de itens no modal
 */
function atualizarListaInventario() {
    const lista = document.getElementById('inventario-lista');
    console.log('atualizarListaInventario - elemento lista:', lista);
    console.log('atualizarListaInventario - categoriaFiltroAtual:', categoriaFiltroAtual);
    console.log('atualizarListaInventario - inventarioAtual:', inventarioAtual);
    
    if (!lista) return;
    
    let itensFiltrados = inventarioAtual;
    if (categoriaFiltroAtual !== 'todos') {
        itensFiltrados = inventarioAtual.filter(i => i.categoria === categoriaFiltroAtual);
    }
    
    console.log('atualizarListaInventario - itensFiltrados:', itensFiltrados);
    
    if (itensFiltrados.length === 0) {
        lista.innerHTML = '<p style="text-align:center; color:#999; padding:24px;">Nenhum item nesta categoria.</p>';
        return;
    }
    
    lista.innerHTML = itensFiltrados.map(item => {
        const categoriaIcon = {
            'armas': '⚔️',
            'itens-comuns': '🔧',
            'itens-raca': '👥',
            'itens-classe': '⚔️',
            'itens-origem': '🌍'
        }[item.categoria] || '📦';
        
        const categoriaNome = {
            'armas': 'Armas',
            'itens-comuns': 'Itens Comuns',
            'itens-raca': 'Itens de Raça',
            'itens-classe': 'Itens de Classe',
            'itens-origem': 'Itens de Origem'
        }[item.categoria] || 'Outro';
        
        // Botões extras para armas
        const botoesArma = item.categoria === 'armas' ? `
            <button type="button" onclick="window.rolarDanoArma('${item.id.replace(/'/g, "\\'")}')" class="btn" style="padding:4px 8px; font-size:11px; background:#4CAF50; color:white; border:none; border-radius:4px; cursor:pointer;" title="Rolar dano normal">🎲</button>
            <button type="button" onclick="window.rolarCriticoArma('${item.id.replace(/'/g, "\\'")}')" class="btn" style="padding:4px 8px; font-size:11px; background:#ff5722; color:white; border:none; border-radius:4px; cursor:pointer;" title="Rolar dano crítico">💥</button>
        ` : '';
        
        return `
            <div class="inventario-item" style="border:1px solid #ddd; border-radius:8px; padding:12px; background:#fafafa;">
                <div style="display:flex; justify-content:space-between; align-items:start; margin-bottom:8px;">
                    <div style="flex:1;">
                        <div style="font-weight:bold; font-size:16px; margin-bottom:4px;">
                            ${categoriaIcon} ${item.nome}
                        </div>
                        <div style="font-size:12px; color:#666; margin-bottom:4px;">
                            ${categoriaNome} • Peso: ${item.peso} ${item.peso === 1 ? 'espaço' : 'espaços'}
                        </div>
                        ${item.funcao ? `<div style="font-size:13px; color:#444; margin-top:6px;">${item.funcao}</div>` : ''}
                    </div>
                    <div style="display:flex; gap:4px; flex-wrap:wrap;">
                        ${botoesArma}
                        <button type="button" onclick="window.abrirModalItem('${item.id.replace(/'/g, "\\'")}')" class="btn" style="padding:4px 8px; font-size:12px; background:#2196F3; color:white; border:none; border-radius:4px; cursor:pointer;">✏️</button>
                        <button type="button" onclick="window.removerItem('${item.id.replace(/'/g, "\\'")}')" class="btn" style="padding:4px 8px; font-size:12px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer;">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

/**
 * Rola dados a partir de expressão (ex: "1d8", "1d4+2", "1d8+1d4")
 */
function rolarDados(expressao) {
    if (!expressao) return 0;
    
    // Remove espaços e transforma em minúsculas
    expressao = expressao.toLowerCase().replace(/\s/g, '');
    console.log('rolarDados - expressao recebida:', expressao);
    
    let total = 0;
    const partes = expressao.split('+');
    console.log('rolarDados - partes:', partes);
    
    for (const parte of partes) {
        if (parte.includes('d')) {
            // Formato XdY
            const [qtd, faces] = parte.split('d').map(n => parseInt(n) || 1);
            let subtotal = 0;
            for (let i = 0; i < qtd; i++) {
                const rolagem = Math.floor(Math.random() * faces) + 1;
                subtotal += rolagem;
            }
            console.log(`rolarDados - ${parte}: ${subtotal}`);
            total += subtotal;
        } else {
            // Bônus fixo
            const bonus = parseInt(parte) || 0;
            console.log(`rolarDados - bonus fixo: ${bonus}`);
            total += bonus;
        }
    }
    
    console.log('rolarDados - total final:', total);
    return total;
}

/**
 * Rola dano normal de uma arma
 */
function rolarDanoArma(itemId) {
    const item = inventarioAtual.find(i => i.id === itemId);
    if (!item) return;
    
    // Busca dados da arma no catálogo para pegar o dano correto
    const catalogItem = window.DadosLoader?.obterItemCatalogo('armas', item.id.split('-').slice(0, -1).join('-'));
    const dano = catalogItem?.dano || '1d4';
    
    const resultado = rolarDados(dano);
    
    mostrarNotificacao(`🎲 ${item.nome}: ${resultado} de dano`);
}

/**
 * Rola dano crítico de uma arma considerando diferentes padrões:
 * - Luta (Força) padrão: rola os dados duas vezes e soma (ex: 1d8 -> 2d8)
 * - Pontaria 18-20 ×3: multiplica a rolagem única por 3
 * - Pontaria fogo 19 ×2: multiplica a rolagem única por 2
 * Regras identificadas pelas propriedades de crítico no JSON.
 */
function rolarCriticoArma(itemId) {
    const item = inventarioAtual.find(i => i.id === itemId);
    if (!item) return;
    
    // Identifica ID base (remove timestamp) e obtém dados do catálogo
    const idBase = item.id.split('-').slice(0, -1).join('-');
    const catalogItem = window.DadosLoader?.obterItemCatalogo('armas', idBase);
    const dano = catalogItem?.dano || '1d4';
    const pericia = (catalogItem?.pericia || '').toLowerCase();
    const props = (catalogItem?.propriedades || []).join(' ').toLowerCase();
    
    let total = 0;
    let descricao = '';
    
    const isCriticoX3 = props.includes('18-20') || props.includes('multiplica dano por 3');
    const isCritico19x2 = props.includes('19') && props.includes('multiplica dano por 2');
    const isCritico20x2 = props.includes('20') && props.includes('multiplica dano por 2');
    
    if (isCriticoX3) {
        // Multiplica resultado único por 3
        const base = rolarDados(dano);
        total = base * 3;
        descricao = `${base} × 3 = ${total}`;
    } else if (isCritico19x2 || isCritico20x2) {
        // Multiplica resultado único por 2
        const base = rolarDados(dano);
        total = base * 2;
        descricao = `${base} × 2 = ${total}`;
    } else {
        // Padrão: rola duas vezes (dobrar dados)
        const r1 = rolarDados(dano);
        const r2 = rolarDados(dano);
        total = r1 + r2;
        descricao = `${r1} + ${r2} = ${total} (dados dobrados)`;
    }
    
    mostrarNotificacao(`💥 CRÍTICO! ${item.nome}: ${descricao} de dano`, 'critico');
}

/**
 * Mostra notificação temporária no topo da tela
 */
function mostrarNotificacao(mensagem, tipo = 'normal') {
    const notif = document.createElement('div');
    notif.textContent = mensagem;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${tipo === 'critico' ? '#ff5722' : '#4CAF50'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-size: 16px;
        font-weight: bold;
        animation: slideDown 0.3s ease;
    `;
    
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

/**
 * Calcula a capacidade total do inventário
 */
function calcularCapacidadeInventario() {
    const atributos = obterTodosAtributos();
    const forca = atributos.forca || 0;
    const bonusBolsaInput = document.getElementById('bonus-bolsa');
    const bonusBolsa = bonusBolsaInput ? (parseInt(bonusBolsaInput.value) || 0) : 0;
    return forca * 2 + 3 + bonusBolsa;
}

/**
 * Calcula o peso total usado no inventário
 */
function calcularPesoUsado() {
    return inventarioAtual.reduce((total, item) => total + (parseFloat(item.peso) || 0), 0);
}

/**
 * Atualiza o display do inventário na ficha
 */
function atualizarDisplayInventario() {
    const usado = calcularPesoUsado();
    const total = calcularCapacidadeInventario();
    
    const usadoElement = document.getElementById('inventario-usado');
    const totalElement = document.getElementById('inventario-total-display');
    
    if (usadoElement) {
        usadoElement.textContent = usado.toFixed(1);
    }
    if (totalElement) {
        totalElement.textContent = total;
    }
}

/**
 * Atualiza o display do inventário no modal
 */
function atualizarDisplayInventarioModal() {
    const usado = calcularPesoUsado();
    const total = calcularCapacidadeInventario();
    
    const usadoElement = document.getElementById('modal-inventario-usado');
    const totalElement = document.getElementById('modal-inventario-total');
    
    if (usadoElement) {
        usadoElement.textContent = usado.toFixed(1);
    }
    if (totalElement) {
        totalElement.textContent = total;
    }
}

/**
 * Salva o inventário no localStorage
 */
function salvarInventarioLocalStorage() {
    localStorage.setItem('inventario_itens', JSON.stringify(inventarioAtual));
}

/**
 * Limpa o inventário
 */
function limparInventario() {
    if (confirm('Deseja realmente limpar todo o inventário? Esta ação não pode ser desfeita.')) {
        inventarioAtual = [];
        salvarInventarioLocalStorage();
        atualizarListaInventario();
        atualizarDisplayInventario();
        atualizarDisplayInventarioModal();
    }
}

// Torna funções globais
window.abrirModalInventario = abrirModalInventario;
window.fecharModalInventario = fecharModalInventario;
window.abrirModalItem = abrirModalItem;
window.fecharModalItem = fecharModalItem;
window.salvarItem = salvarItem;
window.removerItem = removerItem;
window.filtrarPorCategoria = filtrarPorCategoria;
window.limparInventario = limparInventario;

/**
 * Renderiza o catálogo completo (todas as categorias) no modal
 */
function renderizarCatalogoItens() {
    const containers = [
        { el: document.getElementById('catalogo-itens'), escopo: 'modal' },
        { el: document.getElementById('catalogo-itens-page'), escopo: 'page' }
    ].filter(c => c.el);

    // Event delegation para expandir/colapsar seções do catálogo (modal e página)
    containers.forEach(function(containerInfo) {
        const catalogo = containerInfo.el;
        catalogo.dataset.catalogoEscopo = containerInfo.escopo;
        if (catalogo && !catalogo._delegationSet) {
            catalogo.addEventListener('click', function(e) {
                const header = e.target.closest('[data-categoria]');
                if (header && header.parentElement && header.parentElement.classList.contains('catalogo-secao')) {
                    const categoria = header.getAttribute('data-categoria');
                    if (categoria) {
                        const escopo = catalogo.dataset.catalogoEscopo || 'modal';
                        toggleCatalogoSecao(categoria, escopo);
                    }
                }
            });
            catalogo._delegationSet = true;
        }
    });

    if (!containers.length || !window.DadosLoader) return;

    const secoes = [
        { cat: 'armas', titulo: '⚔️ Armas' },
        { cat: 'comuns', titulo: '🔧 Itens Comuns' },
        { cat: 'raca', titulo: '👥 Itens de Raça' },
        { cat: 'classe', titulo: '⚔️ Itens de Classe' },
        { cat: 'origem', titulo: '🌍 Itens de Origem' }
    ];

    containers.forEach(function(containerInfo) {
        const html = secoes.map(sec => renderizarSecaoCatalogo(sec.cat, sec.titulo, containerInfo.escopo)).join('');
        containerInfo.el.innerHTML = html;
    });
}

// Extrai a faixa de crítico necessária de uma propriedade textual da arma
function extrairCriticoNecessario(item) {
    try {
        const props = item?.propriedades || [];
        const critProp = props.find(p => /crítico/i.test(p));
        if (!critProp) return '20'; // padrão
        // Captura formatos: "Crítico: 19 ...", "Crítico: 18-20 ...", "Crítico: 20 em Força ..."
        const match = critProp.match(/Crítico:\s*([0-9]+(?:-[0-9]+)?)/i);
        if (match) return match[1];
        return '20';
    } catch (e) {
        return '20';
    }
}

function renderizarSecaoCatalogo(categoria, titulo, escopo) {
    const itens = window.DadosLoader.obterItensPorCategoria(categoria) || [];
    if (!itens.length) return '';

    const lista = itens.map(item => {
        const peso = (item.peso != null) ? item.peso : 0;
        const desc = item.descricao || '';
        // Se for arma, adiciona perícia e crítico necessário
        let linhaPericiaCritico = '';
        if (categoria === 'armas') {
            const pericia = item.pericia ? item.pericia : '—';
            const critico = extrairCriticoNecessario(item);
            linhaPericiaCritico = `<div style="font-size:12px; color:#444; margin-top:4px;">Perícia: <strong>${pericia}</strong> • Crítico: <strong>${critico}</strong></div>`;
        }
        return `
            <div style="border:1px solid #e0e0e0; border-radius:8px; padding:10px; background:#fff; display:flex; gap:10px; align-items:start;">
                <div style="flex:1;">
                    <div style="font-weight:bold;">${item.nome}</div>
                    <div style="font-size:12px; color:#666;">Peso: ${peso} • ${item.raca ? 'Raça: '+item.raca : item.classe ? 'Classe: '+item.classe : item.origem ? 'Origem: '+item.origem : ''}</div>
                    ${desc ? `<div style=\"font-size:12px; color:#444; margin-top:4px;\">${desc}</div>` : ''}
                    ${linhaPericiaCritico}
                </div>
                <div>
                    <button type="button" class="btn btn-primary" style="white-space:nowrap;" onclick="adicionarItemCatalogo('${categoria}','${item.id}')">Adicionar</button>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="catalogo-secao" style="border:1px solid #ddd; border-radius:8px; overflow:hidden; margin-bottom:8px;">
            <div data-categoria="${categoria}" style="background:#f7f7f7; padding:8px 12px; font-weight:bold; cursor:pointer; user-select:none; display:flex; justify-content:space-between; align-items:center;">
                <span>${titulo} <span style="color:#666; font-weight:normal;">(${itens.length})</span></span>
                <span id="catalogo-icon-${escopo}-${categoria}" style="font-size:14px;">▶</span>
            </div>
            <div id="catalogo-lista-${escopo}-${categoria}" style="padding:8px; display:none; grid-template-columns:1fr; gap:8px;">${lista}</div>
        </div>
    `;
}

/**
 * Adiciona um item do catálogo diretamente ao inventário (com checagem de capacidade)
 */
function adicionarItemCatalogo(categoria, id) {
    const item = window.DadosLoader.obterItemCatalogo(categoria, id);
    if (!item) return;

    const pesoItem = parseFloat(item.peso) || 0;
    const usado = calcularPesoUsado();
    const total = calcularCapacidadeInventario();
    if (usado + pesoItem > total) {
        alert(`Capacidade insuficiente. Espaço disponível: ${(total - usado).toFixed(1)}`);
        return;
    }

    // Monta representação interna
    const novoItem = {
        id: `${item.id}-${Date.now()}`,
        nome: item.nome,
        categoria: categoria === 'comuns' ? 'itens-comuns' : (categoria === 'raca' ? 'itens-raca' : (categoria === 'classe' ? 'itens-classe' : (categoria === 'origem' ? 'itens-origem' : 'armas'))),
        peso: pesoItem,
        funcao: item.funcao || item.descricao || '',
        fonte: 'catalogo'
    };

    inventarioAtual.push(novoItem);
    salvarInventarioLocalStorage();
    atualizarListaInventario();
    atualizarDisplayInventario();
    atualizarDisplayInventarioModal();
    renderizarItensManuaisPagina();
}

// Exporta para uso global nos botões do HTML gerado
window.adicionarItemCatalogo = adicionarItemCatalogo;
window.rolarDanoArma = rolarDanoArma;
window.rolarCriticoArma = rolarCriticoArma;

/**
 * Toggle expansão/colapso de seção do catálogo
 */
function toggleCatalogoSecao(categoria, escopo = 'modal') {
    const lista = document.getElementById(`catalogo-lista-${escopo}-${categoria}`);
    const icon = document.getElementById(`catalogo-icon-${escopo}-${categoria}`);
    
    if (!lista || !icon) return;
    
    const isVisible = lista.style.display === 'grid';
    
    if (isVisible) {
        lista.style.display = 'none';
        icon.textContent = '▶';
    } else {
        lista.style.display = 'grid';
        icon.textContent = '▼';
    }
}

window.toggleCatalogoSecao = toggleCatalogoSecao;

/**
 * Filtra itens do catálogo por nome
 */
function filtrarCatalogoPorNome(termoBusca) {
    const termo = termoBusca.toLowerCase().trim();
    
    const secoes = [
        { cat: 'armas', titulo: '⚔️ Armas' },
        { cat: 'comuns', titulo: '🔧 Itens Comuns' },
        { cat: 'raca', titulo: '👥 Itens de Raça' },
        { cat: 'classe', titulo: '⚔️ Itens de Classe' },
        { cat: 'origem', titulo: '🌍 Itens de Origem' }
    ];
    const containers = [
        { el: document.getElementById('catalogo-itens'), escopo: 'modal' },
        { el: document.getElementById('catalogo-itens-page'), escopo: 'page' }
    ].filter(c => c.el);

    containers.forEach(containerInfo => {
        const container = containerInfo.el;
        const escopo = containerInfo.escopo;

        secoes.forEach(sec => {
            const secaoDiv = container.querySelector(`.catalogo-secao > [data-categoria='${sec.cat}']`)?.parentElement;
            const lista = document.getElementById(`catalogo-lista-${escopo}-${sec.cat}`);
            const icon = document.getElementById(`catalogo-icon-${escopo}-${sec.cat}`);
            if (!lista || !secaoDiv) return;

            if (!termo) {
                // Sem busca: mostra todas as seções, mas colapsadas
                secaoDiv.style.display = 'block';
                lista.style.display = 'none';
                if (icon) icon.textContent = '▶';
                // Restaura conteúdo completo da seção para este escopo
                const htmlSecao = renderizarSecaoCatalogo(sec.cat, sec.titulo, escopo);
                const temp = document.createElement('div');
                temp.innerHTML = htmlSecao;
                const novaLista = temp.querySelector(`#catalogo-lista-${escopo}-${sec.cat}`);
                if (novaLista) {
                    lista.innerHTML = novaLista.innerHTML;
                }
                return;
            }

            // Filtra itens da categoria
            const itens = window.DadosLoader.obterItensPorCategoria(sec.cat) || [];
            const itensFiltrados = itens.filter(item =>
                item.nome.toLowerCase().includes(termo)
            );

            if (itensFiltrados.length === 0) {
                // Esconde seção se nenhum item corresponde
                secaoDiv.style.display = 'none';
            } else {
                // Mostra seção e expande automaticamente
                secaoDiv.style.display = 'block';
                lista.style.display = 'grid';
                if (icon) icon.textContent = '▼';

                // Re-renderiza apenas os itens filtrados
                lista.innerHTML = itensFiltrados.map(item => {
                    const peso = (item.peso != null) ? item.peso : 0;
                    const desc = item.descricao || '';
                    return `
                        <div style="border:1px solid #e0e0e0; border-radius:8px; padding:10px; background:#fff; display:flex; gap:10px; align-items:start;">
                            <div style="flex:1;">
                                <div style="font-weight:bold;">${item.nome}</div>
                                <div style="font-size:12px; color:#666;">Peso: ${peso} • ${item.raca ? 'Raça: '+item.raca : item.classe ? 'Classe: '+item.classe : item.origem ? 'Origem: '+item.origem : ''}</div>
                                ${desc ? `<div style=\"font-size:12px; color:#444; margin-top:4px;\">${desc}</div>` : ''}
                            </div>
                            <div>
                                <button type="button" class="btn btn-primary" style="white-space:nowrap;" onclick="adicionarItemCatalogo('${sec.cat}','${item.id}')">Adicionar</button>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        });
    });
}

window.filtrarCatalogoPorNome = filtrarCatalogoPorNome;

