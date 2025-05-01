import * as yup from 'yup';

export const schema = yup.object().shape({
  required: yup.string().required(),
  email: yup.string().email()
  // age: yup.number().required('Age is required field').typeError('Number only.').positive().integer().round(),
  // password: yup
  //   .string()
  //   .required('Password is required field')
  //   .min(8, 'Password is too short - must be 8 chars minimum.')
  //   .matches(/[a-z]/, 'Password must contain one lowecase letters.')
  //   .matches(/[A-Z]/, 'Password must contain one uppercase letters.')
  //   .matches(/[0-9]/, 'Password must contain one numbers.')
  //   .matches(/[!@#%&]/, 'Password must contain one symbols.'),
  // confirmationPassword: yup
  //   .string()
  //   .required('Confirmation is required field')
  //   .oneOf([yup.ref('password'), 'null'], 'Confirmation Password Field must match with Password Field'),
  // 'problem-list': yup
  //   .array()
  //   .of(
  //     yup.object().shape({
  //       problem: yup.string().required('Problem is required field'),
  //       'message-list': yup
  //         .array()
  //         .of(
  //           yup.object().shape({
  //             message: yup.string().required('Message is required field')
  //           })
  //         )
  //         .unique()
  //     })
  //   )
  //   .required()
  //   .min(1)
});

export type FormType = yup.InferType<typeof schema>;
