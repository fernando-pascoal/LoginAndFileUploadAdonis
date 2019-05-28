'use strict';

const User = use('App/Models/User');
const Mail = use('Mail');
const crypto = require('crypto');
const moment = require('moment');

class ForgotPasswordController {
  async store({ request, response }) {
    try {
      const email = request.input('email');
      const user = await User.findByOrFail('email', email);

      user.token = crypto.randomBytes(20).toString('hex');
      user.token_created_at = new Date();

      await user.save();
      await Mail.send(
        ['emails.forgot_password'],
        {
          email,
          user,
          token: user.token,
          link: `${request.input('redirect_url')}?token=${user.token}`,
        },
        message => {
          message
            .to(email)
            .from('betdicas@betdicas.com')
            .subject('Solicitação de troca de senha');
        }
      );
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Problemas na recuperação de senha, esse email existe?',
        },
      });
    }
  }

  async update({ request, response }) {
    try {
      const { token, password } = request.all();

      const user = await User.findByOrFail('token', token);
      const tokenExpired = moment()
        .subtract('2', 'day')
        .isAfter(user.token_created_at);

      if (tokenExpired) {
        return response.status(401).send({
          error: {
            message: 'O token de recuperação esta expirado',
          },
        });
      }

      user.token = null;
      user.token_created_at = null;
      user.password = password;

      await user.save();
    } catch (error) {
      return response.status(error.status).send({
        error: {
          message: 'Algo deu errado ao resetar sua senha',
        },
      });
    }
  }
}

module.exports = ForgotPasswordController;
