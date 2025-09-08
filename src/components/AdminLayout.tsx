'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  HomeIcon,
  UserGroupIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { wsService } from '@/services/ws';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface AuditLogEntry {
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  timestamp: string;
  details?: any;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [showAuditLog, setShowAuditLog] = useState(false);


  useEffect(() => {
    // Connect to single WebSocket instance
    wsService.connect();
    
    // Listen for admin updates
    wsService.onAdminUpdate((update) => {
      console.log('Admin action received:', update);
      
      // Add to audit log
      setAuditLog(prev => [
        {
          ...update,
          timestamp: update.timestamp || new Date().toISOString()
        },
        ...prev.slice(0, 9) 
      ]);
    });

  
  }, []);




  const handleLogout = () => {
    dispatch(logout());
    router.push('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Employees', href: '/admin/employees', icon: UserGroupIcon },
    { name: 'Parking State', href: '/admin/parking-state', icon: ChartBarIcon },
    { name: 'Control Panel', href: '/admin/control-panel', icon: Cog6ToothIcon },
  ];

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'zone-opened': return 'bg-green-100 text-green-800';
      case 'zone-closed': return 'bg-red-100 text-red-800';
      case 'category-rates-changed': return 'bg-blue-100 text-blue-800';
      case 'vacation-added': return 'bg-purple-100 text-purple-800';
      case 'rush-updated': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  const formatActionDescription = (entry: AuditLogEntry) => {
  switch (entry.action) {
    case 'zone-opened':
      return `opened zone ${entry.targetId}`;
    case 'zone-closed':
      return `closed zone ${entry.targetId}`;
    case 'category-rates-changed':
      return `updated rates for ${entry.targetId}`;
    case 'vacation-added':
      return `added vacation period`;
    case 'rush-updated':
      return `updated rush hours`;
    default:
      return `performed ${entry.action} on ${entry.targetId}`;
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              onClick={() => setSidebarOpen(false)}
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 flex-shrink-0 h-6 w-6" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Static sidebar for desktop */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 bg-white border-r border-gray-200">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-lg font-semibold text-gray-900">Admin Dashboard</h2>
            </div>
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                    pathname === item.href
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <item.icon className="mr-3 flex-shrink-0 h-5 w-5" />
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div>
                <p className="text-sm font-medium text-gray-700">{user?.username || 'Admin'}</p>
                <p className="text-xs text-gray-500">{user?.role || 'Administrator'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto p-2 text-gray-400 hover:text-gray-500"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col flex-1">
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-50">
          <button
            onClick={() => setSidebarOpen(true)}
            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>
        
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Audit Log Floating Panel */}
      <div className="fixed bottom-4 right-4 z-30">
        <button
          onClick={() => setShowAuditLog(!showAuditLog)}
          className="relative p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 transition-colors"
        >
          <BellIcon className="h-6 w-6" />
          {auditLog.length > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {auditLog.length}
            </span>
          )}
          
        </button>
      </div>

      {/* Audit Log Panel */}
      {showAuditLog && (
        <div className="fixed bottom-20 right-4 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-30">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Live Admin Actions</h3>
          </div>
          <div className="overflow-y-auto max-h-80 p-4 space-y-3">
            {auditLog.length === 0 ? (
              <p className="text-sm text-gray-500">No recent admin actions</p>
            ) : (
            auditLog.map((entry, index) => (
  <div key={index} className="bg-gray-50 rounded-lg p-3 text-sm">
    <div className="flex items-center justify-between mb-1">
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionBadgeColor(entry.action)}`}>
        {entry.action.replace(/-/g, ' ')}
      </span>
      <span className="text-xs text-gray-500">
        {new Date(entry.timestamp).toLocaleTimeString()}
      </span>
    </div>
    <p className="text-gray-700">
      <span className="font-medium">{entry.adminId}</span> {formatActionDescription(entry)}
    </p>
    {entry.details && (
      <div className="mt-1 text-xs text-gray-500 bg-white p-2 rounded">
        <pre>{JSON.stringify(entry.details, null, 2)}</pre>
      </div>
    )}
  </div>
))
            )}
          </div>
        </div>
      )}
    </div>
  );
}