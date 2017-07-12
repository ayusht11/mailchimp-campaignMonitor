import express from 'express';
import bodyParser from 'body-parser';
import routes from './app/routes/routes';

const start = () => {

  const app = express();
  var router = express.Router();

  app.use(bodyParser.json());
  app.use('/lists', routes());

  app.use((req, res) => {
    res.status(404).send({url: `${req.originalUrl} not found`})
  });

  app.listen(3000, () => {
  console.log('Server listening on port 3000!')
  });
};

export default start;
