const { isOpenOrder } = require('../domain/order');

class InMemoryOrderRepository {
  constructor(seed = []) {
    this.orders = new Map(seed.map((order) => [order.orderCode, structuredClone(order)]));
  }

  async findOpen({ paymentStatus } = {}) {
    return [...this.orders.values()]
      .filter((order) => isOpenOrder(order))
      .filter((order) => !paymentStatus || order.payment.status === paymentStatus)
      .sort((a, b) => new Date(a.acceptedAt) - new Date(b.acceptedAt))
      .map((order) => structuredClone(order));
  }

  async findByCode(orderCode) {
    const order = this.orders.get(orderCode);
    return order ? structuredClone(order) : null;
  }

  async save(order) {
    this.orders.set(order.orderCode, structuredClone(order));
    return structuredClone(order);
  }
}

module.exports = { InMemoryOrderRepository };
