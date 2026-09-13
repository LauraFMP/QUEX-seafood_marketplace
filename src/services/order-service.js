const { canTransition, requiresValidatedPayment, PaymentStatus } = require('../domain/order');

class DomainError extends Error {
  constructor(message, statusCode = 422) {
    super(message);
    this.name = 'DomainError';
    this.statusCode = statusCode;
  }
}

class OrderService {
  constructor(repository, clock = () => new Date()) {
    this.repository = repository;
    this.clock = clock;
  }

  async listOpenOrders(paymentStatus) {
    const orders = await this.repository.findOpen({ paymentStatus });
    return orders.map((order, index) => ({ position: index + 1, ...order }));
  }

  async getOrder(orderCode) {
    return this.#getRequiredOrder(orderCode);
  }

  async updateStatus(orderCode, nextStatus) {
    const order = await this.#getRequiredOrder(orderCode);
    if (!canTransition(order.status, nextStatus)) {
      throw new DomainError(`Transição inválida: ${order.status} → ${nextStatus}.`);
    }
    if (requiresValidatedPayment(nextStatus) && order.payment.status !== PaymentStatus.VALIDATED) {
      throw new DomainError('O pagamento deve ser validado antes de avançar o pedido.');
    }

    order.status = nextStatus;
    order.statusUpdatedAt = this.clock().toISOString();
    return this.repository.save(order);
  }

  async validatePayment(orderCode, { approved, validatedBy, reason }) {
    const order = await this.#getRequiredOrder(orderCode);
    if (order.payment.status === PaymentStatus.VALIDATED) {
      throw new DomainError('O pagamento deste pedido já foi validado.');
    }

    order.payment = {
      ...order.payment,
      status: approved ? PaymentStatus.VALIDATED : PaymentStatus.REJECTED,
      validatedAt: this.clock().toISOString(),
      validatedBy: validatedBy ?? null,
      rejectionReason: approved ? null : reason ?? null
    };
    return this.repository.save(order);
  }

  async #getRequiredOrder(orderCode) {
    const order = await this.repository.findByCode(orderCode);
    if (!order) throw new DomainError('Pedido não encontrado.', 404);
    return order;
  }
}

module.exports = { OrderService, DomainError };
