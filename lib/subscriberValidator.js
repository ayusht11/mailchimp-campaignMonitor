import validator from 'validator';
import _ from 'lodash';

const subscriberValidator = (req, res) => {  
  if(!validator.isEmail(req.body.email)) {
    return {err: `${req.body.email} is not a valid email`, validated: false};
  }
  else if (!validator.isAlpha(req.body.first_name)) {
    return {err: `${req.body.first_name} must contain only alphabets`, validated: false};
  }
  else if(!validator.isAlpha(req.body.last_name)) {
    return {err: `${req.body.last_name} must contain only alphabets`, validated: false};
  }
  else if(!_.isObject(req.body.custom_fields)) {
    return {err: `${req.body.custom_fields} is not a valid object`, validated: false};
  }
  else {
    return {validated: true}
  }
}

export default subscriberValidator;
