import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PenTool, LayoutDashboard, LogOut, User, Menu, X, Moon, Sun, Lock, Home } from 'lucide-react';
import { storageService } from '../services/storageService';
import { useTheme } from '../context/ThemeContext';
import Button from './Button';
import Logo from './Logo';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [user, setUser] = React.useState(storageService.getUser());
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    storageService.logout();
    setUser(null);
    navigate('/');
  };

  const handleLogin = () => {
    storageService.login();
    setUser(storageService.getUser());
    navigate('/setup-profile');
  };

  const isActive = (path: string) => location.pathname === path;

  // If on landing page and not logged in, show simpler header or nothing
  if (location.pathname === '/') {
    return <>{children}</>;
  }

  if (!user) {
    return (
        <div className="min-h-screen flex items-center justify-center flex-col gap-6 bg-[var(--bg-page)] text-[var(--text-primary)] p-4 animate-in fade-in duration-500">
             <div className="w-16 h-16 bg-[var(--bg-muted)] rounded-full flex items-center justify-center mb-2">
                <Lock size={32} className="text-[var(--text-secondary)]" />
             </div>
             <div className="text-center space-y-2">
                <h1 className="text-2xl font-bold">Access Restricted</h1>
                <p className="text-[var(--text-secondary)] max-w-sm">
                    You need to be logged in to view this page. Please sign in to continue your writing journey.
                </p>
             </div>
             <div className="flex gap-4">
                 <Link to="/">
                    <Button variant="outline">Go Home</Button>
                 </Link>
                 <Button onClick={handleLogin}>Log In / Sign Up</Button>
             </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg-page)] flex flex-col md:flex-row text-[var(--text-primary)] transition-colors duration-300">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--bg-sidebar)] border-r border-[var(--border-light)] h-screen sticky top-0 transition-colors duration-300 z-10">
        <div className="p-6 border-b border-[var(--border-light)] flex items-center gap-2">
            <Link to="/">
                <Logo />
            </Link>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <Link to="/">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/') ? 'bg-[var(--icon-bg)] text-[var(--icon-color)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'}`}>
              <Home size={20} />
              <span>Home</span>
            </div>
          </Link>
          <Link to="/dashboard">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${isActive('/dashboard') ? 'bg-[var(--icon-bg)] text-[var(--icon-color)] font-semibold' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]'}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </div>
          </Link>
          <div className="pt-6 pb-2 px-3 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Content
          </div>
          <button onClick={() => {
              const newPost = storageService.createEmptyPost();
              storageService.savePost(newPost);
              navigate(`/editor/${newPost.id}`);
          }} className="w-full text-left">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)]`}>
                <PenTool size={20} />
                <span className="font-medium">New Post</span>
            </div>
          </button>
        </nav>

        <div className="p-4 border-t border-[var(--border-light)]">
            <div className="flex items-center justify-between mb-4 px-2">
                 <button 
                    onClick={toggleTheme} 
                    className="p-2 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-page)] hover:text-[var(--text-primary)] transition-colors"
                    aria-label="Toggle theme"
                 >
                    {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                 </button>
            </div>
            <div className="flex items-center gap-3 mb-4 px-2">
                <img src={user?.avatar} alt={user?.name} className="w-9 h-9 rounded-full bg-slate-200 object-cover border border-[var(--border-light)]" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{user?.name}</p>
                    <p className="text-xs text-[var(--text-secondary)] truncate">{user?.email}</p>
                </div>
            </div>
            <Button variant="outline" size="sm" className="w-full justify-start text-[var(--text-secondary)] hover:text-red-600 hover:border-red-200" icon={<LogOut size={16} />} onClick={handleLogout}>
                Sign Out
            </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden bg-[var(--bg-header)] border-b border-[var(--border-light)] p-4 flex items-center justify-between sticky top-0 z-20">
         <Link to="/">
             <Logo size="sm" />
         </Link>
         <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-[var(--text-secondary)]">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-[var(--text-primary)]">
                {mobileMenuOpen ? <X /> : <Menu />}
            </button>
         </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-10 bg-black/50" onClick={() => setMobileMenuOpen(false)}>
              <div className="absolute top-16 left-0 right-0 bg-[var(--bg-card)] border-b border-[var(--border-light)] p-4 shadow-xl" onClick={e => e.stopPropagation()}>
                  <nav className="space-y-2">
                    <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg hover:bg-[var(--bg-page)] text-[var(--text-primary)] font-medium">Home</Link>
                    <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block p-3 rounded-lg hover:bg-[var(--bg-page)] text-[var(--text-primary)] font-medium">Dashboard</Link>
                    <button onClick={() => {
                         const newPost = storageService.createEmptyPost();
                         storageService.savePost(newPost);
                         navigate(`/editor/${newPost.id}`);
                         setMobileMenuOpen(false);
                    }} className="block w-full text-left p-3 rounded-lg hover:bg-[var(--bg-page)] text-[var(--text-primary)] font-medium">New Post</button>
                    <div className="border-t border-[var(--border-light)] my-2 pt-2">
                        <button onClick={handleLogout} className="block w-full text-left p-3 text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 font-medium">Sign Out</button>
                    </div>
                  </nav>
              </div>
          </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-auto h-[calc(100vh-64px)] md:h-screen bg-[var(--bg-page)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;