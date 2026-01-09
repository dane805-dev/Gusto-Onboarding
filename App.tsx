import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { OnboardingProvider, useOnboarding } from './context';
import { GlobalLayout } from './components/UI';
import { OwnerDashboard, WizardStep1, WizardStep2, WizardStep3, HireDetail } from './pages/OwnerViews';
import { EmployeeWelcome, EmployeeStep1, EmployeeStep2, EmployeeStep3, EmployeeStep4, EmployeeStepI9, EmployeeDay1Checklist } from './pages/EmployeeViews';

const AppRoutes = () => {
  const { viewMode } = useOnboarding();

  // Basic route protection/redirect logic based on global toggle
  // In a real app, we'd use Guard components, but here simple conditional rendering in the layout or navigate logic works
  // We allow rendering the route, but the UI might look different or we redirect. 
  // For the prototype, we just map routes. The GlobalToggle handles switching context.

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/owner/onboarding" replace />} />
      
      {/* Owner Routes */}
      <Route path="/owner/onboarding" element={<OwnerDashboard />} />
      <Route path="/owner/onboarding/new/step-1" element={<WizardStep1 />} />
      <Route path="/owner/onboarding/new/step-2" element={<WizardStep2 />} />
      <Route path="/owner/onboarding/new/step-3" element={<WizardStep3 />} />
      <Route path="/owner/onboarding/:hireId" element={<HireDetail />} />

      {/* Employee Routes */}
      <Route path="/employee/:hireId/welcome" element={<EmployeeWelcome />} />
      <Route path="/employee/:hireId/preboarding/step-1" element={<EmployeeStep1 />} />
      <Route path="/employee/:hireId/preboarding/i9" element={<EmployeeStepI9 />} />
      <Route path="/employee/:hireId/preboarding/step-2" element={<EmployeeStep2 />} />
      <Route path="/employee/:hireId/preboarding/step-3" element={<EmployeeStep3 />} />
      <Route path="/employee/:hireId/preboarding/step-4" element={<EmployeeStep4 />} />
      <Route path="/employee/:hireId/day1-checklist" element={<EmployeeDay1Checklist />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <OnboardingProvider>
      <HashRouter>
        <GlobalLayout>
           <AppRoutes />
        </GlobalLayout>
      </HashRouter>
    </OnboardingProvider>
  );
};

export default App;