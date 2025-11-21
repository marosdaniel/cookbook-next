// import validator from 'validator';
// import bcrypt from 'bcrypt';
// import crypto from 'crypto';
// import { User } from '../../../../graphql/models';
// import { throwCustomError } from '../../../../helpers/error-handler.helper';
// import { IContext } from '../../../../context/types';
// import { ISetNewPassword } from './types';

// export const setNewPassword = async (_: any, { token, newPassword }: ISetNewPassword, context: IContext) => {
//   const currentUser = context;

//   if (!currentUser) {
//     throwCustomError('Unauthenticated operation - no user found', { errorCode: 'UNAUTHENTICATED', errorStatus: 401 });
//   }

//   const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

//   const user = await User.findOne({
//     resetPasswordToken: hashedToken,
//     resetPasswordExpires: { $gt: Date.now() },
//   });

//   if (!user) {
//     throwCustomError('Invalid or expired reset token', { errorCode: 'INVALID_RESET_TOKEN', errorStatus: 400 });
//   }

//   if (
//     !validator.isStrongPassword(newPassword, {
//       minLength: 8,
//       minLowercase: 1,
//       minUppercase: 1,
//       minNumbers: 1,
//     })
//   ) {
//     throwCustomError(
//       'Password must be at least 8 characters long and include uppercase, lowercase letters and a numbers',
//       {
//         errorCode: 'WEAK_PASSWORD',
//         errorStatus: 400,
//       },
//     );
//   }

//   try {
//     const hashedPassword = await bcrypt.hash(newPassword, 10);
//     user.password = hashedPassword;
//     user.resetPasswordToken = undefined;
//     user.resetPasswordExpires = undefined;
//     await user.save();

//     return {
//       success: true,
//       message: 'Password successfully reset',
//     };
//   } catch (error) {
//     console.error('Error during password reset:', error);
//     throwCustomError('Could not reset password', { errorCode: 'PASSWORD_RESET_FAILED', errorStatus: 500 });
//   }
// };
