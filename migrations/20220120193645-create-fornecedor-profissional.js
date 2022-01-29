'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('FornecedorProfissionals', {
      relacaoId: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fornecedor_userId: {
        type: Sequelize.STRING,
        references: {
          model: 'Fornecedors',
          key: 'fornecedor_userId',
        },
      },
      profissional_userId: {
        type: Sequelize.STRING,
        references: {
          model: 'Profissionals',
          key: 'profissional_userId',
        },
      },
      iniciadoPor: {
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
    await queryInterface.dropTable('FornecedorProfissionals');
  },
};
