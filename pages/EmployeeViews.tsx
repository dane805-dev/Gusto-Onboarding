import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useOnboarding } from '../context';
import { EmployeeLayout, Button, ProgressBar } from '../components/UI';
import { CheckCircle, Circle, ArrowLeft, ArrowRight, MapPin, Calendar, Clock, User, ShieldCheck, DollarSign, FileText, CircleHelp, Sparkles } from 'lucide-react';
import { Task } from '../types';

// --- 1. Welcome ---

export const EmployeeWelcome: React.FC = () => {
    const { hireId } = useParams<{ hireId: string }>();
    const { getHire } = useOnboarding();
    const navigate = useNavigate();
    const hire = getHire(hireId || '');

    if (!hire) return <EmployeeLayout><div className="p-4">Hire not found</div></EmployeeLayout>;

    return (
        <EmployeeLayout>
            <div className="flex flex-col h-full p-6">
                <div className="flex-1 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
                        <User className="w-8 h-8 text-indigo-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to {hire.businessName}, {hire.employeeName.split(' ')[0]}!</h1>
                    <p className="text-gray-600 mb-8">We’ll collect a few details so we can pay you correctly and make your first day smooth.</p>
                    
                    <div className="w-full max-w-xs space-y-4 text-left">
                        {[
                            { step: 1, title: 'Personal details' },
                            { step: 2, title: 'I-9 Eligibility' },
                            { step: 3, title: 'Taxes' },
                            { step: 4, title: 'Pay details' },
                            { step: 5, title: 'Policies & Day 1 plan' },
                        ].map((item) => (
                            <div key={item.step} className="flex items-center">
                                <div className="flex-shrink-0 h-6 w-6 rounded-full border-2 border-indigo-200 flex items-center justify-center text-xs font-medium text-indigo-600">
                                    {item.step}
                                </div>
                                <span className="ml-3 text-sm text-gray-600">{item.title}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="mt-8 text-center">
                     <Button onClick={() => navigate(`/employee/${hireId}/preboarding/step-1`)} className="w-full py-3 text-lg">Get started</Button>
                     <p className="mt-4 text-xs text-gray-400">You can do this on your phone. It should take about 10–15 minutes.</p>
                </div>
            </div>
        </EmployeeLayout>
    );
};

// --- Wizard Wrapper for Steps ---

const WizardStepLayout: React.FC<{ 
    step: number; 
    title: React.ReactNode; 
    onNext: () => void; 
    onBack: () => void;
    nextLabel?: string;
    validationMessage?: string;
    children: React.ReactNode; 
}> = ({ step, title, onNext, onBack, nextLabel = "Next", validationMessage, children }) => {
    return (
        <EmployeeLayout>
             <div className="flex flex-col h-full">
                <div className="px-6 py-4 border-b border-gray-100">
                     <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide">Step {step} of 5</p>
                     <div className="flex items-center text-xl font-bold text-gray-900">
                        {title}
                     </div>
                     <div className="mt-2 h-1 w-full bg-gray-100 rounded-full">
                         <div className="h-1 bg-indigo-600 rounded-full transition-all" style={{ width: `${(step / 5) * 100}%` }}></div>
                     </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6">
                    {children}
                </div>
                <div className="p-6 border-t border-gray-100 bg-white flex justify-between items-center">
                     <Button variant="ghost" onClick={onBack}>Back</Button>
                     <div className="flex items-center gap-4">
                        {validationMessage && <span className="text-sm text-red-600 font-medium">{validationMessage}</span>}
                        <Button onClick={onNext}>{nextLabel}</Button>
                     </div>
                </div>
             </div>
        </EmployeeLayout>
    );
}

// --- 2. Personal Details ---

export const EmployeeStep1: React.FC = () => {
    const { hireId } = useParams<{ hireId: string }>();
    const { updateTaskStatus, getHire } = useOnboarding();
    const navigate = useNavigate();
    const hire = getHire(hireId || '');

    // Local state for inputs just to simulate validation
    const [address, setAddress] = useState('');
    const [phone, setPhone] = useState('');
    const [emergencyName, setEmergencyName] = useState('');
    const [emergencyPhone, setEmergencyPhone] = useState('');

    const handleNext = () => {
        if (!address || !phone || !emergencyName || !emergencyPhone) return;
        // Mark tasks as done
        const task1 = hire?.tasks.find(t => t.title.includes('Provide personal details'));
        if (task1) updateTaskStatus(hireId!, task1.id, 'Completed');
        
        navigate(`/employee/${hireId}/preboarding/i9`);
    };

    return (
        <WizardStepLayout 
            step={1} 
            title="Personal details" 
            onNext={handleNext} 
            onBack={() => navigate(`/employee/${hireId}/welcome`)}
        >
            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Home Address</label>
                    <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Street, City, Zip" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                    <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500" placeholder="(555) 555-5555" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Name</label>
                    <input type="text" value={emergencyName} onChange={e => setEmergencyName(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Full Name" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Emergency Contact Phone</label>
                    <input type="tel" value={emergencyPhone} onChange={e => setEmergencyPhone(e.target.value)} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500" placeholder="(555) 555-5555" />
                </div>
            </div>
        </WizardStepLayout>
    );
};

// --- NEW Step: I-9 Section 1 ---

export const EmployeeStepI9: React.FC = () => {
    const { hireId } = useParams<{ hireId: string }>();
    const { updateTaskStatus, getHire, openAssistant } = useOnboarding();
    const navigate = useNavigate();
    const hire = getHire(hireId || '');
    
    const [citizenship, setCitizenship] = useState('');
    const [ssn, setSsn] = useState('');
    const [signed, setSigned] = useState(false);
    const [showValidation, setShowValidation] = useState(false);

    const handleNext = () => {
        if (!citizenship || !ssn || !signed) {
            setShowValidation(true);
            return;
        }
        
        const task = hire?.tasks.find(t => t.title === 'Complete I-9 (section 1)');
        if (task) updateTaskStatus(hireId!, task.id, 'Completed');
        
        navigate(`/employee/${hireId}/preboarding/step-2`);
    };

    const titleNode = (
        <div className="flex flex-col sm:flex-row sm:items-center">
            <span>Employment Eligibility (I-9)</span>
            <div className="flex items-center mt-1 sm:mt-0">
                <div className="group relative ml-2">
                    <CircleHelp className="w-5 h-5 text-gray-400 hover:text-indigo-600 cursor-pointer" />
                    {/* Tooltip positioned underneath */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center font-normal">
                        <div className="mb-2">
                             Form I-9 verifies the identity and employment authorization of individuals hired for employment in the United States.
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-indigo-300 border-t border-gray-700 pt-1">
                            <Sparkles className="w-3 h-3" /> AI Generated Summary
                        </div>
                        {/* Arrow pointing up */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full border-4 border-transparent border-b-gray-900"></div>
                    </div>
                </div>
                <button 
                    onClick={() => openAssistant('I-9')}
                    className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors"
                >
                    Questions?
                </button>
            </div>
        </div>
    );

    return (
        <WizardStepLayout 
            step={2} 
            title={titleNode}
            onNext={handleNext} 
            onBack={() => navigate(`/employee/${hireId}/preboarding/step-1`)}
            validationMessage={showValidation ? "Must complete all fields to proceed" : undefined}
        >
            <div className="space-y-6">
                <div className="bg-yellow-50 p-4 rounded-lg flex gap-3">
                    <FileText className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <p className="text-sm text-yellow-800">You must attest to your employment authorization. This is a prototype of Form I-9 Section 1.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Social Security Number</label>
                    <input 
                        type="text" 
                        value={ssn}
                        onChange={e => {
                            setSsn(e.target.value);
                            setShowValidation(false);
                        }}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500" 
                        placeholder="000-00-0000" 
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Citizenship Status</label>
                    <div className="space-y-3">
                        {['A citizen of the United States', 'A noncitizen national of the United States', 'A lawful permanent resident', 'An alien authorized to work'].map((opt) => (
                            <div key={opt} className="flex items-start">
                                <input 
                                    id={opt} 
                                    name="citizenship" 
                                    type="radio" 
                                    className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 mt-1"
                                    checked={citizenship === opt}
                                    onChange={() => {
                                        setCitizenship(opt);
                                        setShowValidation(false);
                                    }}
                                />
                                <label htmlFor={opt} className="ml-3 block text-sm text-gray-700">{opt}</label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input 
                                id="sign" 
                                name="sign" 
                                type="checkbox" 
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                checked={signed}
                                onChange={e => {
                                    setSigned(e.target.checked);
                                    setShowValidation(false);
                                }}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="sign" className="font-medium text-gray-700">Signature</label>
                            <p className="text-gray-500">I attest, under penalty of perjury, that I am the person listed above and the information is true.</p>
                        </div>
                    </div>
                </div>
            </div>
        </WizardStepLayout>
    );
};

// --- 3. Taxes ---

export const EmployeeStep2: React.FC = () => {
    const { hireId } = useParams<{ hireId: string }>();
    const { updateTaskStatus, getHire, openAssistant } = useOnboarding();
    const navigate = useNavigate();
    const hire = getHire(hireId || '');

    const handleNext = () => {
        const task = hire?.tasks.find(t => t.title.includes('Complete W-4'));
        if (task) updateTaskStatus(hireId!, task.id, 'Completed');
        navigate(`/employee/${hireId}/preboarding/step-3`);
    };

    const titleNode = (
        <div className="flex flex-col sm:flex-row sm:items-center">
            <span>Taxes (W-4)</span>
            <div className="flex items-center mt-1 sm:mt-0">
                <div className="group relative ml-2">
                    <CircleHelp className="w-5 h-5 text-gray-400 hover:text-indigo-600 cursor-pointer" />
                    {/* Tooltip positioned underneath */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center font-normal">
                        <div className="mb-2">
                             Form W-4 tells your employer how much federal income tax to withhold from your pay.
                        </div>
                        <div className="flex items-center justify-center gap-1 text-[10px] text-indigo-300 border-t border-gray-700 pt-1">
                            <Sparkles className="w-3 h-3" /> AI Generated Summary
                        </div>
                        {/* Arrow pointing up */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full border-4 border-transparent border-b-gray-900"></div>
                    </div>
                </div>
                <button 
                    onClick={() => openAssistant('W-4')}
                    className="ml-3 text-sm font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-0.5 rounded hover:bg-indigo-100 transition-colors"
                >
                    Questions?
                </button>
            </div>
        </div>
    );

    return (
         <WizardStepLayout 
            step={3} 
            title={titleNode}
            onNext={handleNext} 
            onBack={() => navigate(`/employee/${hireId}/preboarding/i9`)}
        >
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg flex gap-3">
                    <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <p className="text-sm text-blue-800">This is a simplified W-4 form for the prototype.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Filing Status</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500">
                        <option>Single or Married filing separately</option>
                        <option>Married filing jointly</option>
                        <option>Head of household</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Number of Dependents</label>
                    <input type="number" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500" defaultValue={0} />
                    <p className="mt-1 text-xs text-gray-500">Children or others you support financially.</p>
                </div>
            </div>
        </WizardStepLayout>
    );
};

// --- 4. Pay Details ---

export const EmployeeStep3: React.FC = () => {
    const { hireId } = useParams<{ hireId: string }>();
    const { updateTaskStatus, getHire } = useOnboarding();
    const navigate = useNavigate();
    const hire = getHire(hireId || '');

    const handleNext = () => {
        const task = hire?.tasks.find(t => t.title.includes('direct deposit'));
        if (task) updateTaskStatus(hireId!, task.id, 'Completed');
        navigate(`/employee/${hireId}/preboarding/step-4`);
    };

    return (
         <WizardStepLayout 
            step={4} 
            title="Pay details" 
            onNext={handleNext} 
            onBack={() => navigate(`/employee/${hireId}/preboarding/step-2`)}
        >
            <div className="space-y-6">
                 <div className="bg-green-50 p-4 rounded-lg flex gap-3">
                    <DollarSign className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800">Set up direct deposit to get paid faster.</p>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Routing Number</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500" placeholder="9 digits" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input type="text" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-3 px-4 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Account number" />
                </div>
            </div>
        </WizardStepLayout>
    );
};

// --- 5. Policies & Finish ---

export const EmployeeStep4: React.FC = () => {
    const { hireId } = useParams<{ hireId: string }>();
    const { updateTaskStatus, getHire } = useOnboarding();
    const navigate = useNavigate();
    const hire = getHire(hireId || '');

    const [checked, setChecked] = useState({ handbook: false, breaks: false, dress: false });

    const handleNext = () => {
        // Mark policies done
        const policyTask = hire?.tasks.find(t => t.title.includes('Review and acknowledge state-specific notice'));
        
        if (policyTask) updateTaskStatus(hireId!, policyTask.id, 'Completed');
        // Usually house rules is Day 1 but prototype flow implies finishing pre-boarding here so let's mark it if it exists in pre-boarding, 
        // OR the user explicitly completes "Policies & Day 1 Plan" step which triggers multiple.
        // For simplicity, we just mark the 'Review and acknowledge' task.
        
        navigate(`/employee/${hireId}/day1-checklist`);
    };
    
    const allChecked = checked.handbook && checked.breaks && checked.dress;

    return (
         <WizardStepLayout 
            step={5} 
            title="Policies & Day 1 Plan" 
            onNext={handleNext} 
            onBack={() => navigate(`/employee/${hireId}/preboarding/step-3`)}
            nextLabel={allChecked ? "Finish and confirm" : "Finish"}
        >
             <div className="space-y-8">
                 <div className="space-y-4">
                     <h3 className="font-semibold text-gray-900">Acknowledgements</h3>
                     <label className="flex items-start">
                         <input type="checkbox" checked={checked.handbook} onChange={e => setChecked({...checked, handbook: e.target.checked})} className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300" />
                         <span className="ml-3 text-sm text-gray-700">I’ve read and agree to the employee handbook.</span>
                     </label>
                      <label className="flex items-start">
                         <input type="checkbox" checked={checked.breaks} onChange={e => setChecked({...checked, breaks: e.target.checked})} className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300" />
                         <span className="ml-3 text-sm text-gray-700">I understand the break and overtime policy.</span>
                     </label>
                      <label className="flex items-start">
                         <input type="checkbox" checked={checked.dress} onChange={e => setChecked({...checked, dress: e.target.checked})} className="mt-1 h-4 w-4 text-indigo-600 rounded border-gray-300" />
                         <span className="ml-3 text-sm text-gray-700">I understand the dress code guidelines.</span>
                     </label>
                 </div>

                 <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                     <div className="bg-indigo-50 px-4 py-3 border-b border-indigo-100">
                         <h3 className="font-semibold text-indigo-900">Your first day</h3>
                     </div>
                     <div className="p-4 space-y-4">
                         <div className="flex items-center text-sm">
                             <Clock className="w-4 h-4 text-gray-400 mr-3" />
                             <span className="text-gray-900 font-medium">{hire?.managerMeetingTime || '9:00 AM'}</span>
                         </div>
                         <div className="flex items-center text-sm">
                             <MapPin className="w-4 h-4 text-gray-400 mr-3" />
                             <div>
                                 <p className="text-gray-900">{hire?.addressLine}</p>
                                 <a href="#" className="text-indigo-600 text-xs">Open in Maps</a>
                             </div>
                         </div>
                         <div className="bg-gray-50 p-3 rounded text-sm text-gray-700">
                             When you arrive, ask for <strong>{hire?.managerName}</strong>. We’ll show you around and introduce you to the team.
                         </div>
                     </div>
                 </div>
                 
                 {!allChecked && <p className="text-center text-xs text-red-500">Please acknowledge all policies to finish.</p>}
             </div>
        </WizardStepLayout>
    );
};

// --- 6. Day 1 Checklist ---

export const EmployeeDay1Checklist: React.FC = () => {
    const { hireId } = useParams<{ hireId: string }>();
    const { getHire, updateTaskStatus } = useOnboarding();
    const hire = getHire(hireId || '');

    if (!hire) return <EmployeeLayout><div>Loading...</div></EmployeeLayout>;

    const day1Tasks = hire.tasks.filter(t => t.phase === 'Day 1');
    const completedCount = day1Tasks.filter(t => t.status === 'Completed').length;
    const isAllDone = day1Tasks.length > 0 && completedCount === day1Tasks.length;

    const handleToggle = (taskId: string, currentStatus: string) => {
        updateTaskStatus(hireId!, taskId, currentStatus === 'Completed' ? 'Not started' : 'Completed');
    };

    return (
        <EmployeeLayout>
             <div className="flex flex-col h-full bg-indigo-600 sm:bg-white">
                 {/* Header */}
                 <div className="bg-indigo-600 px-6 py-8 text-white sm:rounded-b-3xl">
                     <h1 className="text-2xl font-bold">Your Day 1 Checklist</h1>
                     <p className="mt-2 text-indigo-100 text-sm">You’re all set for Day 1 at {hire.businessName}. As you go through your first day, check off these items.</p>
                     
                     <div className="mt-6 bg-indigo-700 rounded-lg p-4 flex items-center justify-between">
                         <div className="flex flex-col">
                             <span className="text-xs font-medium text-indigo-300 uppercase">Progress</span>
                             <span className="text-xl font-bold">{completedCount} / {day1Tasks.length}</span>
                         </div>
                         <div className="w-24">
                             {/* Simple circular progress or just bar */}
                             <div className="h-2 bg-indigo-900 rounded-full w-full">
                                 <div className="h-2 bg-white rounded-full transition-all" style={{ width: `${(completedCount / day1Tasks.length) * 100}%` }}></div>
                             </div>
                         </div>
                     </div>
                 </div>

                 {/* Content */}
                 <div className="flex-1 bg-gray-50 rounded-t-3xl -mt-4 p-6 sm:mt-0 sm:bg-white sm:rounded-none overflow-y-auto">
                     {isAllDone && (
                         <div className="mb-6 bg-green-100 text-green-800 p-4 rounded-lg flex items-center">
                             <CheckCircle className="w-5 h-5 mr-3" />
                             <span className="font-medium">You’ve completed your Day 1 checklist. Nice work!</span>
                         </div>
                     )}
                     
                     <div className="space-y-3">
                         {day1Tasks.map(task => (
                             <label key={task.id} className="flex items-start p-4 bg-white shadow-sm border border-gray-100 rounded-xl cursor-pointer hover:border-indigo-200 transition-colors">
                                 <div className="relative flex items-start">
                                     <input 
                                        type="checkbox" 
                                        className="sr-only" 
                                        checked={task.status === 'Completed'}
                                        onChange={() => handleToggle(task.id, task.status)}
                                     />
                                     <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.status === 'Completed' ? 'bg-indigo-600 border-indigo-600' : 'border-gray-300 bg-white'}`}>
                                         {task.status === 'Completed' && <CheckCircle className="w-4 h-4 text-white" />}
                                     </div>
                                 </div>
                                 <div className="ml-4">
                                     <span className={`block font-medium ${task.status === 'Completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{task.title}</span>
                                     {task.description && <span className="block text-xs text-gray-500 mt-1">{task.description}</span>}
                                 </div>
                             </label>
                         ))}
                     </div>
                     
                     <div className="mt-8">
                         <h3 className="text-sm font-semibold text-gray-900 mb-3">Key Info</h3>
                         <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3 text-sm">
                            <div className="flex items-center text-gray-600"><Clock className="w-4 h-4 mr-3"/> {hire.managerMeetingTime}</div>
                            <div className="flex items-center text-gray-600"><MapPin className="w-4 h-4 mr-3"/> {hire.addressLine}</div>
                            <div className="flex items-center text-gray-600"><User className="w-4 h-4 mr-3"/> Ask for: {hire.managerName}</div>
                         </div>
                     </div>
                 </div>
             </div>
        </EmployeeLayout>
    );
};