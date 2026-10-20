/**
 * Standardized duration formatting utility for Prep application.
 * Formats durations accurately and consistently into hours and minutes.
 */

/**
 * Formats total practice time for the dashboard card.
 * Examples:
 * - 0 seconds -> "0 min"
 * - 35 minutes -> "35 min"
 * - 2 hours 45 minutes -> "2 hr 45 min"
 * - 48 hours 31 minutes -> "48 hr 31 min"
 * - 2 hours exactly -> "2 hr"
 * @param {number} totalSeconds - Total duration in seconds
 * @returns {string} - Formatted duration string
 */
export function formatTotalPracticeTime(totalSeconds = 0) {
  const sec = Math.max(0, Number(totalSeconds) || 0);
  if (sec < 60) return "0 min";

  const totalMinutes = Math.floor(sec / 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} hr ${mins} min`;
  }
  if (hours > 0 && mins === 0) {
    return `${hours} hr`;
  }
  return `${mins} min`;
}

/**
 * Returns readable subtext for the Total Practice Time card.
 * Examples:
 * - 0 interviews -> "Across 0 completed interviews"
 * - 1 interview -> "Across 1 completed interview"
 * - 3 interviews -> "Across 3 completed interviews"
 * - 24 interviews -> "Across 24 completed interviews"
 * @param {number} count - Completed interview count
 * @returns {string} - Subtext
 */
export function formatCompletedInterviewsSubtext(count = 0) {
  const safeCount = Math.max(0, Number(count) || 0);
  return `Across ${safeCount} completed interview${safeCount === 1 ? "" : "s"}`;
}

/**
 * Formats total practice time into hours (e.g., "0.0 hrs", "0.6 hrs", "2.5 hrs").
 * @param {number} totalSeconds - Total duration in seconds
 * @returns {string} - Formatted hours string
 */
export function formatPracticeHours(totalSeconds = 0) {
  const sec = Math.max(0, Number(totalSeconds) || 0);
  if (sec === 0) return "0.0 hrs";
  const hrs = (sec / 3600).toFixed(1);
  return `${hrs} hrs`;
}

/**
 * Returns human-readable subtext for practice time cards.
 * @param {number} totalSeconds - Total duration in seconds
 * @returns {string} - Subtext breakdown
 */
export function formatPracticeSubtext(totalSeconds = 0) {
  const sec = Math.max(0, Number(totalSeconds) || 0);
  if (sec === 0) return "No practice recorded";
  if (sec < 3600) {
    const mins = Math.max(1, Math.round(sec / 60));
    return `${mins} min active practice`;
  }
  const hrs = Math.floor(sec / 3600);
  const remMins = Math.round((sec % 3600) / 60);
  return remMins > 0 ? `${hrs} hr ${remMins} min total` : `${hrs} hrs total`;
}

/**
 * Formats an individual interview session duration.
 * Examples: "35 min", "1 hr 15 min", "2.5 hrs"
 * @param {number} seconds - Duration in seconds
 * @returns {string} - Human-readable session duration
 */
export function formatSessionDuration(seconds = 0) {
  const sec = Math.max(0, Number(seconds) || 0);
  if (sec === 0) return "0 min";
  if (sec < 60) return `${sec}s`;
  
  const totalMin = Math.round(sec / 60);
  if (totalMin < 60) {
    return `${totalMin} min`;
  }
  
  const hrs = (sec / 3600).toFixed(1);
  const cleanHrs = hrs.endsWith(".0") ? hrs.slice(0, -2) : hrs;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  
  return m > 0 ? `${h} hr ${m} min (${cleanHrs} hrs)` : `${cleanHrs} hrs`;
}

/**
 * Formats session duration compactly (e.g. "35m", "1h 15m") for table badges.
 */
export function formatCompactDuration(seconds = 0) {
  const sec = Math.max(0, Number(seconds) || 0);
  if (sec === 0) return "—";
  if (sec < 60) return `${sec}s`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m`;
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
