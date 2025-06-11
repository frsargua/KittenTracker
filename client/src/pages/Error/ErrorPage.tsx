import React from "react";
import { Link } from "react-router-dom";
import {
  errorScenarios,
  type ErrorType,
} from "./ErrorScenarios/ErrorScenarios";

interface ErrorPageProps {
  type: ErrorType;
  customMessage?: string;
}

/**
 * A generic, reusable page for displaying errors based on a predefined type.
 */
const ErrorPage: React.FC<ErrorPageProps> = ({ type, customMessage }) => {
  const { errorCode, title, message } = errorScenarios[type];

  const displayMessage = customMessage || message;

  const styles = `
    .error-page-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: calc(100vh - 150px); /* Adjust based on navbar height */
      text-align: center;
      padding: 2rem;
      background-color: #f8f9fa; /* A light background */
    }

    .error-svg {
      width: 100%;
      max-width: 400px;
      margin-bottom: 2rem;
    }

    .error-svg .cat-body, .error-svg .dog-body {
        transition: transform 0.3s ease-in-out;
    }
    
    .error-svg:hover .cat-body {
        transform: rotate(-5deg) translateX(-5px);
    }

    .error-svg:hover .dog-body {
        transform: rotate(5deg) translateX(5px);
    }

    .error-code {
      font-size: 4rem;
      font-weight: 700;
      color: #343a40;
      margin-bottom: 0;
    }

    .error-title {
        font-size: 2rem;
        font-weight: 500;
        color: #495057;
        margin-top: 0;
        margin-bottom: 1rem;
    }

    .error-message {
      font-size: 1.25rem;
      color: #6c757d;
      margin-bottom: 2rem;
      max-width: 600px;
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div className="error-page-container">
        <svg
          className="error-svg"
          viewBox="0 0 200 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* SVG content remains the same... */}
          {/* Dog */}
          <g className="dog-body" transform-origin="center">
            <path
              d="M 120,80 C 110,95 90,95 80,80 L 85,60 C 90,50 110,50 115,60 Z"
              fill="#c67a3f"
            />
            <circle cx="100" cy="55" r="15" fill="#c67a3f" />
            <path d="M 90,35 C 85,20 95,20 95,35" fill="#c67a3f" />
            <path d="M 110,35 C 115,20 105,20 105,35" fill="#c67a3f" />
            <circle cx="96" cy="55" r="2" fill="black" />
            <circle cx="104" cy="55" r="2" fill="black" />
            <path
              d="M 98,62 Q 100,65 102,62"
              stroke="black"
              fill="none"
              strokeWidth="1"
            />
          </g>
          {/* Cat */}
          <g className="cat-body" transform-origin="center">
            <path
              d="M 80,80 C 70,95 50,95 40,80 L 45,60 C 50,50 70,50 75,60 Z"
              fill="#6c757d"
            />
            <circle cx="60" cy="55" r="15" fill="#6c757d" />
            <path d="M 50,40 L 45,25 L 55,40 Z" fill="#6c757d" />
            <path d="M 70,40 L 75,25 L 65,40 Z" fill="#6c757d" />
            <circle cx="56" cy="55" r="1.5" fill="white" />
            <circle cx="64" cy="55" r="1.5" fill="white" />
            <path
              d="M 58,60 L 55,63 L 65,63 L 62,60"
              stroke="white"
              fill="none"
              strokeWidth="0.5"
            />
          </g>

          <text x="100" y="95" textAnchor="middle" fontSize="8" fill="#6c757d">
            Lost Friends?
          </text>
        </svg>

        <h1 className="error-code">{errorCode}</h1>
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{displayMessage}</p>
        <Link to="/dashboard" className="btn btn-primary btn-lg">
          Go to Dashboard
        </Link>
      </div>
    </>
  );
};

export default ErrorPage;
