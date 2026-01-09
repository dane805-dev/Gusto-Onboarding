import React, { createContext, useContext, useState, useEffect } from 'react';
import { Hire, OnboardingState, ViewMode, SEEDED_HIRES, Task } from './types';
import { generateDefaultTasks, generateSeededTasksForStatus, computeReadinessStatus } from './utils';

interface OnboardingContextType extends OnboardingState {
  setViewMode: (mode: ViewMode) => void;
  setCurrentHireId: (hireId: string) => void;
  updateDraftHire: (patch: Partial<Hire>) => void;
  createHireFromDraft: () => void;
  clearDraftHire: () => void;
  updateTaskStatus: (hireId: string, taskId: string, status: Task['status']) => void;
  addExtraTask: (hireId: string, task: Task) => void;
  removeTask: (hireId: string, taskId: string) => void;
  getHire: (id: string) => Hire | undefined;
  setLastEmployeePath: (path: string) => void;
  resetHireProgress: (hireId: string) => void;
  assistantState: { isOpen: boolean; topic: string };
  openAssistant: (topic: string) => void;
  closeAssistant: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize from local storage or seeded data
  const [hires, setHires] = useState<Hire[]>(() => {
    const stored = localStorage.getItem('gusto_proto_hires');
    if (stored) return JSON.parse(stored);
    
    // Seed tasks for the demo hires based on their statuses
    const seeded = SEEDED_HIRES.map(h => ({
        ...h,
        tasks: generateSeededTasksForStatus(generateDefaultTasks(), h.readinessStatus)
    }));
    return seeded;
  });

  const [draftHire, setDraftHire] = useState<Partial<Hire>>({});
  const [currentHireId, setCurrentHireId] = useState<string | undefined>(undefined);
  const [viewMode, setViewMode] = useState<ViewMode>('Owner');
  const [lastEmployeePath, setLastEmployeePath] = useState<string | undefined>(undefined);
  
  // Assistant State
  const [assistantState, setAssistantState] = useState({ isOpen: false, topic: '' });

  // Persistence
  useEffect(() => {
    localStorage.setItem('gusto_proto_hires', JSON.stringify(hires));
  }, [hires]);

  const updateDraftHire = (patch: Partial<Hire>) => {
    setDraftHire(prev => ({ ...prev, ...patch }));
  };

  const createHireFromDraft = () => {
    if (!draftHire.employeeName) return;

    const defaultTasks = generateDefaultTasks();
    const newHire: Hire = {
      id: crypto.randomUUID(),
      employeeName: draftHire.employeeName || 'New Employee',
      role: draftHire.role || 'Role',
      employmentType: draftHire.employmentType || 'Full-time',
      locationCity: draftHire.locationCity || '',
      locationState: draftHire.locationState || '',
      startDate: draftHire.startDate || new Date().toISOString(),
      tasks: draftHire.tasks && draftHire.tasks.length > 0 ? draftHire.tasks : defaultTasks,
      ownerContactEmail: draftHire.ownerContactEmail || '',
      ownerContactPhone: draftHire.ownerContactPhone || '',
      businessName: draftHire.businessName || 'Sunrise Cafe', // Default
      managerName: draftHire.managerName || 'Alex', // Default
      managerMeetingTime: '9:00 AM',
      addressLine: '123 Main Street, Springfield, CO',
      ...draftHire, // spread to override any defaults if they were in draft
      readinessStatus: 'Not started', // Ensure it starts here
    };

    setHires(prev => [...prev, newHire]);
    setCurrentHireId(newHire.id);
    setDraftHire({});
  };

  const clearDraftHire = () => {
    setDraftHire({});
  };

  const updateTaskStatus = (hireId: string, taskId: string, status: Task['status']) => {
    setHires(prev => prev.map(hire => {
      if (hire.id !== hireId) return hire;

      const updatedTasks = hire.tasks.map(t => 
        t.id === taskId ? { ...t, status } : t
      );
      
      const newReadiness = computeReadinessStatus(updatedTasks);
      
      return {
        ...hire,
        tasks: updatedTasks,
        readinessStatus: newReadiness
      };
    }));
  };

  const addExtraTask = (hireId: string, task: Task) => {
     if(hireId === 'draft') {
        // Handling draft modification
        const currentTasks = draftHire.tasks || generateDefaultTasks();
        updateDraftHire({ tasks: [...currentTasks, task] });
     } else {
         setHires(prev => prev.map(hire => {
             if(hire.id !== hireId) return hire;
             const updatedTasks = [...hire.tasks, task];
             return { ...hire, tasks: updatedTasks };
         }));
     }
  };

  const removeTask = (hireId: string, taskId: string) => {
      if(hireId === 'draft') {
          if(!draftHire.tasks) return;
          updateDraftHire({ tasks: draftHire.tasks.filter(t => t.id !== taskId)});
      } else {
        setHires(prev => prev.map(hire => {
            if (hire.id !== hireId) return hire;
            return {
                ...hire,
                tasks: hire.tasks.filter(t => t.id !== taskId)
            };
        }));
      }
  }

  const getHire = (id: string) => hires.find(h => h.id === id);

  const resetHireProgress = (hireId: string) => {
    setHires(prev => prev.map(hire => {
        if (hire.id !== hireId) return hire;
        // Reset all tasks to 'Not started'
        const resetTasks = hire.tasks.map(t => ({...t, status: 'Not started' as const}));
        return {
            ...hire,
            tasks: resetTasks,
            readinessStatus: 'Not started' as const
        };
    }));
  };
  
  const openAssistant = (topic: string) => setAssistantState({ isOpen: true, topic });
  const closeAssistant = () => setAssistantState(prev => ({ ...prev, isOpen: false }));

  return (
    <OnboardingContext.Provider value={{
      hires,
      draftHire,
      currentHireId,
      viewMode,
      setViewMode,
      setCurrentHireId,
      updateDraftHire,
      createHireFromDraft,
      clearDraftHire,
      updateTaskStatus,
      addExtraTask,
      removeTask,
      getHire,
      lastEmployeePath,
      setLastEmployeePath,
      resetHireProgress,
      assistantState,
      openAssistant,
      closeAssistant
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};