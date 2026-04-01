import { ApiError } from '@/lib/http/types'
import type { HttpClient } from '@/lib/http/client'
import type { IAuthRepository } from './auth.repository'
import type { User, LoginResponse, LoginDto, RegisterDto } from './types'

/**
 * Login and register call the BFF routes directly (not through the proxy)
 * so the BFF can set httpOnly cookies from the backend response before
 * returning to the client.
 *
 * `me()` goes through the proxy-backed HttpClient like all other API calls.
 */
async function bffPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    credentials: 'same-origin',
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const fieldError = Array.isArray(data.errors) ? data.errors[0]?.errors?.[0] : undefined
    const msg =
      fieldError ??
      (Array.isArray(data.message) ? data.message[0] : (data.message ?? 'Error del servidor'))
    throw new ApiError(res.status, msg)
  }
  return data as T
}

export class AuthHttpRepository implements IAuthRepository {
  constructor(private readonly http: HttpClient) {}

  login(dto: LoginDto): Promise<LoginResponse> {
    return bffPost<LoginResponse>('/api/auth/login', {
      email: dto.email,
      password: dto.password,
    })
  }

  register(dto: RegisterDto): Promise<LoginResponse> {
    return bffPost<LoginResponse>('/api/auth/register', {
      name: dto.name,
      email: dto.email,
      password: dto.password,
      username: dto.username,
      gender: dto.gender,
      dateOfBirth: dto.dateOfBirth,
      fingerprint: dto.fingerprint,
    })
  }

  me(): Promise<User> {
    return this.http.get<User>('/api/users/me')
  }
}
