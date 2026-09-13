# QUÉX — API de pedidos do vendedor

Back-end Node.js para o vendedor consultar e gerenciar pedidos **aceitos e ainda abertos**, atualizar seus status e validar pagamentos. A API foi pensada para ser consumida depois por uma interface React.

## Executar

```bash
npm install
npm start
```

O servidor inicia em `http://localhost:3000` (ou na porta definida em `PORT`). Para desenvolvimento, use `npm run dev`. Para executar os testes: `npm test`.

Ao abrir `http://localhost:3000`, há também uma tela de demonstração simples. Ela permite consultar a fila, validar/rejeitar pagamentos e avançar o status dos pedidos. É uma interface temporária em HTML/CSS/JavaScript puro; a API não depende dela e poderá ser usada pelo futuro front-end React.

## Endpoints

| Método | Rota | Finalidade |
|---|---|---|
| `GET` | `/api/v1/seller/orders/open` | Lista os pedidos aceitos e abertos, do mais antigo para o mais novo. |
| `GET` | `/api/v1/seller/orders/:orderCode` | Consulta detalhes de um pedido. |
| `PATCH` | `/api/v1/seller/orders/:orderCode/status` | Atualiza o status seguindo as transições permitidas. |
| `PATCH` | `/api/v1/seller/orders/:orderCode/payment-validation` | Valida ou rejeita um pagamento pendente. |

### Listagem de pedidos abertos

`GET /api/v1/seller/orders/open?paymentStatus=PENDING`

Pedidos abertos são os que foram aceitos e não foram concluídos nem cancelados. O campo `position` expressa a ordem de atendimento: `1` é o primeiro (mais antigo), e a resposta vem de cima para baixo nessa sequência. Cada item contém `orderCode`, cliente, itens, total, status e situação de pagamento.

### Atualizar status

```http
PATCH /api/v1/seller/orders/QX-20260911-0001/status
Content-Type: application/json

{ "status": "PREPARING" }
```

Transições: `ACCEPTED → PREPARING → READY → OUT_FOR_DELIVERY → DELIVERED`. É possível cancelar em qualquer etapa anterior à entrega. Um pedido só pode avançar para `PREPARING` ou além se o pagamento estiver validado.

### Validar pagamento

```http
PATCH /api/v1/seller/orders/QX-20260911-0001/payment-validation
Content-Type: application/json

{ "approved": true, "validatedBy": "seller-42" }
```

Ao rejeitar, informe opcionalmente `reason`. A resposta devolve o pedido atualizado e registra data, responsável e motivo da validação.

## Funcionalidades adicionais incluídas

- Consulta de detalhes individuais por código do pedido.
- Filtro da fila por situação de pagamento (`PENDING`, `VALIDATED`, `REJECTED`).
- Regras de transição de status para evitar saltos e alterações após encerramento.
- Bloqueio do avanço operacional enquanto o pagamento não estiver validado.
- Auditoria mínima de validação: data, responsável e motivo.
- Respostas de erro padronizadas e endpoint de saúde (`GET /health`).

## Persistência

O repositório atual é em memória e inclui dados de demonstração, para tornar o módulo executável sem dependências externas. A interface `OrderRepository` concentra o acesso aos dados; em produção, substitua `InMemoryOrderRepository` por uma implementação com o banco do projeto, preservando os métodos `findOpen`, `findByCode` e `save`.
