const validator = require("validator");
const isEmpty = require("./is_empty");

const validatPostInput = data => {
  let errors = {};

  data.text = !isEmpty(data.text) ? data.text : "";

  if (!validator.isLength(data.text, { min: 10, max: 300 })) {
    errors.text = "Post must be greater than 10 and less than 300 characters";
  }

  //validation for text field
  if (validator.isEmpty(data.text)) {
    errors.text = "Text field is required";
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
};

module.exports = validatPostInput;
