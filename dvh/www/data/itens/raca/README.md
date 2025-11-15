# Itens de Raça

Esta pasta contém os arquivos JSON de itens específicos de cada raça.

## Estrutura do JSON

```json
{
  "id": "identificador-unico",
  "nome": "Nome do Item",
  "tipo": "característica racial",
  "categoria": "itens-raca",
  "raca": "id-da-raca",
  "descricao": "Descrição do item",
  "peso": 0,
  "funcao": "Função ou habilidade concedida",
  "dano": "XdY",
  "tipoDano": "tipo-de-dano",
  "propriedades": ["Lista", "de", "propriedades"],
  "raridade": "geralmente lendário",
  "equipavel": false
}
```

## Características

- Itens raciais geralmente têm `peso: 0` (características naturais)
- `equipavel: false` indica que é parte do personagem
- São concedidos automaticamente pela raça escolhida

## Exemplos

- Asas de Anjo
- Presas de Vampiro
- Cauda de Kitsune
- Garras de Lobisomem
