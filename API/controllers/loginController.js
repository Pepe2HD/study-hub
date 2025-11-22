const { Admin } = require('../models');
const { Op } = require("sequelize");
const jwt = require("jsonwebtoken");
const sendMail = require("../email/mailer");
const bcrypt = require("bcryptjs");
require('dotenv').config();

class loginController {
    async sendCode (req, res) {
        try {
            const { user, senha } = req.body;

            let admin = await Admin.findOne({ where: { email: user } });
            
            if (!admin) {
                admin = await Admin.findOne({ where: { nome: user } });
                if (!admin) {
                    return res.status(400).json({ erro: "Código inválido ou expirado." });
                }
            }

            const senhaValida = await bcrypt.compare(senha, admin.senha);
            if (!senhaValida) return res.status(401).json({ erro: "Senha incorreta" });

            const code = Math.floor(100000 + Math.random() * 900000).toString();

            const expires = new Date(Date.now() + 10 * 60 * 1000); 

            await admin.update({
                login_code: code,
                login_expires: expires
            });

            const htmlTemplate = `
                <div style="font-family: Arial, sans-serif; max-width:480px; margin:auto; padding:24px; border-radius:8px; border:1px solid #e5e5e5;">
                <h3>Olá, ${admin.nome}</h3>
                <p>Seu código de acesso é:</p>
                <div style="text-align:center; margin:24px 0;">
                    <span style="font-size:32px; font-weight:bold; color:#2c7be5; background:#f1f5ff; padding:12px 20px; border-radius:6px; border:1px solid #d7e3ff;">
                    ${code}
                    </span>
                </div>
                <p>Ele expira em <strong>10 minutos</strong>.</p>
                <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
                <p style="font-size:12px; color:#aaa; text-align:center;">
                    Se não foi você quem solicitou este código, ignore esta mensagem.
                </p>
                </div>
            `;

            await sendMail({
                to: email,
                subject: "Seu código de login",
                html: htmlTemplate
            });

            return res.json({ mensagem: "Código enviado para o e-mail." });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ erro: "Erro interno do servidor:", error });
        }
    }

    async validateCode (req, res) {
        try {
            const { user, code } = req.body;

            let admin = await Admin.findOne({
                where: {
                email: user,
                login_code: code,
                login_expires: { [Op.gt]: new Date() }
                }
            });

            if (!admin) {
                admin = await Admin.findOne({
                    where: {
                    nome: user,
                    login_code: code,
                    login_expires: { [Op.gt]: new Date() }
                    }
                });
                if (!admin) {
                    return res.status(400).json({ erro: "Código inválido ou expirado." });
                }
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

            const htmlTemplate = `
                    <div style="
                    font-family: Arial, sans-serif;
                    max-width: 480px;
                    margin: auto;
                    background: #ffffff;
                    padding: 24px;
                    border-radius: 8px;
                    border: 1px solid #e5e5e5;
                    ">
                    
                    <h2 style="color: #333; margin-bottom: 10px;">
                        Redefinição de Senha
                    </h2>

                    <p style="font-size: 15px; color: #555; line-height: 1.5;">
                        Você solicitou a redefinição da sua senha. Clique no botão abaixo para continuar:
                    </p>

                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${link}" style="
                            background: #2c7be5;
                            color: #fff;
                            padding: 12px 20px;
                            border-radius: 6px;
                            text-decoration: none;
                            font-size: 16px;
                            font-weight: bold;
                            display: inline-block;
                        ">
                        Redefinir Senha
                        </a>
                    </div>

                    <p style="font-size: 14px; color: #555; line-height: 1.5;">
                        Caso o botão não funcione, copie e cole o link abaixo em seu navegador:
                    </p>

                    <p style="
                        font-size: 13px;
                        color: #777;
                        word-break: break-all;
                        background: #f8f8f8;
                        padding: 10px;
                        border-radius: 6px;
                        border: 1px solid #e1e1e1;
                    ">
                        ${link}
                    </p>

                    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

                    <p style="font-size: 12px; color: #aaa; text-align: center;">
                        Se você não solicitou esta redefinição, apenas ignore este e-mail.
                    </p>
                    </div>
                `;

            await sendMail({
                to: email,
                subject: "Redefinição de senha",
                html: htmlTemplate
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

