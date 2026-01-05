export type UserSignUpDto = {
  fName: string;
  lName: string;
  email: string;
  password: string;
  contactNumber?: string;
  address?: string;
};

export type UserSignInDto = {
  email: string;
  password: string;
};
