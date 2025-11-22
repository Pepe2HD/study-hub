const { Admin } = require('../models');
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const mailer = require("../email/mailer");
const bcrypt = require("bcryptjs");
require('dotenv').config();

class loginController {
    async sendCode (req, res) {
        try {
            const { email, senha } = req.body;

            const admin = await Admin.findOne({ where: { email } });
            if (!admin) return res.status(404).json({ erro: "Email incorreto" });

            const senhaValida = await bcrypt.compare(senha, admin.senha);
            if (!senhaValida) return res.status(401).json({ erro: "Senha incorreta" });

            const code = Math.floor(100000 + Math.random() * 900000).toString();

            const expires = new Date(Date.now() + 10 * 60 * 1000); 

            await admin.update({
                login_code: code,
                login_expires: expires
            });

            await mailer.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Seu código de login",
                html: `
                <h3>Olá, ${admin.nome}</h3>
                <p>Seu código de acesso é:</p>
                <h2>${code}</h2>
                <p>Ele expira em 10 minutos.</p>
                `
            });

            return res.json({ mensagem: "Código enviado para o e-mail." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro interno do servidor", error });
        }
    }

    async validateCode (req, res) {
        try {
            const { email, code } = req.body;

            const admin = await Admin.findOne({
                where: {
                email,
                login_code: code,
                login_expires: { [Op.gt]: new Date() }
                }
            });

            if (!admin) {
                return res.status(400).json({ erro: "Código inválido ou expirado." });
            }

            await admin.update({
                login_code: null,
                login_expires: null,
            });

            const token = jwt.sign(
                { id: admin.id_admin, email: admin.email },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({ mensagem: "Login autorizado!", token });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    async forgotPass (req,res) {
        try {
            const { email } = req.body;
            const admin = await Admin.findOne({ where: { email } });
            if (!admin) return res.status(404).json({ erro: "Email não encontrado" });

            const crypto = require("crypto");
            const token = crypto.randomBytes(32).toString("hex");
            const expires = new Date(Date.now() + 3600000); // 1h

            await admin.update({ reset_token: token, reset_expires: expires });

            const link = `${process.env.BASE_URL}/reset-password/${token}`;
            await mailer.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: "Redefinição de senha",
                html: `<p>Clique no link para redefinir sua senha:</p><a href="${link}">${link}</a>`
            });

            res.json({ mensagem: "Email enviado com instruções para redefinir a senha." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro interno do servidor" });
        }
    }

    async validateToken (req, res) {
        const { token } = req.params;
        const admin = await Admin.findOne({
            where: { reset_token: token, reset_expires: { [Op.gt]: new Date() } }
        });

        if (!admin) return res.status(400).send("Token inválido ou expirado.");
        res.json({ mensagem: "Token válido." });
    }

    async resetPass (req, res) {
        const { token, novaSenha } = req.body;

        const admin = await Admin.findOne({
            where: { reset_token: token, reset_expires: { [Op.gt]: new Date() } }
        });

        if (!admin) return res.status(400).json({ erro: "Token inválido ou expirado." });

        const hashed = await bcrypt.hash(novaSenha, 10);

        await admin.update({ senha: hashed, reset_token: null, reset_expires: null });

        res.json({ mensagem: "Senha redefinida com sucesso!" });
    }
}


module.exports = new loginController();
