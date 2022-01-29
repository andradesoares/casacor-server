module.exports = (sequelize, DataTypes) => {
  const FornecedorProfissional = sequelize.define('FornecedorProfissional', {
    relacaoId: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    fornecedor_userId: {
      type: DataTypes.STRING,
      references: {
        model: 'Fornecedor',
        key: 'fornecedor_userId',
      },
    },
    profissional_userId: {
      type: DataTypes.STRING,
      references: {
        model: 'Profissional',
        key: 'profissional_userId',
      },
    },
    iniciadoPor: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  });

  FornecedorProfissional.associate = (models) => {
    FornecedorProfissional.belongsTo(models.Fornecedor, {
      foreignKey: 'fornecedor_userId',
      targetKey: 'fornecedor_userId',
    });
    FornecedorProfissional.belongsTo(models.Profissional, {
      foreignKey: 'profissional_userId',
      targetKey: 'profissional_userId',
    });
  };

  return FornecedorProfissional;
};
