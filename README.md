# Cadex Network Optimizer

O Cadex Network Optimizer é um MVP full-stack para visualizar e gerar uma rede geográfica simples entre clientes e polos.

O sistema permite que os usuários criem pontos geográficos em um mapa, os classifiquem como `client` ou `pole`, persistam esses dados através do backend e gerem uma rede onde cada cliente é conectado ao polo mais próximo.

## Objetivo do Projeto

O objetivo deste projeto é demonstrar:

- Arquitetura backend limpa
- Versionamento de esquema de banco de dados com migrations
- Separação entre lógica de negócio e camada HTTP
- Visualização geoespacial com Leaflet
- Integração frontend/backend
- Um fluxo prático semelhante a um produto real

O frontend não calcula a rede. Ele apenas envia dados, consome respostas da API e renderiza o resultado. O backend é responsável pelas regras de domínio e pelo cálculo de distância.

## Stack Tecnológica

### Backend

- Node.js
- TypeScript
- Fastify
- TypeORM
- PostgreSQL
- Migrations

### Frontend

- React
- TypeScript
- Vite
- Leaflet
- React Leaflet
- Axios
- Lucide React
  
### Demonstração




## Estrutura do Repositório

```txt
cadex-app/
  backend/
    src/
      modules/
        points/
        network/
      shared/
        database/
        errors/
        http/
        utils/
    docs/
      api-contract.md
    package.json

  frontend/
    src/
      components/
      hooks/
      pages/
      services/
      styles/
      types/
    package.json
```

## Visão Geral do Domínio

O domínio possui dois tipos principais de pontos:

```txt
client
pole
```

Um `client` representa a localização de um cliente.

Um `pole` representa um ponto de infraestrutura ao qual clientes podem se conectar.

O fluxo de geração da rede é:

```txt
1. Carregar todos os pontos do banco de dados
2. Separar clientes e polos
3. Para cada cliente, encontrar o polo mais próximo
4. Retornar uma lista de conexões
5. Retornar a distância total da rede
```

As conexões são geradas em tempo real e não são armazenadas no banco de dados.

## Arquitetura do Backend

O backend segue este fluxo:

```txt
Controller -> Service -> Repository -> Database
```

Responsabilidades:

```txt
Controller: lida com requisições e respostas HTTP
Service: contém as regras de negócio
Repository: isola o acesso ao banco de dados
Entity: descreve a estrutura do banco
Utils: funções reutilizáveis puras
```

Decisões importantes:

- O TypeORM é isolado dentro dos repositories
- As regras de negócio permanecem dentro dos services
- Controllers não calculam lógica de domínio
- O esquema do banco é controlado por migrations
- `synchronize` está desabilitado
- Respostas de erro são centralizadas

## Arquitetura do Frontend

O frontend segue esta estrutura:

```txt
components: partes visuais da interface
hooks: orquestração de estado e interações do usuário
pages: composição das telas
services: comunicação com a API
types: contratos compartilhados em TypeScript
styles: CSS da aplicação
```

O frontend é responsável por:

- Renderizar o mapa
- Criar pontos através da interação do usuário
- Chamar endpoints do backend
- Exibir estados de carregamento e erro
- Desenhar pontos e conexões da rede
- Mostrar métricas da rede

O frontend não é responsável por:

- Calcular distâncias
- Decidir qual polo é o mais próximo
- Persistir conexões
- Definir regras de negócio

## Pré-requisitos

Antes de executar o projeto, certifique-se de ter:

- Node.js instalado
- npm instalado
- PostgreSQL rodando localmente
- Um banco de dados chamado `cadex_network`

O backend espera um PostgreSQL com estes valores padrão:

```txt
host: localhost
port: 5432
user: cadex
password: cadex
database: cadex_network
```

Você pode sobrescrevê-los através de variáveis de ambiente.

## Variáveis de Ambiente

### Backend

Crie `backend/.env`:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=cadex
DB_PASSWORD=cadex
DB_NAME=cadex_network
```

### Frontend

Crie `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

Já existe um arquivo de exemplo:

```txt
frontend/.env.example
```

## Executando o Backend

Entre na pasta do backend:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Execute as migrations do banco:

```bash
npm run migration:run
```

Inicie o backend:

```bash
npm run dev
```

A API estará disponível em:

```txt
http://localhost:3000
```

## Executando o Frontend

Entre na pasta do frontend:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

A aplicação estará disponível em:

```txt
http://localhost:5173
```

ou:

```txt
http://127.0.0.1:5173
```

## Scripts Úteis

### Backend

```bash
npm run dev
npm run build
npm run migration:generate
npm run migration:run
npm run migration:revert
```

### Frontend

```bash
npm run dev
npm run build
npm run lint
npm run preview
```

## Resumo da API

