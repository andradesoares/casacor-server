module.exports = (sequelize, DataTypes) => {
  const TokenPassword = sequelize.define(
    'TokenPassword',
    {
      email: DataTypes.STRING,
      userId: DataTypes.STRING,
      token: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE,
    },
    {
      timestamps: false,
    }
  );
  TokenPassword.associate = function (models) {};
  return TokenPassword;
};
