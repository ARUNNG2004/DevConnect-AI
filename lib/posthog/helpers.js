import posthog from "posthog-js";

/**
 * Associates the current session with a user identity in PostHog.
 * @param userId - Unique identifier for the user
 * @param traits - Optional properties to attach to the user profile
 */
export function identifyUser(userId, traits) {
  posthog.identify(userId, traits);
}

/**
 * Tracks a named event with optional metadata.
 * @param event - Event name
 * @param properties - Optional key-value pairs describing the event
 */
export function captureEvent(event, properties) {
  posthog.capture(event, properties);
}

/**
 * Reports an exception to PostHog error tracking.
 * @param error - The caught error or unknown value
 * @param properties - Optional additional context
 */
export function captureException(error, properties) {
  posthog.captureException(error, properties);
}
