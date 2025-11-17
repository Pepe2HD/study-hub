const { Router } = require('express');
const cursoController = require('../controllers/cursoController');
const disciplinaController = require('../controllers/disciplinaController');

const curso_disciplinaRouter = new Router();

curso_disciplinaRouter.get('/:id', cursoController.showCD);

curso_disciplinaRouter.get('/rvs/:id', disciplinaController.showDC);

curso_disciplinaRouter.post('/', cursoController.createCD);

curso_disciplinaRouter.delete('/:id_curso/:id_disciplina', cursoController.destroyCD);

module.exports = curso_disciplinaRouter;