"use strict";

const fs = require("fs");
const path =  require("path");
const  Sequelize  = require("sequelize");
require("dotenv").config();

const env = process.env.NODE_ENV || 'development';
const basename = path.basename(__filename);
const config = require(__dirname + '/../config/pgdb.js')[env];

const db = {};
const use_query_string = true;
let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
  } else if (use_query_string) {
    sequelize = new Sequelize(process.env.DB_CONNECTION_URL, {
      dialect: "postgres",
      dialectOptions: {
        require: true,
        rejectUnauthorized: false,
      },
    });
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,{
        url:config.url,
        host:config.host,
        dialect:config.dialect,
        ssl:config.ssl
    }
  );
}
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = sequelize["import"](path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
// db.Sequelize = Sequelize;

module.exports = db;
