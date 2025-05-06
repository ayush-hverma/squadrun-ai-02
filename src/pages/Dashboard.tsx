import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Settings, Shield } from 'lucide-react';
import UnifiedAgent from '@/components/agents/UnifiedAgent';
import ApiCreator from '@/components/agents/ApiCreator';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, logout, hasRole } = useAuth();
  const [activeTab, setActiveTab] = useState('inspector');
  const navigate = useNavigate();

  return (
    <div className="flex h-screen bg-squadrun-darker">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-squadrun-primary/20 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-white">
              {activeTab === 'inspector' ? 'Code Inspector' : 'API Creator'}
            </h1>
            {hasRole('admin') && (
              <span className="px-2 py-1 text-xs rounded bg-purple-500/20 text-purple-300">
                Admin
              </span>
            )}
            {hasRole('superadmin') && (
              <span className="px-2 py-1 text-xs rounded bg-red-500/20 text-red-300">
                Superadmin
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            {(hasRole('admin') || hasRole('superadmin')) && (
              <Button
                variant="ghost"
                onClick={() => navigate('/admin')}
                className="text-sm text-squadrun-gray hover:text-white"
              >
                <Settings className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            )}
            <div className="flex items-center gap-2">
              <img
                src={user?.picture}
                alt={user?.name}
                className="w-8 h-8 rounded-full"
              />
              <span className="text-sm text-white">{user?.name}</span>
            </div>
            <Button
              variant="ghost"
              onClick={logout}
              className="text-sm text-squadrun-gray hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-auto">
          {activeTab === 'inspector' ? (
            <UnifiedAgent />
          ) : (
            <ApiCreator />
          )}
        </main>
      </div>
    </div>
  );
} 