// Prevent rapid-fire requests from same user/session
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests; // max requests per window
    this.windowMs = windowMs; // time window in ms (default: 1 minute)
    this.requests = new Map(); // key -> { count, resetTime }
  }

  isAllowed(key = 'default') {
    const now = Date.now();
    const record = this.requests.get(key) || { count: 0, resetTime: now + this.windowMs };

    // Reset window if expired
    if (now > record.resetTime) {
      record.count = 0;
      record.resetTime = now + this.windowMs;
    }

    record.count++;
    this.requests.set(key, record);

    return record.count <= this.maxRequests;
  }

  getRemainingRequests(key = 'default') {
    const record = this.requests.get(key) || { count: 0 };
    return Math.max(0, this.maxRequests - record.count);
  }
}

// Create global rate limiters for different operations
export const rateLimiters = {
  saveCat: new RateLimiter(5, 60000), // 5 uploads per minute
  starCat: new RateLimiter(20, 60000), // 20 star clicks per minute
  fetchCats: new RateLimiter(30, 60000), // 30 fetches per minute
};

// Sanitize and validate user inputs to prevent XSS, injection, and oversized payloads
export const validateInput = {
  // Validate cat name
  catName: (name) => {
    if (name.trim().length === 0) return { valid: false, error: 'Name cannot be empty' };
    if (name.length > 50) return { valid: false, error: 'Name too long (max 50 chars)' };
    // Prevent common XSS attempts (no HTML tags, scripts, dangerous chars)
    if (/<|>|"|'|&|javascript:|onerror|onload|onclick/i.test(name)) {
      return { valid: false, error: 'Name contains invalid characters' };
    }
    return { valid: true, value: name.trim() };
  },

  // Validate image size (dataURL or Blob)
  imageSize: (imageData, maxBytes = 220000) => {
    if (!imageData) return { valid: false, error: 'Image required' };
    const sizeBytes = typeof imageData === 'string' ? imageData.length : imageData.size;
    if (sizeBytes > maxBytes) {
      return {
        valid: false,
        error: `Image too large (${(sizeBytes / 1024).toFixed(1)}KB max ${(maxBytes / 1024).toFixed(1)}KB)`,
      };
    }
    return { valid: true, value: imageData };
  },

  // Validate image format (must be PNG/JPEG dataURL)
  imageFormat: (imageData) => {
    if (typeof imageData !== 'string') return { valid: false, error: 'Image must be a data URL' };
    const validFormats = ['data:image/png;base64,', 'data:image/jpeg;base64,'];
    if (!validFormats.some((f) => imageData.startsWith(f))) {
      return { valid: false, error: 'Image must be PNG or JPEG' };
    }
    return { valid: true, value: imageData };
  },

  // Validate cat ID (UUID format)
  catId: (id) => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { valid: false, error: 'Invalid cat ID' };
    }
    return { valid: true, value: id };
  },
};

// Detect suspicious patterns: rapid submissions, repeated names, bot-like behavior
class SpamDetector {
  constructor() {
    this.submissions = []; // { timestamp, name, ipHash }
    this.maxAgeMins = 10;
  }

  // Record a submission
  recordSubmission(catName, userIdentifier = 'anonymous') {
    this.submissions.push({
      timestamp: Date.now(),
      name: catName.toLowerCase(),
      user: userIdentifier,
    });

    // Cleanup old submissions
    const cutoff = Date.now() - this.maxAgeMins * 60000;
    this.submissions = this.submissions.filter((s) => s.timestamp > cutoff);
  }

  // Check if submission looks like spam
  isSpam(catName, userIdentifier = 'anonymous') {
    const cutoff = Date.now() - this.maxAgeMins * 60000;
    const recentByUser = this.submissions.filter((s) => s.user === userIdentifier && s.timestamp > cutoff);

    // Flag: more than 10 submissions in 10 minutes
    if (recentByUser.length > 10) {
      return { isSpam: true, reason: 'Too many submissions. Try again later.' };
    }

    // Flag: same name submitted 3+ times in 10 minutes
    const nameCounts = {};
    recentByUser.forEach((s) => {
      nameCounts[s.name] = (nameCounts[s.name] || 0) + 1;
    });
    const duplicateName = Object.values(nameCounts).some((count) => count >= 3);
    if (duplicateName) {
      return { isSpam: true, reason: 'Duplicate submission detected.' };
    }

    // Flag: all names are very similar
    if (recentByUser.length >= 3) {
      const names = recentByUser.map((s) => s.name);
      const avgLength = names.reduce((sum, n) => sum + n.length, 0) / names.length;
      const similarCount = names.filter((n) => Math.abs(n.length - avgLength) < 2).length;
      if (similarCount === names.length) {
        return { isSpam: true, reason: 'Suspicious submission pattern detected.' };
      }
    }

    return { isSpam: false };
  }
}

export const spamDetector = new SpamDetector();

// Don't leak sensitive info in error messages
export const safeErrorMessage = (error, context = 'Operation') => {
  if (!error) return `${context} failed. Please try again.`;

  const errorStr = String(error.message || error).toLowerCase();

  // Map sensitive error details to user-friendly messages
  const sensitivePatterns = {
    'policy|security|rls|permission|unauthorized|forbidden': 'You do not have permission for this action.',
    'bucket|storage|upload|file': 'Unable to store image. Check your connection.',
    'constraint|unique|duplicate': 'This entry already exists. Try a different name.',
    'connection|network|timeout': 'Network error. Check your connection and try again.',
    'database|query|postgres': 'Server error. Try again later.',
  };

  // Find matching pattern and return generic message
  for (const [pattern, message] of Object.entries(sensitivePatterns)) {
    if (new RegExp(pattern).test(errorStr)) {
      return message;
    }
  }

  // Default fallback (never expose raw error)
  return `${context} failed. Please try again later.`;
};

// Ensure only one request of a type runs at a time
class RequestThrottler {
  constructor() {
    this.active = new Map(); // operation -> Promise
  }

  async throttle(operationKey, asyncFn) {
    // If operation already running, wait for it
    if (this.active.has(operationKey)) {
      await this.active.get(operationKey);
    }

    // Start new operation
    const promise = asyncFn()
      .then((result) => {
        this.active.delete(operationKey);
        return result;
      })
      .catch((error) => {
        this.active.delete(operationKey);
        throw error;
      });

    this.active.set(operationKey, promise);
    return promise;
  }

  isActive(operationKey) {
    return this.active.has(operationKey);
  }
}

export const requestThrottler = new RequestThrottler();

// Track user session to detect suspicious behavior
class SessionManager {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.createdAt = Date.now();
    this.requestCount = 0;
    this.lastActivityAt = Date.now();
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  recordActivity() {
    this.requestCount++;
    this.lastActivityAt = Date.now();
  }

  isSessionValid(maxAgeMins = 30) {
    const ageMs = Date.now() - this.createdAt;
    return ageMs < maxAgeMins * 60000;
  }

  getStats() {
    return {
      sessionId: this.sessionId,
      ageMs: Date.now() - this.createdAt,
      requestCount: this.requestCount,
      lastActivityMs: Date.now() - this.lastActivityAt,
    };
  }
}

export const sessionManager = new SessionManager();

// check if data is safe to render
export const isSafeToRender = (data) => {
  if (!data) return true;
  if (typeof data === 'string') {
    // Check for script tags, event handlers, etc.
    return !/(<script|onerror|onload|onclick|javascript:)/i.test(data);
  }
  if (typeof data === 'object' && data.name) {
    return isSafeToRender(data.name);
  }
  return true;
};