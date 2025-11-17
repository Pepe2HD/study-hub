const { Horario } = require('../models');

class horarioController {
    async index (req, res) {
        try {
            const horarios = await Horario.findAll();
            return res.json(horarios);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const horarios = await Horario.findByPk(req.params.id);
            return res.json(horarios);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Horario.create(req.body);
            return res.json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const horario = await Horario.findByPk(req.params.id);
            await horario.update(req.body);
            return res.json(horario);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const horario = await Horario.findByPk(req.params.id);
            await horario.destroy();
            return res.json();
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}

module.exports = new horarioController();