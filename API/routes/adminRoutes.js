const { Router } = require('express');
const adminController = require('../controllers/adminController');

const adminRouter = new Router();

adminRouter.get('/', adminController.index);

adminRouter.get('/:id', adminController.show);

adminRouter.post('/', adminController.create);

adminRouter.put('/:id', adminController.update);

adminRouter.delete('/:id', adminController.destroy);

module.exports = adminRouter;