module.exports = (sequelize, DataTypes) => {
  const Profissional = sequelize.define(
    'Profissional',
    {
      profissional_userId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      nomeEscritorio: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      datadeNascimento: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      cpf: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      endereco: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      logo: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      timestamps: false,
    }
  );

  Profissional.associate = (models) => {
    Profissional.belongsToMany(models.Fornecedor, {
      through: models.FornecedorProfissional,
      foreignKey: 'profissional_userId',
    });
    Profissional.hasOne(models.Ambiente, {
      foreignKey: 'profissional_userId',
    });
  };

  return Profissional;
};
