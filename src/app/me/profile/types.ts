export interface ProfileUser {
  id: string;
  firstName: string;
  lastName: string;
  userName: string;
  email: string;
  role: string;
  locale: string;
  createdAt: string;
  updatedAt: string;
}

export interface GetUserData {
  getUserById: ProfileUser;
}
