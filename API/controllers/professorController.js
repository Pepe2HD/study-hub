const { Disciplina, Professor } = require('../models');

class professorController {
    async index (req, res) {
        try {
            const professores = await Professor.findAll();
            return res.json(professores);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const professores = await Professor.findByPk(req.params.id);
            return res.json(professores);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Professor.create(req.body);
            return res.json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const professor = await Professor.findByPk(req.params.id);
            await professor.update(req.body);
            return res.json(professor);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const professor = await Professor.findByPk(req.params.id);
            await professor.destroy();
            return res.json();
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}


module.exports = new professorController();
