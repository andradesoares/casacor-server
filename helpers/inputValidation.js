const joi = require('joi');

module.exports = {
  validadeBody: (schema) => {
    return (req, res, next) => {
      const result = schema.validate(req.body);

      if (result.error) {
        return res.status(400).json({ message: result.error.details[0].message });
      }

      if (!req.value) {
        req.value = {};
      }

      req.value['body'] = result.value;

      next();
    };
  },
  validadeQuery: (schema) => {
    return (req, res, next) => {
      const result = schema.validate(req.query);

      if (result.error) {
        return res.status(400).json({ message: result.error.details[0].message });
      }

      if (!req.value) {
        req.value = {};
      }

      req.value['query'] = result.value;

      next();
    };
  },
  schemas: {
    authSchema: joi.object().keys({
      tipo: joi.string().required(),
      email: joi.string().email().required(),
      password: joi.string().pattern(new RegExp('.{3,30}$')).required(),
    }),
    fornecedorSchema: joi.object().keys({
      nome: joi.string().required(),
      descricaoProduto: joi.string().required(),
      telefone: joi.string().required(),
      tipo: joi.string().required(),
      siteEmpresa: joi.string().required(),
      perfilInstagram: joi.string().required(),
      password: joi.string().pattern(new RegExp('.{3,30}$')).required(),
      email: joi.string().email().required(),
    }),
    fornecedorUpdateSchema: joi.object().keys({
      userId: joi.string().required(),
      nome: joi.string().required(),
      descricaoProduto: joi.string().required(),
      telefone: joi.string().required(),
      siteEmpresa: joi.string().required(),
      perfilInstagram: joi.string().required(),
    }),
    profissionalSchema: joi.object().keys({
      nome: joi.string().required(),
      nomeEscritorio: joi.string().required(),
      dataDeNascimento: joi.string().required(),
      tipo: joi.string().required(),
      cpf: joi.string().required(),
      email: joi.string().email().required(),
      endereco: joi.string().required(),
      password: joi.string().pattern(new RegExp('.{3,30}$')).required(),
    }),
    profissionalUpdateSchema: joi.object().keys({
      userId: joi.string().required(),
      nome: joi.string().required(),
      nomeEscritorio: joi.string().required(),
      dataDeNascimento: joi.string().required(),
      cpf: joi.string().required(),
      endereco: joi.string().required(),
    }),
    adminSchema: joi.object().keys({
      admin_userId: joi.string().required(),
      nome: joi.string().required(),
      tipo: joi.string().required(),
      email: joi.string().email().required(),
    }),
    resetPasswordRequestSchema: joi.object().keys({
      tipo: joi.string().required(),
      email: joi.string().email().required(),
    }),
    resetPasswordSchema: joi.object().keys({
      tipo: joi.string().required(),
      password: joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
      userId: joi.string().required(),
      resetToken: joi.string().required(),
    }),
    mensagemSchema: joi.object().keys({
      userId: joi.string().required(),
      destinatario: joi.string().required(),
      mensagem: joi.string().required(),
      titulo: joi.string().required(),
    }),
  },
};
