# Itens de Classe

Esta pasta contém os arquivos JSON de itens específicos de cada classe.

## Estrutura do JSON

```json
{
  "id": "identificador-unico",
  "nome": "Nome do Item",
  "tipo": "equipamento de classe",
  "categoria": "itens-classe",
  "classe": "id-da-classe",
  "descricao": "Descrição do item",
  "peso": 0,
  "funcao": "Função do item",
  "bonus": {
    "pericias": {
      "nome-pericia": 0
    },
    "cura": 0
  },
  "propriedades": ["Lista", "de", "propriedades"],
  "raridade": "comum|incomum|raro|muito raro|lendário",
  "preco": 0
}
```

## Características

- Equipamentos essenciais para a classe funcionar
- Geralmente concedem bônus em perícias relacionadas
- Podem ter propriedades únicas da classe

## Exemplos por Classe

- **Mago**: Grimório, Cajado Arcano, Varinha
- **Clérigo**: Símbolo Sagrado, Água Benta
- **Armadilheiro**: Kit de Armadilhas
- **Carteado**: Baralho Místico
- **Tecnológico**: Kit Tecnológico, Gadgets
