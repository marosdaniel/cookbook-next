import {
  AccountService,
  FavoritesService,
  FollowService,
} from '@/server/modules/user';

export { AccountService, FavoritesService, FollowService };

export const UserService = {
  ...AccountService,
  ...FavoritesService,
  ...FollowService,
};
