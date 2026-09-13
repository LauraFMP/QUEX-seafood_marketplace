const express = require('express');
const path = require('path');
const { OrderStatus, PaymentStatus } = require('./domain/order');
const { DomainError } = require('./services/order-service');

function createApp(orderService) {
  const app = express();
  app.use(express.json());
  app.use(express.static(path.join(__dirname, '..', 'public')));

  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  app.get('/api/v1/seller/orders/open', async (req, res, next) => {
    try {
      const { paymentStatus } = req.query;
      if (paymentStatus && !Object.values(PaymentStatus).includes(paymentStatus)) {
        return res.status(400).json({ error: 'paymentStatus inválido.' });
      }
      const orders = await orderService.listOpenOrders(paymentStatus);
      return res.json({ data: orders, meta: { total: orders.length, ordering: 'oldest_first' } });
    } catch (error) { return next(error); }
  });

  app.get('/api/v1/seller/orders/:orderCode', async (req, res, next) => {
    try { return res.json({ data: await orderService.getOrder(req.params.orderCode) }); }
    catch (error) { return next(error); }
  });

  app.patch('/api/v1/seller/orders/:orderCode/status', async (req, res, next) => {
    try {
      const { status } = req.body;
      if (!Object.values(OrderStatus).includes(status)) return res.status(400).json({ error: 'status inválido.' });
      return res.json({ data: await orderService.updateStatus(req.params.orderCode, status) });
    } catch (error) { return next(error); }
  });

  app.patch('/api/v1/seller/orders/:orderCode/payment-validation', async (req, res, next) => {
    try {
      const { approved, validatedBy, reason } = req.body;
      if (typeof approved !== 'boolean') return res.status(400).json({ error: 'approved deve ser booleano.' });
      if (approved === false && reason !== undefined && typeof reason !== 'string') return res.status(400).json({ error: 'reason deve ser texto.' });
      if (validatedBy !== undefined && typeof validatedBy !== 'string') return res.status(400).json({ error: 'validatedBy deve ser texto.' });
      return res.json({ data: await orderService.validatePayment(req.params.orderCode, { approved, validatedBy, reason }) });
    } catch (error) { return next(error); }
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof DomainError) return res.status(error.statusCode).json({ error: error.message });
    if (error instanceof SyntaxError && 'body' in error) return res.status(400).json({ error: 'JSON inválido.' });
    console.error(error);
    return res.status(500).json({ error: 'Erro interno do servidor.' });
  });

  return app;
}

module.exports = { createApp };
