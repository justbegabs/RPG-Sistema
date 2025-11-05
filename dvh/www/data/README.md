# Estrutura de Dados - Sistema de Fichas RPG

Este diretório contém os dados de classes, raças e origens em arquivos JSON individuais.

## 📁 Estrutura de Pastas

```
data/
├── classes/          # Arquivos JSON individuais para cada classe
├── racas/            # Arquivos JSON individuais para cada raça
└── origens/          # Arquivos JSON individuais para cada origem
```

## 📝 Como Adicionar Novos Itens

### Adicionar uma Nova Classe

1. Crie um novo arquivo JSON na pasta `classes/` com o nome da classe (ex: `ninja.json`)
2. Adicione o arquivo na lista `ARQUIVOS_CLASSES` em `js/data-loader.js`
3. O sistema carregará automaticamente o novo arquivo

**Exemplo de arquivo `classes/ninja.json`:**

```json
{
  "id": "ninja",
  "nome": "Ninja",
  "descricao": "Assassino furtivo especializado em artes marciais e técnicas secretas.",
  "atributoPrincipal": "destreza",
  "habilidades": ["Furtividade", "Artemarciais", "Ataques rápidos"],
  "dadosVida": "1d8",
  "proficiencias": ["Armas simples", "Armas corpo a corpo", "Armaduras leves"]
}
```

### Adicionar uma Nova Raça

1. Crie um novo arquivo JSON na pasta `racas/` com o nome da raça (ex: `goblin.json`)
2. Adicione o arquivo na lista `ARQUIVOS_RACAS` em `js/data-loader.js`
3. O sistema carregará automaticamente o novo arquivo

**Exemplo de arquivo `racas/goblin.json`:**

```json
{
  "id": "goblin",
  "nome": "Goblin",
  "descricao": "Pequena criatura astuta e trapaceira.",
  "bonus": {
    "atributos": "Destreza +2, Constituição +1",
    "traduzido": {
      "destreza": 2,
      "constituicao": 1
    }
  },
  "caracteristicas": ["Tamanho pequeno", "Furtividade", "Astúcia"]
}
```

### Adicionar uma Nova Origem

1. Crie um novo arquivo JSON na pasta `origens/` com o nome da origem (ex: `pirata.json`)
2. Adicione o arquivo na lista `ARQUIVOS_ORIGENS` em `js/data-loader.js`
3. O sistema carregará automaticamente o novo arquivo

**Exemplo de arquivo `origens/pirata.json`:**

```json
{
  "id": "pirata",
  "nome": "Pirata",
  "descricao": "Viveu no mar, conhecendo navegação e combate naval.",
  "bonus": {
    "habilidades": ["Navegação", "Atletismo"],
    "equipamento": "Equipamento náutico, arma naval, moedas"
  },
  "caracteristicas": ["Conhecimento náutico", "Combate naval", "Navegação"]
}
```

## 🔧 Atualizando o data-loader.js

Após criar um novo arquivo JSON, você precisa adicioná-lo à lista correspondente em `js/data-loader.js`:

```javascript
// Para classes
const ARQUIVOS_CLASSES = [
    'guerreiro.json',
    'mago.json',
    // ... outros arquivos
    'ninja.json'  // ← Adicione aqui
];

// Para raças
const ARQUIVOS_RACAS = [
    'humano.json',
    'elfo.json',
    // ... outros arquivos
    'goblin.json'  // ← Adicione aqui
];

// Para origens
const ARQUIVOS_ORIGENS = [
    'nobre.json',
    'plebeu.json',
    // ... outros arquivos
    'pirata.json'  // ← Adicione aqui
];
```

## 📋 Estrutura de Campos

### Classe (classes/*.json)
- `id` (string): Identificador único (usar o nome do arquivo sem .json)
- `nome` (string): Nome da classe
- `descricao` (string): Descrição da classe
- `atributoPrincipal` (string): Atributo principal (forca, destreza, constituicao, inteligencia, sabedoria, carisma)
- `habilidades` (array): Lista de habilidades
- `dadosVida` (string): Dados de vida (ex: "1d10")
- `proficiencias` (array): Lista de proficiências

### Raça (racas/*.json)
- `id` (string): Identificador único
- `nome` (string): Nome da raça
- `descricao` (string): Descrição da raça
- `bonus.atributos` (string): Descrição textual dos bônus
- `bonus.traduzido` (object): Bônus numéricos por atributo
- `caracteristicas` (array): Lista de características

### Origem (origens/*.json)
- `id` (string): Identificador único
- `nome` (string): Nome da origem
- `descricao` (string): Descrição da origem
- `bonus.habilidades` (array): Lista de habilidades bônus
- `bonus.equipamento` (string): Equipamento inicial
- `caracteristicas` (array): Lista de características

## ✅ Validação

Certifique-se de que:
- O arquivo JSON está bem formatado
- O `id` corresponde ao nome do arquivo (sem .json)
- Todos os campos obrigatórios estão presentes
- O arquivo foi adicionado à lista no `data-loader.js`

## 🚀 Como Funciona

1. O sistema carrega todos os arquivos listados em `data-loader.js`
2. Os dados são armazenados em cache
3. Os selects do formulário são populados automaticamente
4. Os dados completos são salvos junto com a ficha

## 📝 Notas

- Os arquivos são carregados em ordem alfabética
- Novos arquivos aparecerão automaticamente nos selects após atualizar `data-loader.js`
- Os dados são carregados na inicialização da página
- Erros de carregamento são logados no console

