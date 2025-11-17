/**
 * Exemplo de Servidor Node.js para o Sistema de Fichas RPG
 * 
 * Para usar este servidor:
 * 1. Instale o Node.js: https://nodejs.org/
 * 2. Instale as dependências: npm install express cors
 * 3. Execute: node server-exemplo.js
 * 4. Altere a constante API_URL no arquivo api.js para: 'http://localhost:3000/api/fichas'
 * 5. Altere USE_LOCAL_STORAGE para false no arquivo api.js
 */

const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'fichas.json');

// Middleware
app.use(cors());
app.use(express.json());
// Servir arquivos estáticos da pasta www para uso no navegador/OBS
app.use(express.static(path.join(__dirname, 'www')));

// Inicializa arquivo de dados se não existir
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Função auxiliar para ler fichas
function readFichas() {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Erro ao ler arquivo:', error);
        return [];
    }
}

// Função auxiliar para salvar fichas
function saveFichas(fichas) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(fichas, null, 2));
        return true;
    } catch (error) {
        console.error('Erro ao salvar arquivo:', error);
        return false;
    }
}

// ROTAS

// GET - Listar todas as fichas
app.get('/api/fichas', (req, res) => {
    try {
        const fichas = readFichas();
        res.json(fichas);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar fichas', message: error.message });
    }
});

// GET - Buscar ficha por ID
app.get('/api/fichas/:id', (req, res) => {
    try {
        const fichas = readFichas();
        const ficha = fichas.find(f => f.id === req.params.id);
        
        if (!ficha) {
            return res.status(404).json({ error: 'Ficha não encontrada' });
        }
        
        res.json(ficha);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar ficha', message: error.message });
    }
});

// POST - Criar nova ficha
app.post('/api/fichas', (req, res) => {
    try {
        const fichas = readFichas();
        const novaFicha = {
            ...req.body,
            id: req.body.id || Date.now().toString(36) + Math.random().toString(36).substr(2),
            dataCriacao: req.body.dataCriacao || new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };
        
        fichas.push(novaFicha);
        saveFichas(fichas);
        
        res.status(201).json(novaFicha);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar ficha', message: error.message });
    }
});

// PUT - Atualizar ficha
app.put('/api/fichas/:id', (req, res) => {
    try {
        const fichas = readFichas();
        const index = fichas.findIndex(f => f.id === req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Ficha não encontrada' });
        }
        
        fichas[index] = {
            ...fichas[index],
            ...req.body,
            id: req.params.id,
            dataAtualizacao: new Date().toISOString()
        };
        
        saveFichas(fichas);
        res.json(fichas[index]);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar ficha', message: error.message });
    }
});

// DELETE - Deletar ficha
app.delete('/api/fichas/:id', (req, res) => {
    try {
        const fichas = readFichas();
        const fichasFiltradas = fichas.filter(f => f.id !== req.params.id);
        
        if (fichas.length === fichasFiltradas.length) {
            return res.status(404).json({ error: 'Ficha não encontrada' });
        }
        
        saveFichas(fichasFiltradas);
        res.json({ message: 'Ficha deletada com sucesso' });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar ficha', message: error.message });
    }
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor de Fichas RPG rodando em http://localhost:${PORT}`);
    console.log(`📝 API disponível em http://localhost:${PORT}/api/fichas`);
});

