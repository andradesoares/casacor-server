module.exports = (sequelize, DataTypes) => {
  const Sustentabilidade = sequelize.define(
    'Sustentabilidade',
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      aguaDeChuva: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      materialReciclavel: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      energiaSolar: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
      ambiente_id: {
        type: DataTypes.STRING,
        references: {
          model: 'Ambiente',
          key: 'id',
        },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },

    {
      timestamps: false,
    }
  );
  Sustentabilidade.associate = function (models) {
    Sustentabilidade.belongsTo(models.Ambiente, {
      foreignKey: 'ambiente_id',
    });
  };
  return Sustentabilidade;
};
