# Plano de Arquitetura do Aplicativo de Gestão de Empréstimos

## 1. Esquema do Banco de Dados

### Clientes (Clients)
- `id` (PK, UUID)
- `nome` (String)
- `cpf_cnpj` (String, único)
- `email` (String, opcional)
- `telefone` (String, opcional)
- `endereco` (String, opcional)
- `data_cadastro` (Timestamp)

### Empréstimos (Loans)
- `id` (PK, UUID)
- `cliente_id` (FK para Clientes.id)
- `valor_emprestado` (Decimal)
- `data_emprestimo` (Date)
- `taxa_juros` (Decimal, e.g., 0.05 para 5%)
- `numero_parcelas` (Integer)
- `valor_parcela` (Decimal)
- `data_primeira_parcela` (Date)
- `status` (String: 'ativo', 'quitado', 'atrasado')
- `observacoes` (Text, opcional)

### Parcelas (Installments)
- `id` (PK, UUID)
- `emprestimo_id` (FK para Empréstimos.id)
- `numero_parcela` (Integer)
- `valor_original` (Decimal)
- `valor_pago` (Decimal, default 0)
- `data_vencimento` (Date)
- `data_pagamento` (Date, opcional)
- `status` (String: 'pendente', 'pago', 'atrasado', 'adiantado')
- `multa_juros_atraso` (Decimal, opcional)

### Faturas (Invoices)
- `id` (PK, UUID)
- `cliente_id` (FK para Clientes.id)
- `emprestimo_id` (FK para Empréstimos.id, opcional, para faturas específicas de empréstimos)
- `data_emissao` (Date)
- `data_vencimento` (Date)
- `valor_total` (Decimal)
- `status` (String: 'emitida', 'paga', 'cancelada')
- `itens_fatura` (JSON/Text, para detalhes dos itens faturados, e.g., parcelas)

## 2. Endpoints da API (Flask RESTful)

### Clientes
- `GET /api/clientes`: Listar todos os clientes
- `POST /api/clientes`: Criar um novo cliente
- `GET /api/clientes/<id>`: Obter detalhes de um cliente
- `PUT /api/clientes/<id>`: Atualizar informações de um cliente
- `DELETE /api/clientes/<id>`: Excluir um cliente

### Empréstimos
- `GET /api/emprestimos`: Listar todos os empréstimos
- `POST /api/emprestimos`: Criar um novo empréstimo (calcula parcelas automaticamente)
- `GET /api/emprestimos/<id>`: Obter detalhes de um empréstimo (inclui parcelas)
- `PUT /api/emprestimos/<id>`: Atualizar informações de um empréstimo
- `DELETE /api/emprestimos/<id>`: Excluir um empréstimo
- `GET /api/clientes/<cliente_id>/emprestimos`: Listar empréstimos de um cliente específico

### Parcelas
- `GET /api/emprestimos/<emprestimo_id>/parcelas`: Listar parcelas de um empréstimo
- `POST /api/parcelas/<id>/pagar`: Registrar pagamento de uma parcela
- `POST /api/emprestimos/<emprestimo_id>/adiantar_parcelas`: Adiantar pagamento de parcelas (especificar quantidade ou valor)

### Faturas
- `GET /api/faturas`: Listar todas as faturas
- `POST /api/faturas`: Emitir uma nova fatura (pode ser para uma ou mais parcelas)
- `GET /api/faturas/<id>`: Obter detalhes de uma fatura
- `GET /api/clientes/<cliente_id>/faturas`: Listar faturas de um cliente específico
- `PUT /api/faturas/<id>/status`: Atualizar status da fatura (e.g., 'paga')

