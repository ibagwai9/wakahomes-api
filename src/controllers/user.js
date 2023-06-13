const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const db = require("../models");

require("dotenv").config();

const HOST_URL = process.env.HOST_URL
const User = db.User;

// load input validation
const validReg = require("../validation/register");
const validLogin = require("../validation/login");

// create user
module.exports.create = (req, res) => {
  const { errors, isValid } = validReg.validateRegisterForm(req.body);
  let {
    name,
    username,
    email,
    phone,
    password,
    role='user',
  } = req.body;
  errors.success = false;

  // check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  User.findOne({ where: { email } })
    // .then((user) => {
    // db.sequelize
    //   .query(`SELECT * FROM Users WHERE email='${email}'`)
    .then((user) => {
      if (user) {
        return res
          .status(400)
          .json({ success: false, msg: "Email already exists!" });
      } else {
        let newUser = {
          id: null,
          name,
          username,
          role: role ? role : "user",
          email,
          phone,
          password,
          business_id:1,  
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
    // res.status(500).json
    console.log({
        success: false,
        msg: "Failed to authenticate token." + err,
      });
      return next(null, false);
    }

    const { id } = decoded
    User.findOne({ where: { id } })
      .then((found) => {
        let user = found.dataValues;
          //check attach a business
        if (user.id) {
          db.sequelize.query(`SELECT * FROM business WHERE id=${user.business_id}`)
            .then((business) => {
              res.json({
                success: true,
                data: { user, business:business[0][0] }
              });
             return next(null,user);
            })
            .error(err => {
              console.log({
                success: false,
                data: [],
                error: err
              });
              return next(null, false);
            })
        }
        return next(null, false);
      })
      .catch((err) => {
        res.status(500).json({ success: false, msg: err });
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
                  id: user[0].id,
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

// module.exports.getToken = (req, res) => {
//   const { email } = req.query;
//   db.sequelize
//     .query(`SELECT * FROM public."Users" WHERE email='${email}'`)
//     .then((found) => {
//       let user = found[0];
//       console.log(user);
//       //check for user
//       if (!user.length) {
//         errors.success = false;
//         errors.msg = "User not found!";
//         return res.status(404).json(errors);
//       }

//       // let originalPassword = user[0].password;

//       const { id, role, role_id } = user[0];
//       const payload = {
//         id,
//         role,
//         role_id,
//         expire: Date.now() + 1000 * 60 * 60 * 24 * 7000,
//       };
//       jwt.sign(
//         payload,
//         "secret",
//         {
//           expiresIn: 3600 * 3600 * 3600,
//         },
//         (err, token) => {
//           res.json({
//             success: true,
//             token: "Bearer " + token,
//             user: user[0][0],
//           });
//         }
//       );
//     })
//     .catch((err) => {
//       res.status(500).json({ success: false, msg: err });
//       console.log(err);
//     });
// };

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
// fetch all Users
module.exports.findAllUsers = (req, res) => {
  // User.findAll()
  User.findAll()
    .then((Users) => {
      res.json({ Users, success: true });
    })
    .catch((error) => res.status(500).json({ success: false, error }));
};

// fetch user by userId
module.exports.findById = (req, res) => {
  const id = req.user.id;

  // User.findAll({ where: { id } })
  db.sequelize
    .query(`SELECT * FROM  public."Users" WHERE id = ${id}`)
    .then((user) => {
      if (!user.length) {
         res.json({ msg: "user not found" });
      }else{
        res.json({ user:user[0], success: true });   
      }
    })
    .catch((err) => res.status(500).json({ error:err, success:false }));
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
// update a user's info
module.exports.updateBusiness = (req, res) => {
  const {
    query_type=null,
    business_name=null,
    business_address=null,
    business_logo=null,
    business_description=null,
    city=null,
    state=null,
    postal_code=null,
    services=null,
    business_id=null,
  } = req.body;
    
  db.sequelize.query(`CALL update_business(:query_type,:business_name,:business_address,:business_logo,:business_description,:city,:state,:postal_code,:services,:business_id)`,{
    replacements:{
      query_type,business_name,business_address,business_logo,business_description,city,state,postal_code,services,business_id
    }
  }
    
  )
    .then((resp) => {
      res.status(200).json({ success:true, data:resp });
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
      `INSERT INTO  public."Users"(department,position, name, role, accessTo, username, email, password) VALUES ("${department}","${position}","${firstname + " " + lastname
      }","${role}","${accessTo}","${username}","${email}","${password}")`
    )
    .then((result) => res.json({ success: true, result }))
    .catch((err) => res.status(500).json({ success: false, error: err }));
};
exports.changeUserPassword = async (req, res) => {
  const { id, oldPassword, newPassword } = req.body;
  console.log("BODY:", req.body);
  const salt = await bcrypt.genSaltSync(10);
  const hash = await bcrypt.hash(req.body.password, salt);
  User.findAll({
    where: {
      id,
    },
  }).then((user) => {
    console.log("User:", user[0].dataValues.password);
    //check for user
    if (!user.length) {
      errors.id = "User not found!";
      return res.status(404).json(errors);
    }

    let originalPassword = user[0].dataValues.password;
    //check for password
    bcrypt
      .compare(oldPassword, originalPassword)
      .then((isMatch) => {
        if (isMatch) {
          const { id } = user[0].dataValues;

          //  bcrypt.genSalt(10, function(err, salt) {
          //  bcrypt.hash(newPassword, salt, function(err, hash) {
          //   if (err) throw err;
          console.log("hash:", hash);
          User.update({ password: hash }, { where: { id } })
            .then((user) => {
              res.json({
                success: true,
                user,
                message: "Updated Successfully",
              });
            })
            .catch((error) => {
              res.status(500).json({ success: false, error });
            });
          // });
          // });
        } else {
          errors.password = "Old Password not correct";
          return res.status(404).json(errors);
        }
      })
      .catch((error) => res.status(500).json({ success: false, error }));
  });
  // .catch((error) => res.status(500).json({ success: false, error }));
};


// exports.resetPassword = (req, res) => {
//   const { email, password } = req.params;
//   bcrypt.genSalt(10, (err, salt) => {
//     bcrypt.hash(password, salt, (err, hash) => {
//       console.log(hash);
//       if (err) throw err;
//       db.sequelize
//         .query(`update Users set password="${hash}" where email="${email}"`)
//         .then((results) =>
//           res.status(200).json({
//             results: results[0],
//             messsage: "Password successfully reset",
//           })
//         )
//         .catch((err) => {
//           res.status(500).json({ err });
//           console.log(err);
//         });
//     });
//   });
// };

exports.sendOTP = (req, res) => {
  const { email } = req.body
  // const user 
  const otp_key = uuid();
  User.findOne({ where: { email } })
    .then((user) => {
      if (user) {
        transport
          .sendMail({
            from: '"record.io" <service.record.io@gmail.com>',
            to: email,
            subject: "rekod.io: Reset password",
            html: `
         <h3> <center>
          Hi ${user.fullname} Reset your password
          </center></h3>

          <h3>You  OTP key for password reset</h3>
          <p>Find the link below if your request for pasword reset on recor.io platform</p>
          <h4>Thank you for registering with mylikita.clinic</h4>
            <a href="${HOST_URL}/change-password/?otp-key=${otp_key}&email=${user.email}">${HOST_URL}/change-password?otp-key=${otp_key}&email=${user.email}</a>
          <p>
            Our team are reviewing your account information you would be notified 
            once your account is activated and ready to be used.
          </p>
          <br />
          <p>Do not reply automated mail.</p>
          <h5>Record contact mail</h5>`})
          .then((info) => {
            console.log("Message sent: %s", info.messageId);
          })
          .catch((err) => console.log("Error", err));
        db.sequelize
          .query(`update Users set reset_key="${otp_key}" where email='${email}'`)
          .then((results) =>
            res.status(200).json({
              success: true,
              results: results[0],
              msg: "OTP was sent",
            })
          )
          .catch((err) => {
            res.status(500).json({ err });
            console.log(err);
          });
      } else {
        res.status(500).json({ error: 'User not found' });
      }
    })
    .catch((err) => {
      res.status(500).json({ err });
      console.log(err);
    });
};
exports.verifyOTP = (req, res) => {
  console.log(req.params);
  const { verify } = req.params;
  db.sequelize
    .query(`select * from users where code=${verify}`)
    .then((resp) => {
      console.log(resp, "JJJJJJJJJJJJ");
      let arr = resp[0][0];
      let _verify = arr.code ? arr.code.toString() : "";
      if (_verify === verify) {
        res.json({ arr, message: "valid" });
      }
    })
    .catch((err) =>
      res.status(500).json({ err, message: "opt is not correct" })
    );
};
const authenticate = (res, user) => {
  if (user && user.email) {
    jwt.sign(
      { email: user.email, id: user.id },
      "secret",
      {
        expiresIn: 3600,
      },
      (error, token) => {
        console.log(user);
        if (error) {
          res.status(500).json({ error })
        }
        let result = {
          success: true,
          user,
          token: "Bearer " + token,
        };
        console.log({ result });
        res.json(result);
      }
    );
  } else {
    res.status(500).json({ error: 'Operation failed' });
  }
}
const register = (res = {}, user = {}) => {
  //register new social accoutn
  User.create({
    name: user.name,
    picture: user.imageUrl,
    email: user.email,
    provider_id: user.provider_id
  })
    .then((nuser) => { authenticate(res, nuser) })
    .catch(error => console.error(error))
}

exports.socialLogin = (req, res) => {
  const { provider } = req.query
  const authUser = req.body.profileObj
  console.log({ authUser });
  if (authUser) {
    switch (provider) {
      case 'Facebook':
        User.findOne({
          where: {
            email: authUser.email
          },
        })
          .then((user) => {
            //check for user
            if (user && user.provider_id === authUser.googleId) {
              authenticate(res, user);
            } else {
              register(res, authUser)
            }
          })

        break;
      case 'Google':
        User.findOne({
          where: {
            email: authUser.email
          },
        })
          .then((user) => {
            //check for user
            if (user && user.provider_id === authUser.googleId) {
              authenticate(res, user);
            } else {
              register(res, Object.assign(authUser,{ provider_id: authUser.googleId }));
            }
          })
        break;

    }
  } else {
    res.status(500).json({ success: false })
  }
}
exports.resetPassword = (req, res) => {
  const { reset_key, password, email } = req.body
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      console.log(hash);
      if (err) throw err;
      db.sequelize
        .query(`update Users set password="${hash}" where reset_key='${reset_key}'`)
        .then((results) => {
          db.sequelize.query(`update Users set reset_key=null where email='${email}'`)
            .then(() => console.log('Done nullify otp'))
            .catch((err) => {
              console.log(err);
            });
          res.status(200).json({
            results: results[0],
            messsage: "Password successfully reset",
            success: true
          })
        })
        .catch((error) => {
          res.status(500).json({ error });
          console.log(error);
        });
    });
  });
};



