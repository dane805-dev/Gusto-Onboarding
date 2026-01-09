export type ReadinessStatus =
  | 'Not started'
  | 'In progress'
  | 'Ready for Day 1'
  | 'Ready for payroll';

export type TaskAssignee = 'Employee' | 'Owner' | 'Manager';
export type TaskPhase = 'Pre-boarding' | 'Day 1';

export interface Task {
  id: string;
  section: 'Compliance' | 'Payroll & basics' | 'Day 1 welcome & orientation';
  title: string;
  description?: string;
  assignee: TaskAssignee;
  due: 'Before Day 1' | 'Day 1' | 'Before first payroll';
  phase: TaskPhase;
  status: 'Not started' | 'In progress' | 'Completed';
}

export interface Hire {
  id: string;
  employeeName: string;
  role: string;
  employmentType: 'Full-time' | 'Part-time';
  locationCity: string;
  locationState: string;
  startDate: string; // ISO date string
  readinessStatus: ReadinessStatus;
  tasks: Task[];
  ownerContactEmail: string;
  ownerContactPhone?: string;
  businessName: string;
  managerName: string;
  managerMeetingTime?: string; // e.g. '9:00 AM'
  addressLine?: string; // business address for Day 1
}

export type ViewMode = 'Owner' | 'Employee';

export interface OnboardingState {
  hires: Hire[];
  draftHire?: Partial<Hire>;
  currentHireId?: string;
  viewMode: ViewMode;
  lastEmployeePath?: string;
}

export const SEEDED_HIRES: Hire[] = [
  {
    id: 'h1',
    employeeName: 'Jane Smith',
    role: 'Retail Associate',
    employmentType: 'Full-time',
    locationCity: 'Springfield',
    locationState: 'CO',
    startDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    readinessStatus: 'In progress',
    ownerContactEmail: 'owner@sunrisecafe.com',
    businessName: 'Sunrise Cafe',
    managerName: 'Alex',
    managerMeetingTime: '9:00 AM',
    addressLine: '123 Main Street, Springfield, CO',
    tasks: [] // Will be populated by logic on init if empty, but here we assume pre-seeded
  },
  {
    id: 'h2',
    employeeName: 'Carlos Rodriguez',
    role: 'Server',
    employmentType: 'Part-time',
    locationCity: 'Springfield',
    locationState: 'CO',
    startDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
    readinessStatus: 'Ready for Day 1',
    ownerContactEmail: 'owner@sunrisecafe.com',
    businessName: 'Sunrise Cafe',
    managerName: 'Alex',
    managerMeetingTime: '10:00 AM',
    addressLine: '123 Main Street, Springfield, CO',
    tasks: []
  },
  {
    id: 'h3',
    employeeName: 'Priya Patel',
    role: 'Office Admin',
    employmentType: 'Full-time',
    locationCity: 'Denver',
    locationState: 'CO',
    startDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    readinessStatus: 'Not started',
    ownerContactEmail: 'owner@sunrisecafe.com',
    businessName: 'Sunrise Cafe HQ',
    managerName: 'Sarah',
    managerMeetingTime: '9:00 AM',
    addressLine: '400 Broad St, Denver, CO',
    tasks: []
  }
];