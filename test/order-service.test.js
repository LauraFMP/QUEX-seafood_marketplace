const test = require('node:test');
const assert = require('node:assert/strict');
const { InMemoryOrderRepository } = require('../src/repositories/in-memory-order-repository');
const { OrderService, DomainError } = require('../src/services/order-service');
const { OrderStatus, PaymentStatus } = require('../src/domain/order');

function order(overrides = {}) {
  return {
    orderCode: 'QX-1', status: OrderStatus.ACCEPTED, acceptedAt: '2026-09-11T10:00:00.000Z',
    payment: { status: PaymentStatus.PENDING }, ...overrides
  };
}

test('lista pedidos abertos em ordem de aceite e inclui posição', async () => {
  const service = new OrderService(new InMemoryOrderRepository([
    order({ orderCode: 'QX-2', acceptedAt: '2026-09-11T11:00:00.000Z' }), order()
  ]));
  const result = await service.listOpenOrders();
  assert.deepEqual(result.map(({ orderCode, position }) => ({ orderCode, position })), [
    { orderCode: 'QX-1', position: 1 }, { orderCode: 'QX-2', position: 2 }
  ]);
});

test('não avança pedido sem pagamento validado', async () => {
  const service = new OrderService(new InMemoryOrderRepository([order()]));
  await assert.rejects(() => service.updateStatus('QX-1', OrderStatus.PREPARING), DomainError);
});

test('valida pagamento e então permite preparar o pedido', async () => {
  const service = new OrderService(new InMemoryOrderRepository([order()]), () => new Date('2026-09-11T12:00:00.000Z'));
  const paid = await service.validatePayment('QX-1', { approved: true, validatedBy: 'seller-1' });
  assert.equal(paid.payment.status, PaymentStatus.VALIDATED);
  const updated = await service.updateStatus('QX-1', OrderStatus.PREPARING);
  assert.equal(updated.status, OrderStatus.PREPARING);
});

test('impede saltos entre status', async () => {
  const service = new OrderService(new InMemoryOrderRepository([
    order({ payment: { status: PaymentStatus.VALIDATED } })
  ]));
  await assert.rejects(() => service.updateStatus('QX-1', OrderStatus.READY), DomainError);
});
