const { Router } = require('express');
const cursoController = require('../controllers/cursoController');

const cursoRouter = new Router();

cursoRouter.get('/', cursoController.index);

cursoRouter.get('/:id', cursoController.show);

cursoRouter.post('/', cursoController.create);

cursoRouter.put('/:id', cursoController.update);

cursoRouter.delete('/:id', cursoController.destroy);

module.exports = cursoRouter;