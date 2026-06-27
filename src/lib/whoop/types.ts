export interface WhoopTokens {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  scope?: string;
  token_type?: string;
}

export interface WhoopProfile {
  user_id: number;
  email: string;
  first_name: string;
  last_name: string;
}

export interface WhoopPaginated<T> {
  records: T[];
  next_token?: string;
}

export interface WhoopRecoveryRecord {
  cycle_id: number;
  created_at: string;
  score_state: string;
  score?: {
    recovery_score: number;
    resting_heart_rate: number;
    hrv_rmssd_milli: number;
  };
}

export interface WhoopCycleRecord {
  id: number;
  start: string;
  end: string | null;
  score_state: string;
  score?: {
    strain: number;
    kilojoule: number;
    average_heart_rate: number;
  };
}

export interface WhoopSleepRecord {
  cycle_id: number;
  start: string;
  score_state: string;
  score?: {
    sleep_performance_percentage: number;
    stage_summary?: {
      total_in_bed_time_milli: number;
      total_awake_time_milli: number;
      total_no_data_time_milli: number;
    };
  };
}
