const { OrderStatus, PaymentStatus } = require('./domain/order');

const seedOrders = [
  {
    orderCode: 'QX-20260911-0001',
    customer: { id: 'customer-1', name: 'Ana Silva' },
    items: [{ productId: 'p-1', name: 'Cesta orgânica', quantity: 1, unitPrice: 55 }],
    total: 55,
    status: OrderStatus.ACCEPTED,
    acceptedAt: '2026-09-11T10:00:00.000Z',
    statusUpdatedAt: '2026-09-11T10:00:00.000Z',
    payment: { method: 'PIX', status: PaymentStatus.PENDING, validatedAt: null, validatedBy: null, rejectionReason: null }
  },
  {
    orderCode: 'QX-20260911-0002',
    customer: { id: 'customer-2', name: 'Bruno Costa' },
    items: [{ productId: 'p-2', name: 'Kit café', quantity: 2, unitPrice: 28 }],
    total: 56,
    status: OrderStatus.ACCEPTED,
    acceptedAt: '2026-09-11T10:15:00.000Z',
    statusUpdatedAt: '2026-09-11T10:15:00.000Z',
    payment: { method: 'CARD', status: PaymentStatus.VALIDATED, validatedAt: '2026-09-11T10:16:00.000Z', validatedBy: 'seller-1', rejectionReason: null }
  }
];

module.exports = { seedOrders };
