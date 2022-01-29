const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const path = require('path');

const fs = require('fs');
const { google } = require('googleapis');
const sendEmail = require('../helpers/sendEmail');
const { Fornecedor, Profissional, TokenPassword, Admin, Ambiente } = require('../models');

module.exports = {
  fornecedorSignUp: async (req, res, next) => {
    try {
      const {
        nome,
        tipo,
        descricaoProduto,
        telefone,
        email,
        siteEmpresa,
        perfilInstagram,
        password,
      } = req.value.body;

      const usuarioExistente = await Fornecedor.findOne({
        where: {
          email: email,
        },
      });

      if (usuarioExistente) {
        return res.status(400).json({ error: 'Erro ao cadastrar usuario' });
      }

      const userId = crypto.randomBytes(32).toString('hex');
      const hashPassword = bcrypt.hashSync(password, 10);

      await Fornecedor.create({
        fornecedor_userId: userId,
        nome: nome,
        status: 'pendente',
        tipo: tipo,
        email: email,
        descricaoProduto: descricaoProduto,
        telefone: telefone,
        siteEmpresa: siteEmpresa,
        perfilInstagram: perfilInstagram,
        password: hashPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      res.status(200).json({
        message:
          'Usuario cadastrado. Aguarde a administração autorizar o cadastro para fazer login',
      });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao cadastrar usuario' });
    }
  },
  profissionalSignUp: async (req, res, next) => {
    try {
      const {
        nome,
        tipo,
        nomeEscritorio,
        dataDeNascimento,
        cpf,
        email,
        endereco,
        nomeResponsavelObra,
        telefoneResponsavelObra,
        emailResponsavelObra,
        password,
      } = req.value.body;

      const usuarioExistente = await Profissional.findOne({
        where: {
          email: email,
        },
      });

      if (usuarioExistente) {
        return res.status(400).json({ error: 'Erro ao cadastrar usuario' });
      }
      const userId = crypto.randomBytes(32).toString('hex');

      const hashPassword = bcrypt.hashSync(password, 10);

      await Profissional.create({
        profissional_userId: userId,
        nome: nome,
        tipo: tipo,
        status: 'pendente',
        nomeEscritorio: nomeEscritorio,
        datadeNascimento: dataDeNascimento,
        cpf: cpf,
        email: email,
        endereco: endereco,
        nomeResponsavelObra: nomeResponsavelObra,
        telefoneResponsavelObra: telefoneResponsavelObra,
        emailResponsavelObra: emailResponsavelObra,
        password: hashPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const ambienteId = crypto.randomBytes(32).toString('hex');

      await Ambiente.create({
        id: ambienteId,
        profissional_userId: userId,
      });

      res.status(200).json({
        message:
          'Usuario cadastrado. Aguarde a administração autorizar o cadastro para fazer login',
      });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao cadastrar usuario.' });
    }
  },
  adminSignUp: async (req, res, next) => {
    try {
      const { nome, tipo, email, admin_userId } = req.value.body;

      const usuarioExistente = await Admin.findOne({
        where: {
          email: email,
        },
      });

      if (usuarioExistente) {
        return res.status(400).json({ message: 'Erro ao cadastrar usuario' });
      }

      let admin = await Admin.findOne({
        where: {
          admin_userId: admin_userId,
        },
      });

      if (admin.status !== 'pleno') {
        res.status(401).send({ error: 'Usuario sem autorização' });
      }

      const userId = crypto.randomBytes(32).toString('hex');
      const password = crypto.randomBytes(32).toString('hex');
      const hashPassword = bcrypt.hashSync(password, 10);

      await Admin.create({
        admin_userId: userId,
        nome: nome,
        tipo: tipo,
        email: email,
        password: hashPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      let token = await TokenPassword.findOne({
        where: {
          email: email,
        },
      });

      if (token) await token.destroy();

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHashed = await bcrypt.hash(resetToken, Number(process.env.bcryptSalt));

      await TokenPassword.create({
        email: email,
        userId: userId,
        token: resetTokenHashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const link = `https://casacor-client.vercel.app/admin/recuperar-senha/nova/?tipo=${tipo}&resetToken=${resetToken}&userId=${userId}`;

      sendEmail.sendEmail(email, 'Password Reset Request', link);

      res.status(200).json({ message: 'Usuario cadastrado.', userId });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Erro ao cadastrar usuario' });
    }
  },
  resetPasswordRequest: async (req, res, next) => {
    try {
      const { email, tipo } = req.value.body;
      let usuario;
      if (tipo == 'fornecedor') {
        usuario = await Fornecedor.findOne({
          where: {
            email: email,
          },
        });
      } else if (tipo == 'profissional') {
        usuario = await Profissional.findOne({
          where: {
            email: email,
          },
        });
      } else if (tipo == 'admin') {
        usuario = await Admin.findOne({
          where: {
            email: email,
          },
        });
      }

      if (!usuario) {
        return res.status(422).send({ error: 'Email invalido' });
      }

      let token = await TokenPassword.findOne({
        where: {
          email: email,
        },
      });

      if (token) await token.destroy();

      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHashed = await bcrypt.hash(resetToken, Number(process.env.bcryptSalt));

      await TokenPassword.create({
        email: email,
        userId: usuario.userId,
        token: resetTokenHashed,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const link = `https://casacor-client.vercel.app/recuperar-senha/nova/?tipo=${tipo}&resetToken=${resetToken}&userId=${usuario.userId}`;

      sendEmail.sendEmail(email, 'Password Reset Request', link);

      return res.json({ message: 'Link para troca de senha enviado' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao enviar email' });
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      const { password, resetToken, userId, tipo } = req.value.body;
      const passwordResetToken = await TokenPassword.findOne({ where: { userId: userId } });

      if (!passwordResetToken) {
        return res.json({ error: 'Token invalido' });
      }

      const isValid = await bcrypt.compare(resetToken, passwordResetToken.token);

      if (!isValid) {
        return res.json({ error: 'Token invalido' });
      }

      const hashPassword = bcrypt.hashSync(password, 10);

      if (tipo == 'fornecedor') {
        await Fornecedor.update(
          { password: hashPassword },
          {
            where: {
              fornecedor_userId: userId,
            },
          }
        );
      } else if (tipo == 'profissional') {
        await Profissional.update(
          { password: hashPassword },
          {
            where: {
              profissional_userId: userId,
            },
          }
        );
      } else if (tipo == 'admin') {
        await Admin.update(
          { password: hashPassword },
          {
            where: {
              admin_userId: userId,
            },
          }
        );
      }

      await passwordResetToken.destroy();

      res.status(200).json({ message: 'Senha trocada' });
    } catch (err) {
      res.status(500).json({ error: 'Erro ao trocar senha' });
    }
  },
  fornecedorUpdate: async (req, res, next) => {
    try {
      const { userId, nome, descricaoProduto, telefone, siteEmpresa, perfilInstagram } =
        req.value.body;

      const fornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: userId,
        },
      });

      if (!fornecedor) {
        return res.status(400).json({ error: 'Usuario não encontrado' });
      }

      await fornecedor.set({
        nome: nome,
        descricaoProduto: descricaoProduto,
        telefone: telefone,
        siteEmpresa: siteEmpresa,
        perfilInstagram: perfilInstagram,
      });

      res.status(200).json({ message: 'Usuario atualizado.', usuario: fornecedor });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Erro atualizando usuario.' });
    }
  },
  profissionalUpdate: async (req, res, next) => {
    try {
      const { userId, nome, descricaoProduto, telefone, siteEmpresa, perfilInstagram } =
        req.value.body;

      const fornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: userId,
        },
      });

      if (!fornecedor) {
        return res.status(400).json({ error: 'Usuario não encontrado' });
      }

      await fornecedor.set({
        nome: nome,
        descricaoProduto: descricaoProduto,
        telefone: telefone,
        siteEmpresa: siteEmpresa,
        perfilInstagram: perfilInstagram,
      });

      res.status(200).json({ message: 'Usuario atualizado', usuario: fornecedor });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: 'Error atualizando usuario.' });
    }
  },
};
