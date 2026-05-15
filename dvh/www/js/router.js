/**
 * Sistema de Roteamento
 * Gerencia a navegação entre diferentes páginas do aplicativo
 */

// Página atual
let currentPage = 'home';

/**
 * Inicializa o sistema de roteamento
 */
function initRouter() {
    // Configura os event listeners nos itens de menu
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');
            navigateToPage(page);
        });
    });

    // Configura o toggle do menu mobile
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const sidebar = document.getElementById('sidebar');
            const isOpen = sidebar?.classList.toggle('active');
            if (isOpen) {
                document.body.classList.add('sidebar-open');
            } else {
                document.body.classList.remove('sidebar-open');
            }
        });
    }

    // Fecha o menu ao clicar fora (mobile)
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('sidebar');
        const menuToggle = document.getElementById('menuToggle');
        
        if (sidebar && menuToggle && 
            !sidebar.contains(e.target) && 
            !menuToggle.contains(e.target) &&
            window.innerWidth <= 768) {
            sidebar.classList.remove('active');
        }
    });

    // Configura os botões da barra inferior
    const bottomNavBtns = document.querySelectorAll('.bottom-nav .nav-btn');
    bottomNavBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const page = btn.getAttribute('data-page');
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Configura a barra de navegação inferior interativa (scroll)
    setupBottomNavScroll();

    // Configura o toggle de modo escuro
    setupDarkModeToggle();

    // Carrega a página inicial
    navigateToPage('home');
}

/**
 * Configura o toggle de modo escuro
 */
function setupDarkModeToggle() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (!darkModeToggle) return;

    // Carrega preferência salva
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }

    // Toggle ao clicar
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        const isNowDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isNowDark);
    });
}

/**
 * Configura o comportamento da barra de navegação inferior ao rolar a tela
 * NOTA: A barra permanece sempre visível na página inicial conforme solicitado
 */
function setupBottomNavScroll() {
    const bottomNav = document.getElementById('bottomNav');
    if (!bottomNav) return;

    // A barra permanece sempre visível na página inicial
    // Removido o comportamento de esconder/mostrar ao rolar
    // A função pode ser expandida no futuro se necessário
}

/**
 * Navega para uma página específica
 * @param {string} pageId - ID da página para navegar
 * @param {object} params - Parâmetros adicionais (ex: { tipo: 'raca', id: 'vampiro' })
 */
function navigateToPage(pageId, params = {}) {
    // Esconde todas as páginas
    const pages = document.querySelectorAll('.page');
    pages.forEach(page => {
        page.classList.remove('active');
    });

    // Mostra a página selecionada
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
        targetPage.classList.add('active');
        currentPage = pageId;
    }

    // Atualiza o item de menu ativo apenas se não for página de detalhes ou home
    if (!pageId.includes('-detail') && pageId !== 'home') {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-page') === pageId) {
                item.classList.add('active');
            }
        });

        // Atualiza botões da barra inferior
        const bottomNavBtns = document.querySelectorAll('.bottom-nav .nav-btn');
        bottomNavBtns.forEach(btn => {
            btn.classList.remove('active');
            if (btn.getAttribute('data-page') === pageId) {
                btn.classList.add('active');
            }
        });
    }

    // Esconde a barra inferior se não estiver na página home
    const bottomNav = document.getElementById('bottomNav');
    const mainContent = document.querySelector('.main-content');
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    
    if (pageId === 'home') {
        // Página home: barra inferior visível, sidebar fechada
        if (bottomNav) {
            bottomNav.style.display = 'block';
            bottomNav.classList.remove('nav-hidden');
            bottomNav.style.transform = 'translateY(0)';
            bottomNav.style.opacity = '1';
        }
        document.body.style.background = 'linear-gradient(135deg, #0a1929 0%, #1a3a5a 50%, #0f2537 100%)';
        if (sidebar) { sidebar.classList.remove('active'); }
        document.body.classList.remove('sidebar-open');
        if (menuToggle) { menuToggle.style.display = 'block'; }
        // Scroll para o topo quando voltar para home
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Outras páginas: barra inferior oculta, sidebar fechada por padrão
        document.body.style.background = 'linear-gradient(135deg, #ff8c00 0%, #ff6b35 100%)';
        if (bottomNav) { bottomNav.style.display = 'none'; }
        // Sidebar sempre fechada ao navegar, só abre com toggle manual
        if (sidebar) { sidebar.classList.remove('active'); }
        document.body.classList.remove('sidebar-open');
        if (menuToggle) { menuToggle.style.display = 'block'; }
    }

    // Carrega dados específicos da página se necessário
    if (params.tipo && params.id) {
        loadDetailPage(params.tipo, params.id);
    } else {
        loadPageData(pageId);
    }
}

