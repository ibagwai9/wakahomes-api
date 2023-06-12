const config  = require("../config/config");
const passport = require("passport");

const user = require("../controllers/user");
const { api, requireAuth } = config;

module.exports = (app) => {
    app.get(`${api}/users/verify-token`,
    requireAuth, 
    user.verifyUserToken
    // (req, res) => {
    //   res.json({data:{user: req.user, token:user.token, success:true}, business:[]})
    // }
  );
  // create a new user
  app.post(`${api}/users/create`,user.create );

  // user login
  app.post(`${api}/users/login`,user.login);
  // user login
  // app.get(`${api}/users/get-token`,user.getToken);


  //retrieve all users
  app.get(`${api}/users`,requireAuth, user.findAllUsers);

  // retrieve user by id
  app.get(`${api}/users/:userId`,requireAuth,user.findById);

  // update a user with id
  app.post(`${api}/users/update`, requireAuth, user.update);
  // update a Business with id
  app.post(`${api}/users/update-business`, requireAuth, user.updateBusiness);
  // delete a user
  app.delete(`${api}/users/:userId`,requireAuth,  user.deleteUser);


  app.post(`${api}/create/user`, requireAuth, user.createUser);


  app.get(`${api}/verify-otp/:verify`,user.verifyOTP)
  app.post(`${api}/send-otp`,user.sendOTP)
  app.post(`${api}/reset-password`,user.resetPassword)
  app.post(`${api}/social-login`,user.socialLogin)

  app.get(`${api}/login/failed`,
  (req,res)=> {
    res.status(401).json({message:'Failed to login', success:false});
  })
  // // Set up routes for authentication
  // app.get(`${api}/auth/google`, 
  // // (req, res, next)=> {
  // //   res.header('Access-Control-Allow-Origin', '*'); // Replace with the actual allowed origin
  // //   res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  // //   next()}, 
  //   passport.authenticate('google', { scope: ['profile', 'email'] }));
    
  app.get(
    `${api}/auth/google/callback`,
    passport.authenticate('google', { failureRedirect: `/login/failed`, 
    successRedirect: process.env.G_USER
  }),
    (req, res) => {
      // Redirect or respond with a success message
      res.json({success:true, data:req.user})
    });

    app.get(
      `${api}/auth/google/user`,
      passport.authenticate('google'),
      (req, res) => {
        // Redirect or respond with a success message
        res.json({success:true, data:req.user})
      });


  // Set up routes for authentication
  app.get(`${api}/auth/facebook`, 
    passport.authenticate('facebook', { scope: ['profile', 'email'] }));
  
  // Set up routes for authentication
  app.post(`${api}/auth/facebook`, 
    passport.authenticate('facebook', { scope: ['profile', 'email'] }));
    
  app.get(
    `${api}/auth/facebook/callback`,
    passport.authenticate('facebook', { failureRedirect: `${api}/login/failed`, successRedirect: process.env.CLIENT_URL}),
    (req, res) => {
      // Redirect or respond with a success message
      res.json({success:true, data:req.user})
    });



  app.get("*", function (req, res) {
    res.status(404).json("<h1>404</h1><p>Page not found!</p>");
  });
};
