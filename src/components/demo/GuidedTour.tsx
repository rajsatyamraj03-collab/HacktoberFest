import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle2, 
  ChevronRight, 
  RotateCcw, 
  Sparkles, 
  X, 
  ChevronDown, 
  ChevronUp,
  LayoutDashboard,
  Calendar,
  MessageSquare,
  Users,
  ShoppingBag,
  CheckSquare
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { initializeStore } from '../../services/storage';
import { useToast } from '../common/Toast';

export interface TourStep {
  id: number;
  title: string;
  desc: string;
  page: string;
  icon: any;
}

export const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    title: 'Unified Dashboard',
    desc: 'View connected widgets across events, hackathon teams, tasks, and marketplace.',
    page: 'dashboard',
    icon: LayoutDashboard,
  },
  {
    id: 2,
    title: 'Event Registration',
    desc: 'Browse events, view HackVerse details, register with student ID and get instant ticket code.',
    page: 'events',
    icon: Calendar,
  },
  {
    id: 3,
    title: 'Community Feed',
    desc: 'Upvote posts, join student clubs, and leave comments on peer showcases.',
    page: 'community',
    icon: MessageSquare,
  },
  {
    id: 4,
    title: 'Hackathon Teammates',
    desc: 'Review smart match percentages, check open roles, and submit a join request.',
    page: 'hackathon',
    icon: Users,
  },
  {
    id: 5,
    title: 'Campus Marketplace',
    desc: 'Explore student essentials, filter by condition, and send safe buyer inquiries.',
    page: 'marketplace',
    icon: ShoppingBag,
  },
  {
    id: 6,
    title: 'Task Management',
    desc: 'Create, prioritize, and complete your academic and hackathon tasks in Kanban or List view.',
    page: 'tasks',
    icon: CheckSquare,
  },
];

interface GuidedTourProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export const GuidedTour: React.FC<GuidedTourProps> = ({ onNavigate }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([1]);
  const [isDismissed, setIsDismissed] = useState(false);
  const { showToast } = useToast();

  if (isDismissed) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];
  const progressPercent = Math.round(((completedSteps.length) / TOUR_STEPS.length) * 100);

  const handleNextStep = () => {
    if (!completedSteps.includes(currentStep.id)) {
      setCompletedSteps((prev) => [...prev, currentStep.id]);
    }

    if (currentStepIndex < TOUR_STEPS.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      onNavigate(TOUR_STEPS[nextIndex].page);
    } else {
      // Completed all
      if (!completedSteps.includes(6)) {
        setCompletedSteps([1, 2, 3, 4, 5, 6]);
      }
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.8 },
      });
      showToast('🎉 Tour Complete!', 'You explored all 5 integrated CampusVerse modules.', 'success');
    }
  };

  const handleResetDemo = () => {
    if (window.confirm('Reset all demo data back to default state?')) {
      initializeStore(true);
      setCompletedSteps([1]);
      setCurrentStepIndex(0);
      onNavigate('dashboard');
      showToast('Demo Data Reset', 'All events, tasks, teams, and posts are reset to initial demo state.', 'info');
    }
  };

  const jumpToStep = (index: number) => {
    setCurrentStepIndex(index);
    onNavigate(TOUR_STEPS[index].page);
    if (!completedSteps.includes(TOUR_STEPS[index].id)) {
      setCompletedSteps((prev) => [...prev, TOUR_STEPS[index].id]);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 50,
        maxWidth: '420px',
        width: 'calc(100% - 40px)',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--primary)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        animation: 'slideUp 250ms ease-out',
      }}
    >
      {/* Tour Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          padding: '10px 14px',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#FBBF24" />
          <span style={{ fontSize: '0.8125rem', fontWeight: 700, letterSpacing: '0.02em' }}>
            90-SECOND HACKATHON DEMO TOUR
          </span>
          <span
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '0.7rem',
              fontWeight: 600,
            }}
          >
            {completedSteps.length}/{TOUR_STEPS.length}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ background: 'transparent', border: 'none', color: '#FFFFFF', cursor: 'pointer', padding: '2px' }}
            title={isOpen ? 'Minimize' : 'Expand'}
          >
            {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button
            onClick={() => setIsDismissed(true)}
            style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', padding: '2px' }}
            title="Dismiss Tour"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {isOpen && (
        <div style={{ padding: '14px' }}>
          {/* Progress Bar */}
          <div
            style={{
              height: '4px',
              background: 'var(--border-subtle)',
              borderRadius: '2px',
              marginBottom: '12px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                background: 'linear-gradient(90deg, var(--primary), var(--secondary))',
                transition: 'width 300ms ease',
              }}
            />
          </div>

          {/* Current Step Content */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {React.createElement(currentStep.icon, { size: 18 })}
            </div>
            <div>
              <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Step {currentStep.id}: {currentStep.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                {currentStep.desc}
              </div>
            </div>
          </div>

          {/* Steps Carousel / Indicator dots */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {TOUR_STEPS.map((s, idx) => {
              const isDone = completedSteps.includes(s.id);
              const isCurrent = idx === currentStepIndex;
              return (
                <button
                  key={s.id}
                  onClick={() => jumpToStep(idx)}
                  title={`Step ${s.id}: ${s.title}`}
                  style={{
                    flex: 1,
                    height: '24px',
                    borderRadius: '4px',
                    border: 'none',
                    background: isCurrent ? 'var(--primary)' : isDone ? 'var(--success-light)' : 'var(--bg-subtle)',
                    color: isCurrent ? '#FFFFFF' : isDone ? 'var(--success-text)' : 'var(--text-muted)',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 150ms ease',
                  }}
                >
                  {isDone ? <CheckCircle2 size={12} /> : s.id}
                </button>
              );
            })}
          </div>

          {/* Action Row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            <button
              onClick={handleResetDemo}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '4px 8px' }}
              title="Reset sample events, tasks and posts"
            >
              <RotateCcw size={12} /> Reset Data
            </button>

            <button
              onClick={handleNextStep}
              className="btn btn-primary btn-sm"
              style={{ fontSize: '0.8rem', padding: '6px 12px' }}
            >
              {currentStepIndex < TOUR_STEPS.length - 1 ? (
                <>Next Step <ChevronRight size={14} /></>
              ) : (
                <>Finish Tour <Sparkles size={14} /></>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
