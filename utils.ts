import { Hire, ReadinessStatus, Task, TaskAssignee, TaskPhase } from './types';
import { v4 as uuidv4 } from 'uuid';

// --- Task Generation ---

export const generateDefaultTasks = (): Task[] => {
  return [
    // Compliance
    {
      id: uuidv4(),
      section: 'Compliance',
      title: 'Complete W-4',
      assignee: 'Employee',
      due: 'Before Day 1',
      phase: 'Pre-boarding',
      status: 'Not started'
    },
    {
      id: uuidv4(),
      section: 'Compliance',
      title: 'Complete I-9 (section 1)',
      assignee: 'Employee',
      due: 'Before Day 1',
      phase: 'Pre-boarding',
      status: 'Not started'
    },
    {
      id: uuidv4(),
      section: 'Compliance',
      title: 'Complete I-9 (section 2 verification)',
      assignee: 'Owner',
      due: 'Day 1',
      phase: 'Day 1',
      status: 'Not started'
    },
    {
      id: uuidv4(),
      section: 'Compliance',
      title: 'Review and acknowledge state-specific notice',
      assignee: 'Employee',
      due: 'Before Day 1',
      phase: 'Pre-boarding',
      status: 'Not started'
    },
    // Payroll & Basics
    {
      id: uuidv4(),
      section: 'Payroll & basics',
      title: 'Provide personal details & emergency contact',
      assignee: 'Employee',
      due: 'Before Day 1',
      phase: 'Pre-boarding',
      status: 'Not started'
    },
    {
      id: uuidv4(),
      section: 'Payroll & basics',
      title: 'Set up direct deposit',
      assignee: 'Employee',
      due: 'Before Day 1',
      phase: 'Pre-boarding',
      status: 'Not started'
    },
    {
      id: uuidv4(),
      section: 'Payroll & basics',
      title: 'Confirm pay rate and schedule',
      assignee: 'Owner',
      due: 'Before first payroll',
      phase: 'Pre-boarding',
      status: 'Not started'
    },
    // Day 1
    {
      id: uuidv4(),
      section: 'Day 1 welcome & orientation',
      title: 'Meet manager',
      description: 'At start time',
      assignee: 'Employee',
      due: 'Day 1',
      phase: 'Day 1',
      status: 'Not started'
    },
    {
      id: uuidv4(),
      section: 'Day 1 welcome & orientation',
      title: 'Store/office tour and safety briefing',
      assignee: 'Manager',
      due: 'Day 1',
      phase: 'Day 1',
      status: 'Not started'
    },
    {
      id: uuidv4(),
      section: 'Day 1 welcome & orientation',
      title: 'Review house rules (breaks, phone use, dress code)',
      assignee: 'Employee',
      due: 'Day 1',
      phase: 'Day 1',
      status: 'Not started'
    },
    {
      id: uuidv4(),
      section: 'Day 1 welcome & orientation',
      title: 'Shadow a teammate on your first shift',
      assignee: 'Employee',
      due: 'Day 1',
      phase: 'Day 1',
      status: 'Not started'
    }
  ];
};

export const generateSeededTasksForStatus = (tasks: Task[], status: ReadinessStatus): Task[] => {
    // Copy to avoid mutation
    const newTasks = tasks.map(t => ({...t}));
    
    if (status === 'Not started') return newTasks;

    if (status === 'In progress') {
        // Mark a few pre-boarding employee tasks as done
        newTasks.forEach(t => {
             if (t.title.includes('personal details') || t.title.includes('W-4')) {
                 t.status = 'Completed';
             }
        });
        return newTasks;
    }

    if (status === 'Ready for Day 1') {
        // All pre-boarding employee tasks done
        // Owner pre-boarding done
        newTasks.forEach(t => {
            if (t.phase === 'Pre-boarding') {
                t.status = 'Completed';
            }
        });
        return newTasks;
    }

    if (status === 'Ready for payroll') {
        newTasks.forEach(t => t.status = 'Completed');
        return newTasks;
    }
    
    return newTasks;
};


// --- Readiness Logic (Page 7) ---

export const computeReadinessStatus = (tasks: Task[]): ReadinessStatus => {
  if (tasks.length === 0) return 'Not started';

  const allTasksNotStarted = tasks.every(t => t.status === 'Not started');
  if (allTasksNotStarted) return 'Not started';

  const preboardingTasks = tasks.filter(t => t.phase === 'Pre-boarding');
  const preboardingEmployeeTasks = preboardingTasks.filter(t => t.assignee === 'Employee');
  const preboardingOwnerTasks = preboardingTasks.filter(t => t.assignee === 'Owner' || t.assignee === 'Manager');
  
  const day1Tasks = tasks.filter(t => t.phase === 'Day 1');
  
  const allPreboardingEmployeeCompleted = preboardingEmployeeTasks.every(t => t.status === 'Completed');
  const allPreboardingOwnerCompleted = preboardingOwnerTasks.every(t => t.status === 'Completed');
  const allDay1Completed = day1Tasks.every(t => t.status === 'Completed');

  // "If at least one task has status === 'In progress' or 'Completed' and not all preboardingEmployeeTasks are Completed -> In progress"
  const hasActivity = tasks.some(t => t.status === 'In progress' || t.status === 'Completed');
  if (hasActivity && !allPreboardingEmployeeCompleted) {
    return 'In progress';
  }

  // "If all preboardingEmployeeTasks are Completed but at least one of the following is true: 
  // Any preboardingOwnerTasks is not Completed, or Any day1Tasks is not Completed"
  if (allPreboardingEmployeeCompleted && (!allPreboardingOwnerCompleted || !allDay1Completed)) {
     return 'Ready for Day 1';
  }

  // "If all tasks across both phases and all assignees are Completed"
  const allTasksCompleted = tasks.every(t => t.status === 'Completed');
  if (allTasksCompleted) {
    return 'Ready for payroll';
  }

  // Fallback (shouldn't really happen with above logic coverage)
  return 'In progress'; 
};

// --- Day 1 Checklist Status Logic (Page 8) ---

export type Day1ChecklistStatus = 'Not yet active' | 'Active' | 'Completed';

export const computeDay1ChecklistStatus = (tasks: Task[]): Day1ChecklistStatus => {
  const preboardingTasks = tasks.filter(t => t.phase === 'Pre-boarding');
  const preboardingEmployeeTasks = preboardingTasks.filter(t => t.assignee === 'Employee');
  
  const day1Tasks = tasks.filter(t => t.phase === 'Day 1');

  const preboardingEmployeeTasksCompleted = preboardingEmployeeTasks.length > 0 && preboardingEmployeeTasks.every(t => t.status === 'Completed');
  const day1TasksCompleted = day1Tasks.length > 0 && day1Tasks.every(t => t.status === 'Completed');

  if (!preboardingEmployeeTasksCompleted) return 'Not yet active';
  if (preboardingEmployeeTasksCompleted && !day1TasksCompleted) return 'Active';
  if (preboardingEmployeeTasksCompleted && day1TasksCompleted) return 'Completed';

  return 'Not yet active';
};