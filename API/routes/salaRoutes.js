const { Router } = require('express');
const salaController = require('../controllers/salaController');

const salaRouter = new Router();

salaRouter.get('/', salaController.index);

salaRouter.get('/:id', salaController.show);

salaRouter.post('/', salaController.create);

salaRouter.put('/:id', salaController.update);

salaRouter.delete('/:id', salaController.destroy);

module.exports = salaRouter;