O contrato completo da API está disponível em:

```txt
backend/docs/api-contract.md
```

### POST /points

Cria um ponto.

Request:

```json
{
  "type": "client",
  "latitude": -22.9068,
  "longitude": -43.1729
}
```

Response:

```json
{
  "id": "4446c36e-982d-432e-aa80-dd36b3af644c",
  "type": "client",
  "latitude": -22.9068,
  "longitude": -43.1729,
  "createdAt": "2026-05-09T17:10:54.779Z",
  "updatedAt": "2026-05-09T17:10:54.779Z"
}
```

### GET /points

Lista todos os pontos.

Response:

```json
[
  {
    "id": "b776c49b-5703-452a-ae0a-700f13a05502",
    "type": "pole",
    "latitude": -23.5505,
    "longitude": -46.6333,
    "createdAt": "2026-05-09T17:10:10.686Z",
    "updatedAt": "2026-05-09T17:10:10.686Z"
  }
]
```

### POST /network/generate

Gera a rede a partir dos pontos armazenados no banco de dados.

Request body:

```txt
none
```

Response:

```json
{
  "connections": [
    {
      "clientId": "4446c36e-982d-432e-aa80-dd36b3af644c",
      "poleId": "e14b8e36-f533-425f-a17d-dfbdff995889",
      "distance": 224642.13
    }
  ],
  "totalDistance": 224642.13
}
```

As distâncias são retornadas em metros.

## Formato de Erro

Erros da aplicação seguem esta estrutura:

```json
{
  "error": {
    "message": "Invalid point type",
    "code": "INVALID_POINT_TYPE",
    "statusCode": 400
  }
}
```

Erros inesperados seguem esta estrutura:

```json
{
  "error": {
    "message": "Internal server error",
    "code": "INTERNAL_SERVER_ERROR",
    "statusCode": 500
  }
}
```

## Fluxo Principal do Usuário

1. Abrir o frontend
2. Selecionar o tipo de ponto: `client` ou `pole`
3. Clicar no mapa
4. Salvar o ponto selecionado
5. Repetir até existirem clientes e polos
6. Clicar em `Generate network`
7. Visualizar conexões no mapa
8. Ler a distância total e métricas de conexão

## Funcionalidades do Frontend

- Mapa interativo
- Criação de pontos ao clicar no mapa
- Diferenciação visual entre clientes e polos
- Lista de pontos
- Botão de geração da rede
- Renderização de conexões com polylines
- Métrica de distância total
- Quantidade de conexões
- Estados de carregamento
- Mensagens de erro

## Funcionalidades do Backend

- Entidade Point
- Repository de Point
- Service de Point
- API de Point
- Tratamento de erros
- Utilitário de distância
- Service de geração da rede
- API da rede
- Métricas da rede
- Tratamento de casos extremos
- Documentação do contrato da API

## Checklist de Validação

Antes de apresentar o projeto, execute:

```bash
cd backend
npm run build
```

```bash
cd ../frontend
npm run lint
npm run build
```

Depois teste manualmente:

```txt
POST /points
GET /points
POST /network/generate
```

No frontend, teste:

```txt
Create client
Create pole
Generate network
View connection line
View total distance
Refresh points
```

## Solução de Problemas

### Backend não consegue conectar ao banco

Verifique se o PostgreSQL está em execução.

O erro mais comum é:

```txt
ECONNREFUSED 127.0.0.1:5432
```

Isso significa que o backend não conseguiu alcançar o PostgreSQL.

### Frontend mostra erros de requisição

Verifique se o backend está rodando em:

```txt
http://localhost:3000
```

Também verifique `frontend/.env`:

```env
VITE_API_URL=http://localhost:3000
```

### O mapa não carrega os tiles

Verifique sua conexão com a internet. O mapa utiliza tiles do OpenStreetMap.

### A geração da rede retorna erro de ausência de polos

Crie pelo menos um ponto com:

```json
{
  "type": "pole"
}
```

### A geração da rede retorna conexões vazias

Crie pelo menos um ponto com:

```json
{
  "type": "client"
}
```

## Fluxo de Versionamento

Fluxo recomendado:

```txt
develop -> feature branch -> commits -> PR -> merge -> delete branch
```

Exemplos de commits:

```txt
feat: cria interface do mapa
feat: integra frontend com api de pontos
feat: renderiza conexoes da rede
fix: corrige tratamento de erro no frontend
docs: documenta execucao do projeto
```

## Status do Projeto

O MVP inclui:

- Backend funcional
- Esquema de banco versionado
- Frontend funcional
- Mapa interativo
- Persistência de pontos
- Geração de rede
- Renderização visual das conexões
- Painel de métricas
- Documentação da API

O projeto está pronto para demonstração como um MVP full-stack.