/**
 * Navega para página de detalhes
 * @param {string} tipo - 'raca', 'classe' ou 'origem'
 * @param {string} id - ID do item
 */
function navigateToDetail(tipo, id) {
    let pageId = '';
    if (tipo === 'raca') {
        pageId = 'raca-detail';
    } else if (tipo === 'classe') {
        pageId = 'classe-detail';
    } else if (tipo === 'origem') {
        pageId = 'origem-detail';
    }
    
    if (pageId) {
        navigateToPage(pageId, { tipo, id });
    }
}

/**
 * Carrega dados específicos para cada página
 * @param {string} pageId - ID da página
 */
function loadPageData(pageId) {
    switch(pageId) {
        case 'racas':
            loadRacasPage();
            break;
        case 'classes':
            loadClassesPage();
            break;
        case 'origens':
            loadOrigensPage();
            break;
        case 'atributos':
            if (window.Atributos) {
                Atributos.init();
            }
            break;
        case 'pericias':
            if (window.Pericias) {
                Pericias.init();
            }
            break;
        case 'ficha':
            // Tenta obter e armazenar o nível
            let nivel = 0;
            
            // Primeiro tenta do input
            const inputNivel = document.getElementById('nivel');
            if (inputNivel && inputNivel.value) {
                nivel = parseInt(inputNivel.value) || 0;
            }
            
            // Se não conseguiu, tenta do localStorage
            if (nivel === 0) {
                const nivelStored = localStorage.getItem('nivelFichaAtual');
                if (nivelStored) {
                    nivel = parseInt(nivelStored) || 0;
                }
            }
            
            // Se conseguiu, armazena na variável global
            if (nivel > 0) {
                window.nivelFichaAtual = nivel;
                console.log('[router] Página ficha: nivelFichaAtual =', nivel);
            }
            
            // Recarrega atributos e perícias na ficha quando entrar na página
            if (typeof popularAtributosFicha === 'function') {
                popularAtributosFicha();
            }
            if (typeof popularPericiasFicha === 'function') {
                popularPericiasFicha();
            }
            break;
        default:
            break;
    }
}

/**
 * Carrega página de detalhes
 * @param {string} tipo - 'raca', 'classe' ou 'origem'
 * @param {string} id - ID do item
 */
