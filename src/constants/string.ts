export const AUTH_STRINGS = {
  CREDENTIALS_REQUIRED: "Email and password are required.",
  PASSWORD_TOO_SHORT: "Password must be at least 6 characters long.",
  LOGIN_SUCCESS: "Login successful.",
  SIGNUP_SUCCESS: "Account registered successfully.",
  INVALID_CREDENTIALS: "Invalid email or password.",
  EMAIL_ALREADY_IN_USE: "An account with this email address already exists.",
  USER_NOT_FOUND: "No account found with this email address.",
  ACCOUNT_LOCKED: "Account temporarily locked due to excessive failed attempts. Please try again later.",
  SESSION_EXPIRED: "Your session has expired. Please log in again to continue.",
  UNAUTHORIZED: "You are not authorized to access this resource.",
  AUTH_NETWORK_ERROR: "Unable to connect to the authentication service. Please check your network connection.",
} as const;

export const AUTH_TOKEN_STRINGS = {
  INVALID_TOKEN: "Invalid or expired authentication token.",
  AUTH_TOKEN_REQUIRED: "Authentication token is required.",
  ADMIN_ACCESS_REQUIRED: "Forbidden: Administrator privileges required.",
} as const;

export const TASK_STRINGS = {
  TITLE_REQUIRED: "Task title is required.",
  TITLE_TOO_LONG: "Task title must not exceed 100 characters.",
  TASK_CREATED: "Task created successfully.",
  TASKS_FETCH_SUCCESSFULLY: "Tasks retrieved successfully.",
  TASK_NOT_FOUND: "Task not found.",
  TASK_UPDATED: "Task updated successfully.",
  TASK_DELETED: "Task deleted successfully.",
  TASK_FORBIDDEN: "You do not have permission to access or modify this task.",
} as const;

export const COMMON_STRINGS = {
  INTERNAL_SERVER_ERROR: "An unexpected error occurred. Please try again later.",
  ROUTE_NOT_FOUND: "The requested resource could not be found.",
  BAD_REQUEST: "Invalid request payload or parameters.",
} as const;
