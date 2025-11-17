const { Router } = require('express');
const horarioController = require('../controllers/horarioController');

const horarioRouter = new Router();

horarioRouter.get('/', horarioController.index);

horarioRouter.get('/:id', horarioController.show);

horarioRouter.post('/', horarioController.create);

horarioRouter.put('/:id', horarioController.update);

horarioRouter.delete('/:id', horarioController.destroy);

module.exports = horarioRouter;