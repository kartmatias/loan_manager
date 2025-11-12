# Refatoração: Controle e Geração de Faturas por Parcela

## Resumo das Alterações

O sistema de gestão de empréstimos foi refatorado para incluir a funcionalidade de **geração de faturas por parcela individual**, permitindo o registro de pagamentos específicos para cada parcela de um empréstimo.

## Principais Mudanças Implementadas

### 1. Backend (Flask API)

#### Modelo de Parcelas (`src/models/installment.py`)
- **Adicionado**: Relacionamento `faturas` para vincular múltiplas faturas a uma parcela
- **Funcionalidade**: Uma parcela pode ter várias faturas associadas (histórico de pagamentos)

```python
faturas = db.relationship('Invoice', backref='parcela', lazy=True, cascade='all, delete-orphan')
```

#### Modelo de Faturas (`src/models/invoice.py`)
- **Adicionado**: Campo `parcela_id` para vincular fatura a uma parcela específica
- **Funcionalidade**: Cada fatura pode ser associada a uma parcela individual
- **Atualizado**: Método `to_dict()` para incluir informações da parcela

```python
parcela_id = db.Column(db.String(36), db.ForeignKey('installments.id'), nullable=True)
```

#### Novo Endpoint API (`src/routes/installment_invoice.py`)
- **Rota**: `POST /api/parcelas/<parcela_id>/fatura`
- **Funcionalidade**: Gera fatura específica para uma parcela
- **Parâmetros**:
  - `parcela_id`: ID da parcela para gerar fatura
  - `descricao` (opcional): Descrição personalizada da fatura
  - `observacoes` (opcional): Observações adicionais

**Exemplo de requisição**:
```bash
curl -X POST http://localhost:5000/api/parcelas/<ID_PARCELA>/fatura \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Pagamento da parcela 1/5",
    "observacoes": "Pagamento em dia"
  }'
```

**Resposta**:
```json
{
  "id": "uuid-da-fatura",
  "emprestimo_id": "uuid-do-emprestimo",
  "parcela_id": "uuid-da-parcela",
  "cliente_id": "uuid-do-cliente",
  "valor_total": 1000.00,
  "descricao": "Pagamento da parcela 1/5",
  "status": "pendente",
  "data_emissao": "2025-10-13",
  "data_vencimento": "2025-11-12"
}
```

### 2. Frontend (React)

#### Componente de Empréstimos (`src/components/Loans.jsx`)

**Adicionado**: Botão "Gerar Fatura" para cada parcela no modal de detalhes do empréstimo

**Funcionalidade**:
- Exibe lista de parcelas com status (Paga/Pendente)
- Botão individual para gerar fatura de cada parcela
- Feedback visual ao gerar fatura
- Atualização automática da lista após geração

**Interface**:
```
Parcela 1/5
Valor: R$ 1.000,00
Vencimento: 12/11/2025
Status: Pendente
[Gerar Fatura] [Marcar como Paga]
```

#### Componente de Faturas (`src/components/Invoices.jsx`)

**Atualizado**: Exibição de faturas com indicação de parcela

**Funcionalidade**:
- Mostra número da parcela associada à fatura
- Exibe informações completas da fatura
- Permite visualizar e gerenciar faturas por parcela

**Interface**:
```
Fatura #001
Cliente: João Silva
Valor: R$ 1.000,00
Parcela: 1/5
Status: Pendente
[Ver Detalhes] [Marcar como Paga]
```

## Fluxo de Uso

### 1. Criar Cliente
1. Acesse a seção "Clientes"
2. Clique em "Novo Cliente"
3. Preencha os dados do cliente
4. Clique em "Criar"

### 2. Criar Empréstimo
1. Acesse a seção "Empréstimos"
2. Clique em "Novo Empréstimo"
3. Selecione o cliente
4. Informe:
   - Valor emprestado
   - Número de parcelas
   - Taxa de juros (%)
   - Data do empréstimo
   - Data da primeira parcela
5. Clique em "Criar"

### 3. Gerar Fatura por Parcela
1. Na seção "Empréstimos", clique em um empréstimo
2. No modal de detalhes, visualize a lista de parcelas
3. Para cada parcela, clique em "Gerar Fatura"
4. A fatura será criada automaticamente com:
   - Valor da parcela
   - Data de vencimento da parcela
   - Informações do cliente e empréstimo
   - Número da parcela

### 4. Gerenciar Faturas
1. Acesse a seção "Faturas"
2. Visualize todas as faturas geradas
3. Filtre por cliente, status ou parcela
4. Marque faturas como pagas
5. Visualize detalhes e histórico de pagamentos

## Vantagens da Refatoração

### Controle Granular
- Registro individual de pagamento por parcela
- Histórico completo de faturas por parcela
- Rastreamento detalhado de inadimplência

### Flexibilidade
- Geração de múltiplas faturas para a mesma parcela (renegociações)
- Adiantamento de parcelas específicas
- Pagamentos parciais registrados separadamente

### Organização
- Faturas vinculadas diretamente às parcelas
- Visualização clara do status de cada parcela
- Relatórios mais precisos por período

### Escalabilidade
- Estrutura preparada para pagamentos parciais
- Suporte a múltiplos métodos de pagamento por parcela
- Integração facilitada com sistemas de pagamento

## Estrutura do Banco de Dados

### Tabela `installments`
```
id (PK)
emprestimo_id (FK -> loans)
numero_parcela
valor_original
valor_pago
data_vencimento
data_pagamento
status
juros_aplicados
multa_aplicada
desconto_aplicado
observacoes
```

