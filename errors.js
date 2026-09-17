/**
 * Sort Circuit — Custom Error System & Error Codes
 * Shared error classes, registry, and formatting utilities.
 */

class SCError extends Error {
  /**
   * @param {string} code - The unique error code (e.g. 'SC-VAL-001')
   * @param {string} message - User-friendly error message
   * @param {Error|null} [cause] - Original underlying error if any
   * @param {string} [title] - Short category/title for UI headers
   * @param {string} [solution] - Suggested resolution or troubleshooting step
   */
  constructor(code, message, cause = null, title = '', solution = '') {
    super(message);
    this.name = 'SCError';
    this.code = code;
    this.cause = cause;
    this.title = title || (ERROR_CODES_BY_CODE[code]?.title || 'Error');
    this.solution = solution || (ERROR_CODES_BY_CODE[code]?.solution || '');
    this.timestamp = new Date().toISOString();
  }

  toString() {
    return `[${this.code}] ${this.message}`;
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      title: this.title,
      message: this.message,
      solution: this.solution,
      timestamp: this.timestamp,
      cause: this.cause ? (this.cause.message || String(this.cause)) : null
    };
  }
}

const ERROR_CODES = {
  // ── Validation (SC-VAL-xxx) ───────────────────────────
  ERR_ID_REQUIRED: {
    code: 'SC-VAL-001',
    category: 'Validation',
    title: 'Student ID Required',
    message: 'Student ID is required to save your score.',
    solution: 'Enter your assigned numeric student ID before submitting.'
  },
  ERR_ID_NUMBERS_ONLY: {
    code: 'SC-VAL-002',
    category: 'Validation',
    title: 'Numbers Only',
    message: 'Student ID must contain numbers only.',
    solution: 'Remove any letters, punctuation, spaces, or special characters.'
  },
  ERR_ID_TOO_LONG: {
    code: 'SC-VAL-003',
    category: 'Validation',
    title: 'Student ID Too Long',
    message: 'Student ID cannot exceed 40 digits.',
    solution: 'Verify your student ID and ensure it is 40 digits or fewer.'
  },
  ERR_INVALID_SCORE: {
    code: 'SC-VAL-004',
    category: 'Validation',
    title: 'Invalid Score',
    message: 'Score must be a positive integer.',
    solution: 'Play a valid round to earn a positive score.'
  },
  ERR_INVALID_MODE: {
    code: 'SC-VAL-005',
    category: 'Validation',
    title: 'Invalid Game Mode',
    message: 'Selected game mode is not recognized.',
    solution: 'Choose either Standard or Sudden Death mode.'
  },

  // ── Network & Connectivity (SC-NET-xxx) ───────────────
  ERR_OFFLINE: {
    code: 'SC-NET-001',
    category: 'Network',
    title: 'Device Offline',
    message: 'No internet connection detected.',
    solution: 'Check your Wi-Fi or network connection. Scores will still be kept on this device.'
  },
  ERR_LEADERBOARD_UNREACHABLE: {
    code: 'SC-NET-002',
    category: 'Network',
    title: 'Leaderboard Unreachable',
    message: 'Could not establish a connection to the leaderboard service.',
    solution: 'Check your internet connection or firewall. The leaderboard service may be temporarily unavailable.'
  },
  ERR_REQUEST_TIMEOUT: {
    code: 'SC-NET-003',
    category: 'Network',
    title: 'Request Timed Out',
    message: 'Leaderboard request took too long to respond.',
    solution: 'Your network connection may be slow. Please try again in a moment.'
  },
  ERR_RATE_LIMIT: {
    code: 'SC-NET-004',
    category: 'Network',
    title: 'Rate Limit Exceeded',
    message: 'Too many requests submitted in a short period.',
    solution: 'Please wait a few seconds before trying again.'
  },
  ERR_CORS_BLOCKED: {
    code: 'SC-NET-005',
    category: 'Network',
    title: 'Request Blocked (CORS)',
    message: 'The network request was blocked by browser security policy.',
    solution: 'Ensure the origin domain is permitted in your Supabase project settings.'
  },

  // ── Authentication & Admin (SC-AUTH-xxx) ──────────────
  ERR_AUTH_INVALID: {
    code: 'SC-AUTH-001',
    category: 'Authentication',
    title: 'Invalid Credentials',
    message: 'Incorrect email address or password.',
    solution: 'Double-check your administrator email and password.'
  },
  ERR_AUTH_EXPIRED: {
    code: 'SC-AUTH-002',
    category: 'Authentication',
    title: 'Session Expired',
    message: 'Your administrator session has expired.',
    solution: 'Please sign in again to continue managing scores.'
  },
  ERR_AUTH_REFRESH: {
    code: 'SC-AUTH-003',
    category: 'Authentication',
    title: 'Token Refresh Failed',
    message: 'Could not refresh the authentication session token.',
    solution: 'Sign out and sign back in with your administrator credentials.'
  },
  ERR_AUTH_FORBIDDEN: {
    code: 'SC-AUTH-004',
    category: 'Authentication',
    title: 'Access Forbidden',
    message: 'Access denied: insufficient permissions or Row Level Security policy blocked the request.',
    solution: 'Verify your administrator credentials and database RLS policy settings.'
  },

  // ── Data & Storage (SC-DATA-xxx) ──────────────────────
  ERR_SCORE_SAVE_FAILED: {
    code: 'SC-DATA-001',
    category: 'Data',
    title: 'Score Save Failed',
    message: 'Failed to save score to the remote leaderboard.',
    solution: 'Your score was preserved locally. Check your connection to sync to the live board.'
  },
  ERR_LEADERBOARD_LOAD_FAILED: {
    code: 'SC-DATA-002',
    category: 'Data',
    title: 'Leaderboard Load Failed',
    message: 'Unable to retrieve latest scores from the leaderboard.',
    solution: 'Showing local device scores. Check your connection or click Refresh.'
  },
  ERR_SCORE_DELETE_FAILED: {
    code: 'SC-DATA-003',
    category: 'Data',
    title: 'Delete Failed',
    message: 'Failed to delete the selected score entry.',
    solution: 'Confirm you are signed in as an authorized administrator with delete permissions.'
  },
  ERR_STORAGE_UNAVAILABLE: {
    code: 'SC-DATA-004',
    category: 'Data',
    title: 'Local Storage Blocked',
    message: 'Browser local storage is disabled, full, or blocked.',
    solution: 'Enable local storage in browser settings or exit private/incognito browsing.'
  },
  ERR_CSV_EXPORT_FAILED: {
    code: 'SC-DATA-005',
    category: 'Data',
    title: 'CSV Export Failed',
    message: 'Could not generate or download the CSV score export.',
    solution: 'Ensure browser download permissions are enabled for this page.'
  },

  // ── Configuration (SC-CFG-xxx) ────────────────────────
  ERR_CONFIG_MISSING: {
    code: 'SC-CFG-001',
    category: 'Configuration',
    title: 'Supabase Not Configured',
    message: 'Supabase URL or publishable API key is missing or unconfigured.',
    solution: 'Update the SUPABASE configuration object in the file with your URL and publishable key.'
  },
  ERR_CONFIG_INVALID: {
    code: 'SC-CFG-002',
    category: 'Configuration',
    title: 'Invalid Configuration URL',
    message: 'The configured Supabase URL is not a valid HTTP/HTTPS address.',
    solution: 'Ensure SUPABASE.url begins with https:// and points to a live project.'
  },

  // ── Audio & Graphics (SC-AUDIO-xxx / SC-GFX-xxx) ──────
  ERR_AUDIO_INIT: {
    code: 'SC-AUDIO-001',
    category: 'Audio',
    title: 'Audio Initialization Failed',
    message: 'Web Audio API is not supported or was blocked from starting.',
    solution: 'Interact with the screen (click or tap) to allow audio playback.'
  },
  ERR_AUDIO_SYNTH: {
    code: 'SC-AUDIO-002',
    category: 'Audio',
    title: 'Synthesizer Error',
    message: 'The audio synthesis engine encountered an unexpected sound buffer error.',
    solution: 'Sound has been temporarily muted to avoid interruption.'
  },
  ERR_CANVAS_INIT: {
    code: 'SC-GFX-001',
    category: 'Graphics',
    title: 'Canvas Unsupported',
    message: 'HTML5 Canvas 2D rendering context is not supported by your browser.',
    solution: 'Please update your browser or try modern Chrome, Safari, Firefox, or Edge.'
  },
  ERR_CANVAS_LOST: {
    code: 'SC-GFX-002',
    category: 'Graphics',
    title: 'Graphics Context Lost',
    message: 'The GPU canvas rendering context was lost or crashed.',
    solution: 'Reload the page to restart the graphics engine.'
  },
  ERR_FONT_LOAD: {
    code: 'SC-FONT-001',
    category: 'Graphics',
    title: 'Custom Font Load Failed',
    message: 'The embedded Open Sauce Sans typeface failed to load.',
    solution: 'Gameplay continues with the system UI font fallback.'
  },

  // ── Routing & System (SC-ROUTER-xxx / SC-SYS-xxx) ─────
  ERR_NOT_FOUND: {
    code: 'SC-ROUTER-404',
    category: 'Routing',
    title: 'Page Not Found (404)',
    message: 'The requested page or resource could not be found.',
    solution: 'Navigate back to the game using the provided links.'
  },
  ERR_RUNTIME_EXCEPTION: {
    code: 'SC-SYS-001',
    category: 'System',
    title: 'Runtime Error',
    message: 'An unexpected runtime error occurred.',
    solution: 'Reload the page. If the problem persists, record the error code and report it.'
  },
  ERR_UNHANDLED_REJECTION: {
    code: 'SC-SYS-002',
    category: 'System',
    title: 'Unhandled Rejection',
    message: 'An asynchronous operation failed without a catch handler.',
    solution: 'Check your internet connection and reload the page.'
  }
};

