const { Periodo } = require('../models');
class periodoController {
    async index (req, res) {
        try {
            const periodos = await Periodo.findAll();
            return res.json(periodos);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const periodos = await Periodo.findByPk(req.params.id);
            return res.json(periodos);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Periodo.create(req.body);
            return res.json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const periodo = await Periodo.findByPk(req.params.id);
            await periodo.update(req.body);
            return res.json(periodo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const periodo = await Periodo.findByPk(req.params.id);
            await periodo.destroy();
            return res.json();
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}

module.exports = new periodoController();