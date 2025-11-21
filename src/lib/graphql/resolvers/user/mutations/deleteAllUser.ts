// import { User } from '../../../../graphql/models';
// import { throwCustomError } from '../../../../helpers/error-handler.helper';
// import { IContext } from '../../../../context/types';

// export const deleteAllUser = async (_: any, __: any, context: IContext) => {
//   const currentUser = context;

//   if (!currentUser || currentUser.role !== 'ADMIN') {
//     throwCustomError('Unauthorized operation - admin rights required', {
//       errorCode: 'UNAUTHORIZED',
//       errorStatus: 403,
//     });
//   }

//   try {
//     const res = await User.deleteMany({ _id: { $ne: currentUser._id } });

//     return res.deletedCount;
//   } catch (error) {
//     console.error('Error deleting all users:', error);
//     throwCustomError('Could not delete all users', { errorCode: 'DELETE_USERS_FAILED', errorStatus: 500 });
//   }
// };
