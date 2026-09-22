export const OrderStatus = Object.freeze({
  ACCEPTED: 'ACCEPTED',
  PREPARING: 'PREPARING',
  READY: 'READY',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED'
});

export const PaymentStatus = Object.freeze({
  PENDING: 'PENDING',
  VALIDATED: 'VALIDATED',
  REJECTED: 'REJECTED'
});

const terminalStatuses = new Set([OrderStatus.DELIVERED, OrderStatus.CANCELLED]);
const transitions = Object.freeze({
  [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
  [OrderStatus.PREPARING]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.OUT_FOR_DELIVERY, OrderStatus.CANCELLED],
  [OrderStatus.OUT_FOR_DELIVERY]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: []
});

export function isOpenOrder(order) {
  return !terminalStatuses.has(order.status);
}

export function canTransition(currentStatus, nextStatus) {
  return transitions[currentStatus]?.includes(nextStatus) ?? false;
}

export function requiresValidatedPayment(status) {
  return [OrderStatus.PREPARING, OrderStatus.READY, OrderStatus.OUT_FOR_DELIVERY, OrderStatus.DELIVERED]
    .includes(status);
}

