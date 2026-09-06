export const ERRORS = {
  login: {
    invalidCredentials: 'That email or password isn’t right. Please try again.',
  },

  signup: {
    firstNameRequired: 'Please enter your first name.',
    lastNameRequired: 'Please enter your last name.',
    birthdayRequired: 'Please enter your birthday.',
    emailRequired: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address.',
    failed: 'We couldn’t create your account. Please try again.',
    otpFailed: 'That code isn’t right. Please try again.',
    passwordRequired: 'Please create a password.',
    passwordTooShort: 'Your password needs to be at least 6 characters.',
    missingEmail: 'Please start signup again so we can verify your email.',
    registrationFailed: 'We couldn’t finish creating your account. Please try again.',
  },

  validation: {
    emailRequired: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address.',
    passwordRequired: 'Please enter your password.',
    passwordTooShort: 'Your password needs to be at least 6 characters.',
  },

  server: {
    unexpected: 'Something went wrong. Please try again.',
    noResponse: 'We couldn’t reach the server. Check your connection and try again.',
    requestSetup: (_message: string) => 'Something went wrong. Please try again.',
    requestFailed: (_status: number, message: string) =>
      message || 'Something went wrong. Please try again.',
    missingBackendUrl: 'The app isn’t connected right now. Please try again later.',
  },

  response: {
    invalidProfile: 'We couldn’t load this profile. Please try again.',
  },

  post: {
    createFailed: 'We couldn’t share your post. Please try again.',
    updateFailed: 'We couldn’t update your post. Please try again.',
    deleteFailed: 'We couldn’t delete your post. Please try again.',
    fetchFailed: 'We couldn’t load posts. Please try again.',
  },

  auth: {
    unauthorized: 'Please log in to continue.',
    providerRequired: 'Please refresh the page and try again.',
    changePasswordFailed: 'We couldn’t change your password. Please try again.',
  },

  friend: {
    fetchFailed: 'We couldn’t load your friends. Please try again.',
    providerRequired: 'Please refresh the page and try again.',
  },

  chat: {
    fetchConversationsFailed: 'We couldn’t load your conversations. Please try again.',
    fetchUsersFailed: 'We couldn’t load people. Please try again.',
    fetchMessagesFailed: 'We couldn’t load these messages. Please try again.',
    sendFailed: 'We couldn’t send your message. Please try again.',
    createFailed: 'We couldn’t start this conversation. Please try again.',
    deleteConversationFailed: 'We couldn’t delete this conversation. Please try again.',
    openFailed: 'We couldn’t open this chat. Please try again.',
    unsendFailed: 'We couldn’t unsend that message. Please try again.',
    deleteMessageFailed: 'We couldn’t delete that message. Please try again.',
    acceptRequestFailed: 'We couldn’t accept this message request. Please try again.',
    rejectRequestFailed: 'We couldn’t decline this message request. Please try again.',
    reactFailed: 'We couldn’t add that reaction. Please try again.',
    providerRequired: 'Please refresh the page and try again.',
  },

  profile: {
    fetchFailed: 'We couldn’t load this profile. Please try again.',
    updateFailed: 'We couldn’t update your profile. Please try again.',
    uploadPictureFailed: 'We couldn’t upload your profile photo. Please try again.',
    uploadCoverFailed: 'We couldn’t upload your cover photo. Please try again.',
    deleteAccountFailed: 'We couldn’t delete your account. Please try again.',
    removePictureFailed: 'We couldn’t remove your profile photo. Please try again.',
    removeCoverFailed: 'We couldn’t remove your cover photo. Please try again.',
    providerRequired: 'Please refresh the page and try again.',
  },

  postContext: {
    providerRequired: 'Please refresh the page and try again.',
  },
} as const;
