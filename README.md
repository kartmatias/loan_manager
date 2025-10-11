# Gestão de Empréstimos

Este é um aplicativo web mobile-first para gestão financeira de empréstimos de dinheiro, desenvolvido com um backend em Flask e um frontend em React. Ele permite ao credor controlar os valores emprestados, pagamentos de parcelas, adiantamento de parcelas e emissão de faturas por cliente.

## Funcionalidades

-   **Gestão de Clientes:** Adicionar, visualizar, editar e excluir clientes.
-   **Gestão de Empréstimos:** Registrar novos empréstimos, com cálculo automático de parcelas, visualização de detalhes e status.
-   **Gestão de Parcelas:** Registrar pagamentos de parcelas, adiantar parcelas e visualizar o status de cada parcela.
-   **Emissão de Faturas:** Gerar faturas para clientes, com detalhes de empréstimos e parcelas.
-   **Dashboard:** Visão geral das estatísticas de empréstimos e clientes.

## Arquitetura

O projeto é dividido em duas partes principais:

1.  **Backend (API RESTful com Flask):** Responsável pela lógica de negócios, persistência de dados (SQLite) e exposição dos endpoints da API.
2.  **Frontend (Aplicativo Web com React):** Interface do usuário mobile-first que consome a API do backend para exibir e interagir com os dados.

## Configuração e Execução

### Pré-requisitos

-   Python 3.8+
-   Node.js 18+
-   pnpm (gerenciador de pacotes Node.js)

### 1. Backend (Flask)

Navegue até o diretório `loan_manager_api`:

```bash
cd loan_manager_api
```

Crie e ative um ambiente virtual:

```bash
python3 -m venv venv
source venv/bin/activate
```

Instale as dependências do Python:

```bash
pip install -r requirements.txt
```

O banco de dados SQLite (`app.db`) será criado automaticamente na primeira execução. Para iniciar o servidor Flask (em modo de desenvolvimento):

```bash
python src/main.py
```

O servidor estará disponível em `http://localhost:5000`.

### 2. Frontend (React)

Navegue até o diretório `loan-manager`:

```bash
cd loan-manager
```

Instale as dependências do Node.js com pnpm:

```bash
pnpm install
```

Para iniciar o servidor de desenvolvimento do React:

```bash
pnpm run dev
```

O aplicativo estará disponível em `http://localhost:5173` (ou outra porta disponível).

**Observação:** Para que o frontend se comunique corretamente com o backend, certifique-se de que o backend Flask esteja rodando. A URL da API é configurada em `src/App.jsx` e aponta para `http://localhost:5000` por padrão.

### 3. Implantação (Integração Frontend e Backend)

Para servir o frontend diretamente pelo Flask (ideal para produção):

1.  Construa o aplicativo React:
    ```bash
    cd loan-manager
    pnpm run build
    ```
2.  Copie os arquivos de build do React para o diretório `static` do Flask:
    ```bash
    rm -rf ../loan_manager_api/src/static/*
    cp -r dist/* ../loan_manager_api/src/static/
    ```
3.  Inicie o servidor Flask (certifique-se de que o ambiente virtual esteja ativado):
    ```bash
    cd ../loan_manager_api
    python src/main.py
    ```

Agora, o aplicativo completo (frontend e backend) estará acessível via `http://localhost:5000`.

## Endpoints da API (Resumo)

-   **Clientes:**
    -   `GET /api/clientes`
    -   `POST /api/clientes`
    -   `GET /api/clientes/<id>`
    -   `PUT /api/clientes/<id>`
    -   `DELETE /api/clientes/<id>`
-   **Empréstimos:**
    -   `GET /api/emprestimos`
    -   `POST /api/emprestimos`
    -   `GET /api/emprestimos/<id>`
    -   `PUT /api/emprestimos/<id>`
    -   `DELETE /api/emprestimos/<id>`
    -   `GET /api/clientes/<cliente_id>/emprestimos`
-   **Parcelas:**
    -   `GET /api/emprestimos/<emprestimo_id>/parcelas`
    -   `POST /api/parcelas/<id>/pagar`
    -   `POST /api/emprestimos/<emprestimo_id>/adiantar_parcelas`
-   **Faturas:**
    -   `GET /api/faturas`
    -   `POST /api/faturas`
    -   `GET /api/faturas/<id>`
    -   `GET /api/clientes/<cliente_id>/faturas`
    -   `PUT /api/faturas/<id>/status`

Para detalhes completos dos modelos e rotas, consulte os arquivos em `loan_manager_api/src/models/` e `loan_manager_api/src/routes/`.
