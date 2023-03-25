const Validator  = require('validator');
const isEmpty  = require('./isEmpty');

module.exports.validateRegisterForm = (data)=> {
  let errors = {};

  // data.firstname = !isEmpty(data.firstname) ? data.firstname : '';
  data.name = !isEmpty(data.name) ? data.name : '';
  data.role = !isEmpty(data.role) ? data.role : '';
  data.phone = !isEmpty(data.phone) ? data.phone : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';

  // if (!Validator.isLength(data.firstname, { min: 2, max: 30 })) {
  //   errors.firstname = 'First Name must be between 2 and 30 character long';
  // }

  if (!Validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = 'Name must be between 2 and 30 character long';
  }

  // if (Validator.isEmpty(data.firstname)) {
  //   errors.firstname = 'First Name field is required';
  // }

  if (Validator.isEmpty(data.name)) {
    errors.name = 'Name field is required';
  }

  // if (Validator.isEmpty(data.phone)) {
  //   errors.phone = 'Phone number field is required';
  // }

  // if (!Validator.isLength(data.phone, { min: 10, max: 11 })) {
  //   errors.phone = 'Phone number field is invalid';
  // }

  // if (Validator.isMobilePhone(data.phone)) {
  //   errors.phone = 'Phone number field is invalid';
  // }

  if (Validator.isEmpty(data.email)) {
    errors.email = 'email field is required';
  }

  if (!Validator.isEmail(data.email)) {
    errors.email = 'email is invalid';
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = 'password field is required';
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = 'password must be at least 6 characters long';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

// export default validateRegisterForm;