const { Turno } = require('../models');

class turnoController {
    async index (req, res) {
        try {
            const turnos = await Turno.findAll();
            return res.json(turnos);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const turnos = await Turno.findByPk(req.params.id);
            return res.json(turnos);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Turno.create(req.body);
            return res.json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const turno = await Turno.findByPk(req.params.id);
            await turno.update(req.body);
            return res.json(turno);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const turno = await Turno.findByPk(req.params.id);
            await turno.destroy();
            return res.json();
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}

module.exports = new turnoController();