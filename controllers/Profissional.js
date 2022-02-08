const crypto = require('crypto');
const { Op } = require('sequelize');
const fs = require('fs');
const googleDrive = require('../helpers/googleDrive');

const {
  Fornecedor,
  Profissional,
  FornecedorProfissional,
  Ambiente,
  Sustentabilidade,
  Mensagem,
} = require('../models');

module.exports = {
  lerUsuario: async (req, res, next) => {
    const { profissionalId } = req.body;

    try {
      const usuario = await Profissional.findOne({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        where: {
          profissional_userId: profissionalId,
        },
        include: {
          model: Ambiente,
          where: {
            profissional_userId: profissionalId,
          },
          include: {
            model: Sustentabilidade,
          },
        },
      });

      const mensagens = await Mensagem.findAll({
        where: {
          [Op.or]: [{ destinatario: 'todos' }, { destinatario: 'profissionais' }],
        },
      });

      res.status(200).send({ usuario, mensagens });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Erro ao encontrar usuarios' });
    }
  },
  editarAmbiente: async (req, res, next) => {
    const { nome, userId, aguaDeChuva, materialReciclavel, energiaSolar } = req.body;

    try {
      const ambienteToUpdate = await Ambiente.findOne({
        where: {
          profissional_userId: userId,
        },
        include: {
          model: Sustentabilidade,
        },
      });

      await Ambiente.update(
        { nome: nome },
        {
          where: {
            profissional_userId: userId,
          },
        }
      );

      await Sustentabilidade.update(
        {
          aguaDeChuva: aguaDeChuva,
          materialReciclavel: materialReciclavel,
          energiaSolar: energiaSolar,
        },
        {
          where: {
            ambiente_id: ambienteToUpdate.dataValues.id,
          },
        }
      );

      const ambiente = await Ambiente.findOne({
        where: {
          profissional_userId: userId,
        },
        include: {
          model: Sustentabilidade,
        },
      });

      res.status(200).send({ ambiente });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao encontrar usuarios' });
    }
  },
  lerConexoes: async (req, res, next) => {
    const { profissionalId } = req.query;

    try {
      const fornecedores = await Fornecedor.findAll({
        joinTableAttributes: ['status'],
        include: {
          model: Profissional,
          where: { profissional_userId: profissionalId },
          required: false,
          attributes: ['profissional_userId', 'nome'],
        },
        attributes: ['fornecedor_userId', 'nome'],
        order: [['nome', 'ASC']],
        where: { status: 'confirmado' },
      });

      const fornecedoresAdicionados = fornecedores.filter(
        (fornecedor) => fornecedor.Profissionals[0]?.profissional_userId == profissionalId
      );

      const fornecedoresNaoAdicionados = fornecedores.filter(
        (fornecedor) => fornecedor.Profissionals[0]?.profissional_userId !== profissionalId
      );

      res.status(200).send({ fornecedoresAdicionados, fornecedoresNaoAdicionados });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao encontrar usuarios' });
    }
  },
  adicionarFornecedor: async (req, res, next) => {
    const { usuarioId, usuarioOpostoId } = req.body;

    try {
      const usuarioProfissional = await Profissional.findOne({
        where: {
          profissional_userId: usuarioId,
        },
        attributes: ['profissional_userId', 'nome'],
      });

      const usuarioFornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: usuarioOpostoId,
        },
        attributes: ['fornecedor_userId', 'nome'],
      });

      if (!usuarioFornecedor || !usuarioProfissional) {
        return res.status(422).send({ error: 'Usuario não encontrado' });
      }
      const id = crypto.randomBytes(32).toString('hex');

      await FornecedorProfissional.create({
        relacaoId: id,
        fornecedor_userId: usuarioOpostoId,
        profissional_userId: usuarioId,
        status: 'pendente',
        iniciadoPor: 'profissional',
      });

      usuarioFornecedor.dataValues.Profissionals = [
        {
          usuarioProfissional,
          FornecedorProfissional: {
            relacaoId: id,
            fornecedor_userId: usuarioOpostoId,
            profissional_userId: usuarioId,
            status: 'pendente',
            iniciadoPor: 'profissional',
          },
        },
      ];

      res.status(200).send({ message: 'Fornecedor adicionado', fornecedor: usuarioFornecedor });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao adicionar usuario' });
    }
  },
  responderSolicitacaoFornecedor: async (req, res, next) => {
    const { usuarioId, usuarioOpostoId, resposta } = req.body;

    try {
      const usuarioProfissional = await Profissional.findOne({
        where: {
          profissional_userId: usuarioId,
        },
        attributes: ['profissional_userId', 'nome'],
      });

      const usuarioFornecedor = await Fornecedor.findOne({
        where: {
          fornecedor_userId: usuarioOpostoId,
        },
        attributes: ['fornecedor_userId', 'nome'],
      });

      if (!usuarioFornecedor || !usuarioProfissional) {
        return res.status(422).send({ error: 'Usuario não econtrado' });
      }

      const conexao = await FornecedorProfissional.findOne({
        where: {
          fornecedor_userId: usuarioOpostoId,
          profissional_userId: usuarioId,
        },
      });

      if (conexao) {
        usuarioFornecedor.dataValues.Profissionals = [
          {
            usuarioProfissional,
            FornecedorProfissional: conexao.dataValues,
          },
        ];
        if (conexao.dataValues.iniciadoPor == 'fornecedor') {
          if (resposta == 'confirmado') {
            conexao.status = 'confirmado';
            conexao.save();
          } else {
            conexao.destroy();
            return res
              .status(200)
              .send({ message: 'Conexao terminada', fornecedor: usuarioFornecedor });
          }
        } else {
          return res.status(400).send({ error: 'Conexao já existente' });
        }
        res.status(200).send({ message: 'Profissional adicionado', fornecedor: usuarioFornecedor });
      }
    } catch (error) {
      res.status(500).send({ error: 'Erro ao adicionar usuario' });
    }
  },
  cancelarConexaoIniciadaProfissional: async (req, res, next) => {
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
        return res.status(422).send({ error: 'Usuario não econtrado' });
      }

      const conexao = await FornecedorProfissional.findOne({
        where: {
          fornecedor_userId: fornecedorId,
          profissional_userId: profissionalId,
        },
      });

      if (conexao) {
        if (conexao.dataValues.iniciadoPor == 'profissional' && conexao.status == 'pendente') {
          conexao.destroy();
        }
        res.status(200).send({ message: 'Conexao Cancelada', fornecedor: usuarioFornecedor });
      } else {
        return res.status(400).send({ error: 'Conexao não existente' });
      }
    } catch (error) {
      res.status(500).send({ error: 'Erro ao cancelar conexao' });
    }
  },
  fileUpload: async (req, res, next) => {
    try {
      const { userId, nome } = req.body;

      const id = await googleDrive.createAndUploadFile(
        googleDrive.auth,
        `public/images/profissional/${nome}`,
        nome,
        process.env.GOOGLEDRIVE_PROFI_FOLDER
      );

      if (!id) {
        res.status(500).json({ error: 'Erro enviando arquivo.' });
      }

      await Profissional.update(
        { logo: id },
        {
          where: {
            profissional_userId: userId,
          },
        }
      );

      fs.rename(
        __dirname + `/../public/images/profissional/${nome}`,
        __dirname + `/../public/images/profissional/${id}.jpg`,
        () => {
          console.log('\nFile Renamed!\n');
        }
      );
      res.status(200).json({ message: 'Arquivo enviado.', id });
    } catch (erro) {
      console.log(erro);
      res.status(500).json({ error: 'Erro enviando arquivo.' });
    }
  },

  fileDelete: async (req, res, next) => {
    try {
      const { logoId, userId } = req.body;

      await googleDrive.deleteFile(googleDrive.auth, logoId);

      await Profissional.update(
        { logo: null },
        {
          where: {
            profissional_userId: userId,
          },
        }
      );

      fs.unlinkSync(__dirname + `/../public/images/profissional/${logoId}.jpg`);

      res.status(200).json({ message: 'Arquivo excluido.' });
    } catch (err) {
      res.status(500).json({ error: 'Erro excluindo arquivo.' });
    }
  },
};
