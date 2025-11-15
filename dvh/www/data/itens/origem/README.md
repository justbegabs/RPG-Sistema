# Itens de Origem

Esta pasta contém os arquivos JSON de itens específicos de cada origem.

## Estrutura do JSON

```json
{
  "id": "identificador-unico",
  "nome": "Nome do Item",
  "tipo": "equipamento de origem",
  "categoria": "itens-origem",
  "origem": "id-da-origem",
  "descricao": "Descrição do item",
  "peso": 0,
  "funcao": "Função do item",
  "bonus": {
    "pericias": {
      "nome-pericia": 0
    }
  },
  "propriedades": ["Lista", "de", "propriedades"],
  "raridade": "comum|incomum|raro",
  "preco": 0
}
```

## Características

- Itens que refletem o passado e background do personagem
- Geralmente equipamentos profissionais ou ferramentas de ofício
- Concedem bônus relacionados às experiências da origem

## Exemplos por Origem

- **Artista**: Ferramentas Artísticas, Instrumentos
- **Militar**: Equipamento Militar, Insígnias
- **Programador**: Laptop, Softwares
- **Jornalista**: Diário, Câmera, Gravador
- **Eremita**: Kit de Sobrevivência
- **Inventor**: Ferramentas de Engenharia
