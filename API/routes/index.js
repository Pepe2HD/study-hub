const auth = require("../middlewares/auth");
const express = require('express');
const router = express.Router();

const adminRoutes = require('./adminRoutes');
const cursoRoutes = require('./cursoRoutes');
const disciplinaRoutes = require('./disciplinaRoutes');
const horarioRoutes = require('./horarioRoutes');
const periodoRoutes = require('./periodoRoutes');
const professorRoutes = require('./professorRoutes');
const salaRoutes = require('./salaRoutes');
const turnoRoutes = require('./turnoRoutes');
const curso_disciplinaRouter = require('./curso_disciplinaRoutes');
const loginRouter = require('./loginRoutes');
router.get("/admin/check-auth", auth, (req, res) => {
    res.json({
        valido: true,
        usuario: req.user
    });
});

router.use('/admin', adminRoutes);
router.use('/curso', cursoRoutes);
router.use('/disciplina', disciplinaRoutes);
router.use('/horario', horarioRoutes);
router.use('/periodo', periodoRoutes);
router.use('/professor', professorRoutes);
router.use('/sala', salaRoutes);
router.use('/turno', turnoRoutes);
router.use('/curso/disciplina', curso_disciplinaRouter);
router.use('/login', loginRouter);


module.exports = router;

