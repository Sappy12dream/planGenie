export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ResourceType = 'link' | 'document' | 'video' | 'other';
export type TaskDifficulty = 1 | 2 | 3 | 4 | 5;

export interface Task {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  order: number;
  created_at: string;
  updated_at?: string;

  // AI Intelligence Metadata
  estimated_time_hours?: number | null;
  difficulty?: TaskDifficulty | null;
  estimated_cost_usd?: number | null;
  tools_needed?: string[];
  prerequisites?: number[];
  tags?: string[];
}

export interface Resource {
  id: string;
  plan_id: string;
  title: string;
  url: string;
  type: ResourceType;
  created_at: string;
}

export interface Plan {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  status: PlanStatus;
  tasks: Task[];
  resources: Resource[];
  created_at: string;
  updated_at: string;

  // AI Intelligence Metadata
  plan_type?: string;
  total_estimated_hours?: number | null;
  total_estimated_cost_usd?: number | null;
  health_score?: number | null;
  last_analyzed_at?: string | null;
}

export interface PlanGenerateRequest {
  title: string;
  description: string;
  timeline?: string;
}
