require('dotenv').config();

const express = require('express');
const cors = require('cors');
const app = express();
const path = require('path');

//Middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

//Routes
app.use('/user', require('./routes/user'));
app.use('/auth', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));
app.use('/fornecedor', require('./routes/fornecedores'));
app.use('/profissional', require('./routes/profissionais'));

module.exports = app;