### Tabela `invoices`
```
id (PK)
emprestimo_id (FK -> loans)
parcela_id (FK -> installments) [NOVO]
cliente_id (FK -> clients)
valor_total
descricao
status
data_emissao
data_vencimento
data_pagamento
observacoes
```

## Endpoints da API

### Parcelas

#### Listar parcelas de um empréstimo
```
GET /api/emprestimos/<emprestimo_id>/parcelas
```

#### Obter detalhes de uma parcela
```
GET /api/parcelas/<parcela_id>
```

#### Atualizar parcela
```
PUT /api/parcelas/<parcela_id>
```

#### Marcar parcela como paga
```
POST /api/parcelas/<parcela_id>/pagar
```

#### **Gerar fatura para parcela** [NOVO]
```
POST /api/parcelas/<parcela_id>/fatura
```

### Faturas

#### Listar todas as faturas
```
GET /api/faturas
```

#### Obter detalhes de uma fatura
```
GET /api/faturas/<fatura_id>
```

#### Atualizar fatura
```
PUT /api/faturas/<fatura_id>
```

#### Marcar fatura como paga
```
POST /api/faturas/<fatura_id>/pagar
```

## Exemplos de Uso da API

### Exemplo 1: Gerar fatura para a primeira parcela

```bash
# 1. Criar cliente
curl -X POST http://localhost:5000/api/clientes \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Maria Santos",
    "cpf_cnpj": "987.654.321-00",
    "email": "maria@email.com",
    "telefone": "(11) 91234-5678"
  }'

# Resposta: { "id": "cliente-id", ... }

# 2. Criar empréstimo
curl -X POST http://localhost:5000/api/emprestimos \
  -H "Content-Type: application/json" \
  -d '{
    "cliente_id": "cliente-id",
    "valor_emprestado": 10000.00,
    "numero_parcelas": 10,
    "taxa_juros": 2.5,
    "data_emprestimo": "2025-10-13",
    "data_primeira_parcela": "2025-11-13"
  }'

# Resposta: { "id": "emprestimo-id", "parcelas": [...] }

# 3. Obter ID da primeira parcela
curl http://localhost:5000/api/emprestimos/emprestimo-id/parcelas

# Resposta: [{ "id": "parcela-id", "numero_parcela": 1, ... }]

# 4. Gerar fatura para a primeira parcela
curl -X POST http://localhost:5000/api/parcelas/parcela-id/fatura \
  -H "Content-Type: application/json" \
  -d '{
    "descricao": "Fatura da parcela 1/10",
    "observacoes": "Primeiro pagamento"
  }'

# Resposta: { "id": "fatura-id", "parcela_id": "parcela-id", ... }
```

### Exemplo 2: Listar faturas de um cliente específico

```bash
curl http://localhost:5000/api/faturas?cliente_id=cliente-id
```

### Exemplo 3: Marcar fatura como paga

```bash
curl -X POST http://localhost:5000/api/faturas/fatura-id/pagar \
  -H "Content-Type: application/json" \
  -d '{
    "data_pagamento": "2025-11-13",
    "valor_pago": 1000.00
  }'
```

## Testes Realizados

### Teste 1: Criação de Cliente e Empréstimo
✅ Cliente criado com sucesso  
✅ Empréstimo criado com 5 parcelas  
✅ Parcelas geradas automaticamente

### Teste 2: Geração de Fatura por Parcela
✅ Fatura gerada para parcela específica  
✅ Vínculo correto entre fatura e parcela  
✅ Dados da parcela incluídos na fatura

### Teste 3: Interface do Usuário
✅ Botão "Gerar Fatura" exibido para cada parcela  
✅ Modal de detalhes mostra parcelas corretamente  
✅ Feedback visual ao gerar fatura

## Próximos Passos Sugeridos

### Funcionalidades Adicionais
1. **Pagamentos Parciais**: Permitir pagamento parcial de uma parcela com múltiplas faturas
2. **Renegociação**: Gerar novas faturas para parcelas renegociadas
3. **Notificações**: Enviar lembretes de vencimento por email/SMS
4. **Relatórios**: Dashboard com análise de inadimplência por parcela
5. **Exportação**: Gerar PDF das faturas individuais

### Melhorias de UX
1. **Filtros Avançados**: Filtrar faturas por parcela, período, status
2. **Busca**: Buscar faturas por número, cliente ou valor
3. **Ordenação**: Ordenar parcelas por vencimento, valor, status
4. **Gráficos**: Visualização gráfica do fluxo de pagamentos

### Integrações
1. **Gateway de Pagamento**: Integrar com Stripe, PagSeguro, Mercado Pago
2. **Contabilidade**: Exportar para sistemas contábeis
3. **Backup**: Backup automático do banco de dados
4. **API Externa**: Webhook para notificar sistemas externos

## Arquivos Modificados

```
loan_manager_api/
├── src/
│   ├── models/
│   │   ├── installment.py [MODIFICADO]
│   │   └── invoice.py [MODIFICADO]
│   ├── routes/
│   │   └── installment_invoice.py [NOVO]
│   └── main.py [MODIFICADO]
│
loan-manager/
└── src/
    └── components/
        ├── Loans.jsx [MODIFICADO]
        └── Invoices.jsx [MODIFICADO]
```

## Conclusão

A refatoração implementou com sucesso o controle e geração de faturas por parcela individual, proporcionando maior flexibilidade e precisão no gerenciamento de pagamentos de empréstimos. O sistema agora permite:

- ✅ Gerar faturas específicas para cada parcela
- ✅ Registrar pagamentos individuais por parcela
- ✅ Manter histórico completo de faturas por parcela
- ✅ Visualizar status detalhado de cada parcela
- ✅ Gerenciar adiantamentos e renegociações

O código está organizado, documentado e pronto para uso em produção.

