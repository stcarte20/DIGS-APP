import { BrowserRouter as Router, Routes, Route, HashRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavigation } from './components/layout/TopNavigation';
import { Overview } from './pages/Overview';
import { MyWorkspace } from './pages/MyWorkspace';
import { Cases } from './pages/Cases';
import { CaseDetail } from './pages/CaseDetail';
import { EditCase } from './pages/EditCase';
import { Grievances } from './pages/Grievances';
import { Office365Test } from './pages/Office365Test';
import { PowerAppsDiagnostic } from './pages/PowerAppsDiagnostic';
import { 
  GrievanceDetail, 
  Arbitration,
  PRM,
  Intake, 
  Calendar, 
  Search, 
  Reports, 
  Settings, 
  Profile, 
  Notifications, 
  Help
} from './pages/index';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Use HashRouter in PowerApps environment for better compatibility
const isPowerAppsEnv = window.location.hostname.includes('apps.powerapps.com') || 
                       window.location.hostname.includes('make.powerapps.com');

const RouterComponent = isPowerAppsEnv ? HashRouter : Router;

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterComponent>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <TopNavigation />
            <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
              <div className="max-w-[1920px] mx-auto">
                <Routes>
                <Route path="/" element={<MyWorkspace />} />
                <Route path="/workspace" element={<MyWorkspace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
                <Route path="/cases/:id/edit" element={<EditCase />} />
                <Route path="/grievances" element={<Grievances />} />
                <Route path="/grievances/:id" element={<GrievanceDetail />} />
                <Route path="/arbitration" element={<Arbitration />} />
                <Route path="/prm" element={<PRM />} />
                <Route path="/intake" element={<Intake />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/search" element={<Search />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/help" element={<Help />} />
                <Route path="/office365test" element={<Office365Test />} />
                <Route path="/powerapps-diagnostic" element={<PowerAppsDiagnostic />} />
              </Routes>
              </div>
            </main>
          </div>
        </div>
      </RouterComponent>
    </QueryClientProvider>
  );
}

export default App;
