const { Router } = require('express');
const professorController = require('../controllers/professorController');

const professorRouter = new Router();

professorRouter.get('/', professorController.index);

professorRouter.get('/:id', professorController.show);

professorRouter.post('/', professorController.create);

professorRouter.put('/:id', professorController.update);

professorRouter.delete('/:id', professorController.destroy);

module.exports = professorRouter;