module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
    token: DataTypes.STRING,
    signature: DataTypes.STRING,
  });

  User.associate = function (models) {
    // associations go here
  };

  return User;
};
