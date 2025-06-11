/**
 * Defines the structure for a single error scenario.
 */
export interface ErrorScenario {
  errorCode: string | number;
  title: string;
  message: string;
}

/**
 * A dictionary of predefined error scenarios used by the ErrorPage component.
 */
export const errorScenarios: { [key: string]: ErrorScenario } = {
  NOT_FOUND: {
    errorCode: "404",
    title: "Page Not Found",
    message:
      "Oops! The page you're looking for seems to have gone on a little adventure with our furry friends.",
  },
  AUTH_ERROR: {
    errorCode: "Authentication Error",
    title: "Something went wrong during login",
    message: "We had trouble authenticating you. Please try logging in again.",
  },
  SERVER_ERROR: {
    errorCode: "500",
    title: "Server Error",
    message:
      "It seems our servers are taking a cat nap. We're working on waking them up!",
  },
  OTHERS: {
    errorCode: "400",
    title: "Bad Request",
    message:
      "It seems our page is taking a cat nap. We're working on waking them up!",
  },
};

export type ErrorType = keyof typeof errorScenarios;
