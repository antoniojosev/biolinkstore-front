import type { HttpClient } from '@/lib/http/client'
import type { IAuthRepository } from './auth.repository'
import type { User, LoginResponse, LoginDto, RegisterDto } from './types'

export class AuthHttpRepository implements IAuthRepository {
  constructor(private readonly http: HttpClient) {}

  login(dto: LoginDto): Promise<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', {
      email: dto.email,
      password: dto.password,
    })
  }

  register(dto: RegisterDto): Promise<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/register', {
      name: dto.name,
      email: dto.email,
      password: dto.password,
    })
  }

  me(): Promise<User> {
    return this.http.get<User>('/api/users/me')
  }
}
