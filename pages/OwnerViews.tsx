import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useOnboarding } from '../context';
import { OwnerLayout, Button, ReadinessBadge, ProgressBar } from '../components/UI';
import { Task, SEEDED_HIRES, TaskAssignee, TaskPhase } from '../types';
import { computeReadinessStatus, generateDefaultTasks, Day1ChecklistStatus, computeDay1ChecklistStatus } from '../utils';
import { Plus, Trash2, CheckCircle, Circle, User, Briefcase, MapPin, Calendar, Mail, Phone, ArrowRight, Wand2, X } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const US_STATES = [
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA", 
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD", 
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ", 
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC", 
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

// --- 1. Owner Home ---

export const OwnerDashboard: React.FC = () => {
  const { hires, setCurrentHireId, clearDraftHire } = useOnboarding();
  const navigate = useNavigate();

  const handleStartNew = () => {
    clearDraftHire();
    navigate('/owner/onboarding/new/step-1');
  };

  const handleRowClick = (id: string) => {
    setCurrentHireId(id);
    navigate(`/owner/onboarding/${id}`);
  };

  // Derived next step logic
  const getNextStep = (hire: any) => {
      switch(hire.readinessStatus) {
          case 'Not started': return 'Invite sent to employee';
          case 'In progress': return 'Monitor employee and owner tasks';
          case 'Ready for Day 1': return 'Complete remaining Day 1 tasks';
          case 'Ready for payroll': return 'No actions pending';
          default: return '';
      }
  };

  return (
    <OwnerLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">New Hire Onboarding</h1>
        <Button onClick={handleStartNew}>
            <Plus className="w-4 h-4 mr-2" />
            Start new hire onboarding
        </Button>
      </div>

      <div className="bg-white shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Readiness</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Next Step</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 cursor-pointer">
            {hires.map((hire) => (
              <tr key={hire.id} onClick={() => handleRowClick(hire.id)} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{hire.employeeName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{hire.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(hire.startDate).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap"><ReadinessBadge status={hire.readinessStatus} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getNextStep(hire)}</td>
              </tr>
            ))}
            {hires.length === 0 && (
                <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No hires yet. Click the button above to start.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </OwnerLayout>
  );
};

// --- 2. Wizard Step 1: Basics ---

export const WizardStep1: React.FC = () => {
    const { draftHire, updateDraftHire } = useOnboarding();
    const navigate = useNavigate();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        updateDraftHire({ [name]: value });
    };

    const isFormValid = draftHire.employeeName && draftHire.role && draftHire.startDate && draftHire.locationState && draftHire.locationCity;

    const inputBaseClass = "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 text-gray-900";

    return (
        <OwnerLayout>
            <div className="max-w-2xl mx-auto">
                <h2 className="text-xl font-bold mb-6 text-black">Set up your new hire</h2>
                
                <div className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Employee Name</label>
                        <input type="text" name="employeeName" value={draftHire.employeeName || ''} onChange={handleChange} className={inputBaseClass} />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Select Onboarding Kit - Role</label>
                            <select name="role" value={draftHire.role || ''} onChange={handleChange} className={inputBaseClass}>
                                <option value="" className="text-gray-500">Select a role</option>
                                <option value="Retail Associate">Retail Associate</option>
                                <option value="Server">Server</option>
                                <option value="Office Admin">Office Admin</option>
                            </select>
                        </div>
                        <div>
                             <label className="block text-sm font-medium text-gray-700">Employment Type</label>
                             <div className="mt-2 flex space-x-4">
                                <label className="inline-flex items-center">
                                    <input type="radio" name="employmentType" value="Full-time" checked={draftHire.employmentType === 'Full-time' || !draftHire.employmentType} onChange={handleChange} className="form-radio h-4 w-4 text-indigo-600" />
                                    <span className="ml-2 text-sm text-gray-700">Full-time</span>
                                </label>
                                <label className="inline-flex items-center">
                                    <input type="radio" name="employmentType" value="Part-time" checked={draftHire.employmentType === 'Part-time'} onChange={handleChange} className="form-radio h-4 w-4 text-indigo-600" />
                                    <span className="ml-2 text-sm text-gray-700">Part-time</span>
                                </label>
                             </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                             <label className="block text-sm font-medium text-gray-700">State</label>
                             <select name="locationState" value={draftHire.locationState || ''} onChange={handleChange} className={inputBaseClass}>
                                 <option value="" className="text-gray-500">Select State</option>
                                 {US_STATES.map(state => (
                                     <option key={state} value={state}>{state}</option>
                                 ))}
                             </select>
                        </div>
                         <div>
                             <label className="block text-sm font-medium text-gray-700">City</label>
                             <input type="text" name="locationCity" value={draftHire.locationCity || ''} onChange={handleChange} className={inputBaseClass} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Start Date</label>
                        <input type="date" name="startDate" value={draftHire.startDate || ''} onChange={handleChange} className={inputBaseClass} />
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md flex items-start">
                         <Wand2 className="w-5 h-5 text-blue-500 mt-0.5 mr-2" />
                         <p className="text-sm text-blue-700">We’ll use this information to generate the right forms and checklist for this hire.</p>
                    </div>

                    <div className="flex justify-between pt-4">
                        <Button variant="ghost" onClick={() => navigate('/owner/onboarding')}>Cancel</Button>
                        <Button disabled={!isFormValid} onClick={() => navigate('/owner/onboarding/new/step-2')}>Next: Review checklist</Button>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
};

// --- 3. Wizard Step 2: Checklist ---

export const WizardStep2: React.FC = () => {
    const { draftHire, addExtraTask, removeTask } = useOnboarding();
    const navigate = useNavigate();
    
    // Modal state for adding custom task
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [newTask, setNewTask] = useState<{
        title: string;
        section: Task['section'];
        assignee: TaskAssignee;
        due: Task['due'];
    }>({
        title: '',
        section: 'Day 1 welcome & orientation',
        assignee: 'Employee',
        due: 'Day 1'
    });

    // Init defaults if empty
    useEffect(() => {
        if (!draftHire.tasks || draftHire.tasks.length === 0) {
            const defaults = generateDefaultTasks();
            defaults.forEach(t => addExtraTask('draft', t));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 
    
    const tasks = draftHire.tasks || [];

    const handleAddAI = () => {
        const newTask: Task = {
            id: uuidv4(),
            section: 'Day 1 welcome & orientation',
            title: 'Review employee handbook',
            assignee: 'Employee',
            due: 'Day 1',
            phase: 'Day 1',
            status: 'Not started'
        };
        addExtraTask('draft', newTask);
        alert("Checklist updated based on role and location (Simulated AI)");
    };

    const handleAddCustomTask = () => {
        if (!newTask.title) return;
        
        // Simple phase inference
        const phase: TaskPhase = (newTask.due === 'Day 1') ? 'Day 1' : 'Pre-boarding';

        const task: Task = {
            id: uuidv4(),
            title: newTask.title,
            section: newTask.section,
            assignee: newTask.assignee,
            due: newTask.due,
            phase: phase,
            status: 'Not started'
        };

        addExtraTask('draft', task);
        setIsAddTaskOpen(false);
        setNewTask({
            title: '',
            section: 'Day 1 welcome & orientation',
            assignee: 'Employee',
            due: 'Day 1'
        });
    };

    return (
        <OwnerLayout>
            <div className="max-w-4xl mx-auto">
                 <h2 className="text-xl font-bold mb-6 text-black">Review Smart Onboarding Checklist</h2>
                 <div className="flex gap-6">
                     <div className="flex-1 space-y-4">
                        <div className="flex justify-between items-center bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <div>
                                <h3 className="text-sm font-semibold text-purple-900 flex items-center gap-2">
                                    <Wand2 className="w-4 h-4"/> Smart Checklist
                                </h3>
                                <p className="text-xs text-purple-700 mt-1">Generated for {draftHire.role} in {draftHire.locationCity}, {draftHire.locationState}</p>
                            </div>
                            <div className="flex space-x-2">
                                <Button variant="secondary" onClick={handleAddAI} className="text-xs px-3">Use Onboarding Kit Template</Button>
                                <Button variant="outline" onClick={() => setIsAddTaskOpen(true)} className="text-xs px-3 bg-white">
                                    <Plus className="w-3 h-3 mr-1" /> Add task
                                </Button>
                            </div>
                        </div>

                        {['Compliance', 'Payroll & basics', 'Day 1 welcome & orientation'].map(section => (
                            <div key={section} className="bg-white shadow rounded-lg overflow-hidden">
                                <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                    <h3 className="text-sm font-bold text-gray-700">{section}</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {tasks.filter(t => t.section === section).map(task => (
                                        <div key={task.id} className="p-4 flex items-center justify-between hover:bg-gray-50 group">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{task.assignee}</span>
                                                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">Due: {task.due}</span>
                                                </div>
                                            </div>
                                            <button onClick={() => removeTask('draft', task.id)} className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                    {tasks.filter(t => t.section === section).length === 0 && (
                                        <div className="p-4 text-sm text-gray-400 italic">No tasks in this section.</div>
                                    )}
                                </div>
                            </div>
                        ))}
                     </div>

                     <div className="w-80">
                         <div className="bg-white p-6 shadow rounded-lg sticky top-6">
                            <h3 className="font-bold text-gray-900 mb-4">Summary</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center text-gray-600"><User className="w-4 h-4 mr-2"/> {draftHire.employeeName}</div>
                                <div className="flex items-center text-gray-600"><Calendar className="w-4 h-4 mr-2"/> Start: {draftHire.startDate}</div>
                                <div className="flex items-center text-gray-600"><MapPin className="w-4 h-4 mr-2"/> {draftHire.locationCity}, {draftHire.locationState}</div>
                            </div>
                            <div className="mt-6 border-t pt-4">
                                <p className="text-xs text-gray-500 uppercase font-semibold">Estimated time</p>
                                <div className="mt-2 flex justify-between text-sm">
                                    <span>Employee</span>
                                    <span className="font-medium">~15 min</span>
                                </div>
                                <div className="flex justify-between text-sm mt-1">
                                    <span>Owner</span>
                                    <span className="font-medium">~5 min</span>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col gap-3">
                                <Button onClick={() => navigate('/owner/onboarding/new/step-3')}>Next: Invite Employee</Button>
                                <Button variant="ghost" onClick={() => navigate('/owner/onboarding/new/step-1')}>Back</Button>
                            </div>
                         </div>
                     </div>
                 </div>
            </div>

            {/* Add Task Modal */}
            {isAddTaskOpen && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
                    <div className="relative bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Add Checklist Task</h3>
                            <button onClick={() => setIsAddTaskOpen(false)} className="text-gray-400 hover:text-gray-500">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Task Title</label>
                                <input 
                                    type="text" 
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    value={newTask.title}
                                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                                    placeholder="e.g. Collect uniform"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700">Section</label>
                                <select 
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                    value={newTask.section}
                                    onChange={(e) => setNewTask({...newTask, section: e.target.value as Task['section']})}
                                >
                                    <option value="Day 1 welcome & orientation">Day 1 welcome & orientation</option>
                                    <option value="Compliance">Compliance</option>
                                    <option value="Payroll & basics">Payroll & basics</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Assignee</label>
                                    <select 
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        value={newTask.assignee}
                                        onChange={(e) => setNewTask({...newTask, assignee: e.target.value as TaskAssignee})}
                                    >
                                        <option value="Employee">Employee</option>
                                        <option value="Owner">Owner</option>
                                        <option value="Manager">Manager</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Due</label>
                                    <select 
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                                        value={newTask.due}
                                        onChange={(e) => setNewTask({...newTask, due: e.target.value as Task['due']})}
                                    >
                                        <option value="Day 1">Day 1</option>
                                        <option value="Before Day 1">Before Day 1</option>
                                        <option value="Before first payroll">Before first payroll</option>
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <Button variant="ghost" onClick={() => setIsAddTaskOpen(false)}>Cancel</Button>
                                <Button onClick={handleAddCustomTask} disabled={!newTask.title}>Add Task</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </OwnerLayout>
    );
};

// --- 4. Wizard Step 3: Invite ---

export const WizardStep3: React.FC = () => {
    const { draftHire, updateDraftHire, createHireFromDraft, currentHireId } = useOnboarding();
    const navigate = useNavigate();

    // Effect to detect when hire is created and redirect
    useEffect(() => {
        // This is tricky because creating happens in handler.
        // We'll handle redirect in handler.
    }, []);

    const handleSend = () => {
        if (!draftHire.ownerContactEmail) return;
        createHireFromDraft();
        // We can't immediately get the ID from createHireFromDraft easily unless we change the context signature to return it.
        // Instead, we trust the Context sets `currentHireId`.
        // Let's use a small timeout or just assume the last item in array? 
        // Better: Context `createHireFromDraft` sets `currentHireId`. 
        // We can navigate in a useEffect that watches currentHireId CHANGE, or just wait a tick.
        setTimeout(() => {
             // We need to fetch the ID. Since we can't easily wait for state update inside the same tick
             // We will assume the `currentHireId` is updated or use a redirect logic in a wrapper.
             // For this prototype, checking `currentHireId` in a useEffect is safer.
        }, 100);
    };

    // Watch for successful creation
    useEffect(() => {
       if (currentHireId && draftHire.employeeName === undefined) { 
           // draftHire is cleared on creation, so if currentHireId exists and draft is empty, we likely just finished.
           // However, this might trigger on existing hires too if we just refreshed.
           // Let's rely on a simpler "Navigate" inside the button click if we can, 
           // but `createHireFromDraft` is void.
           // Actually, let's just redirect to the list, or better, finding the latest hire.
           navigate(`/owner/onboarding/${currentHireId}`);
       }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentHireId, draftHire]);


    return (
        <OwnerLayout>
             <div className="max-w-2xl mx-auto">
                 <h2 className="text-xl font-bold mb-6 text-black">Invite {draftHire.employeeName}</h2>
                 
                 <div className="bg-white shadow sm:rounded-lg p-6 space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address (Required)</label>
                        <input type="email" value={draftHire.ownerContactEmail || ''} onChange={(e) => updateDraftHire({ownerContactEmail: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 sm:text-sm bg-gray-50 text-gray-900" />
                    </div>
                    
                    <div className="space-y-3">
                         <div className="flex items-center">
                             <input type="checkbox" checked readOnly className="h-4 w-4 text-indigo-600 rounded border-gray-300" />
                             <label className="ml-2 block text-sm text-gray-900">Send email invite</label>
                         </div>
                          <div className="flex items-center">
                             <input type="checkbox" disabled className="h-4 w-4 text-gray-300 rounded border-gray-300" />
                             <label className="ml-2 block text-sm text-gray-500">Send SMS invite (Not available in prototype)</label>
                         </div>
                    </div>

                    <div className="bg-gray-50 rounded-md p-4 border border-gray-200">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email Preview</h4>
                        <div className="text-sm text-gray-800 space-y-2">
                            <p><strong>Subject:</strong> Welcome to {draftHire.businessName || 'Sunrise Cafe'} – let’s get you ready for Day 1.</p>
                            <hr className="border-gray-200"/>
                            <p>Hi {draftHire.employeeName?.split(' ')[0]},</p>
                            <p>We’re excited to have you join as a {draftHire.role} starting {draftHire.startDate}.</p>
                            <p>Before your first day, please complete a few quick steps so we can pay you correctly and make your first day smooth.</p>
                        </div>
                    </div>
                    
                    <div className="flex justify-between pt-4">
                        <Button variant="ghost" onClick={() => navigate('/owner/onboarding/new/step-2')}>Back</Button>
                        <Button onClick={handleSend} disabled={!draftHire.ownerContactEmail}>Send Invite</Button>
                    </div>
                 </div>
             </div>
        </OwnerLayout>
    );
};

// --- 5. Hire Detail / Readiness Dashboard ---

export const HireDetail: React.FC = () => {
    const { hireId } = useParams<{ hireId: string }>();
    const { getHire, updateTaskStatus } = useOnboarding();
    const hire = getHire(hireId || '');
    const navigate = useNavigate();

    if (!hire) return <OwnerLayout><div>Hire not found</div></OwnerLayout>;

    const completedTasks = hire.tasks.filter(t => t.status === 'Completed').length;
    const totalTasks = hire.tasks.length;
    
    // Derived Day 1 Status
    const day1Status = computeDay1ChecklistStatus(hire.tasks);
    const day1Tasks = hire.tasks.filter(t => t.phase === 'Day 1');
    const day1Completed = day1Tasks.filter(t => t.status === 'Completed').length;

    // Group tasks
    const employeeTasks = hire.tasks.filter(t => t.assignee === 'Employee');
    const ownerTasks = hire.tasks.filter(t => t.assignee === 'Owner' || t.assignee === 'Manager');

    const handleTaskToggle = (taskId: string, currentStatus: string) => {
        const newStatus = currentStatus === 'Completed' ? 'Not started' : 'Completed';
        updateTaskStatus(hire.id, taskId, newStatus);
    };

    return (
        <OwnerLayout>
            <div className="mb-6">
                <Button variant="ghost" onClick={() => navigate('/owner/onboarding')} className="mb-2 pl-0 hover:bg-transparent hover:text-indigo-600">
                    <ArrowRight className="w-4 h-4 mr-1 rotate-180" /> Back to list
                </Button>
                <div className="flex items-center gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">{hire.employeeName}</h1>
                    <ReadinessBadge status={hire.readinessStatus} />
                </div>
                <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
                    <span>{completedTasks} of {totalTasks} tasks completed</span>
                    <div className="w-48"><ProgressBar completed={completedTasks} total={totalTasks} color="bg-indigo-600" /></div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Task Lists */}
                <div className="lg:col-span-2 space-y-8">
                    
                    {/* Employee Tasks */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900">Employee tasks</h3>
                        </div>
                        <ul className="divide-y divide-gray-200">
                            {employeeTasks.map(task => (
                                <li key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-start">
                                        <button onClick={() => handleTaskToggle(task.id, task.status)} className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border ${task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                            {task.status === 'Completed' && <CheckCircle className="w-4 h-4 m-auto" />}
                                        </button>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                            <p className="text-xs text-gray-500">Due: {task.due}</p>
                                        </div>
                                    </div>
                                    <span className={`text-xs px-2 py-1 rounded-full ${task.phase === 'Pre-boarding' ? 'bg-blue-50 text-blue-700' : 'bg-orange-50 text-orange-700'}`}>{task.phase}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Owner Tasks */}
                    <div className="bg-white shadow sm:rounded-lg overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="text-lg font-medium text-gray-900">Owner tasks</h3>
                        </div>
                        <ul className="divide-y divide-gray-200">
                             {ownerTasks.map(task => (
                                <li key={task.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-start">
                                        <button onClick={() => handleTaskToggle(task.id, task.status)} className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border ${task.status === 'Completed' ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300'}`}>
                                            {task.status === 'Completed' && <CheckCircle className="w-4 h-4 m-auto" />}
                                        </button>
                                        <div className="ml-3">
                                            <p className={`text-sm font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</p>
                                            <p className="text-xs text-gray-500">Assignee: {task.assignee}</p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Right Col: Summary Cards */}
                <div className="space-y-6">
                    {/* Day 1 Checklist Status */}
                    <div className="bg-white shadow sm:rounded-lg p-6 border-t-4 border-indigo-500">
                        <h3 className="text-lg font-medium text-gray-900">Day 1 Checklist</h3>
                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-sm text-gray-500">Status</span>
                            <span className={`text-xs font-bold uppercase tracking-wide px-2 py-0.5 rounded ${day1Status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{day1Status}</span>
                        </div>
                        <div className="mt-4">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Progress</span>
                                <span>{day1Completed} of {day1Tasks.length}</span>
                            </div>
                            <ProgressBar completed={day1Completed} total={day1Tasks.length} color="bg-indigo-500" />
                        </div>
                        <div className="mt-6">
                            <button className="text-sm text-indigo-600 hover:text-indigo-900 font-medium flex items-center">
                                View Day 1 Plan <ArrowRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white shadow sm:rounded-lg p-6">
                         <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Hire Details</h3>
                         <div className="space-y-3 text-sm">
                            <div className="flex items-center text-gray-900"><User className="w-4 h-4 mr-2 text-gray-400"/> {hire.role}</div>
                            <div className="flex items-center text-gray-900"><Briefcase className="w-4 h-4 mr-2 text-gray-400"/> {hire.employmentType}</div>
                            <div className="flex items-center text-gray-900"><MapPin className="w-4 h-4 mr-2 text-gray-400"/> {hire.locationCity}, {hire.locationState}</div>
                            <div className="flex items-center text-gray-900"><Calendar className="w-4 h-4 mr-2 text-gray-400"/> Start: {hire.startDate}</div>
                            <div className="flex items-center text-gray-900"><Mail className="w-4 h-4 mr-2 text-gray-400"/> {hire.ownerContactEmail}</div>
                         </div>
                    </div>
                </div>
            </div>
        </OwnerLayout>
    );
};