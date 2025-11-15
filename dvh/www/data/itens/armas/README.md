# Armas

Esta pasta contém os arquivos JSON de armas disponíveis no sistema.

## Estrutura do JSON

```json
{
  "id": "identificador-unico",
  "nome": "Nome da Arma",
  "tipo": "arma",
  "categoria": "armas",
  "descricao": "Descrição da arma",
  "peso": 0,
  "dano": "XdY",
  "tipoDano": "cortante|perfurante|concussão|mágico|necrótico",
  "alcance": "corpo a corpo|distância (X/Y pés)|arremesso (X/Y)",
  "proficiencia": "armas simples|armas marciais",
  "propriedades": ["Lista", "de", "propriedades"],
  "raridade": "comum|incomum|raro|muito raro|lendário",
  "preco": 0
}
```

## Campos Obrigatórios

- `id`: Identificador único (kebab-case)
- `nome`: Nome da arma
- `tipo`: Sempre "arma"
- `categoria`: Sempre "armas"
- `peso`: Peso em espaços de inventário
- `raridade`: Nível de raridade

## Campos Opcionais

- `dano`: Dado de dano (ex: 1d8, 2d6)
- `tipoDano`: Tipo de dano causado
- `alcance`: Alcance do ataque
- `proficiencia`: Proficiência necessária
- `propriedades`: Array com propriedades especiais
- `preco`: Preço em moedas de ouro
