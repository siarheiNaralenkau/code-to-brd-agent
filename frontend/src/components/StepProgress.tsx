import type { WorkflowStep } from '../types';
import './StepProgress.css';

const STEPS: { id: WorkflowStep; label: string }[] = [
  { id: 'clone', label: '1. Clone Repo' },
  { id: 'parse', label: '2. Parse AST' },
  { id: 'features', label: '3. Extract Features' },
  { id: 'brd', label: '4. Generate BRD' },
];

interface StepProgressProps {
  currentStep: WorkflowStep;
  onStepClick?: (step: WorkflowStep) => void;
}

export function StepProgress({ currentStep, onStepClick }: StepProgressProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <div className="step-progress">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        const stateClass = isDone
          ? 'step-progress__item--done'
          : isActive
          ? 'step-progress__item--active'
          : 'step-progress__item--pending';
        const notLastClass = index < STEPS.length - 1 ? 'step-progress__item--not-last' : '';
        const clickableClass = isDone ? 'step-progress__item--clickable' : '';
        return (
          <div
            key={step.id}
            className={`step-progress__item ${stateClass} ${notLastClass} ${clickableClass}`}
            onClick={isDone && onStepClick ? () => onStepClick(step.id) : undefined}
            title={isDone ? `Go back to: ${step.label}` : undefined}
          >
            {step.label}
          </div>
        );
      })}
    </div>
  );
}
