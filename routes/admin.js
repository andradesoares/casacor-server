const express = require('express');

const AdminController = require('../controllers/Admin');
const requireAuth = require('../middlewares/requireAuth');

const { validadeBody, schemas } = require('../helpers/inputValidation');

const Router = express.Router();

Router.route('/getUsuario').post(AdminController.getOne);
Router.route('/getUsuarios').post(AdminController.getUsuarios);
Router.route('/getAll').post(AdminController.getAll);
Router.route('/excluirAdmin').post(AdminController.excluirAdmin);
Router.route('/respostaCadastro').post(AdminController.respostaCadastro);
Router.route('/enviarMensagem').post(
  validadeBody(schemas.mensagemSchema),
  AdminController.enviarMensagem
);

module.exports = Router;
