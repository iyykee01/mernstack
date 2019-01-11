const validator = require("validator");
const isEmpty = require("./is_empty");

const validateRegisterInput = data => {
  let errors = {};

  data.name = !isEmpty(data.name) ? data.name : "";
  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";
  data.confirmPassword = !isEmpty(data.confirmPassword) ? data.confirmPassword : "";

  //validation for Name
  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "Name must be 2 and 30 characters";
  }

  if (validator.isEmpty(data.name)) {
    errors.name = "Name field is required";
  }

  //validation for Email
  if (validator.isEmpty(data.email)) {
    errors.email = "Email field is required";
  }

  if (!validator.isEmail(data.email)) {
    errors.email = "Email is invalid";
  }

  //validation for Password
  if (validator.isEmpty(data.password)) {
    errors.password = "Password field is required";
  }

  if (!validator.isLength(data.password, { min: 6, max: 15 })) {
    errors.password = "Password must be at least 6 characters";
  }

  //validation for Confirm password
  if (validator.isEmpty(data.confirmPassword)) {
    errors.confirmPassword = "Confirm password  field is required";
  }

  if (!validator.equals(data.password, data.confirmPassword)) {
    errors.confirmPassword = "Password does not match";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = validateRegisterInput;
