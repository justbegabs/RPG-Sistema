/**
 * Sistema de API para Fichas de RPG
 * Gerencia requisições POST e GET para o sistema de fichas
 */

// URL da API - Altere para sua URL de servidor
const API_URL = 'http://localhost:3000/api/fichas';
// Fallback: usar localStorage se a API não estiver disponível
const USE_LOCAL_STORAGE = true;

/**
 * Função para fazer POST de uma ficha de personagem
 * @param {Object} ficha - Objeto com os dados da ficha
 * @returns {Promise} - Promise com a resposta da API
 */
async function postFicha(ficha) {
    try {
        // Validação básica
        if (!ficha.nome || !ficha.classe || !ficha.raca) {
            throw new Error('Campos obrigatórios não preenchidos');
        }

        // Adiciona timestamp e ID único
        const fichaCompleta = {
            ...ficha,
            id: generateId(),
            dataCriacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        // Se estiver usando localStorage (fallback)
        if (USE_LOCAL_STORAGE) {
            return await postFichaLocalStorage(fichaCompleta);
        }

        // Requisição POST para a API
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(fichaCompleta)
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data,
            message: 'Ficha salva com sucesso!'
        };

    } catch (error) {
        console.error('Erro ao salvar ficha:', error);
        
        // Tenta usar localStorage como fallback
        if (!USE_LOCAL_STORAGE) {
            try {
                return await postFichaLocalStorage(ficha);
            } catch (localError) {
                return {
                    success: false,
                    error: error.message,
                    message: 'Erro ao salvar ficha. Verifique sua conexão.'
                };
            }
        }

        return {
            success: false,
            error: error.message,
            message: 'Erro ao salvar ficha: ' + error.message
        };
    }
}

/**
 * Salva ficha no localStorage (fallback/local)
 * @param {Object} ficha - Objeto com os dados da ficha
 * @returns {Promise} - Promise com o resultado
 */
async function postFichaLocalStorage(ficha) {
    return new Promise((resolve, reject) => {
        try {
            // Recupera fichas existentes
            const fichas = getFichasLocalStorage();
            
            // Adiciona nova ficha
            fichas.push(ficha);
            
            // Salva no localStorage
            localStorage.setItem('rpg_fichas', JSON.stringify(fichas));
            
            resolve({
                success: true,
                data: ficha,
                message: 'Ficha salva com sucesso no armazenamento local!'
            });
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Busca todas as fichas
 * @returns {Promise} - Promise com a lista de fichas
 */
async function getFichas() {
    try {
        // Se estiver usando localStorage
        if (USE_LOCAL_STORAGE) {
            return {
                success: true,
                data: getFichasLocalStorage()
            };
        }

        // Requisição GET para a API
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };

    } catch (error) {
        console.error('Erro ao buscar fichas:', error);
        
        // Tenta usar localStorage como fallback
        try {
            return {
                success: true,
                data: getFichasLocalStorage()
            };
        } catch (localError) {
            return {
                success: false,
                error: error.message,
                data: []
            };
        }
    }
}

/**
 * Busca uma ficha específica por ID
 * @param {string} id - ID da ficha
 * @returns {Promise} - Promise com os dados da ficha
 */
async function getFichaById(id) {
    try {
        if (USE_LOCAL_STORAGE) {
            const fichas = getFichasLocalStorage();
            const ficha = fichas.find(f => f.id === id);
            
            if (!ficha) {
                throw new Error('Ficha não encontrada');
            }
            
            return {
                success: true,
                data: ficha
            };
        }

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        const data = await response.json();
        return {
            success: true,
            data: data
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Deleta uma ficha por ID
 * @param {string} id - ID da ficha
 * @returns {Promise} - Promise com o resultado
 */
async function deleteFicha(id) {
    try {
        if (USE_LOCAL_STORAGE) {
            const fichas = getFichasLocalStorage();
            const fichasFiltradas = fichas.filter(f => f.id !== id);
            localStorage.setItem('rpg_fichas', JSON.stringify(fichasFiltradas));
            
            return {
                success: true,
                message: 'Ficha deletada com sucesso!'
            };
        }

        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`Erro na requisição: ${response.status}`);
        }

        return {
            success: true,
            message: 'Ficha deletada com sucesso!'
        };

    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

/**
 * Funções auxiliares para localStorage
 */
function getFichasLocalStorage() {
    try {
        const fichasJson = localStorage.getItem('rpg_fichas');
        return fichasJson ? JSON.parse(fichasJson) : [];
    } catch (error) {
        console.error('Erro ao ler localStorage:', error);
        return [];
    }
}

/**
 * Gera um ID único para a ficha
 * @returns {string} - ID único
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

