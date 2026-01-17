import { Check } from "lucide-react";

import { Button } from "./Button";

export default function Stepper({ steps, currentStep, onStepClick }) {
  return (
    <div className="w-full py-6">
      {/* Mobile Layout (< md) */}
      <div className="md:hidden">
        <div className="flex items-center space-x-2">
          {/* Only show current step on mobile */}
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;

            if (!isActive) return null;

            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500 text-white">
                  <span className="text-xs font-semibold">{stepNumber}</span>
                </div>
                <div className="ml-2">
                  <p className="text-sm font-medium text-blue-600">{step.title}</p>
                  <p className="text-xs text-gray-500">{stepNumber} dari {steps.length}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Desktop Layout (>= md) */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isActive = stepNumber === currentStep;
          const isClickable = stepNumber <= currentStep && onStepClick;

          return (
            <div key={step.id} className="flex items-center min-w-0 flex-1">
              {/* Step Circle */}
              <div
                className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 flex-shrink-0 ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isActive
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-gray-100 border-gray-300 text-gray-500"
                } ${isClickable ? "cursor-pointer hover:scale-105" : ""}`}
                onClick={() => isClickable && onStepClick(stepNumber)}
              >
                {isCompleted ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <span className="text-sm font-semibold">{stepNumber}</span>
                )}
              </div>

              {/* Step Label */}
              <div className="ml-3 min-w-0 flex-1">
                <p
                  className={`text-sm font-medium truncate ${
                    isActive
                      ? "text-blue-600"
                      : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                  }`}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-400 mt-1 truncate">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 mx-4 flex-shrink-0 w-8 lg:w-16 ${
                    stepNumber < currentStep ? "bg-green-500" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Navigation component for stepper
export function StepperNavigation({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  isLoading = false,
  canGoNext = true,
  nextButtonText = "Lanjut",
  submitButtonText = "Simpan",
  isLastStep: externalIsLastStep,
}) {
  const isFirstStep = currentStep === 1;
  const isLastStep = externalIsLastStep !== undefined ? externalIsLastStep : currentStep === totalSteps;

  return (
    <div className="pt-6 border-t">
      {/* Mobile Layout */}
      <div className="md:hidden space-y-3">
        <div className="text-center text-sm text-gray-500">
          Langkah {currentStep} dari {totalSteps}
        </div>
        <div className="flex flex-col space-y-2">
          {!isFirstStep && (
            <Button
              disabled={isLoading}
              size="sm"
              type="button"
              variant="outline"
              onClick={onPrevious}
            >
              ← Sebelumnya
            </Button>
          )}
          {isLastStep ? (
            <Button
              disabled={!canGoNext || isLoading}
              isLoading={isLoading}
              loadingText="Menyimpan..."
              size="sm"
              type="button"
              onClick={onSubmit}
            >
              {submitButtonText}
            </Button>
          ) : (
            <Button
              disabled={!canGoNext || isLoading}
              size="sm"
              type="button"
              onClick={onNext}
            >
              {nextButtonText} →
            </Button>
          )}
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex justify-between items-center">
        <Button
          disabled={isFirstStep || isLoading}
          type="button"
          variant="outline"
          onClick={onPrevious}
        >
          Sebelumnya
        </Button>

        <div className="text-sm text-gray-500">
          Langkah {currentStep} dari {totalSteps}
        </div>

        {isLastStep ? (
          <Button
            disabled={!canGoNext || isLoading}
            isLoading={isLoading}
            loadingText="Menyimpan..."
            type="button"
            onClick={onSubmit}
          >
            {submitButtonText}
          </Button>
        ) : (
          <Button
            disabled={!canGoNext || isLoading}
            type="button"
            onClick={onNext}
          >
            {nextButtonText}
          </Button>
        )}
      </div>
    </div>
  );
}

// Step content wrapper
export function StepContent({ children, stepId, className = "" }) {
  // This component should be used within the context of a parent that provides currentStep
  // For now, we'll render all children and let the parent handle step visibility
  return <div className={`py-6 ${className}`}>{children}</div>;
}
