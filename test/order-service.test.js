import {
	ORDER_STATUS_SEQUENCE,
	CLOSED_ORDER_STATUSES,
	PaymentStatus,
} from '../domain/order.js';

export class DomainError extends Error {
	constructor(message) {
		super(message);
		this.name = 'DomainError';
	}
}

export class OrderService {
	/**
	 * @param {object} repository - precisa expor findAll, findByCode e save.
	 * @param {() => Date} clock - injeção de relógio, facilita testes.
	 */
	constructor(repository, clock = () => new Date()) {
		this.repository = repository;
		this.clock = clock;
	}

	// Lista pedidos ainda "em aberto" (não entregues/cancelados),
	// ordenados por ordem de aceite, com a posição na fila.
	async listOpenOrders() {
		const orders = await this.repository.findAll();
		return orders
			.filter((order) => !CLOSED_ORDER_STATUSES.includes(order.status))
			.sort((a, b) => new Date(a.acceptedAt) - new Date(b.acceptedAt))
			.map((order, index) => ({ ...order, position: index + 1 }));
	}

	async validatePayment(orderCode, { approved, validatedBy }) {
		const order = await this._getOrderOrFail(orderCode);

		const updated = {
			...order,
			payment: {
				...order.payment,
				status: approved ? PaymentStatus.VALIDATED : PaymentStatus.REJECTED,
				validatedBy,
				validatedAt: this.clock().toISOString(),
			},
		};

		return this.repository.save(updated);
	}

	async updateStatus(orderCode, newStatus) {
		const order = await this._getOrderOrFail(orderCode);

		const currentIndex = ORDER_STATUS_SEQUENCE.indexOf(order.status);
		const nextIndex = ORDER_STATUS_SEQUENCE.indexOf(newStatus);

		if (nextIndex === -1 || nextIndex !== currentIndex + 1) {
			throw new DomainError(
				`Não é possível pular direto de "${order.status}" para "${newStatus}".`
			);
		}

		// Antes de entrar em preparo, o pagamento precisa estar validado.
		if (
			newStatus === ORDER_STATUS_SEQUENCE[1] &&
			order.payment?.status !== PaymentStatus.VALIDATED
		) {
			throw new DomainError(
				'Não é possível avançar o pedido sem pagamento validado.'
			);
		}

		return this.repository.save({ ...order, status: newStatus });
	}

	async _getOrderOrFail(orderCode) {
		const order = await this.repository.findByCode(orderCode);
		if (!order) {
			throw new DomainError(`Pedido "${orderCode}" não encontrado.`);
		}
		return order;
	}
}