// Quick lookup map by code ('SC-VAL-001' => metadata)
const ERROR_CODES_BY_CODE = Object.values(ERROR_CODES).reduce((acc, item) => {
  acc[item.code] = item;
  return acc;
}, {});

/**
 * Creates an SCError instance from an error key or code.
 * @param {string} keyOrCode - E.g. 'ERR_ID_REQUIRED' or 'SC-VAL-001'
 * @param {string} [overrideMessage] - Optional custom message
 * @param {Error|null} [cause] - Underlying cause
 * @returns {SCError}
 */
function scError(keyOrCode, overrideMessage = '', cause = null) {
  const meta = ERROR_CODES[keyOrCode] || ERROR_CODES_BY_CODE[keyOrCode] || {
    code: keyOrCode.startsWith('SC-') ? keyOrCode : 'SC-SYS-000',
    title: 'Application Error',
    message: overrideMessage || 'An unexpected error occurred.',
    solution: 'Please reload the page and try again.'
  };
  return new SCError(
    meta.code,
    overrideMessage || meta.message,
    cause,
    meta.title,
    meta.solution
  );
}

/**
 * Formats any error (SCError or plain Error) into a clean user-facing string with error code.
 * @param {Error|SCError|string} err
 * @param {string} [fallbackKey='ERR_RUNTIME_EXCEPTION']
 * @returns {string} E.g. "[SC-VAL-001] Student ID is required."
 */
