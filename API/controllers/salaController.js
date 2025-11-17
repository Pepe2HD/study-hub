const { Sala } = require('../models');

class salaController {
    async index (req, res) {
        try {
            const salas = await Sala.findAll();
            return res.json(salas);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const salas = await Sala.findByPk(req.params.id);
            return res.json(salas);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Sala.create(req.body);
            return res.json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const sala = await Sala.findByPk(req.params.id);
            await sala.update(req.body);
            return res.json(sala);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const sala = await Sala.findByPk(req.params.id);
            await sala.destroy();
            return res.json();
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}

module.exports = new salaController();