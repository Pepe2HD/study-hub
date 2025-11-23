const sgMail = require("@sendgrid/mail");
require("dotenv").config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function sendMail({ to, subject, html }) {
    const msg = {
        to,
        from: process.env.EMAIL_USER, 
        subject,
        html
    };

    await sgMail.send(msg);
}

module.exports = sendMail;
