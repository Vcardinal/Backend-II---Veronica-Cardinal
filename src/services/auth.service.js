const crypto = require('crypto');
const bcrypt = require('bcrypt');

class AuthService {
  constructor(usersDAO, mailer) {
    this.usersDAO = usersDAO;
    this.mailer = mailer;
  }

  async forgotPassword(email) {
    if (!email) return;

    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.usersDAO.getByEmailWithPassword(normalizedEmail);

  
    if (!user) return;

    const token = crypto.randomBytes(20).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hora

    user.resetPasswordToken = token;
    user.resetPasswordExpires = expires;
    await user.save();

    const resetLink = `${process.env.RESET_PASSWORD_URL}?token=${token}`;

    await this.mailer.sendMail({
      to: user.email,
      subject: 'Restablecer contraseña',
      html: `
        <h3>Recuperación de contraseña</h3>
        <p>Hacé click en el siguiente enlace para restablecer tu contraseña:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>Este enlace vence en 1 hora.</p>
      `,
    });
  }

   async resetPassword(token, newPassword) {
    if (!token || !newPassword) {
      const err = new Error('Datos inválidos');
      err.status = 400;
      throw err;
    }

    const user = await this.usersDAO.findByResetToken(token);
    if (!user) {
      const err = new Error('Token inválido o expirado');
      err.status = 400;
      throw err;
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      const err = new Error(
        'La nueva contraseña no puede ser igual a la anterior'
      );
      err.status = 400;
      throw err;
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();
  }
}

module.exports = AuthService;
