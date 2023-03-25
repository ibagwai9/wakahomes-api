const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const  db = require("../models");

const User = db.User;

// load input validation
const validReg = require( "../validation/register");
const validLogin = require ("../validation/login");

// create user
module.exports.create = (req, res) => {
  const { errors, isValid } = validReg.validateRegisterForm(req.body);
  let {
    name,
    email,
    phone,
    password,
    role,
  } = req.body;
  errors.success = false;

  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ where: { email } })
    // .then((user) => {
    // db.sequelize
    //   .query(`SELECT * FROM users WHERE email='${email}'`)
    .then((user) => {
      if (user) {
        return res
          .status(400)
          .json({ success: false, msg: "Email already exists!" });
      } else {
        let newUser = {
          id: null,
          name,
          role: role ? role : "user",
          email,
          phone,
          password,
        };
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            User.create(newUser)
              .then((newUser) => {
                res.json({ success: true, user: newUser });
              })
              .catch((err) => {
                res.status(500).json({ success: false, msg: err });
              });
          });
        });
      }
    });
};

module.exports.verifyUserToken = (req, res, next) => {
  const authToken = req.headers["authorization"];
  const tok = authToken.split(" ")[1];
  const token = tok.length > 10 ? tok : authToken;
  // console.log(token)
  jwt.verify(token, "secret", (err, decoded) => {
    if (err) {
      return res.json({
        success: false,
        msg: "Failed to authenticate token." + err,
      });
    }

    const { id } = decoded;
    User.findOne({ where: { id } })
      .then((found) => {
        let user = found;
        console.log(user);
        //check for user
        if (user.id) {
          res.json({
            success: true,
            data:user[0],
          });
          next();
        }
        return next(null, false);
      })
      .catch((err) => {
        res.status(500).json({ success: false, msg: err });
        console.log(err);
      });
  });
};

module.exports.login = (req, res) => {
  const { errors, isValid } = validLogin.validateLoginForm(req.body);

  if (!isValid) {
    return res
      .status(400)
      .json({ success: false, error: errors, msg: "Fields are required" });
  }

  const { email, password } = req.body;
  db.sequelize
    .query(`SELECT * FROM public."Users" WHERE email='${email}'`)
    .then((found) => {
      let user = found[0];
      console.log(user);
      //check for user
      if (!user.length) {
        errors.success = false;
        errors.msg = "User not found!";
        return res.status(404).json(errors);
      }

      let originalPassword = user[0].password;

      //check for password
      bcrypt
        .compare(password, originalPassword)
        .then((isMatch) => {
          if (isMatch) {
            // user matched
            console.log("matched!");
            const { id, role, role_id } = user[0];
            const payload = {
              id,
              role,
              role_id,
              expire: Date.now() + 1000 * 60 * 60 * 24 * 7000,
            }; //jwt payload
            // console.log(payload)

            jwt.sign(
              payload,
              "secret",
              {
                expiresIn: 3600 * 3600 * 3600,
              },
              (err, token) => {
                res.json({
                  success: true,
                  token: "Bearer " + token,
                  role: user[0].role,
                  role_id: user[0].role_id,
                });
              }
            );
          } else {
            errors.msg = "Password not correct";
            errors.success = false;
            console.log(errors);
            return res.status(400).json(errors);
          }
        })
        .catch((err) => res.status(500).json({ success: false, msg: err }));
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: err });
      console.log(err);
    });
};

module.exports.getToken = (req, res) => {
  const { email } = req.query;
  db.sequelize
    .query(`SELECT * FROM public."Users" WHERE email='${email}'`)
    .then((found) => {
      let user = found[0];
      console.log(user);
      //check for user
      if (!user.length) {
        errors.success = false;
        errors.msg = "User not found!";
        return res.status(404).json(errors);
      }

      // let originalPassword = user[0].password;

      const { id, role, role_id } = user[0];
      const payload = {
        id,
        role,
        role_id,
        expire: Date.now() + 1000 * 60 * 60 * 24 * 7000,
      };
      jwt.sign(
        payload,
        "secret",
        {
          expiresIn: 3600 * 3600 * 3600,
        },
        (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token,
            user: user[0],
          });
        }
      );
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: err });
      console.log(err);
    });
};

// profile
module.exports.profile = (req, res) => {
  // User.findOne({ where: { id: req.user.id } })
  //   .then((user) => {
  //     res.json({
  //       success: true,
  //       user,
  //     });
  //   })

  db.sequelize
    .query(`SELECT * FROM  public."Users" WHERE id='${req.user.id}'`)
    .then((found) => {
      let user = found[0];
      console.log(user);
      //check for user
      if (!user) {
        return res
          .status(404)
          .json({ success: false, msg: "Token not matched" });
      } else {
        res.json({
          success: true,
          user: user[0],
        });
      }
    })
    .catch((err) => {
      res.status(500).json({ success: false, msg: err });
      console.log(err);
    });
};
// fetch all users
module.exports.findAllUsers = (req, res) => {
  // User.findAll()
  User.findAll()
    .then((users) => {
      res.json({ users, success: true });
    })
    .catch((error) => res.status(500).json({ success: false, error }));
};

// fetch user by userId
module.exports.findById = (req, res) => {
  const id = req.params.userId;

  // User.findAll({ where: { id } })
  db.sequelize
    .query(`SELECT * FROM  public."Users" `)
    .then((user) => {
      if (!user.length) {
        return res.json({ msg: "user not found" });
      }
      res.json({ user });
    })
    .catch((err) => res.status(500).json({ err }));
};

// update a user's info
module.exports.update = (req, res) => {
  let { name, role, image, accessTo, token, id } = req.body;
  console.log({ Body: req.body });
  User.update(
    {
      name,
      role,
      accessTo,
      token,
      image,
    },
    { where: { id } }
  )
    .then((user) => {
      console.log({ user });
      res.status(200).json({ user });
    })
    .catch((err) => res.status(500).json({ success: false, msg: err }));
};

// delete a user
module.exports.deleteUser = (req, res) => {
  const id = req.params.userId;

  User.destroy({ where: { id } })
    .then(() => res.status.json({ msg: "User has been deleted successfully!" }))
    .catch((err) => res.status(500).json({ msg: "Failed to delete!" }));
};

module.exports.getRole = (req, res) => {
  const { id } = req.user.id;
  db.sequelize
    .query(`CALL get_position`)
    .then((results) => res.json({ success: true, results: results[0] }))
    .catch((err) => res.status(500).json({ err }));
};

module.exports.createUser = (req, res) => {
  const {
    firstname = "",
    lastname = "",
    username = "",
    email = "",
    password = "",
    role = "",
    accessTo = "",
    department = "",
    position = "",
  } = req.body;
  console.log(req.body);
  db.sequelize
    .query(
      `INSERT INTO  public."Users"(department,position, name, role, accessTo, username, email, password) VALUES ("${department}","${position}","${
        firstname + " " + lastname
      }","${role}","${accessTo}","${username}","${email}","${password}")`
    )
    .then((result) => res.json({ success: true, result }))
    .catch((err) => res.status(500).json({ success: false, error: err }));
};
// export { create, login, findAllUsers, findById, update, deleteUser, profile };
