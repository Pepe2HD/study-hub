const { Router } = require('express');
const disciplinaController = require('../controllers/disciplinaController');
const professor = require('../controllers/professorController');
const professorController = require('../controllers/professorController');

const disciplina_professorRouter = new Router();

disciplina_professorRouter.get('/:id', disciplinaController.showDP);

disciplina_professorRouter.get('/rvs/:id', professorController.showPD);

disciplina_professorRouter.post('/', disciplinaController.createDP);

disciplina_professorRouter.delete('/:id_disciplina/:id_professor', disciplinaController.destroyDP);

module.exports = disciplina_professorRouter;