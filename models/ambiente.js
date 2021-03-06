module.exports = (sequelize, DataTypes) => {
  const Ambiente = sequelize.define(
    'Ambiente',
    {
      id: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nomeResponsavelObra: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      telefoneResponsavelObra: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailResponsavelObra: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profissional_userId: {
        type: DataTypes.STRING,
        references: {
          model: 'Profissional',
          key: 'profissional_userId',
        },
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },

    {
      timestamps: false,
    }
  );
  Ambiente.associate = function (models) {
    Ambiente.belongsTo(models.Profissional, {
      foreignKey: 'profissional_userId',
    });
    Ambiente.hasOne(models.Sustentabilidade, {
      foreignKey: 'ambiente_id',
    });
  };
  return Ambiente;
};
