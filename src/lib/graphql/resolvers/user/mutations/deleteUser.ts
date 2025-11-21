// import { IContext } from '../../../../context/types';
// import { User } from '../../../../graphql/models';
// import { throwCustomError } from '../../../../helpers/error-handler.helper';
// import { IDeleteUser } from './types';

// export const deleteUser = async (_: any, { id }: IDeleteUser, context: IContext) => {
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

//   try {
//     const result = await User.deleteOne({ _id: id });

//     if (!result || result.deletedCount === 0) {
//       throwCustomError('User not found.', { errorCode: 'USER_NOT_FOUND', errorStatus: 404 });
//     }

//     return {
//       success: true,
//       message: 'User successfully deleted',
//       deletedCount: result.deletedCount,
//     };
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     throwCustomError('Could not delete user', { errorCode: 'DELETE_USER_FAILED', errorStatus: 500 });
//   }
// };
