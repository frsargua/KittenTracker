import React from "react";

interface LoadingSpinnerProps {
  /** The message to display below the spinner */
  message?: string;
  /** The size of the paw icon in pixels */
  size?: number;
}

/**
 * A reusable loading spinner component with a cat paw animation.
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = 80,
}) => {
  /**
   * CSS styles for the component and its animations.
   * By including the styles directly in the component, it becomes
   * fully self-contained and doesn't require a separate .css file.
   */
  const styles = `
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      color: #6c757d; /* A muted text color, similar to Bootstrap's */
    }

    .loading-message {
      margin-top: 1rem;
      font-size: 1.2rem;
      font-weight: 500;
    }

    .paw-spinner .toe-pad {
      /* Apply the 'tap' animation to each toe pad */
      animation: tap 1.5s infinite ease-in-out;
    }

    /* Stagger the animation delay for each toe to create a tapping sequence */
    .paw-spinner .toe-1 { animation-delay: 0s; }
    .paw-spinner .toe-2 { animation-delay: 0.1s; }
    .paw-timer .toe-3 { animation-delay: 0.2s; }
    .paw-spinner .toe-4 { animation-delay: 0.3s; }

    /* The main pad can have a subtle pulse animation */
    .paw-spinner .main-pad {
      animation: pulse 1.5s infinite ease-in-out;
      animation-delay: 0.15s;
    }

    /* Keyframes for the tapping animation of the toe pads */
    @keyframes tap {
      0%, 50%, 100% {
        transform: translateY(0);
        opacity: 1;
      }
      25% {
        transform: translateY(-12px); /* Moves the toe up */
        opacity: 0.9;
      }
    }

    /* Keyframes for the pulsing animation of the main pad */
    @keyframes pulse {
      0%, 100% {
        transform: scale(1);
      }
      50% {
        transform: scale(1.03); /* Slightly enlarges the pad */
      }
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="loading-container">
        <svg
          className="paw-spinner"
          width={size}
          height={size}
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main Pad SVG Path */}
          <path
            className="main-pad"
            d="M 50,85 A 25,20 0 1,1 50,85 Z M 30,70 A 15,15 0 1,1 70,70 A 25,20 0 0,0 30,70 Z"
            fill="#fd7e14" /* An orange color, like a cat's paw */
            transform-origin="center"
          />
          {/* Toe Pads SVGs */}
          <circle
            className="toe-pad toe-1"
            cx="25"
            cy="45"
            r="8"
            fill="#fd7e14"
          />
          <circle
            className="toe-pad toe-2"
            cx="42"
            cy="35"
            r="8"
            fill="#fd7e14"
          />
          <circle
            className="toe-pad toe-3"
            cx="58"
            cy="35"
            r="8"
            fill="#fd7e14"
          />
          <circle
            className="toe-pad toe-4"
            cx="75"
            cy="45"
            r="8"
            fill="#fd7e14"
          />
        </svg>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </>
  );
};

export default LoadingSpinner;