async function loadDetailPage(tipo, id) {
    try {
        // Carrega dados se necessário
        if (DadosLoader.getCache()[tipo === 'raca' ? 'racas' : tipo === 'classe' ? 'classes' : 'origens'].length === 0) {
            await DadosLoader.carregarTodos();
        }

        const item = DadosLoader.obterItemPorId(
            tipo === 'raca' ? 'racas' : tipo === 'classe' ? 'classes' : 'origens',
            id
        );

        if (!item) {
            throw new Error('Item não encontrado');
        }

        // Exibe detalhes baseado no tipo
        if (tipo === 'raca') {
            displayRacaDetail(item);
        } else if (tipo === 'classe') {
            displayClasseDetail(item);
        } else if (tipo === 'origem') {
            displayOrigemDetail(item);
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes:', error);
        const contentId = tipo === 'raca' ? 'raca-detail-content' : 
                         tipo === 'classe' ? 'classe-detail-content' : 
                         'origem-detail-content';
        const content = document.getElementById(contentId);
        if (content) {
            content.innerHTML = '<p class="error">Erro ao carregar detalhes. Item não encontrado.</p>';
        }
    }
}

/**
 * Exibe detalhes completos de uma raça
 */
function displayRacaDetail(raca) {
    const title = document.getElementById('raca-detail-title');
    const content = document.getElementById('raca-detail-content');
    
    if (title) title.textContent = `👥 ${raca.nome}`;
    if (!content) return;

    const bonus = raca.bonus?.traduzido || raca.bonus || {};
    const bonusInfo = formatRacaBonus(raca);
    const caracteristicas = raca.caracteristicas || [];

    content.innerHTML = `
        <div class="detail-card">
            <div class="detail-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1>${raca.nome}</h1>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <h3>📖 Descrição</h3>
                    <p class="detail-description">${raca.descricao}</p>
                </div>

                <div class="detail-section">
                    <h3>⚡ ${bonusInfo.label}</h3>
                    <p class="detail-info"><strong>${bonusInfo.texto}</strong></p>
                        ${bonusInfo.alma ? `<p><strong>${bonusInfo.alma}</strong></p>` : ''}
                    ${Object.keys(bonus).length > 0 ? `
                        <div class="bonus-grid">
                            ${bonus.pericias && typeof bonus.pericias === 'object' ? Object.entries(bonus.pericias).map(([pericia, valor]) => `
                                <div class="bonus-item">
                                    <span class="bonus-label">${pericia.charAt(0).toUpperCase() + pericia.slice(1).replace(/_/g, ' ')}</span>
                                    <span class="bonus-value ${valor > 0 ? 'positive' : valor < 0 ? 'negative' : ''}">${valor > 0 ? '+' : ''}${valor}</span>
                                </div>
                            `).join('') : ''}
                            ${bonus.pericias_penalidade && typeof bonus.pericias_penalidade === 'object' ? Object.entries(bonus.pericias_penalidade).map(([pericia, valor]) => `
                                <div class="bonus-item">
                                    <span class="bonus-label">${pericia.charAt(0).toUpperCase() + pericia.slice(1).replace(/_/g, ' ')}</span>
                                    <span class="bonus-value negative">${valor}</span>
                                </div>
                            `).join('') : ''}
                            ${bonus.alma !== undefined ? `
                                <div class="bonus-item">
                                    <span class="bonus-label">Alma</span>
                                    <span class="bonus-value ${bonus.alma > 0 ? 'positive' : bonus.alma < 0 ? 'negative' : ''}">${bonus.alma > 0 ? '+' : ''}${bonus.alma}</span>
                                </div>
                            ` : ''}
                        </div>
                    ` : ''}
                </div>

            </div>
        </div>
    `;
}

/**
 * Exibe detalhes completos de uma classe
 */
function displayClasseDetail(classe) {
    const title = document.getElementById('classe-detail-title');
    const content = document.getElementById('classe-detail-content');
    
    if (title) title.textContent = `⚔️ ${classe.nome}`;
    if (!content) return;

    content.innerHTML = `
        <div class="detail-card">
            <div class="detail-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1>${classe.nome}</h1>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <h3>📖 Descrição</h3>
                    <p class="detail-description">${classe.descricao}</p>
                </div>
            </div>
        </div>
    `;
}

/**
 * Exibe detalhes completos de uma origem
 */
function displayOrigemDetail(origem) {
    const title = document.getElementById('origem-detail-title');
    const content = document.getElementById('origem-detail-content');
    
    if (title) title.textContent = `🌍 ${origem.nome}`;
    if (!content) return;

    const habilidades = origem.bonus?.habilidades || [];
    const equipamento = origem.bonus?.equipamento || 'N/A';
    const caracteristicas = origem.caracteristicas || [];

    content.innerHTML = `
        <div class="detail-card">
            <div class="detail-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1>${origem.nome}</h1>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <h3>📖 Descrição</h3>
                    <p class="detail-description">${origem.descricao}</p>
                </div>

                ${habilidades.length > 0 ? `
                    <div class="detail-section">
                        <h3>✨ Habilidades Bônus</h3>
                        <div class="detail-tags">
                            ${habilidades.map(h => `<span class="tag tag-skill">${h}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                <div class="detail-section">
                    <h3>🎒 Equipamento Inicial</h3>
                    <p class="detail-info">${equipamento}</p>
                </div>

            </div>
        </div>
    `;
}

/**
 * Carrega e exibe a página de Raças
 */
async function loadRacasPage() {
    const content = document.getElementById('racas-content');
    if (!content) return;

    content.innerHTML = '<p class="loading">Carregando raças...</p>';

    try {
        const racas = DadosLoader.obterDados('racas');
        if (racas && racas.length > 0) {
            displayRacas(racas, content);
        } else {
            // Tenta carregar se ainda não estiver em cache
            await DadosLoader.carregarTodos();
            const racasLoaded = DadosLoader.obterDados('racas');
            if (racasLoaded && racasLoaded.length > 0) {
                displayRacas(racasLoaded, content);
            } else {
                content.innerHTML = '<p class="empty">Nenhuma raça encontrada.</p>';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar raças:', error);
        content.innerHTML = '<p class="error">Erro ao carregar raças. Tente novamente.</p>';
    }
}

/**
 * Carrega e exibe a página de Classes
 */
async function loadClassesPage() {
    const content = document.getElementById('classes-content');
    if (!content) return;

    content.innerHTML = '<p class="loading">Carregando classes...</p>';

    try {
        const classes = DadosLoader.obterDados('classes');
        if (classes && classes.length > 0) {
            displayClasses(classes, content);
        } else {
            await DadosLoader.carregarTodos();
            const classesLoaded = DadosLoader.obterDados('classes');
            if (classesLoaded && classesLoaded.length > 0) {
                displayClasses(classesLoaded, content);
            } else {
                content.innerHTML = '<p class="empty">Nenhuma classe encontrada.</p>';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar classes:', error);
        content.innerHTML = '<p class="error">Erro ao carregar classes. Tente novamente.</p>';
    }
}

/**
 * Carrega e exibe a página de Origens
 */
async function loadOrigensPage() {
    const content = document.getElementById('origens-content');
    if (!content) return;

    content.innerHTML = '<p class="loading">Carregando origens...</p>';

    try {
        const origens = DadosLoader.obterDados('origens');
        if (origens && origens.length > 0) {
            displayOrigens(origens, content);
        } else {
            await DadosLoader.carregarTodos();
            const origensLoaded = DadosLoader.obterDados('origens');
            if (origensLoaded && origensLoaded.length > 0) {
                displayOrigens(origensLoaded, content);
            } else {
                content.innerHTML = '<p class="empty">Nenhuma origem encontrada.</p>';
            }
        }
    } catch (error) {
        console.error('Erro ao carregar origens:', error);
        content.innerHTML = '<p class="error">Erro ao carregar origens. Tente novamente.</p>';
    }
}

/**
 * Exibe as raças em cards
 */
function displayRacas(racas, container) {
    container.innerHTML = '';
    
    racas.forEach(raca => {
        const card = createRacaCard(raca);
        container.appendChild(card);
    });
}

/**
 * Exibe as classes em cards
 */
function displayClasses(classes, container) {
    container.innerHTML = '';
    
    classes.forEach(classe => {
        const card = createClasseCard(classe);
        container.appendChild(card);
    });
}

/**
 * Exibe as origens em cards
 */
function displayOrigens(origens, container) {
    container.innerHTML = '';
    
    origens.forEach(origem => {
        const card = createOrigemCard(origem);
        container.appendChild(card);
    });
}

/**
 * Cria um card HTML para uma raça
 */
function createRacaCard(raca) {
    const card = document.createElement('div');
    card.className = 'data-card clickable-card';
    card.style.cursor = 'pointer';
    
    const bonusInfo = formatRacaBonus(raca);
    
    card.innerHTML = `
        <div class="data-card-header">
            <h3>${raca.nome}</h3>
        </div>
        <div class="data-card-body">
            <p class="data-description">${raca.descricao}</p>
            <div class="data-info">
                <p><strong>${bonusInfo.label}:</strong> ${bonusInfo.texto}</p>
                ${bonusInfo.alma ? `<p><strong>${bonusInfo.alma}</strong></p>` : ''}
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => {
        navigateToDetail('raca', raca.id);
    });
    
    return card;
}

function formatRacaBonus(raca) {
    const bonus = raca?.bonus?.traduzido || raca?.bonus || {};

    if (bonus.atributos) {
        return { label: 'Bônus de Atributos', texto: bonus.atributos };
    }

    const partes = [];

    if (bonus.pericias && typeof bonus.pericias === 'object') {
        const texto = Object.entries(bonus.pericias)
            .map(([pericia, valor]) => `${pericia.charAt(0).toUpperCase() + pericia.slice(1).replace(/_/g, ' ')} ${valor > 0 ? '+' : ''}${valor}`)
            .join(', ');
        if (texto) partes.push(texto);
    }

    if (bonus.pericias_penalidade && typeof bonus.pericias_penalidade === 'object') {
        const texto = Object.entries(bonus.pericias_penalidade)
            .map(([pericia, valor]) => `${pericia.charAt(0).toUpperCase() + pericia.slice(1).replace(/_/g, ' ')} ${valor}`)
            .join(', ');
        if (texto) partes.push(texto);
    }

    if (bonus.alma !== undefined) {
        return {
            label: 'Bônus de Perícias',
            texto: partes.length > 0 ? partes.join(' • ') : 'Sem bônus',
            alma: `Alma ${bonus.alma > 0 ? '+' : ''}${bonus.alma}`
        };
    }

    return {
        label: 'Bônus de Perícias',
        texto: partes.length > 0 ? partes.join(' • ') : 'Sem bônus'
    };
}

/**
 * Cria um card HTML para uma classe
 */
function createClasseCard(classe) {
    const card = document.createElement('div');
    card.className = 'data-card clickable-card';
    card.style.cursor = 'pointer';
    const descricaoResumo = getResumoClasse(classe.descricao || '');
    
    card.innerHTML = `
        <div class="data-card-header">
            <h3>${classe.nome}</h3>
        </div>
        <div class="data-card-body">
            <p class="data-description">${descricaoResumo}</p>
        </div>
    `;
    
    card.addEventListener('click', () => {
        navigateToDetail('classe', classe.id);
    });
    
    return card;
}

function getResumoClasse(descricao) {
    // Mostra apenas a parte introdutoria no card; bonus ficam no detalhe da classe.
    const marcadoresBonus = ['\n\nBônus ', '\n\nÔnus '];

    let corte = descricao.length;
    marcadoresBonus.forEach((marcador) => {
        const indice = descricao.indexOf(marcador);
        if (indice !== -1 && indice < corte) {
            corte = indice;
        }
    });

    return descricao.slice(0, corte).trim();
}

/**
 * Cria um card HTML para uma origem
 */
function createOrigemCard(origem) {
    const card = document.createElement('div');
    card.className = 'data-card clickable-card';
    card.style.cursor = 'pointer';
    
    const habilidades = origem.bonus?.habilidades || [];
    const equipamento = origem.bonus?.equipamento || 'N/A';
    const caracteristicas = origem.caracteristicas || [];
    
    card.innerHTML = `
        <div class="data-card-header">
            <h3>${origem.nome}</h3>
        </div>
        <div class="data-card-body">
            <p class="data-description">${origem.descricao}</p>
            ${habilidades.length > 0 ? `
                <div class="data-section">
                    <strong>Habilidades Bônus:</strong>
                    <div class="data-tags">
                        ${habilidades.map(h => `<span class="tag tag-skill">${h}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            <div class="data-info">
                <p><strong>Equipamento:</strong> ${equipamento}</p>
            </div>
            ${caracteristicas.length > 0 ? `
                <div class="data-section">
                    <strong>Características:</strong>
                    <div class="data-tags">
                        ${caracteristicas.map(c => `<span class="tag">${c}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => {
        navigateToDetail('origem', origem.id);
    });
    
    return card;
}

/**
 * Cria um link clicável para uma raça/classe/origem
 * @param {string} tipo - 'raca', 'classe' ou 'origem'
 * @param {string} id - ID do item
 * @param {string} texto - Texto a ser exibido
 */
function createDataLink(tipo, id, texto) {
    const link = document.createElement('a');
    link.href = '#';
    link.className = 'data-link';
    link.textContent = texto || id;
    link.addEventListener('click', (e) => {
        e.preventDefault();
        navigateToDetail(tipo, id);
    });
    return link;
}

// Exporta para uso global
window.Router = {
    init: initRouter,
    navigate: navigateToPage,
    navigateToDetail: navigateToDetail,
    getCurrentPage: () => currentPage,
    createDataLink: createDataLink
};
