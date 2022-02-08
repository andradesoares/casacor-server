const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('public/images/profissional'));
  },
  filename: function (req, file, cb) {
    cb(null, req.body.nome);
  },
});

const upload = multer({ storage: storage });

const ProfissionaisController = require('../controllers/Profissional');
const requireAuth = require('../middlewares/requireAuth');

const { validadeBody, schemas } = require('../helpers/inputValidation');

const Router = express.Router();

Router.route('/lerUsuario').post(ProfissionaisController.lerUsuario);
Router.route('/lerConexoes').get(ProfissionaisController.lerConexoes);
Router.route('/adicionarfornecedor').post(requireAuth, ProfissionaisController.adicionarFornecedor);
Router.route('/confirmarConexao').post(
  requireAuth,
  ProfissionaisController.responderSolicitacaoFornecedor
);
Router.route('/cancelarConexao').post(
  requireAuth,
  ProfissionaisController.cancelarConexaoIniciadaProfissional
);
Router.route('/editarAmbiente').post(ProfissionaisController.editarAmbiente);
Router.route('/fileUpload').post(upload.any(), ProfissionaisController.fileUpload);
Router.route('/fileDelete').post(ProfissionaisController.fileDelete);

module.exports = Router;
