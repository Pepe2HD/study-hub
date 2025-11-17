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

    async createDP (req, res) {
        try {
            const { id_disciplina, id_professor } = req.body;

            const disciplina = await Disciplina.findByPk(id_disciplina);
            if (!disciplina) {
                return res.status(404).json({ error: 'Disciplina não encontrada.' });
            }
            const professor = await Professor.findByPk(id_professor);

            await disciplina.addProfessor(professor);
            return res.json({ message: 'Professor associada a disciplina com sucesso.' });
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }

    async destroyDP(req, res) {
        try {
            const disciplina = await Disciplina.findByPk(req.params.id_disciplina);
            const professor = await Professor.findByPk(req.params.id_professor);

            if (!professor || !disciplina) {
                return res.status(404).json({ error: 'Disciplina ou professor não encontrada.' });
            }

            await disciplina.removeProfessor(professor);
            return res.json({ message: 'Professor removido da disciplina com sucesso.' });
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }

    async showDP(req, res) {
        try {
            const disciplina = await Disciplina.findByPk(req.params.id, {
                include: { model: Professor, as: 'professor' }
            });

            if (!disciplina) {
                return res.status(404).json({ error: 'Disciplina não encontrada.' });
            }

            return res.json(disciplina.professor);
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }
}

module.exports = new disciplinaController();