// import bcrypt from 'bcrypt';
// import { User } from '../../../../graphql/models';
// import { throwCustomError } from '../../../../helpers/error-handler.helper';
// import { IChangePassword } from './types';
// import { IContext } from '../../../../context/types';

// export const changePassword = async (_: any, { id, passwordEditInput }: IChangePassword, context: IContext) => {
//   const { currentPassword, newPassword, confirmNewPassword } = passwordEditInput;

//   const currentUser = context;

//   if (!currentUser) {
//     throwCustomError('Unauthenticated operation - no user found', { errorCode: 'UNAUTHENTICATED', errorStatus: 401 });
//   }

//   if (currentUser.role !== 'ADMIN' && currentUser._id !== id) {
//     throwCustomError('Unauthorized operation - insufficient permissions', {
//       errorCode: 'UNAUTHORIZED',
//       errorStatus: 403,
//     });
//   }

//   const user = await User.findById(id).populate('favoriteRecipes').populate('recipes');

//   if (!user) {
//     throwCustomError('User not found', { errorCode: 'USER_NOT_FOUND', errorStatus: 404 });
//   }

//   if (!currentPassword || !newPassword || !confirmNewPassword) {
//     throwCustomError('Please fill in all fields', { errorCode: 'INVALID_INPUT', errorStatus: 400 });
//   }

//   if (newPassword !== confirmNewPassword) {
//     throwCustomError('Passwords do not match', { errorCode: 'PASSWORD_MISMATCH', errorStatus: 400 });
//   }

//   const isMatch = await bcrypt.compare(currentPassword, user.password);
//   if (!isMatch) {
//     throwCustomError('Invalid password', { errorCode: 'INVALID_PASSWORD', errorStatus: 401 });
//   }

//   const hashedPassword = await bcrypt.hash(newPassword, 10);
//   user.password = hashedPassword;
//   await user.save();

//   return true;
// };
