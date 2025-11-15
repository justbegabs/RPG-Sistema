# Sistema de Itens - Deuses vs Humanos

Este diretório contém todos os arquivos JSON de itens do sistema RPG.

## Estrutura de Pastas

```
itens/
├── armas/          # Armas (espadas, arcos, cajados, etc.)
├── comuns/         # Itens comuns (equipamentos, consumíveis, ferramentas)
├── raca/           # Itens raciais (características naturais das raças)
├── classe/         # Itens de classe (equipamentos específicos)
└── origem/         # Itens de origem (ferramentas profissionais)
```

## Categorias de Itens

### 1. Armas (armas/)
Equipamentos de combate que causam dano.

**Exemplos**: Espada Longa, Arco Longo, Adaga, Cajado Arcano

**Campos principais**:
- `dano`: Dado de dano (1d8, 2d6, etc.)
- `tipoDano`: cortante, perfurante, concussão, mágico
- `alcance`: corpo a corpo, distância, arremesso
- `proficiencia`: armas simples ou marciais

### 2. Itens Comuns (comuns/)
Equipamentos gerais, consumíveis e ferramentas.

**Exemplos**: Poção de Cura, Corda de Seda, Kit de Ferramentas, Tocha, Mochila

**Tipos**:
- Equipamento: ferramentas, mochilas, cordas
- Consumível: poções, elixires, comida
- Ferramenta: kits especializados

### 3. Itens de Raça (raca/)
Características naturais específicas de cada raça.

**Exemplos**: Asas de Anjo, Presas de Vampiro, Cauda de Kitsune, Garras de Lobisomem

**Características**:
- Geralmente têm `peso: 0` (parte do corpo)
- `equipavel: false` (não podem ser removidos)
- Concedidos automaticamente pela raça

### 4. Itens de Classe (classe/)
Equipamentos essenciais para cada classe.

**Exemplos**: Grimório do Mago, Símbolo Sagrado, Kit de Armadilhas, Baralho Místico

**Características**:
- Necessários para habilidades de classe
- Concedem bônus específicos
- Podem ter propriedades únicas

### 5. Itens de Origem (origem/)
Ferramentas e equipamentos do passado do personagem.

**Exemplos**: Ferramentas Artísticas, Equipamento Militar, Laptop, Diário de Jornalista

**Características**:
- Refletem o background do personagem
- Ferramentas profissionais
- Bônus relacionados à experiência

## Estrutura Base de JSON

Todos os itens compartilham campos básicos:

```json
{
  "id": "identificador-unico",
  "nome": "Nome do Item",
  "tipo": "tipo-do-item",
  "categoria": "categoria-do-item",
  "descricao": "Descrição detalhada",
  "peso": 0,
  "funcao": "Função principal",
  "raridade": "comum|incomum|raro|muito raro|lendário",
  "preco": 0
}
```

## Campos Especiais

### Bônus
Alguns itens concedem bônus em atributos ou perícias:

```json
"bonus": {
  "inventario": 10,
  "pericias": {
    "nome-pericia": 2
  },
  "cura": 1
}
```

### Dano (para armas)
```json
"dano": "1d8",
"tipoDano": "cortante"
```

### Propriedades
Array com características especiais:

```json
"propriedades": ["Versátil", "Duas mãos", "Leve"]
```

## Raridades

- **Comum**: Itens básicos, facilmente encontrados
- **Incomum**: Itens de qualidade superior
- **Raro**: Itens especiais com propriedades únicas
- **Muito Raro**: Itens poderosos, difíceis de obter
- **Lendário**: Itens únicos com poder extraordinário

## Peso e Inventário

- O campo `peso` indica quantos espaços o item ocupa no inventário
- Capacidade base do inventário: `Força × 2 + 3 + Bônus de Bolsa`
- Itens raciais geralmente têm `peso: 0` (características naturais)

## Como Adicionar Novos Itens

1. Escolha a categoria apropriada
2. Crie um arquivo JSON com nome em kebab-case (ex: `espada-flamejante.json`)
3. Use o `id` igual ao nome do arquivo (sem extensão)
4. Preencha todos os campos obrigatórios
5. Adicione campos opcionais conforme necessário
6. Teste no sistema para garantir que funciona

## Integração com o Sistema

Os itens são carregados automaticamente pelo sistema de inventário e podem ser:
- Adicionados manualmente pelo jogador
- Concedidos automaticamente por raça/classe/origem
- Encontrados durante aventuras
- Comprados em lojas (usando o campo `preco`)

## Consulte os READMEs de Cada Pasta

Cada subpasta possui um README.md com detalhes específicos sobre aquela categoria de itens.
