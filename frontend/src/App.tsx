import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './hooks/useTheme';
import { Layout } from './components/Layout';
import { Login } from './screens/Login';
import { Signup } from './screens/Signup';
import { Dashboard } from './screens/Dashboard';

// Lazy load all screens
const CycleTracker = lazy(() => import('./screens/CycleTracker').then(m => ({ default: m.CycleTracker })));
const SymptomLogger = lazy(() => import('./screens/SymptomLogger').then(m => ({ default: m.SymptomLogger })));
const MoodTracker = lazy(() => import('./screens/MoodTracker').then(m => ({ default: m.MoodTracker })));
const Reminders = lazy(() => import('./screens/Reminders').then(m => ({ default: m.Reminders })));
const AIChat = lazy(() => import('./screens/AIChat').then(m => ({ default: m.AIChat })));

// Domain 1: Safety
const SOSButton = lazy(() => import('./screens/SOSButton').then(m => ({ default: m.SOSButton })));
const SafeWalk = lazy(() => import('./screens/SafeWalk').then(m => ({ default: m.SafeWalk })));
const IncidentReporter = lazy(() => import('./screens/IncidentReporter').then(m => ({ default: m.IncidentReporter })));
const EscapePlanner = lazy(() => import('./screens/EscapePlanner').then(m => ({ default: m.EscapePlanner })));

// Domain 2: Health Lifecycle
const FertilityTracker = lazy(() => import('./screens/FertilityTracker').then(m => ({ default: m.FertilityTracker })));
const PregnancyCompanion = lazy(() => import('./screens/PregnancyCompanion').then(m => ({ default: m.PregnancyCompanion })));
const PostpartumHub = lazy(() => import('./screens/PostpartumHub').then(m => ({ default: m.PostpartumHub })));
const MenopauseCenter = lazy(() => import('./screens/MenopauseCenter').then(m => ({ default: m.default || m.MenopauseCenter })));
const GriefCompanion = lazy(() => import('./screens/GriefCompanion').then(m => ({ default: m.default || m.GriefCompanion })));

// Domain 3: Mental Health
const CrisisSupport = lazy(() => import('./screens/CrisisSupport').then(m => ({ default: m.default || m.CrisisSupport })));

// Domain 4: Legal & Financial
const LegalRights = lazy(() => import('./screens/LegalRights').then(m => ({ default: m.LegalRights })));
const FinancialTracker = lazy(() => import('./screens/FinancialTracker').then(m => ({ default: m.FinancialTracker })));

// Domain 5: Career
const CareerCoach = lazy(() => import('./screens/CareerCoach').then(m => ({ default: m.CareerCoach })));

// Domain 6: Community
const MentorHub = lazy(() => import('./screens/MentorHub').then(m => ({ default: m.MentorHub })));
const QAForum = lazy(() => import('./screens/QAForum').then(m => ({ default: m.QAForum })));
const ResourceMap = lazy(() => import('./screens/ResourceMap').then(m => ({ default: m.ResourceMap })));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function LoadingFallback() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[hsl(var(--primary))] border-t-transparent" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (!user) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingFallback />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function LP({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute><Suspense fallback={<LoadingFallback />}>{children}</Suspense></ProtectedRoute>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />

      {/* Original features */}
      <Route path="/cycles" element={<LP><CycleTracker /></LP>} />
      <Route path="/symptoms" element={<LP><SymptomLogger /></LP>} />
      <Route path="/moods" element={<LP><MoodTracker /></LP>} />
      <Route path="/reminders" element={<LP><Reminders /></LP>} />
      <Route path="/chat" element={<LP><AIChat /></LP>} />

      {/* Domain 1: Safety */}
      <Route path="/sos" element={<LP><SOSButton /></LP>} />
      <Route path="/safe-walk" element={<LP><SafeWalk /></LP>} />
      <Route path="/incidents" element={<LP><IncidentReporter /></LP>} />
      <Route path="/escape-plan" element={<LP><EscapePlanner /></LP>} />

      {/* Domain 2: Health Lifecycle */}
      <Route path="/fertility" element={<LP><FertilityTracker /></LP>} />
      <Route path="/pregnancy" element={<LP><PregnancyCompanion /></LP>} />
      <Route path="/postpartum" element={<LP><PostpartumHub /></LP>} />
      <Route path="/menopause" element={<LP><MenopauseCenter /></LP>} />
      <Route path="/grief" element={<LP><GriefCompanion /></LP>} />

      {/* Domain 3: Mental Health */}
      <Route path="/crisis-support" element={<LP><CrisisSupport /></LP>} />

      {/* Domain 4: Legal & Financial */}
      <Route path="/legal" element={<LP><LegalRights /></LP>} />
      <Route path="/financial" element={<LP><FinancialTracker /></LP>} />

      {/* Domain 5: Career */}
      <Route path="/career" element={<LP><CareerCoach /></LP>} />

      {/* Domain 6: Community */}
      <Route path="/mentors" element={<LP><MentorHub /></LP>} />
      <Route path="/qa" element={<LP><QAForum /></LP>} />
      <Route path="/resources" element={<LP><ResourceMap /></LP>} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
