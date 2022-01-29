const express = require('express');

const AdminController = require('../controllers/Admin');
const requireAuth = require('../middlewares/requireAuth');

const Router = express.Router();

Router.route('/getUsuario').post(AdminController.getOne);
Router.route('/getUsuarios').post(AdminController.getUsuarios);
Router.route('/getAll').post(AdminController.getAll);
Router.route('/excluirAdmin').post(AdminController.excluirAdmin);
Router.route('/respostaCadastro').post(AdminController.respostaCadastro);

module.exports = Router;
