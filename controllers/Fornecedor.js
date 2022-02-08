const crypto = require('crypto');
const { Op } = require('sequelize');
const fs = require('fs');
const googleDrive = require('../helpers/googleDrive');

const { Fornecedor, Profissional, FornecedorProfissional, Mensagem } = require('../models');

module.exports = {
  lerUsuario: async (req, res, next) => {
    const { fornecedorId } = req.body;

    try {
      const usuario = await Fornecedor.findOne({
        attributes: { exclude: ['passord', 'createdAt', 'updatedAt'] },
        where: {
          fornecedor_userId: fornecedorId,
        },
      });

      const mensagens = await Mensagem.findAll({
        where: {
          [Op.or]: [{ destinatario: 'todos' }, { destinatario: 'fornecedores' }],
        },
      });

      // const response = await downloadFile(usuario.logo, auth);
      res.status(200).send({ usuario, mensagens });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao encontrar usuario' });
    }
  },

  lerConexoes: async (req, res, next) => {
    const { fornecedorId } = req.query;

    try {
      const profissionais = await Profissional.findAll({
        joinTableAttributes: ['status'],
        include: {
          model: Fornecedor,
          where: { fornecedor_userId: fornecedorId },
          required: false,
          attributes: ['fornecedor_userId', 'nome'],
        },
        attributes: ['profissional_userId', 'nome'],
        order: [['nome', 'ASC']],
        where: { status: 'confirmado' },
      });

      const profissionaisAdicionados = profissionais.filter(
        (profissional) => profissional.Fornecedors[0]?.fornecedor_userId == fornecedorId
      );

      const profissionaisNaoAdicionados = profissionais.filter(
        (profissional) => profissional.Fornecedors[0]?.fornecedor_userId !== fornecedorId
      );

      res.status(200).send({ profissionaisAdicionados, profissionaisNaoAdicionados });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao encontrar usuarios' });
    }
  },
  adicionarProfissional: async (req, res, next) => {
    const { usuarioId, usuarioOpostoId } = req.body;

    try {
      const usuarioProfissional = await Profissional.findOne({
        where: {
          profissional_userId: usuarioOpostoId,
        },
        attributes: ['profissional_userId', 'nome'],
      });

      const usuarioFornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: usuarioId,
        },
        attributes: ['fornecedor_userId', 'nome'],
      });

      if (!usuarioFornecedor || !usuarioProfissional) {
        return res.status(422).send({ error: 'Usuario não encontrado' });
      }
      const id = crypto.randomBytes(32).toString('hex');

      await FornecedorProfissional.create({
        relacaoId: id,
        fornecedor_userId: usuarioId,
        profissional_userId: usuarioOpostoId,
        status: 'pendente',
        iniciadoPor: 'fornecedor',
      });

      usuarioProfissional.dataValues.Fornecedors = [
        {
          usuarioFornecedor,
          FornecedorProfissional: {
            relacaoId: id,
            fornecedor_userId: usuarioId,
            profissional_userId: usuarioOpostoId,
            status: 'pendente',
            iniciadoPor: 'fornecedor',
          },
        },
      ];

      res
        .status(200)
        .send({ message: 'Profissional adicionado', profissional: usuarioProfissional });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao adicionar usuario' });
    }
  },
  responderSolicitacaoProfissional: async (req, res, next) => {
    const { usuarioId, usuarioOpostoId, resposta } = req.body;

    try {
      const usuarioProfissional = await Profissional.findOne({
        where: {
          profissional_userId: usuarioOpostoId,
        },
        attributes: ['profissional_userId', 'nome'],
      });

      const usuarioFornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: usuarioId,
        },
        attributes: ['fornecedor_userId', 'nome'],
      });

      if (!usuarioFornecedor || !usuarioProfissional) {
        return res.status(422).send({ error: 'User não eonctrado' });
      }

      const conexao = await FornecedorProfissional.findOne({
        where: {
          fornecedor_userId: usuarioId,
          profissional_userId: usuarioOpostoId,
        },
      });

      if (conexao) {
        usuarioProfissional.dataValues.Fornecedors = [
          {
            usuarioFornecedor,
            FornecedorProfissional: conexao.dataValues,
          },
        ];
        if (conexao.dataValues.iniciadoPor == 'profissional') {
          if (resposta == 'confirmado') {
            conexao.status = 'confirmado';
            conexao.save();
          } else {
            conexao.destroy();
            return res
              .status(200)
              .send({ message: 'Conexao terminada', profissional: usuarioProfissional });
          }
        } else {
          return res.status(400).send({ error: 'Conexao já existente' });
        }
        res
          .status(200)
          .send({ message: 'Profissional adicionado', profissional: usuarioProfissional });
      }
    } catch (error) {
      res.status(500).send({ error: 'Erro ao adicionar usuario' });
    }
  },
  cancelarConexaoIniciadaFornecedor: async (req, res, next) => {
    const { profissionalId, fornecedorId } = req.body;

    try {
      const usuarioProfissional = await Profissional.findOne({
        where: {
          profissional_userId: profissionalId,
        },
        attributes: ['profissional_userId', 'nome'],
      });

      const usuarioFornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: fornecedorId,
        },
        attributes: ['fornecedor_userId', 'nome'],
      });

      if (!usuarioFornecedor || !usuarioProfissional) {
        return res.status(422).send({ error: 'User não encontrado' });
      }

      const conexao = await FornecedorProfissional.findOne({
        where: {
          fornecedor_userId: fornecedorId,
          profissional_userId: profissionalId,
        },
      });

      if (conexao) {
        if (conexao.dataValues.iniciadoPor == 'fornecedor' && conexao.status == 'pendente') {
          conexao.destroy();
        }
        res.status(200).send({ message: 'Conexao Cancelada', profissional: usuarioProfissional });
      } else {
        return res.status(400).send({ error: 'Conexao não encontrada' });
      }
    } catch (error) {
      res.status(500).send({ error: 'Erro ao adicionar usuario' });
    }
  },

  fileUpload: async (req, res, next) => {
    try {
      const { userId, nome } = req.body;

      const id = await googleDrive.createAndUploadFile(
        googleDrive.auth,
        `public/images/fornecedor/${nome}`,
        nome,
        process.env.GOOGLEDRIVE_FORNE_FOLDER
      );

      if (!id) {
        res.status(500).json({ error: 'Erro enviando arquivo.' });
      }

      await Fornecedor.update(
        { logo: id },
        {
          where: {
            fornecedor_userId: userId,
          },
        }
      );

      fs.rename(
        __dirname + `/../public/images/fornecedor/${nome}`,
        __dirname + `/../public/images/fornecedor/${id}.jpg`,
        () => {
          console.log('\nFile Renamed!\n');
        }
      );
      res.status(200).json({ message: 'Arquivo enviado.', id });
    } catch (err) {
      res.status(500).json({ error: 'Erro enviando arquivo.' });
    }
  },

  fileDelete: async (req, res, next) => {
    try {
      const { logoId, userId } = req.body;

      await googleDrive.deleteFile(googleDrive.auth, logoId);

      await Fornecedor.update(
        { logo: null },
        {
          where: {
            fornecedor_userId: userId,
          },
        }
      );

      fs.unlinkSync(__dirname + `/../public/images/fornecedor/${logoId}.jpg`);

      res.status(200).json({ message: 'Arquivo excluido.' });
    } catch (err) {
      res.status(500).json({ error: 'Erro excluindo arquivo.' });
    }
  },
};
