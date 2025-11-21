// import crypto from 'crypto'; // For token hashing
// import { generateResetToken, sendPasswordResetEmail } from '../../../../helpers/email';
// import { throwCustomError } from '../../../../helpers/error-handler.helper';
// import { User } from '../../../../graphql/models';
// import { IRequestPasswordReset } from './types';

// export const resetPassword = async (_: any, { email }: IRequestPasswordReset) => {
//   const user = await User.findOne({ email });

//   if (!user) {
//     throwCustomError('User not found', { errorCode: 'USER_NOT_FOUND', errorStatus: 404 });
//   }

//   // Generate reset token and hash it
//   const resetToken = generateResetToken();
//   const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

//   // Set token expiry time (1 hour from now)
//   const resetExpires = new Date(Date.now() + 60 * 60 * 1000);

//   // Update user with hashed token and expiry time
//   user.resetPasswordToken = hashedToken;
//   user.resetPasswordExpires = resetExpires;
//   await user.save();

//   try {
//     // Send password reset email
//     await sendPasswordResetEmail(user.email, resetToken);
//   } catch (error) {
//     console.error('Error sending reset email:', error);
//     throwCustomError('Could not send reset email', { errorCode: 'EMAIL_SEND_FAILED', errorStatus: 500 });
//   }

//   return {
//     success: true,
//     message: 'Password reset email sent successfully',
//   };
// };
