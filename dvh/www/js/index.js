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
    
    // Popula os selects do formulário
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
}

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
                forca: parseInt(formData.get('forca')) || 10,
                destreza: parseInt(formData.get('destreza')) || 10,
                constituicao: parseInt(formData.get('constituicao')) || 10,
                inteligencia: parseInt(formData.get('inteligencia')) || 10,
                sabedoria: parseInt(formData.get('sabedoria')) || 10,
                carisma: parseInt(formData.get('carisma')) || 10,
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
