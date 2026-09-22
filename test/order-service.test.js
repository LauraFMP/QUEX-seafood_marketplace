import assert from 'node:assert/strict';
import { test } from 'node:test';
import { OrderStatus, PaymentStatus } from '../src/domain/order.js';
import { InMemoryOrderRepository } from '../src/repositories/in-memory-order-repository.js';
import { DomainError, OrderService } from '../src/services/order-service.js';

const clock = () => new Date('2026-09-11T12:00:00.000Z');

function createOrder(orderCode, acceptedAt, status = OrderStatus.ACCEPTED) {
	return {
		orderCode,
		acceptedAt,
		status,
		payment: { status: PaymentStatus.PENDING },
	};
}

test('lista pedidos abertos na ordem de aceite', async () => {
	const repository = new InMemoryOrderRepository([
		createOrder('QX-2', '2026-09-11T10:00:00.000Z'),
		createOrder('QX-1', '2026-09-11T09:00:00.000Z'),
		createOrder('QX-3', '2026-09-11T08:00:00.000Z', OrderStatus.DELIVERED),
	]);
	const service = new OrderService(repository, clock);

	assert.deepEqual(
		(await service.listOpenOrders()).map(({ orderCode, position }) => ({ orderCode, position })),
		[
			{ orderCode: 'QX-1', position: 1 },
			{ orderCode: 'QX-2', position: 2 },
		]
	);
});

test('bloqueia avanço sem pagamento validado', async () => {
	const service = new OrderService(
		new InMemoryOrderRepository([createOrder('QX-1', '2026-09-11T09:00:00.000Z')]),
		clock
	);

	await assert.rejects(
		service.updateStatus('QX-1', OrderStatus.PREPARING),
		(error) => error instanceof DomainError && error.statusCode === 422
	);
});

test('valida pagamento e permite iniciar o preparo', async () => {
	const service = new OrderService(
		new InMemoryOrderRepository([createOrder('QX-1', '2026-09-11T09:00:00.000Z')]),
		clock
	);

	const validated = await service.validatePayment('QX-1', {
		approved: true,
		validatedBy: 'seller-42',
	});
	const updated = await service.updateStatus('QX-1', OrderStatus.PREPARING);

	assert.equal(validated.payment.status, PaymentStatus.VALIDATED);
	assert.equal(validated.payment.validatedBy, 'seller-42');
	assert.equal(updated.status, OrderStatus.PREPARING);
});
