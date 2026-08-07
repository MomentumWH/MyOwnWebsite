/**
 * Storage keys are kept in one place so the route guard, stores and API
 * clients cannot silently drift into different authentication conventions.
 */
export const StorageKeys = {
  authToken: "auth_token",
  authUser: "auth_user",
  apiToken: "api_token",
  registeredAccounts: "registered_accounts",
  chatMessages: "chat-messages",
} as const;
