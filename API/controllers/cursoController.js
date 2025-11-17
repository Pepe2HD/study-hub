const { Curso, Disciplina } = require('../models');

class cursoController {
    async index (req, res) {
        try {
            const cursos = await Curso.findAll();
            return res.json(cursos);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async show (req, res) {
        try {
            const cursos = await Curso.findByPk(req.params.id);
            return res.json(cursos);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async create (req, res) {
        try {
            const novo = await Curso.create(req.body);
            return res.json(novo);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }
    
    async update (req, res) {
        try {
            const curso = await Curso.findByPk(req.params.id);
            await curso.update(req.body);
            return res.json(curso);
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async destroy (req, res) {
        try {
            const curso = await Curso.findByPk(req.params.id);
            await curso.destroy();
            return res.json();
        } catch (erro) {
            return res.status(400).json({error : erro.message});
        }
    }

    async createCD (req, res) {
        try {
            const { id_curso, id_disciplina } = req.body;

            const curso = await Curso.findByPk(id_curso);
            if (!curso) {
                return res.status(404).json({ error: 'Curso não encontrado.' });
            }
            const disciplina = await Disciplina.findByPk(id_disciplina);

            await curso.addDisciplina(disciplina);
            return res.json({ message: 'Disciplina associada ao curso com sucesso.' });
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }

    async destroyCD(req, res) {
        try {
            const curso = await Curso.findByPk(req.params.id_curso);
            const disciplina = await Disciplina.findByPk(req.params.id_disciplina);

            if (!curso || !disciplina) {
                return res.status(404).json({ error: 'Curso ou disciplina não encontrada.' });
            }

            await curso.removeDisciplina(disciplina);
            return res.json({ message: 'Disciplina removida do curso com sucesso.' });
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }

    async showCD(req, res) {
        try {
            const curso = await Curso.findByPk(req.params.id, {
                include: { model: Disciplina, as: 'disciplina' }
            });

            if (!curso) {
                return res.status(404).json({ error: 'Curso não encontrado.' });
            }

            return res.json(curso.disciplina);
        } catch (erro) {
            return res.status(400).json({ error: erro.message });
        }
    }
}

module.exports = new cursoController();