export type RequestSignupDto = {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  phoneNumber: string;
  tosConsent: boolean;
  privacyConsent: boolean;
  marketingConsent: boolean;
};

export type ResponseSignupDto = {
  id: number;
  createdAt: string;
};

export type RequestLoginDto = {
  email: string;
  password: string;
};

export type ResponseLoginDto = {
  id: number;
  accessToken: string;
  refreshToken: string | null;
};

export type ResponseLogoutDto = string;

export type ResponseRefreshDto = {
  accessToken: string;
};

export type RequestVerifyOwnerDto = {
  businessNumber: string;
  startDate: string;
};

export type ResponseVerifyOwnerDto = {
  businessNumber: string;
  startDate: string;
};
