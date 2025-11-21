const { Router } = require('express');
const loginController = require('../controllers/loginController');

const loginRouter = new Router();

loginRouter.post('/send-code', loginController.sendCode.bind(loginController));

loginRouter.post('/validate-code', loginController.validateCode.bind(loginController));

loginRouter.post('/forgot-password', loginController.forgotPass.bind(loginController));

loginRouter.get('/reset-password/:token', loginController.validateToken.bind(loginController));

loginRouter.post('/reset-password', loginController.resetPass.bind(loginController));

module.exports = loginRouter;