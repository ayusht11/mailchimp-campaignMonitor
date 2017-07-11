import express from 'express';
import app from './../../server';
import requestValidator from './../../lib/requestValidator';

const routes = () => {
  const subscriberRoutes = express.Router();
  subscriberRoutes.use(requestValidator);
  subscriberRoutes.post('/', (req, res) => req.instanceHandler.addSubscriber(req, res));
  subscriberRoutes.get('/', (req, res) => req.instanceHandler.getSubscribers(req, res));

  return subscriberRoutes;
};

export default routes;
