export interface User {
  id: string
  email: string
  name?: string
  username?: string
  gender?: string
  dateOfBirth?: string
  avatar?: string
}

/** Shape returned by /api/auth/login and /api/auth/register */
export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: { id: string; email: string; name: string | null }
}

export interface LoginDto {
  email: string
  password: string
}

export interface RegisterDto {
  name?: string
  email: string
  password: string
  username: string
  gender?: string
  dateOfBirth?: string
}
