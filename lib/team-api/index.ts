import type { HttpClient } from "@/lib/http/client"

export type StoreMemberRole = "OWNER" | "ADMIN" | "STAFF"

export interface MemberUser {
  id: string
  email: string
  name: string | null
  avatar: string | null
}

export interface StoreMember {
  id: string
  storeId: string
  userId: string
  role: StoreMemberRole
  invitedBy: string | null
  joinedAt: string
  user?: MemberUser
}

export interface InvitationStore {
  id: string
  name: string
  slug: string
  logo: string | null
}

export interface StoreInvitation {
  id: string
  storeId: string
  email: string
  role: StoreMemberRole
  expiresAt: string
  acceptedAt: string | null
  declinedAt: string | null
  store?: InvitationStore
  inviter?: { id: string; email: string; name: string | null }
}

export interface InvitationDetail extends StoreInvitation {
  // /invitations/:token can return extra context for the accept page
  store: InvitationStore
}

export class TeamHttpRepository {
  constructor(private readonly http: HttpClient) {}

  // Members ---
  listMembers(storeId: string): Promise<StoreMember[]> {
    return this.http.get<StoreMember[]>(`/api/stores/${storeId}/members`)
  }

  invite(storeId: string, email: string, role: StoreMemberRole): Promise<StoreInvitation> {
    return this.http.post<StoreInvitation>(`/api/stores/${storeId}/members/invite`, { email, role })
  }

  listPendingInvitations(storeId: string): Promise<StoreInvitation[]> {
    return this.http.get<StoreInvitation[]>(`/api/stores/${storeId}/members/invitations`)
  }

  updateRole(storeId: string, memberId: string, role: StoreMemberRole): Promise<StoreMember> {
    return this.http.patch<StoreMember>(`/api/stores/${storeId}/members/${memberId}/role`, { role })
  }

  remove(storeId: string, memberId: string): Promise<void> {
    return this.http.delete<void>(`/api/stores/${storeId}/members/${memberId}`)
  }

  // Invitations (current user) ---
  myInvitations(): Promise<StoreInvitation[]> {
    return this.http.get<StoreInvitation[]>(`/api/invitations/me`)
  }

  getByToken(token: string): Promise<StoreInvitation> {
    return this.http.get<StoreInvitation>(`/api/invitations/${encodeURIComponent(token)}`)
  }

  accept(token: string): Promise<StoreInvitation> {
    return this.http.post<StoreInvitation>(`/api/invitations/${encodeURIComponent(token)}/accept`)
  }

  decline(token: string): Promise<StoreInvitation> {
    return this.http.post<StoreInvitation>(`/api/invitations/${encodeURIComponent(token)}/decline`)
  }
}
