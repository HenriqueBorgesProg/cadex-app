# Guia de Estudo do Cadex FTTH Planner

Este guia explica o funcionamento do app como um todo: objetivo, arquitetura, backend, frontend, banco de dados, rotas reais, simulação de implantação, postes sugeridos e estimativa financeira.

## 1. Visão Geral

O Cadex FTTH Planner é um MVP para planejamento de redes FTTH.

Ele ajuda a demonstrar como um sistema pode apoiar decisões técnicas de implantação, respondendo perguntas como:

- onde estão clientes e postes cadastrados
- qual rota por ruas reais conecta dois pontos
- quantos postes seriam sugeridos ao longo de uma rota
- qual seria a distância total da implantação
- qual seria o custo estimado de cabo e postes

O sistema possui dois fluxos principais:

- `Generate network`: conecta clientes aos postes mais próximos usando rotas reais.
- `Plan route`: simula uma rota planejada entre origem e destino escolhidos manualmente.

## 2. Stack

Backend:

- Node.js
- TypeScript
- Fastify
- TypeORM
- PostgreSQL

Frontend:

- React
- TypeScript
- Vite
- Leaflet
- React Leaflet
- Axios

Integração de rotas:

- OSRM público
- OpenStreetMap como base de dados viária

## 3. Estrutura do Projeto

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
  frontend/
    src/
      components/
      hooks/
      pages/
      services/
      styles/
      types/
