import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/layout/Sidebar';
import { TopNavigation } from './components/layout/TopNavigation';
import { Overview } from './pages/Overview';
import { MyWorkspace } from './pages/MyWorkspace';
import { Cases } from './pages/Cases';
import { CaseDetail } from './pages/CaseDetail';
import { Grievances } from './pages/Grievances';
import { Office365Test } from './pages/Office365Test';
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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <div className="flex h-screen bg-background">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden">
            <TopNavigation />
            <main className="flex-1 overflow-auto p-6">
              <Routes>
                <Route path="/" element={<MyWorkspace />} />
                <Route path="/workspace" element={<MyWorkspace />} />
                <Route path="/overview" element={<Overview />} />
                <Route path="/cases" element={<Cases />} />
                <Route path="/cases/:id" element={<CaseDetail />} />
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
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
