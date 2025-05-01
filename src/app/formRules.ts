import { Rule } from 'antd/es/form';

const required: Rule = {
  required: true,
  message: '${label} is required'
};

const email: Rule = {
  type: 'email',
  message: 'Email is invalid'
};

export { required, email };
