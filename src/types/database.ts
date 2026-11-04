export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum OrgRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  TEACHER = "TEACHER",
  STUDENT = "STUDENT",
}

export enum AssessmentCategory {
  GENERAL = "GENERAL",
  HSK_ORIENTED = "HSK_ORIENTED",
  BUSINESS = "BUSINESS",
  DAILY = "DAILY",
  CUSTOM = "CUSTOM",
}

export enum SessionStatus {
  DRAFT = "DRAFT",
  READY = "READY",
  IN_PROGRESS = "IN_PROGRESS",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export enum SpeakerType {
  EXAMINER = "EXAMINER",
  LEARNER = "LEARNER",
}

export enum AudioStatus {
  UPLOADED = "UPLOADED",
  PROCESSED = "PROCESSED",
  FAILED = "FAILED",
}

export enum JobStatus {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

export enum RecommendationCategory {
  PHONETICS = "PHONETICS",
  VOCABULARY = "VOCABULARY",
  GRAMMAR = "GRAMMAR",
  FLUENCY = "FLUENCY",
  TASK_COMPLETION = "TASK_COMPLETION",
}

export enum PlanTier {
  FREE = "FREE",
  PRO = "PRO",
  TEACHER = "TEACHER",
  ORGANIZATION = "ORGANIZATION",
}
