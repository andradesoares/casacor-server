'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Sustentabilidades', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      aguaDeChuva: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      materialReciclavel: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      energiaSolar: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      ambiente_id: {
        type: Sequelize.STRING,
        references: {
          model: 'Ambientes',
          key: 'id',
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
    await queryInterface.dropTable('Sustentabilidades');
  },
};
