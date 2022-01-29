module.exports = (sequelize, DataTypes) => {
  const Fornecedor = sequelize.define(
    'Fornecedor',
    {
      fornecedor_userId: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      descricaoProduto: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      telefone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      siteEmpresa: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      perfilInstagram: {
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

  Fornecedor.associate = (models) => {
    Fornecedor.belongsToMany(models.Profissional, {
      through: models.FornecedorProfissional,
      foreignKey: 'fornecedor_userId',
    });
  };

  return Fornecedor;
};
