const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const { Fornecedor, Profissional, Admin } = require('../models');

module.exports = {
  signIn: async (req, res, next) => {
    try {
      const { tipo, email, password } = req.value.body;

      let usuario;

      if (tipo == 'fornecedor') {
        usuario = await Fornecedor.findOne({
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          where: {
            email: email,
          },
        });
      } else if (tipo == 'profissional') {
        usuario = await Profissional.findOne({
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          where: {
            email: email,
          },
        });
      } else if (tipo == 'admin') {
        usuario = await Admin.findOne({
          attributes: { exclude: ['createdAt', 'updatedAt'] },
          where: {
            email: email,
          },
        });
      }

      if (!usuario) {
        return res.status(422).send({ error: 'Email ou senha invalido' });
      }

      if (tipo !== 'admin') {
        if (usuario.dataValues.status == 'pendente') {
          return res.status(422).send({ error: 'Usuario pendendo autorização.' });
        } else if (usuario.dataValues.status == 'bloqueado') {
          return res.status(422).send({ error: 'Usuario bloqueado.' });
        } else if (usuario.dataValues.status == 'recusado') {
          return res.status(422).send({ error: 'Usuario não foi aceito.' });
        }
      }

      if (!bcrypt.compareSync(password, usuario.dataValues.password)) {
        return res.status(422).send({ error: 'Email ou senha invalido.' });
      }

      const userId = usuario.dataValues[`${tipo}_userId`];

      const token = JWT.sign({ userId: userId, tipo: tipo }, 'MY_SECRET_KEY');

      delete usuario.dataValues.password;

      res.status(200).send({ token, userId, usuario });
    } catch (error) {
      res.status(400).send({ error: 'Erro ao logar usuario' });
    }
  },
};
