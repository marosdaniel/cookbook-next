// import { User } from '../../../../graphql/models';
// import { throwCustomError } from '../../../../helpers/error-handler.helper';
// import { IEditUserInput } from './types';

// export const editUser = async (_: any, { id, userEditInput }: IEditUserInput) => {
//   try {
//     const user = await User.findById(id);

//     if (!user) {
//       throwCustomError('User not found.', { errorCode: 'USER_NOT_FOUND', errorStatus: 401 });
//     }

//     Object.assign(user, userEditInput);

//     // mongoose pre-save hook will hash the password if it was changed
//     await user.save();

//     return user;
//   } catch (error) {
//     console.error('Error while editing user:', error);
//     throwCustomError('Could not edit user.', { errorCode: 'EDIT_USER_ERROR', errorStatus: 500 });
//   }
// };
