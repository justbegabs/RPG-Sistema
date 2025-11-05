# Sistema de Fichas RPG - Deuses versus Humanos

Sistema completo de gerenciamento de fichas de personagens para RPG com funcionalidade POST em JavaScript.

## 🎲 Características

- ✅ Formulário completo para criação de fichas de personagem
- ✅ Sistema POST em JavaScript para salvar fichas
- ✅ Interface moderna e responsiva
- ✅ Listagem de fichas criadas
- ✅ Exclusão de fichas
- ✅ Armazenamento local (localStorage) ou API REST
- ✅ Suporte a Cordova/Android

## 📋 Funcionalidades

### Criação de Fichas
- Nome do personagem
- Classe e Raça
- Nível (1-20)
- Atributos: Força, Destreza, Constituição, Inteligência, Sabedoria, Carisma
- Pontos de Vida e Mana
- História do personagem

### Sistema de Armazenamento
- **LocalStorage**: Funciona offline, armazena no navegador
- **API REST**: Conecta-se a um servidor backend (opcional)

## 🚀 Como Usar

### Modo LocalStorage (Padrão)

1. Abra o arquivo `www/index.html` no navegador
2. Preencha o formulário de criação de ficha
3. Clique em "Salvar Ficha"
4. As fichas são salvas automaticamente no localStorage do navegador

### Modo API REST (Opcional)

1. Instale o Node.js: https://nodejs.org/
2. Instale as dependências:
   ```bash
   npm install express cors
   ```
3. Execute o servidor de exemplo:
   ```bash
   node server-exemplo.js
   ```
4. Edite o arquivo `www/js/api.js`:
   - Altere `USE_LOCAL_STORAGE` para `false`
   - Altere `API_URL` para `'http://localhost:3000/api/fichas'`
5. Abra o arquivo `www/index.html` no navegador

## 📁 Estrutura de Arquivos

```
dvh/
├── www/
│   ├── index.html          # Interface principal
│   ├── css/
│   │   └── index.css       # Estilos modernos
│   └── js/
│       ├── index.js        # Lógica principal
│       └── api.js          # Funções POST/GET
├── server-exemplo.js       # Servidor Node.js de exemplo
└── README.md              # Este arquivo
```

## 🔧 Configuração da API

### Usando LocalStorage (Padrão)

No arquivo `www/js/api.js`, a configuração padrão é:
```javascript
const USE_LOCAL_STORAGE = true;
```

### Usando API REST

No arquivo `www/js/api.js`, altere para:
```javascript
const USE_LOCAL_STORAGE = false;
const API_URL = 'http://localhost:3000/api/fichas'; // Sua URL da API
```

## 📡 Endpoints da API

Se você usar um servidor backend, os endpoints esperados são:

- `GET /api/fichas` - Lista todas as fichas
- `GET /api/fichas/:id` - Busca uma ficha específica
- `POST /api/fichas` - Cria uma nova ficha
- `PUT /api/fichas/:id` - Atualiza uma ficha
- `DELETE /api/fichas/:id` - Deleta uma ficha

## 🎨 Interface

A interface possui:
- **Aba Criar Ficha**: Formulário completo para criação
- **Aba Listar Fichas**: Visualização de todas as fichas criadas
- **Design Responsivo**: Funciona em desktop e mobile
- **Tema Dark Mode**: Suporte automático a tema escuro

## 📱 Uso com Cordova

Este projeto já está configurado para Cordova/Android. Para compilar:

```bash
cd dvh
cordova build android
```

## 🔒 Segurança

- Validação de campos obrigatórios
- Sanitização básica de dados
- Tratamento de erros
- Fallback para localStorage se a API falhar

## 📝 Exemplo de Dados de Ficha

```json
{
  "id": "abc123",
  "nome": "Aragorn",
  "classe": "Guerreiro",
  "raca": "Humano",
  "nivel": 5,
  "forca": 16,
  "destreza": 14,
  "constituicao": 15,
  "inteligencia": 12,
  "sabedoria": 13,
  "carisma": 11,
  "vida": 45,
  "mana": 0,
  "historia": "Um guerreiro valente...",
  "dataCriacao": "2024-01-01T00:00:00.000Z",
  "dataAtualizacao": "2024-01-01T00:00:00.000Z"
}
```

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (com Grid e Flexbox)
- JavaScript (ES6+)
- Fetch API (para requisições HTTP)
- LocalStorage API
- Express.js (servidor de exemplo)

## 📄 Licença

Este projeto está sob a licença Apache 2.0.

