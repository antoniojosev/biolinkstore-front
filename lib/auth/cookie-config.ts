export const AT_COOKIE = 'igs_at'
export const RT_COOKIE = 'igs_rt'
/** Readable by JS — signals that a session exists so the client skips the
 *  cold-start /me call when there's clearly no session. Contains no secret. */
export const SESSION_FLAG_COOKIE = 'igs_session'

/** Must match JWT_EXPIRES_IN in backend (15 min) */
export const AT_MAX_AGE = 15 * 60
/** Must match JWT_REFRESH_EXPIRES_IN in backend (7 days) */
export const RT_MAX_AGE = 7 * 24 * 60 * 60

export const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
}
