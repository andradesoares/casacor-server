'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Profissionals', {
      profissional_userId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nomeEscritorio: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      datadeNascimento: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      cpf: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      endereco: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      nomeResponsavelObra: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      telefoneResponsavelObra: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      emailResponsavelObra: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Profissionals');
  },
};