function formatError(err, fallbackKey = 'ERR_RUNTIME_EXCEPTION') {
  if (err instanceof SCError) {
    return `[${err.code}] ${err.message}`;
  }
  const raw = err && err.message ? err.message : String(err || 'Unknown error');
  
  // Intelligent classification for uncaught network / Supabase errors
  if (/offline|network.*fail|failed to fetch|load failed/i.test(raw)) {
    return `[SC-NET-002] Could not reach the leaderboard — check your connection.`;
  }
  if (/invalid login|invalid grant|invalid_grant|invalid credentials/i.test(raw)) {
    return `[SC-AUTH-001] Invalid email or password.`;
  }
  if (/session expired|jwt expired|token expired|401/i.test(raw)) {
    return `[SC-AUTH-002] Session expired — please sign in again.`;
  }
  if (/rate limit|too many requests|429/i.test(raw)) {
    return `[SC-NET-004] Too many requests. Please wait a moment.`;
  }
  if (/404/i.test(raw)) {
    return `[SC-ROUTER-404] Resource not found.`;
  }

  const fallback = ERROR_CODES[fallbackKey] || ERROR_CODES.ERR_RUNTIME_EXCEPTION;
  return `[${fallback.code}] ${raw}`;
}

/**
 * Renders an HTML badge + message for an error.
 * @param {Error|SCError|string} err
 * @param {string} [fallbackKey]
 * @returns {string} HTML markup
 */
function formatErrorHtml(err, fallbackKey = 'ERR_RUNTIME_EXCEPTION') {
  const text = formatError(err, fallbackKey);
  const match = text.match(/^\[(SC-[A-Z0-9-]+)\]\s*(.*)$/);
  if (match) {
    const code = match[1];
    const msg = match[2];
    return `<span class="err-badge">${code}</span><span>${escapeHtml(msg)}</span>`;
  }
  return escapeHtml(text);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Export for Node/CommonJS or attach to global window
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SCError,
    ERROR_CODES,
    ERROR_CODES_BY_CODE,
    scError,
    formatError,
    formatErrorHtml
  };
}
if (typeof window !== 'undefined') {
  window.SCError = SCError;
  window.ERROR_CODES = ERROR_CODES;
  window.ERROR_CODES_BY_CODE = ERROR_CODES_BY_CODE;
  window.scError = scError;
  window.formatError = formatError;
  window.formatErrorHtml = formatErrorHtml;
}
