const { Router } = require('express');
const periodoController = require('../controllers/periodoController');

const periodoRouter = new Router();

periodoRouter.get('/', periodoController.index);

periodoRouter.get('/:id', periodoController.show);

periodoRouter.post('/', periodoController.create);

periodoRouter.put('/:id', periodoController.update);

periodoRouter.delete('/:id', periodoController.destroy);

module.exports = periodoRouter;