export const successResponse = (
  messageEn = "Successfully",
  messageKh = "ជោគជ័យ។",
  data = null
) => ({
  isSuccess: true,
  message: { messageEn, messageKh },
  ...(data ? { data } : {}),
});

export const errorResponse = (
  messageEn = "Operation failed.",
  messageKh = "បរាជ័យ។",
  error = null
) => ({
  isSuccess: false,
  message: { messageEn, messageKh },
  ...(error ? { error } : {}),
});