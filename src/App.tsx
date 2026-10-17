import React, { useState, useEffect } from 'react';
import { subscribeToStore, getCurrentUser } from './services/storage';
import { ToastProvider } from './components/common/Toast';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { GlobalSearchModal } from './components/search/GlobalSearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileModal } from './components/auth/ProfileModal';
import { GuidedTour } from './components/demo/GuidedTour';

// Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { EventsPage } from './pages/EventsPage';
import { MyRegistrationsPage } from './pages/MyRegistrationsPage';
import { CommunityPage } from './pages/CommunityPage';
import { HackathonPage } from './pages/HackathonPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { TasksPage } from './pages/TasksPage';
import { AdminModerationPage } from './pages/AdminModerationPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  const [currentPage, setCurrentPage] = useState<string>('dashboard');
  const [selectedEntityId, setSelectedEntityId] = useState<string | undefined>(undefined);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [, setTick] = useState(0);

  // Subscribe to reactive store changes
  useEffect(() => {
    const unsubscribe = subscribeToStore(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navigateTo = (page: string, entityId?: string) => {
    setCurrentPage(page);
    setSelectedEntityId(entityId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ToastProvider>
      {/* Public Landing Page View */}
      {currentPage === 'landing' ? (
        <LandingPage
          onNavigate={(page) => navigateTo(page)}
          onOpenAuth={() => setIsAuthOpen(true)}
        />
      ) : (
        /* Full Authenticated App Layout */
        <div className="app-container">
          <div className="main-content">
            {/* Top Navigation */}
            <Navbar
              onOpenSearch={() => setIsSearchOpen(true)}
              onOpenAuth={() => setIsAuthOpen(true)}
              onOpenProfile={() => setIsProfileOpen(true)}
              onNavigate={(page) => navigateTo(page)}
              currentPage={currentPage}
            />

            <div style={{ display: 'flex', flex: 1 }}>
              {/* Collapsible Left Sidebar */}
              <Sidebar
                currentPage={currentPage}
                onNavigate={(page) => navigateTo(page)}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              />

              {/* Main Module Content Area */}
              <main style={{ flex: 1, minWidth: 0 }}>
                {currentPage === 'dashboard' && (
                  <DashboardPage
                    onNavigate={(page, id) => navigateTo(page, id)}
                    onOpenCreateTask={() => navigateTo('tasks')}
                    onOpenCreateEvent={() => navigateTo('events')}
                    onOpenCreateListing={() => navigateTo('marketplace')}
                  />
                )}

                {currentPage === 'events' && (
                  <EventsPage
                    onNavigate={(page) => navigateTo(page)}
                    selectedEventId={selectedEntityId}
                  />
                )}

                {currentPage === 'registrations' && (
                  <MyRegistrationsPage
                    onNavigate={(page) => navigateTo(page)}
                  />
                )}

                {currentPage === 'community' && (
                  <CommunityPage
                    onNavigate={(page) => navigateTo(page)}
                    selectedPostId={selectedEntityId}
                  />
                )}

                {currentPage === 'hackathon' && (
                  <HackathonPage
                    onNavigate={(page) => navigateTo(page)}
                    selectedTeamId={selectedEntityId}
                  />
                )}

                {currentPage === 'marketplace' && (
                  <MarketplacePage
                    onNavigate={(page) => navigateTo(page)}
                    selectedItemId={selectedEntityId}
                  />
                )}

                {currentPage === 'tasks' && (
                  <TasksPage
                    onNavigate={(page, id) => navigateTo(page, id)}
                  />
                )}

                {currentPage === 'admin-moderation' && (
                  <AdminModerationPage
                    onNavigate={(page) => navigateTo(page)}
                  />
                )}

                {currentPage === 'settings' && (
                  <SettingsPage
                    onOpenProfile={() => setIsProfileOpen(true)}
                    onOpenAuth={() => setIsAuthOpen(true)}
                    onNavigate={(page) => navigateTo(page)}
                  />
                )}
              </main>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal (Cmd+K) */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigate={(page, id) => navigateTo(page, id)}
      />

      {/* Auth / Role Persona Picker Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => navigateTo('dashboard')}
      />

      {/* Profile Edit Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      {/* Interactive 90-Second Hackathon Demo Tour Assistant */}
      <GuidedTour
        currentPage={currentPage}
        onNavigate={(page) => navigateTo(page)}
      />
    </ToastProvider>
  );
}

export default App;
