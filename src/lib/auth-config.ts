// Check if OAuth providers are properly configured
export const isGoogleOAuthAvailable = () => {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
};

export const authConfig = {
  google: isGoogleOAuthAvailable(),
};
