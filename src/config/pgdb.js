require('dotenv').config()

module.exports = {
  "development": {
    "username": process.env.db_user,
    "password": process.env.db_password,
    "database": process.env.db_name,
    "host": process.env.db_host,
    "dialect": process.env.db_dialect,
    "operatorsAliases": false
  },
  "test": {
    "username": "root",
    "password": "password",
    "database": "burgers_db",
    "host": "127.0.0.1",
    "dialect": "mysql",
    "operatorsAliases": false
  },
  "production": {
    "username": process.env.db_user,
    "password": process.env.db_password,
    "database": process.env.db_name,
    "host": process.env.db_host,
    "dialect":process.env.db_dialect,
    "operatorsAliases": false
  }
} 