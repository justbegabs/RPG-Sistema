# Itens Comuns

Esta pasta contém os arquivos JSON de itens comuns (equipamentos gerais, consumíveis, ferramentas).

## Estrutura do JSON

```json
{
  "id": "identificador-unico",
  "nome": "Nome do Item",
  "tipo": "equipamento|consumível|ferramenta",
  "categoria": "itens-comuns",
  "descricao": "Descrição do item",
  "peso": 0,
  "funcao": "Função principal do item",
  "efeito": "Efeito quando usado (para consumíveis)",
  "bonus": {
    "inventario": 0,
    "pericias": {
      "nome-pericia": 0
    }
  },
  "raridade": "comum|incomum|raro|muito raro|lendário",
  "preco": 0
}
```

## Tipos de Itens Comuns

- **Equipamento**: Ferramentas, mochilas, cordas, tochas, etc.
- **Consumível**: Poções, elixires, comida, bebidas mágicas
- **Ferramenta**: Kits especializados, instrumentos

## Campos Especiais

- `bonus.inventario`: Aumenta a capacidade de inventário (mochilas, bolsas)
- `efeito`: Descrição do efeito (principalmente para consumíveis)
- `usos`: Número de usos ou duração
