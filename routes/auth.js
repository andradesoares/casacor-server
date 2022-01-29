const express = require('express');

const AuthController = require('../controllers/Auth');

const { validadeBody, schemas } = require('../helpers/inputValidation');

const Router = express.Router();

Router.route('/signin').post(validadeBody(schemas.authSchema), AuthController.signIn);

module.exports = Router;
