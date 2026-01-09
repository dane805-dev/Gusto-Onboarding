import React, { useEffect, useState } from 'react';
import { ViewMode } from '../types';
import { useOnboarding } from '../context';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { Check, User, Briefcase, MapPin, Calendar, ArrowRight, ChevronLeft, RefreshCcw, Users, X, Send, Sparkles, MessageCircle } from 'lucide-react';

// --- Shared Atoms ---

export const ReadinessBadge: React.FC<{ status: string }> = ({ status }) => {
  const colors = {
    'Not started': 'bg-gray-100 text-gray-600',
    'In progress': 'bg-blue-100 text-blue-700',
    'Ready for Day 1': 'bg-green-100 text-green-700',
    'Ready for payroll': 'bg-purple-100 text-purple-700',
  };
  const colorClass = colors[status as keyof typeof colors] || colors['Not started'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }> = 
  ({ className = '', variant = 'primary', ...props }) => {
  const base = "inline-flex items-center justify-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "border-transparent text-white bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "border-transparent text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:ring-indigo-500",
    outline: "border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-indigo-500",
    ghost: "border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50",
  };

  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
};

export const ProgressBar: React.FC<{ completed: number; total: number; color?: string }> = ({ completed, total, color = 'bg-green-500' }) => {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div className={`${color} h-2.5 rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }}></div>
    </div>
  );
};

// --- Assistant Sidebar ---

const AssistantSidebar: React.FC = () => {
  const { assistantState, closeAssistant } = useOnboarding();
  const { isOpen, topic } = assistantState;
  const [messages, setMessages] = useState<{role: 'ai'|'user', text: string}[]>([]);
  const [input, setInput] = useState('');

  // Reset messages when topic changes
  useEffect(() => {
    if (isOpen) {
      setMessages([{ role: 'ai', text: `Hi! I'm your Onboarding Assistant. I can help answer questions about the ${topic} form.` }]);
    }
  }, [topic, isOpen]);

  if (!isOpen) return null;

  const suggestions = topic === 'I-9' 
    ? ["What documents do I need?", "Difference between citizen and national?", "Is this form mandatory?"]
    : ["How do I calculate dependents?", "What if I'm exempt?", "What is withholding?"];

  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    
    // Fake response
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', text: "That's a great question. Typically, you should refer to the official instructions or ask your employer for specific guidance. (This is a prototype response)." }]);
    }, 800);
  };

  return (
    <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl transform transition-transform duration-300 z-[100] flex flex-col border-l border-gray-200">
      {/* Header */}
      <div className="p-4 bg-indigo-600 text-white flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          <span className="font-semibold">AI Assistant</span>
        </div>
        <button onClick={closeAssistant} className="text-indigo-100 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 text-sm ${m.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200 text-gray-800'}`}>
              {m.text}
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="p-4 bg-white border-t border-gray-100">
        <p className="text-xs text-gray-500 mb-2 font-medium">Suggested questions:</p>
        <div className="flex flex-wrap gap-2">
          {suggestions.map(q => (
            <button key={q} onClick={() => handleSend(q)} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full border border-indigo-100 hover:bg-indigo-100 text-left">
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="p-3 bg-white border-t border-gray-200">
        <div className="relative">
          <input 
            type="text" 
            className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500" 
            placeholder="Type a question..." 
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button onClick={() => handleSend()} className="absolute right-2 top-1.5 text-indigo-600 hover:text-indigo-700">
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="mt-2 text-center">
             <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3" /> AI assistant for employment forms
             </span>
        </div>
      </div>
    </div>
  );
}

// --- Layouts ---

export const GlobalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { setLastEmployeePath } = useOnboarding();

  useEffect(() => {
    if (location.pathname.startsWith('/employee')) {
      setLastEmployeePath(location.pathname);
    }
  }, [location, setLastEmployeePath]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ViewModeToggle />
      {children}
    </div>
  );
};

const ViewModeToggle = () => {
  const { viewMode, setViewMode, currentHireId, hires, lastEmployeePath } = useOnboarding();
  const navigate = useNavigate();

  const handleToggle = (mode: ViewMode) => {
    setViewMode(mode);
    
    if (mode === 'Owner') {
       if (currentHireId) {
           navigate(`/owner/onboarding/${currentHireId}`);
       } else {
           navigate('/owner/onboarding');
       }
    } else {
        // Switching to Employee
        if (lastEmployeePath) {
            navigate(lastEmployeePath);
            return;
        }

        let targetId = currentHireId;
        if (!targetId && hires.length > 0) {
            targetId = hires[0].id;
        }

        if (targetId) {
            navigate(`/employee/${targetId}/welcome`);
        } else {
            // Fallback if no hires
            alert("Create a hire as an Owner first to view Employee mode.");
            setViewMode('Owner');
        }
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg border border-gray-200 rounded-full p-1 z-50 flex space-x-1">
       <span className="self-center px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">View as:</span>
       <button 
         onClick={() => handleToggle('Owner')}
         className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'Owner' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
       >
         Owner
       </button>
       <button 
         onClick={() => handleToggle('Employee')}
         className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${viewMode === 'Employee' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
       >
         Employee
       </button>
    </div>
  );
}

export const OwnerLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
       <div className="mb-8 flex items-center text-sm text-gray-500">
          <span className="font-semibold text-gray-900">People</span>
          <ChevronLeft className="w-4 h-4 mx-1 rotate-180" />
          <span>Onboarding</span>
       </div>
       {children}
    </div>
  );
}

export const EmployeeLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { hireId } = useParams<{ hireId: string }>();
    const { hires, setCurrentHireId, resetHireProgress, getHire } = useOnboarding();
    const navigate = useNavigate();
    const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
    
    const currentHire = getHire(hireId || '');

    const handleReset = () => {
        if(hireId) {
            if(window.confirm(`Reset onboarding progress for ${currentHire?.employeeName}?`)) {
                resetHireProgress(hireId);
                navigate(`/employee/${hireId}/welcome`);
            }
        }
    };

    const handleSwitchEmployee = (id: string) => {
        setCurrentHireId(id);
        navigate(`/employee/${id}/welcome`);
        setIsSwitcherOpen(false);
    }

    return (
        <div className="min-h-screen bg-white flex flex-col items-center">
             {/* Assistant Sidebar */}
             <AssistantSidebar />

             {/* Demo Controls Header */}
             <div className="w-full bg-gray-900 text-gray-300 py-2 px-4 flex justify-between items-center text-xs">
                 <div className="font-mono uppercase tracking-wide opacity-75">Demo Controls</div>
                 <div className="flex space-x-4">
                     <div className="relative">
                         <button onClick={() => setIsSwitcherOpen(!isSwitcherOpen)} className="hover:text-white flex items-center">
                             <Users className="w-3 h-3 mr-1" />
                             {currentHire ? currentHire.employeeName : 'Choose Employee'}
                         </button>
                         {isSwitcherOpen && (
                             <div className="absolute right-0 mt-2 w-48 bg-white rounded shadow-lg py-1 text-gray-900 z-50">
                                 {hires.map(h => (
                                     <button 
                                         key={h.id} 
                                         onClick={() => handleSwitchEmployee(h.id)}
                                         className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                     >
                                         {h.employeeName}
                                     </button>
                                 ))}
                             </div>
                         )}
                     </div>
                     <button onClick={handleReset} className="hover:text-white flex items-center">
                         <RefreshCcw className="w-3 h-3 mr-1" /> Reset
                     </button>
                 </div>
             </div>

            <div className="w-full max-w-md bg-white min-h-screen sm:min-h-0 sm:h-full sm:shadow-sm sm:border-x sm:border-gray-100 flex-1 flex flex-col">
                {children}
            </div>
        </div>
    )
}