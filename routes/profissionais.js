const express = require('express');

const ProfissionaisController = require('../controllers/Profissional');
const requireAuth = require('../middlewares/requireAuth');

const { validadeBody, schemas } = require('../helpers/inputValidation');

const Router = express.Router();

Router.route('/lerUsuario').post(ProfissionaisController.lerUsuario);
Router.route('/lerConexoes').get(ProfissionaisController.lerConexoes);
Router.route('/adicionarFornecedor').post(
  requireAuth,
  validadeBody(schemas.addProfissional),
  ProfissionaisController.adicionarFornecedor
);
Router.route('/confirmarConexao').post(
  requireAuth,
  ProfissionaisController.responderSolicitacaoFornecedor
);
Router.route('/cancelarConexao').post(
  requireAuth,
  ProfissionaisController.cancelarConexaoIniciadaProfissional
);
Router.route('/editarAmbiente').post(ProfissionaisController.editarAmbiente);

module.exports = Router;
