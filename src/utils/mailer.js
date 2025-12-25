const nodemailer = require('nodemailer');

const { MAIL_USER, MAIL_PASS, MAIL_FROM_NAME = 'Backend II' } = process.env;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
});

async function sendMail({ to, subject, html, text }) {
  return transporter.sendMail({
    from: `"${MAIL_FROM_NAME}" <${MAIL_USER}>`,
    to,
    subject,
    text,
    html,
  });
}

module.exports = { sendMail };
