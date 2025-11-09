// Optional wrapper around environment variable. The app's API client (`services/api.ts`) uses
// process.env.REACT_APP_API_URL if present. You can import BASE_URL from here if you prefer.

export const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
