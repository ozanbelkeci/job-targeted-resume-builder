export interface Resume {
  id: string;
  user_id: string;
  name: string | null;
  original_filename: string;
  original_text: string;
  is_default: boolean;
  storage_path: string | null;
  created_at: string;
}

export interface OptimizedCvExperience {
  title: string;
  company: string;
  duration: string;
  bullets: string[];
}

export interface OptimizedCvEducation {
  degree: string;
  school: string;
  year: string;
}

export interface CvReference {
  name: string;
  title: string;
  contact: string;
}

export interface OptimizedCv {
  name: string;
  email: string;
  phone: string;
  linkedin: string | null;
  github: string | null;
  website: string | null;
  location: string | null;
  summary: string;
  experience: OptimizedCvExperience[];
  education: OptimizedCvEducation[];
  skills: string[];
  references?: CvReference[];
}

export interface AtsKeywords {
  matched: string[];
  missing: string[];
}

export interface LinkedInSuggestions {
  headlines: string[];
  about: string;
  skills: string[];
}

export interface Optimization {
  id: string;
  user_id: string;
  resume_id: string;
  job_title: string;
  job_company: string | null;
  job_input_type: 'url' | 'text';
  job_url: string | null;
  job_description_raw: string;
  optimized_cv_json: OptimizedCv;
  ats_score: number;
  ats_keywords: AtsKeywords;
  tips: string[];
  cover_letter: string | null;
  linkedin_suggestions: LinkedInSuggestions | null;
  created_at: string;
}

export interface UserCredits {
  id: string;
  user_id: string;
  credits: number;
  is_pro: boolean;
  pro_expires_at: string | null;
  updated_at: string;
}

export interface GeminiOptimizationResult {
  job_title: string;
  job_company: string | null;
  ats_score: number;
  matched_keywords: string[];
  missing_keywords: string[];
  tips: string[];
  optimized_cv: OptimizedCv;
}

export interface ChecklistState {
  coverLetterGenerated: boolean;
  linkedInUpdated: boolean;
  appliedToJob: boolean;
}

export interface ApiSuccessResponse<T> {
  data: T;
}

export interface ApiErrorResponse {
  error: string;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
