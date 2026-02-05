/**
 * Extracts a meaningful error message from a nested API error response.
 */
export const parseApiError = (error: unknown): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error &&
    typeof error.response === "object" &&
    error.response !== null &&
    "data" in error.response &&
    typeof error.response.data === "object" &&
    error.response.data !== null &&
    "message" in error.response.data
  ) {
    const message = (error.response as any).data.message;

    if (typeof message === "string") return message;
    if (typeof message?.error === "string") return message.error;
  }

  return "An unexpected error occurred";
};
