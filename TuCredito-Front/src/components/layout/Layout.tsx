import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background text-main overflow-hidden relative transition-colors duration-300">
       {/* Dark mode specific background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-900/50 via-background to-background pointer-events-none dark:block hidden"></div>
      
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex flex-1 flex-col overflow-hidden relative w-full">
        {/* Background Gradients/Effects - Visible in both but subtle */}
        <div className="absolute top-0 left-0 w-full h-96 bg-primary-500/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent-purple/5 rounded-full blur-3xl pointer-events-none translate-y-1/3 translate-x-1/3"></div>

        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-10 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
