const config  = require("../config/config");

const user = require("../controllers/user");
const { api, requireAuth } = config;

module.exports = (app) => {
  // create a new user
  app.post(`/users/create`,user.create );

  // user login
  app.post(`/users/login`,user.login);
  // user login
  app.get(`/users/get-token`,user.getToken);

  app.get(`/user/verify-token`,requireAuth,user.verifyUserToken);

  //retrieve all users
  app.get(`/users`,requireAuth, user.findAllUsers);

  // retrieve user by id
  app.get(`/users/:userId`,requireAuth,user.findById);

  // update a user with id
  app.post(`/users/update`, requireAuth, user.update);
  // delete a user
  app.delete(`/users/:userId`,requireAuth,  user.deleteUser);
  app.post(`/create/user`, requireAuth, user.createUser);

  app.get("*", function (req, res) {
    res.status(404).json("<h1>404</h1><p>Page not found!</p>");
  });
};
