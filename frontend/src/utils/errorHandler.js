import { toast } from 'react-toastify';

// Generic error handler
export const handleError = (error, defaultMessage = 'An unexpected error occurred') => {
  console.error('Error:', error);

  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    const status = error.response.status;
    const message = error.response.data.message || defaultMessage;

    switch (status) {
      case 400:
        toast.error(`Bad Request: ${message}`);
        break;
      case 401:
        toast.error('Unauthorized: Please login again');
        // You might want to trigger a logout action here
        break;
      case 403:
        toast.error('Forbidden: You do not have permission to perform this action');
        break;
      case 404:
        toast.error('Not Found: The requested resource could not be found');
        break;
      case 500:
        toast.error('Server Error: Please try again later');
        break;
      default:
        toast.error(message);
    }
  } else if (error.request) {
    // The request was made but no response was received
    toast.error('Network Error: Please check your internet connection');
  } else {
    // Something happened in setting up the request that triggered an Error
    toast.error(defaultMessage);
  }

  // You can choose to rethrow the error if you want calling code to handle it as well
  // throw error;
};

// Specific error handlers for different parts of your application

export const handleLoginError = (error) => {
  handleError(error, 'Login failed. Please check your credentials and try again.');
};

export const handleRegisterError = (error) => {
  handleError(error, 'Registration failed. Please check your information and try again.');
};

export const handleProfileUpdateError = (error) => {
  handleError(error, 'Failed to update profile. Please try again.');
};

export const handleSubscriptionError = (error) => {
  handleError(error, 'Subscription action failed. Please try again.');
};

export const handleNetworkError = (error) => {
  handleError(error, 'Network action failed. Please try again.');
};

export const handleGiftError = (error) => {
  handleError(error, 'Gift action failed. Please try again.');
};

export const handleSupportTicketError = (error) => {
  handleError(error, 'Failed to submit support ticket. Please try again.');
};

// You can add more specific error handlers as needed for different parts of your application