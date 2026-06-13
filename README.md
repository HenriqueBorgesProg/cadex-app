# Cadex FTTH Planner

O Cadex FTTH Planner é um MVP full-stack para planejamento de implantação de redes FTTH, inspirado no contexto operacional da Cadex Goiânia.

O sistema permite criar pontos geográficos no mapa, classificá-los como `client` ou `pole`, gerar conexões por ruas reais e simular uma rota planejada entre dois pontos existentes. A simulação sugere postes ao longo do trajeto, calcula distância total e estima o custo financeiro de implantação.

<div align="center">

### Demonstração do funcionamento completo do sistema

https://github.com/user-attachments/assets/3cd4622e-f446-42de-ac4b-dc3d6c57a15f

</div>

---

## Objetivo do Projeto

O objetivo deste projeto é demonstrar:

- Arquitetura backend limpa
- Versionamento de esquema de banco de dados com migrations
- Separação entre lógica de negócio e camada HTTP
- Visualização geoespacial com Leaflet
- Integração frontend/backend
- Planejamento de implantação FTTH baseado em rotas reais
- Sugestão de infraestrutura e estimativa financeira

O frontend não calcula rotas, custos ou regras de rede. Ele apenas envia dados, consome respostas da API e renderiza o resultado. O backend é responsável pelas regras de domínio, cálculo de rotas, sugestão de postes e estimativa financeira.

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

## Estrutura do Repositório

```txt
cadex-app/
  backend/
    src/
      modules/
        points/
        network/
        routes/
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

Um `pole` representa um ponto de infraestrutura ao qual clientes podem se conectar ou que pode ser usado como origem/destino de planejamento.

O sistema possui dois fluxos principais.

O fluxo de geração da rede é:

```txt
1. Carregar todos os pontos do banco de dados
2. Separar clientes e polos
3. Para cada cliente, encontrar o polo com menor rota real por ruas
4. Retornar uma lista de conexões com geometria de rota
5. Retornar a distância total da rede
```

As conexões são geradas em tempo real e não são armazenadas no banco de dados.

O fluxo de planejamento de rota é:

```txt
1. Usuário ativa o modo Plan route
2. Usuário seleciona ponto de origem
3. Usuário seleciona ponto de destino
4. Backend ajusta origem e destino para a rua roteável mais próxima
5. Backend calcula a rota real usando OSRM
6. Backend sugere postes ao longo da geometria
7. Backend calcula custos de cabo, postes e custo total
8. Frontend renderiza rota, postes sugeridos e métricas
```

Os postes sugeridos são apenas simulação e não são persistidos automaticamente.
O espaçamento entre postes, custo por metro de cabo e custo unitário por poste podem ser ajustados na interface antes de gerar a simulação.

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

Gera a rede a partir dos pontos armazenados no banco de dados, usando rotas reais por ruas.

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
      "distance": 224642.13,
      "geometry": [
        {
          "latitude": -16.6869,
          "longitude": -49.2648
        }
      ]
    }
  ],
  "totalDistance": 224642.13
}
```

As distâncias são retornadas em metros. Pontos fora da rua são ajustados para a rua roteável mais próxima antes do cálculo.

### POST /routes/preview

Gera uma simulação de planejamento entre dois pontos existentes, sem persistir postes sugeridos.

Request:

```json
{
  "originPointId": "b776c49b-5703-452a-ae0a-700f13a05502",
  "destinationPointId": "4446c36e-982d-432e-aa80-dd36b3af644c",
  "poleSpacingMeters": 100,
  "cableCostPerMeter": 5,
  "poleUnitCost": 250
}
```

Response:

```json
{
  "origin": {
    "id": "b776c49b-5703-452a-ae0a-700f13a05502",
    "type": "pole",
    "latitude": -16.6869,
    "longitude": -49.2648,
    "createdAt": "2026-05-09T17:10:10.686Z",
    "updatedAt": "2026-05-09T17:10:10.686Z"
  },
  "destination": {
    "id": "4446c36e-982d-432e-aa80-dd36b3af644c",
    "type": "client",
    "latitude": -16.6773,
    "longitude": -49.2941,
    "createdAt": "2026-05-09T17:10:54.779Z",
    "updatedAt": "2026-05-09T17:10:54.779Z"
  },
  "routeOrigin": {
    "latitude": -16.6868,
    "longitude": -49.2647
  },
  "routeDestination": {
    "latitude": -16.6771,
    "longitude": -49.2940
  },
  "routeGeometry": [
    {
      "latitude": -16.6868,
      "longitude": -49.2647
    }
  ],
  "distanceMeters": 3500,
  "durationSeconds": 420,
  "suggestedPoles": [
    {
      "sequence": 1,
      "latitude": -16.6841,
      "longitude": -49.2701,
      "distanceFromOriginMeters": 100
    }
  ],
  "poleCount": 35,
  "cableCost": 17500,
  "polesCost": 8750,
  "totalEstimatedCost": 26250
}
```

`routeOrigin` e `routeDestination` são as coordenadas roteáveis usadas no cálculo, após ajuste para a rua mais próxima.

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
6. Clicar em `Generate network` para visualizar conexões por ruas reais
7. Ou clicar em `Plan route` para selecionar origem e destino
8. Clicar em `Generate simulation`
9. Visualizar rota, postes sugeridos e estimativa financeira

## Funcionalidades do Frontend

- Mapa interativo
- Criação de pontos ao clicar no mapa
- Diferenciação visual entre clientes e polos
- Lista de pontos
- Botão de geração da rede
- Renderização de conexões com polylines
- Modo de planejamento de rota
- Seleção de origem e destino existentes
- Renderização de rota real simulada
- Renderização de postes sugeridos
- Resumo de custo estimado
- Configuração de espaçamento entre postes e custos da simulação
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
- Service de preview de rota planejada
- API de preview de rota
- Integração com OSRM para rotas reais
- Ajuste de pontos para rua roteável mais próxima
- Geração de postes sugeridos não persistidos
- Estimativa de custo de cabo e postes
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
POST /routes/preview
```

No frontend, teste:

```txt
Create client
Create pole
Generate network
View connection line
View total distance
Plan route
Select origin and destination
Generate simulation
View suggested poles
View estimated cost
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
- Geração de rede usando rotas reais
- Planejamento de rota entre origem e destino
- Renderização visual das conexões e simulações
- Sugestão automática de postes
- Estimativa financeira de implantação
- Painel de métricas
- Documentação da API

O projeto está pronto para demonstração como um MVP full-stack de planejamento FTTH.


## Melhorias Futuras

As próximas evoluções planejadas incluem:

- Algoritmos de menor caminho
- Otimização de rede
- Clusterização geográfica
- Cache de rotas para redução de custo computacional
- Métricas avançadas de conexão
- Suporte para múltiplos polos prioritários
- Persistência de redes geradas
- Aprovação e persistência seletiva de postes sugeridos
- Atualização em tempo real das conexões
- Dashboard analítico
- Autenticação de usuários
- Histórico de geração de redes

A arquitetura atual foi organizada para permitir essas evoluções sem necessidade de reestruturação completa do sistema.
