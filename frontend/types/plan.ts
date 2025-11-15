export type PlanStatus = 'draft' | 'active' | 'completed' | 'archived';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';
export type ResourceType = 'link' | 'document' | 'video' | 'other';

export interface Task {
  id: string;
  plan_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string | null;
  order: number;
  created_at: string;
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
}

export interface PlanGenerateRequest {
  title: string;
  description: string;
  timeline?: string;
}
