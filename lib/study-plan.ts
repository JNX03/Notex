export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completed: boolean;
  subject: string;
  priority: 'low' | 'medium' | 'high';
}

export interface StudyPlan {
  id: string;
  subject: string;
  tasks: Task[];
  startDate: string;
  endDate: string;
  targetHours: number;
  completedHours: number;
}

export function getStudyPlans(): StudyPlan[] {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem('studyPlans');
  return stored ? JSON.parse(stored) : [];
}

export function saveStudyPlan(plan: StudyPlan) {
  const plans = getStudyPlans();
  const index = plans.findIndex(p => p.id === plan.id);
  
  if (index >= 0) {
    plans[index] = plan;
  } else {
    plans.push(plan);
  }
  
  localStorage.setItem('studyPlans', JSON.stringify(plans));
}

export function updateTask(planId: string, taskId: string, updates: Partial<Task>) {
  const plans = getStudyPlans();
  const plan = plans.find(p => p.id === planId);
  
  if (plan) {
    const taskIndex = plan.tasks.findIndex(t => t.id === taskId);
    if (taskIndex >= 0) {
      plan.tasks[taskIndex] = { ...plan.tasks[taskIndex], ...updates };
      saveStudyPlan(plan);
    }
  }
} 