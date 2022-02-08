const express = require('express');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join('public/images/fornecedor'));
  },
  filename: function (req, file, cb) {
    cb(null, req.body.nome);
  },
});

const upload = multer({ storage: storage });

const FornecedoresController = require('../controllers/Fornecedor');
const requireAuth = require('../middlewares/requireAuth');
const { validadeBody, schemas } = require('../helpers/inputValidation');

const Router = express.Router();

Router.route('/lerUsuario').post(FornecedoresController.lerUsuario);
Router.route('/lerConexoes').get(FornecedoresController.lerConexoes);
Router.route('/adicionarprofissional').post(
  requireAuth,
  FornecedoresController.adicionarProfissional
);
Router.route('/confirmarConexao').post(
  requireAuth,
  FornecedoresController.responderSolicitacaoProfissional
);
Router.route('/cancelarConexao').post(
  requireAuth,
  FornecedoresController.cancelarConexaoIniciadaFornecedor
);

Router.route('/fileUpload').post(upload.any(), FornecedoresController.fileUpload);
Router.route('/fileDelete').post(FornecedoresController.fileDelete);

module.exports = Router;
