module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define("User", {
    business_id:DataTypes.INTEGER,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    username: DataTypes.STRING,
    picture: DataTypes.STRING,
    occupation: DataTypes.STRING,
    dob: DataTypes.DATE,
    password: DataTypes.STRING,
    address: DataTypes.STRING,
    about: DataTypes.STRING,
    role: DataTypes.STRING,
    token: DataTypes.STRING,
    signature: DataTypes.STRING,
  });

  User.associate = function (models) {
    // associations go here
  };

  return User;
};
