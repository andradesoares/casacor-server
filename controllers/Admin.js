const { Op } = require('sequelize');

const { Fornecedor, Profissional, Admin, Ambiente, Sustentabilidade } = require('../models');

module.exports = {
  getOne: async (req, res, next) => {
    const { adminId } = req.body;
    try {
      const usuario = await Admin.findOne({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        where: {
          admin_userId: adminId,
        },
      });
      res.status(200).send({ usuario });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao encontrar usuario' });
    }
  },
  getAll: async (req, res, next) => {
    const { adminId } = req.body;

    try {
      const admins = await Admin.findAll({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        where: {
          admin_userId: {
            [Op.not]: adminId,
          },
        },
      });
      res.status(200).send({ admins });
    } catch (error) {
      res.status(500).send({ error: 'Erro ao encontrar usuarios' });
    }
  },
  excluirAdmin: async (req, res, next) => {
    const { admin_userId } = req.body;

    try {
      let admin = await Admin.findOne({
        where: {
          admin_userId: admin_userId,
        },
      });

      if (admin) await admin.destroy();
      res.status(200).send({ message: 'Admin excluido' });
    } catch (erro) {
      res.status(500).send({ error: 'Erro ao excluir usuario' });
    }
  },
  getUsuarios: async (req, res, next) => {
    try {
      let fornecedores = await Fornecedor.findAll({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
      });
      let profissionais = await Profissional.findAll({
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
        include: {
          model: Ambiente,
          include: {
            model: Sustentabilidade,
          },
        },
      });
      res.status(200).send({ fornecedores, profissionais });
    } catch (error) {
      console.log(error);
      res.status(500).send({ error: 'Erro ao encontrar usuarios' });
    }
  },
  respostaCadastro: async (req, res, next) => {
    const { admin_userId, tipoUsuario, status, userId } = req.body;

    console.log(userId);

    try {
      let usuario;
      if (tipoUsuario == 'fornecedor') {
        usuario = await Fornecedor.findOne({
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
          where: {
            fornecedor_userId: userId,
          },
        });
      } else if (tipoUsuario == 'profissional') {
        usuario = await Profissional.findOne({
          attributes: { exclude: ['password', 'createdAt', 'updatedAt'] },
          where: {
            profissional_userId: userId,
          },
        });
      }

      let admin = await Admin.findOne({
        where: {
          admin_userId: admin_userId,
        },
      });

      if (admin.tipo !== 'pleno') {
        res.status(401).send({ error: 'Usuario sem autorização' });
      }

      if (!usuario) {
        return res.status(422).send({ error: 'Usuario não encontrado' });
      }

      {
        status == 'confirmado' ? ((usuario.status = 'bloqueado'), usuario.save()) : null;
      }
      {
        status == 'pendente' || status == 'recusado' || status == 'bloqueado'
          ? ((usuario.status = 'confirmado'), usuario.save())
          : null;
      }
      {
        status == 'recusar' ? ((usuario.status = 'recusado'), usuario.save()) : null;
      }

      res.status(200).send({ message: 'Status Atualizado', usuario: usuario.dataValues });
    } catch (error) {
      console.log(error);
      res.status(500).send({ erro: 'Erro ao encontrar usuarios' });
    }
  },
};
