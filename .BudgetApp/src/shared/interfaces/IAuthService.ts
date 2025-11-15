import type {
  LoginCredentials,
  RegisterUserInput,
  UserProfile,
} from "../auth";

export default interface IAuthService {
  register: (payload: RegisterUserInput) => Promise<UserProfile>;
  login: (payload: LoginCredentials) => Promise<UserProfile>;
}
