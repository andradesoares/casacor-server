const crypto = require('crypto');
const { Op } = require('sequelize');

const {
  Fornecedor,
  Profissional,
  FornecedorProfissional,
  Ambiente,
  Sustentabilidade,
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
      res.status(200).send({ usuario });
    } catch (error) {
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
    const { profissionalId, fornecedorId } = req.value.body;

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
        return res.status(422).send({ error: 'Usuario não encontrado' });
      }
      const id = crypto.randomBytes(32).toString('hex');

      await FornecedorProfissional.create({
        relacaoId: id,
        fornecedor_userId: fornecedorId,
        profissional_userId: profissionalId,
        status: 'pendente',
        iniciadoPor: 'profissional',
      });

      usuarioFornecedor.dataValues.Profissionals = [
        {
          usuarioProfissional,
          FornecedorProfissional: {
            relacaoId: id,
            fornecedor_userId: fornecedorId,
            profissional_userId: profissionalId,
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
    const { profissionalId, fornecedorId, resposta } = req.body;

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
        if (conexao.dataValues.iniciadoPor == 'fornecedor') {
          if (resposta == 'confirmado') {
            conexao.status = 'confirmado';
            conexao.save();
          } else {
            conexao.destroy();
            return res.status(400).send({ error: 'Conexao terminada' });
          }
        } else {
          return res.status(400).send({ error: 'Conexao já existente' });
        }
      }

      usuarioFornecedor.dataValues.Profissionals = [
        {
          usuarioProfissional,
          FornecedorProfissional: conexao.dataValues,
        },
      ];

      res.status(200).send({ message: 'Profissional adicionado', fornecedor: usuarioFornecedor });
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
};
