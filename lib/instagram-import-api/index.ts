// Contract this frontend expects from the BE-128 Instagram import.
//
// The real backend will use Apify + AI to scrape the merchant's Instagram
// profile, detect product-like posts, and propose candidates. While the
// backend is in development, the UI lives against the contract below.
// The repo gracefully degrades when the endpoint returns 404 so the
// merchant sees a "in construction" state instead of a crash.
import type { HttpClient } from "@/lib/http/client"

export type ImportJobStatus =
  | "QUEUED"
  | "SCRAPING"
  | "PROCESSING"
  | "READY"
  | "FAILED"

export interface ImportCandidate {
  id: string
  /** Suggested name (AI extracted from the post caption). */
  name: string
  /** Suggested description (AI cleaned caption). */
  description: string
  /** R2/S3 URL where Apify uploaded the post image. */
  imageUrl: string
  /** AI's best price guess in USD, null if it couldn't infer one. */
  suggestedPriceUsd: number | null
  /** Original Instagram post URL — surfaced in the UI for context. */
  sourceUrl: string
}

export interface ImportJob {
  jobId: string
  status: ImportJobStatus
  /** 0-100 — UI shows a progress bar. */
  progress: number
  /** Populated when status === READY. */
  candidates?: ImportCandidate[]
  /** Populated when status === FAILED. */
  error?: string
}

export interface CommitOverride {
  name?: string
  description?: string
  priceUsd?: number
}

export interface CommitResult {
  createdProductIds: string[]
}

export class InstagramImportNotImplemented extends Error {
  constructor() {
    super("El backend de import desde Instagram todavía no está disponible")
    this.name = "InstagramImportNotImplemented"
  }
}

export class InstagramImportHttpRepository {
  constructor(private readonly http: HttpClient) {}

  /** Start a job for `profileUrl`. Backend returns a job id and an initial status. */
  async start(storeId: string, profileUrl: string): Promise<ImportJob> {
    try {
      return await this.http.post<ImportJob>(
        `/api/stores/${storeId}/instagram-import/jobs`,
        { profileUrl },
      )
    } catch (err) {
      this.maybeRethrowNotImplemented(err)
      throw err
    }
  }

  /** Poll the job. Frontend hits this every ~2 seconds while not READY/FAILED. */
  async poll(storeId: string, jobId: string): Promise<ImportJob> {
    try {
      return await this.http.get<ImportJob>(
        `/api/stores/${storeId}/instagram-import/jobs/${encodeURIComponent(jobId)}`,
      )
    } catch (err) {
      this.maybeRethrowNotImplemented(err)
      throw err
    }
  }

  /**
   * Persist the candidates the merchant ticked, optionally with last-minute
   * overrides (e.g. price they just typed in).
   */
  async commit(
    storeId: string,
    jobId: string,
    candidateIds: string[],
    overrides: Record<string, CommitOverride> = {},
  ): Promise<CommitResult> {
    try {
      return await this.http.post<CommitResult>(
        `/api/stores/${storeId}/instagram-import/jobs/${encodeURIComponent(jobId)}/commit`,
        { candidateIds, overrides },
      )
    } catch (err) {
      this.maybeRethrowNotImplemented(err)
      throw err
    }
  }

  private maybeRethrowNotImplemented(err: unknown): void {
    const e = err as { status?: number; isNotFound?: boolean }
    if (e?.status === 404 || e?.isNotFound) {
      throw new InstagramImportNotImplemented()
    }
  }
}
