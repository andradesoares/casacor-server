const express = require('express');

const UserController = require('../controllers/User');

const { validadeBody, schemas } = require('../helpers/inputValidation');

const Router = express.Router();

Router.route('/fornecedor/signup').post(
  validadeBody(schemas.fornecedorSchema),
  UserController.fornecedorSignUp
);
Router.route('/fornecedor/fornecedorUpdate').post(
  validadeBody(schemas.fornecedorUpdateSchema),
  UserController.fornecedorUpdate
);

Router.route('/profissional/signup').post(
  validadeBody(schemas.profissionalSchema),
  UserController.profissionalSignUp
);
Router.route('/profissional/profissionalUpdate').post(
  validadeBody(schemas.profissionalUpdateSchema),
  UserController.profissionalUpdate
);
Router.route('/admin/signup').post(validadeBody(schemas.adminSchema), UserController.adminSignUp);
Router.route('/requestPasswordReset').post(
  validadeBody(schemas.resetPasswordRequestSchema),
  UserController.resetPasswordRequest
);
Router.route('/passwordReset').post(
  validadeBody(schemas.resetPasswordSchema),
  UserController.resetPassword
);

module.exports = Router;
