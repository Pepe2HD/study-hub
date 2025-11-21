const { Curso, Disciplina, Professor } = require('../models');

class disciplinaController {
    async index (req, res) {
        try {
            const disciplinas = await Disciplina.findAll();
            return res.json(disciplinas);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const disciplinas = await Disciplina.findByPk(req.params.id);
            return res.json(disciplinas);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Disciplina.create(req.body);
            return res.json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const disciplina = await Disciplina.findByPk(req.params.id);
            await disciplina.update(req.body);
            return res.json(disciplina);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const disciplina = await Disciplina.findByPk(req.params.id);
            await disciplina.destroy();
            return res.json();
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    async showDC(req, res) {
        try {
            const disciplina = await Disciplina.findByPk(req.params.id, {
                include: { model: Curso, as: 'curso' }
            });

            if (!disciplina) {
                return res.status(404).json({ error: 'Disciplina não encontrada.' });
            }

            return res.json(disciplina.curso);
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }
}


module.exports = new disciplinaController();
