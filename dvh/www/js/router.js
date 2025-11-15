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
            if (sidebar) {
                sidebar.classList.toggle('active');
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

    // Carrega a página inicial
    navigateToPage('home');
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
        // Página home: mostra barra inferior sempre visível, esconde sidebar
        if (bottomNav) {
            bottomNav.style.display = 'block';
            // Remove a classe hidden se estiver presente e garante que está visível
            bottomNav.classList.remove('nav-hidden');
            // Força a barra a ficar visível
            bottomNav.style.transform = 'translateY(0)';
            bottomNav.style.opacity = '1';
        }
        // Atualiza o fundo do body para o tema escuro
        document.body.style.background = 'linear-gradient(135deg, #0a1929 0%, #1a3a5a 50%, #0f2537 100%)';
        if (sidebar) {
            sidebar.style.display = 'none';
        }
        if (menuToggle) {
            menuToggle.style.display = 'none';
        }
        if (mainContent) {
            mainContent.style.marginLeft = '0';
        }
        // Scroll para o topo quando voltar para home
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        // Restaura o fundo padrão do body nas outras páginas
        document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        // Outras páginas: esconde barra inferior, mostra sidebar
        if (bottomNav) {
            bottomNav.style.display = 'none';
        }
        if (sidebar) {
            sidebar.style.display = 'block';
        }
        if (menuToggle) {
            menuToggle.style.display = 'block';
        }
        if (mainContent && window.innerWidth > 768) {
            mainContent.style.marginLeft = '280px';
        } else if (mainContent) {
            mainContent.style.marginLeft = '0';
        }
    }

    // Fecha o menu mobile após navegação
    if (sidebar && window.innerWidth <= 768) {
        sidebar.classList.remove('active');
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

    const bonus = raca.bonus?.traduzido || {};
    const bonusTexto = raca.bonus?.atributos || 'Sem bônus';
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
                    <h3>⚡ Bônus de Atributos</h3>
                    <p class="detail-info"><strong>${bonusTexto}</strong></p>
                    ${Object.keys(bonus).length > 0 ? `
                        <div class="bonus-grid">
                            ${Object.entries(bonus).map(([attr, valor]) => {
                                const nomeAtributo = attr.charAt(0).toUpperCase() + attr.slice(1);
                                return `
                                    <div class="bonus-item">
                                        <span class="bonus-label">${nomeAtributo}</span>
                                        <span class="bonus-value ${valor > 0 ? 'positive' : valor < 0 ? 'negative' : ''}">
                                            ${valor > 0 ? '+' : ''}${valor}
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                </div>

                ${caracteristicas.length > 0 ? `
                    <div class="detail-section">
                        <h3>✨ Características</h3>
                        <div class="detail-tags">
                            ${caracteristicas.map(c => `<span class="tag tag-feature">${c}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
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

    const habilidades = classe.habilidades || [];
    const proficiencias = classe.proficiencias || [];
    const atributoPrincipal = classe.atributoPrincipal || 'N/A';

    content.innerHTML = `
        <div class="detail-card">
            <div class="detail-header" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <h1>${classe.nome}</h1>
                <span class="detail-badge">${classe.dadosVida || 'N/A'}</span>
            </div>
            <div class="detail-body">
                <div class="detail-section">
                    <h3>📖 Descrição</h3>
                    <p class="detail-description">${classe.descricao}</p>
                </div>

                <div class="detail-info-grid">
                    <div class="info-item">
                        <strong>Atributo Principal</strong>
                        <span>${atributoPrincipal.charAt(0).toUpperCase() + atributoPrincipal.slice(1)}</span>
                    </div>
                    <div class="info-item">
                        <strong>Dados de Vida</strong>
                        <span>${classe.dadosVida || 'N/A'}</span>
                    </div>
                </div>

                ${habilidades.length > 0 ? `
                    <div class="detail-section">
                        <h3>✨ Habilidades</h3>
                        <div class="detail-tags">
                            ${habilidades.map(h => `<span class="tag tag-skill">${h}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}

                ${proficiencias.length > 0 ? `
                    <div class="detail-section">
                        <h3>🎯 Proficiências</h3>
                        <div class="detail-tags">
                            ${proficiencias.map(p => `<span class="tag tag-proficiency">${p}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
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

                ${caracteristicas.length > 0 ? `
                    <div class="detail-section">
                        <h3>⭐ Características</h3>
                        <div class="detail-tags">
                            ${caracteristicas.map(c => `<span class="tag tag-feature">${c}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
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
    
    const bonusTexto = raca.bonus?.atributos || 'Sem bônus';
    const caracteristicas = raca.caracteristicas || [];
    
    card.innerHTML = `
        <div class="data-card-header">
            <h3>${raca.nome}</h3>
        </div>
        <div class="data-card-body">
            <p class="data-description">${raca.descricao}</p>
            <div class="data-info">
                <p><strong>Bônus de Atributos:</strong> ${bonusTexto}</p>
            </div>
            ${caracteristicas.length > 0 ? `
                <div class="data-tags">
                    ${caracteristicas.map(c => `<span class="tag">${c}</span>`).join('')}
                </div>
            ` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => {
        navigateToDetail('raca', raca.id);
    });
    
    return card;
}

/**
 * Cria um card HTML para uma classe
 */
function createClasseCard(classe) {
    const card = document.createElement('div');
    card.className = 'data-card clickable-card';
    card.style.cursor = 'pointer';
    
    const habilidades = classe.habilidades || [];
    const proficiencias = classe.proficiencias || [];
    const atributoPrincipal = classe.atributoPrincipal || 'N/A';
    
    card.innerHTML = `
        <div class="data-card-header">
            <h3>${classe.nome}</h3>
            <span class="data-badge">${classe.dadosVida || 'N/A'}</span>
        </div>
        <div class="data-card-body">
            <p class="data-description">${classe.descricao}</p>
            <div class="data-info">
                <p><strong>Atributo Principal:</strong> ${atributoPrincipal.charAt(0).toUpperCase() + atributoPrincipal.slice(1)}</p>
                <p><strong>Dados de Vida:</strong> ${classe.dadosVida || 'N/A'}</p>
            </div>
            ${habilidades.length > 0 ? `
                <div class="data-section">
                    <strong>Habilidades:</strong>
                    <div class="data-tags">
                        ${habilidades.map(h => `<span class="tag tag-skill">${h}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
            ${proficiencias.length > 0 ? `
                <div class="data-section">
                    <strong>Proficiências:</strong>
                    <div class="data-tags">
                        ${proficiencias.map(p => `<span class="tag tag-proficiency">${p}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        </div>
    `;
    
    card.addEventListener('click', () => {
        navigateToDetail('classe', classe.id);
    });
    
    return card;
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