```

## 4. Arquitetura Geral

O backend segue este fluxo:

```txt
Controller -> Service -> Repository -> Database
```

Responsabilidades:

- `Controller`: lida com HTTP, request e response.
- `Service`: contém regra de negócio.
- `Repository`: acessa o banco de dados.
- `Entity`: representa tabela do banco.
- `shared`: concentra infraestrutura comum, erros, database e utilitários.

O frontend segue esta ideia:

```txt
Page -> Hook -> Services -> API
Components -> Renderização visual
```

Responsabilidades:

- `pages`: compõem a tela.
- `hooks`: orquestram estado e ações.
- `services`: fazem chamadas HTTP.
- `components`: exibem UI.
- `types`: definem contratos TypeScript.

Regra importante:

O frontend não calcula regras de negócio. Ele coleta dados do usuário, chama a API e renderiza a resposta.

## 5. Banco de Dados

O banco usado é PostgreSQL.

Configuração principal:

```txt
backend/src/shared/database/data-source.ts
```

Migration principal:

```txt
backend/src/shared/database/migrations/1777818903680-CreatePointsTable.ts
```

O projeto usa:

```txt
synchronize: false
```

Isso significa que o TypeORM não cria tabelas automaticamente. As tabelas são criadas por migrations.

Se o volume do banco for apagado, rode novamente:

```bash
cd backend
npm run migration:run
```

## 6. Entidade Point

Arquivo:

```txt
backend/src/modules/points/entity/Point.ts
```

A entidade `Point` representa um ponto geográfico cadastrado no mapa.

Campos:

- `id`: UUID
- `type`: tipo do ponto
- `latitude`: latitude
- `longitude`: longitude
- `createdAt`: data de criação
- `updatedAt`: data de atualização

Tipos possíveis:

```txt
client
pole
```

Significado:

- `client`: localização de cliente.
- `pole`: poste ou ponto de infraestrutura.

## 7. Módulo Points

Arquivos:

```txt
backend/src/modules/points/controller/points-controller.ts
backend/src/modules/points/service/points-service.ts
backend/src/modules/points/repository/points-repository.ts
backend/src/modules/points/routes/points-routes.ts
```

Endpoints:

```txt
POST /points
GET /points
```

Fluxo de criação de ponto:

```txt
Usuário clica no mapa
Frontend guarda coordenada pendente
Usuário escolhe client ou pole
Usuário salva o ponto
Frontend chama POST /points
Backend valida os dados
Repository salva no PostgreSQL
Frontend adiciona o ponto no mapa
```

Validações no backend:

- `type` precisa ser `client` ou `pole`.
- latitude precisa ser número entre `-90` e `90`.
- longitude precisa ser número entre `-180` e `180`.

## 8. Rotas Reais Com OSRM

Arquivo:

```txt
backend/src/modules/network/service/road-route-service.ts
```

Esse serviço calcula rotas por ruas reais.

Ele usa OSRM com dois endpoints:

```txt
/nearest/v1/driving/{longitude},{latitude}
/route/v1/driving/{originLongitude},{originLatitude};{destinationLongitude},{destinationLatitude}
```

Por que usar `/nearest`:

Nem todo ponto cadastrado fica exatamente em cima de uma rua. Um poste ou cliente pode estar levemente fora da via. Se o sistema tentar rotear diretamente esse ponto, o OSRM pode falhar ou gerar comportamento ruim.

Então o backend faz snap:

```txt
ponto cadastrado -> rua roteável mais próxima
```

Depois calcula a rota usando as coordenadas roteáveis.

Fluxo do `RoadRouteService`:

```txt
Recebe origem e destino
Busca rua mais próxima da origem
Busca rua mais próxima do destino
Calcula rota real entre esses dois pontos ajustados
Retorna distância, duração, geometria, routeOrigin e routeDestination
```

O serviço faz múltiplas tentativas para reduzir falhas temporárias do OSRM.

## 9. Generate Network

Arquivos:

```txt
backend/src/modules/network/controller/network-controller.ts
backend/src/modules/network/service/network-service.ts
backend/src/modules/network/routes/network-routes.ts
```

Endpoint:

```txt
POST /network/generate
```

Objetivo:

Conectar cada cliente ao poste mais próximo considerando distância por ruas reais.

Fluxo:

```txt
Busca todos os pontos do banco
Separa clientes e postes
Para cada cliente, calcula rota real até cada poste
Escolhe o poste com menor distância por rua
Retorna conexões e distância total
```

Resposta conceitual:

```json
{
  "connections": [
    {
      "clientId": "uuid-client",
      "poleId": "uuid-pole",
      "distance": 1200,
      "geometry": [
        {
          "latitude": -16.67,
          "longitude": -49.29
        }
      ]
    }
  ],
  "totalDistance": 1200
}
```

As conexões geradas não são persistidas no banco. Elas são calculadas em tempo real.

## 10. Plan Route

Arquivos:

```txt
backend/src/modules/routes/controller/routes-controller.ts
backend/src/modules/routes/service/route-preview-service.ts
backend/src/modules/routes/routes/routes-routes.ts
```

Endpoint:

```txt
POST /routes/preview
```

Objetivo:

Gerar uma simulação de implantação entre dois pontos existentes escolhidos manualmente pelo usuário.

Entrada:

```json
{
  "originPointId": "uuid-origem",
  "destinationPointId": "uuid-destino",
  "poleSpacingMeters": 100,
  "cableCostPerMeter": 5,
  "poleUnitCost": 250
}
```

Fluxo:

```txt
Valida origem, destino e parâmetros
Busca origem no banco
Busca destino no banco
Calcula rota real usando ruas
Gera postes sugeridos ao longo da rota
Calcula custo de cabo
Calcula custo de postes
Calcula custo total
Retorna preview sem persistir postes
```

Resposta conceitual:

```json
{
  "origin": {},
  "destination": {},
  "routeOrigin": {
    "latitude": -16.68,
    "longitude": -49.26
  },
  "routeDestination": {
    "latitude": -16.67,
    "longitude": -49.29
  },
  "routeGeometry": [],
  "distanceMeters": 3500,
  "durationSeconds": 420,
  "suggestedPoles": [],
  "poleCount": 35,
  "cableCost": 17500,
  "polesCost": 8750,
  "totalEstimatedCost": 26250
}
```

Diferença importante:

- `origin` e `destination`: pontos originais cadastrados.
- `routeOrigin` e `routeDestination`: pontos ajustados para a rua roteável mais próxima.

## 11. Postes Sugeridos

A geração de postes sugeridos fica no backend, dentro de:

```txt
backend/src/modules/routes/service/route-preview-service.ts
```

A lógica percorre a geometria da rota e cria um poste a cada `poleSpacingMeters`.

Exemplo:

```txt
distância total: 1000 m
espaçamento: 100 m
postes sugeridos: aproximadamente 10
```

Cada poste sugerido possui:

- `sequence`: ordem do poste
- `latitude`: latitude sugerida
- `longitude`: longitude sugerida
- `distanceFromOriginMeters`: distância desde a origem

Esses postes aparecem no mapa como simulação, mas não são salvos automaticamente no banco.

## 12. Estimativa Financeira

O backend calcula os custos.

Fórmulas:

```txt
cableCost = distanceMeters * cableCostPerMeter
polesCost = poleCount * poleUnitCost
```

O frontend só exibe os valores retornados.

## 13. Frontend

Tela principal:

```txt
frontend/src/pages/NetworkOptimizerPage.tsx
```

Hook principal:

```txt
frontend/src/hooks/useNetworkOptimizer.ts
```

Componentes principais:

```txt
frontend/src/components/ControlPanel.tsx
frontend/src/components/MapView.tsx
frontend/src/components/MetricsPanel.tsx
frontend/src/components/PointList.tsx
frontend/src/components/StatusBanner.tsx
```

Services:

```txt
frontend/src/services/api.ts
frontend/src/services/points-service.ts
frontend/src/services/network-service.ts
frontend/src/services/routes-service.ts
```

Tipos:

```txt
frontend/src/types/domain.ts
```

## 14. useNetworkOptimizer

Arquivo:

```txt
frontend/src/hooks/useNetworkOptimizer.ts
```

Esse hook controla a maior parte do estado da aplicação.

Ele gerencia:

- lista de pontos
- tipo selecionado para novo ponto
- ponto pendente
- rede gerada
- modo de planejamento
- origem e destino da rota
- parâmetros da simulação
- preview da rota
- estados de loading
- mensagens de erro

## 15. MapView

Arquivo:

```txt
frontend/src/components/MapView.tsx
```

Esse componente renderiza o mapa com React Leaflet.

Ele mostra:

- pontos cadastrados
- ponto pendente
- conexões da rede
- rota simulada
- postes sugeridos
- popups

Também faz o enquadramento automático do mapa de forma suave.

## 16. ControlPanel

Arquivo:

```txt
frontend/src/components/ControlPanel.tsx
```

Esse painel permite:

- escolher `client` ou `pole`
- salvar ponto
- gerar rede
- ativar `Plan route`
- selecionar origem e destino
- configurar espaçamento e custos
- gerar simulação
- ver resumo da simulação

Parâmetros configuráveis:

- `Pole spacing (m)`
- `Cable cost / m`
- `Pole unit cost`

Os inputs permitem ficar vazios durante a digitação. A validação acontece ao clicar em `Generate simulation`.

## 17. MetricsPanel

Arquivo:

```txt
frontend/src/components/MetricsPanel.tsx
```

Sem simulação ativa, mostra métricas da rede:

- pontos
- clientes
- postes
- conexões
- distância total
- distância média

Com simulação ativa, mostra métricas do planejamento:

- distância da rota
- postes sugeridos
- custo de cabo
- custo de postes
- custo total estimado
- quantidade de coordenadas da rota

## 18. Fluxos de Uso

Criar ponto:

```txt
Selecionar tipo
Clicar no mapa
Salvar ponto
Backend valida e persiste
Frontend renderiza
```

Gerar rede:

```txt
Criar clientes e postes
Clicar em Generate network
Backend calcula rotas reais
Frontend desenha conexões
```

Planejar rota:

```txt
Clicar em Plan route
Selecionar origem
Selecionar destino
Ajustar parâmetros
Clicar em Generate simulation
Backend calcula rota, postes e custos
Frontend renderiza simulação
```

## 19. Tratamento de Erros

Erros de aplicação usam este formato:

```json
{
  "error": {
    "message": "Invalid point type",
    "code": "INVALID_POINT_TYPE",
    "statusCode": 400
  }
}
```

Exemplos importantes:

- `NO_POLES_FOUND`: não há postes para gerar rede.
- `ORIGIN_POINT_NOT_FOUND`: origem não encontrada.
- `DESTINATION_POINT_NOT_FOUND`: destino não encontrado.
- `SAME_ORIGIN_AND_DESTINATION`: origem e destino são iguais.
- `ROAD_ROUTE_UNAVAILABLE`: não foi possível calcular rota real.

## 20. Problemas Comuns

Porta 3000 ocupada:

```txt
listen EADDRINUSE: address already in use 0.0.0.0:3000
```

Geralmente acontece porque o backend Docker já está rodando e você tenta rodar o backend local.

Solução:

```bash
docker compose stop backend
cd backend
npm run dev
```

Tabela `points` não existe:

```txt
relation "points" does not exist
```

Geralmente acontece após `docker compose down -v`, porque o volume do banco foi apagado.

Solução:

```bash
cd backend
npm run migration:run
```

Rota indisponível:

```txt
ROAD_ROUTE_UNAVAILABLE
```

Possíveis causas:

- OSRM indisponível
- ponto distante demais de rua roteável
- falha temporária de internet
- limite ou instabilidade no serviço público do OSRM

## 21. Comandos Úteis

Subir apenas Postgres:

```bash
docker compose up -d postgres
```

Rodar migrations:

```bash
cd backend
npm run migration:run
```

Rodar backend:

```bash
cd backend
npm run dev
```

Rodar frontend:

```bash
cd frontend
npm run dev
```

Validar backend:

```bash
cd backend
npm run build
```

Validar frontend:

```bash
cd frontend
npm run lint
npm run build
```

## 22. Pontos Mais Importantes Para Estudar

1. Como `Point` é persistido no banco.
2. Como `PointsService` valida dados antes de salvar.
3. Como `NetworkService` escolhe o poste mais próximo usando rota real.
4. Como `RoadRouteService` usa OSRM `/nearest` e `/route`.
5. Por que `routeOrigin` e `routeDestination` podem ser diferentes dos pontos originais.
6. Como `RoutePreviewService` gera postes sugeridos.
7. Como os custos são calculados no backend.
8. Como `useNetworkOptimizer` orquestra o estado do frontend.
9. Como `MapView` renderiza pontos, rotas e postes.
10. Como o frontend evita regra de negócio e apenas renderiza resultados.

## 23. Resumo Mental

```txt
Usuário interage com o mapa
Frontend coleta a intenção
Frontend chama a API
Backend valida os dados
Backend acessa o banco quando necessário
Backend calcula rotas, postes e custos
Frontend recebe o resultado pronto
Frontend renderiza mapa, métricas e mensagens
```

A ideia central do projeto é demonstrar um MVP que se aproxima de uma ferramenta real de planejamento FTTH, mantendo boa separação de responsabilidades entre frontend, backend e banco de dados.
