import { User } from '@/types/user';

export interface AuthToken {
  access: string;
  refresh: string;
  default_organization: string;
}

export interface SignUpResponse extends AuthToken {
  access: string;
  refresh: string;
  user: User;
}

export enum ErrorCode {
  CredentialsSignin = 'CredentialsSignin',
}
