export type UserSignUpDto = {
  firstname: string;
  lastname: string;
  email: string;
  birthday?: string;
  age?: number;
  password: string;
  contact?: string;
  address?: string;
  emailVerificationCode?: string;
};

export type UserSignInDto = {
  email: string;
  password: string;
};

export type GoogleSignInDto = {
  credential: string;
};

export type CheckEmailDto = {
  email: string;
}