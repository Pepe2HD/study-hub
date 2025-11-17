const { Router } = require('express');
const turnoController = require('../controllers/turnoController');

const turnoRouter = new Router();

turnoRouter.get('/', turnoController.index);

turnoRouter.get('/:id', turnoController.show);

turnoRouter.post('/', turnoController.create);

turnoRouter.put('/:id', turnoController.update);

turnoRouter.delete('/:id', turnoController.destroy);

module.exports = turnoRouter;