const { createApp } = require('./app');
const { InMemoryOrderRepository } = require('./repositories/in-memory-order-repository');
const { OrderService } = require('./services/order-service');
const { seedOrders } = require('./seed-orders');

const app = createApp(new OrderService(new InMemoryOrderRepository(seedOrders)));
const port = Number(process.env.PORT) || 3000;

app.listen(port, () => console.log(`QUÉX Orders API em http://localhost:${port}`));
