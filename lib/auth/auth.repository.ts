import type { User, LoginResponse, LoginDto, RegisterDto } from './types'

/**
 * IAuthRepository — contract for all auth operations.
 *
 * Implementations:
 *   - AuthHttpRepository  (production, calls REST API)
 *   - MockAuthRepository  (testing / storybook)
 */
export interface IAuthRepository {
  login(dto: LoginDto): Promise<LoginResponse>
  register(dto: RegisterDto): Promise<LoginResponse>
  me(): Promise<User>
}
