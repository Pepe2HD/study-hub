const { Router } = require('express');
const disciplinaController = require('../controllers/disciplinaController');

const disciplinaRouter = new Router();

disciplinaRouter.get('/', disciplinaController.index);

disciplinaRouter.get('/:id', disciplinaController.show);

disciplinaRouter.post('/', disciplinaController.create);

disciplinaRouter.put('/:id', disciplinaController.update);

disciplinaRouter.delete('/:id', disciplinaController.destroy);

module.exports = disciplinaRouter;