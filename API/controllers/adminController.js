const { Admin } = require('../models');

class adminController {
    async index (req, res) {
        try {
            const admins = await Admin.findAll();
            return res.json(admins);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const admins = await Admin.findByPk(req.params.id);
            return res.json(admins);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Admin.create(req.body);
            return res.json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const admin = await Admin.findByPk(req.params.id);
            await admin.update(req.body);
            return res.json(admin);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const admin = await Admin.findByPk(req.params.id);
            await admin.destroy();
            return res.status(204).send();
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
}

module.exports = new adminController();