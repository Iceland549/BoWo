const ENABLE_LOGS = true; // set false to mute

export function log(...args) {
  if (ENABLE_LOGS) console.log('[BoWo]', ...args);
}

export function info(...args) {
  if (ENABLE_LOGS) console.info('[BoWo][INFO]', ...args);
}

export function warn(...args) {
  if (ENABLE_LOGS) console.warn('[BoWo][WARN]', ...args);
}

export function error(...args) {
  if (ENABLE_LOGS) console.error('[BoWo][ERROR]', ...args);
}
