const config  = require("../config/config");

const user = require("../controllers/user");
const { api, requireAuth } = config;

module.exports = (app) => {
  // create a new user
  app.post(`${api}/users/create`,user.create );

  // user login
  app.post(`${api}/users/login`,user.login);
  // user login
  app.get(`${api}/users/get-token`,user.getToken);

  app.get(`${api}/user/verify-token`,requireAuth,user.verifyUserToken);

  //retrieve all users
  app.get(`${api}/users`,requireAuth, user.findAllUsers);

  // retrieve user by id
  app.get(`${api}/users/:userId`,requireAuth,user.findById);

  // update a user with id
  app.post(`${api}/users/update`, requireAuth, user.update);
  // delete a user
  app.delete(`${api}/users/:userId`,requireAuth,  user.deleteUser);
  app.post(`${api}/create/user`, requireAuth, user.createUser);

  app.get("*", function (req, res) {
    res.status(404).json("<h1>404</h1><p>Page not found!</p>");
  });
};
