'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Ambientes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      nome: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      profissional_userId: {
        type: Sequelize.STRING,
        references: {
          model: 'Profissionals',
          key: 'profissional_userId',
        },
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
    await queryInterface.dropTable('Ambientes');
  },
};
