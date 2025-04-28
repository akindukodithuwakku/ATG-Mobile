import axios from 'axios';

// Use environment variables for the API endpoint to avoid hardcoding
const API_ENDPOINT = process.env.REACT_APP_API_ENDPOINT || 'https://fcmivh95rf.execute-api.ap-south-1.amazonaws.com/dev/submit';

/**
 * Submits the care intake form data to the API.
 * @param {Object} formData - The data to be submitted.
 * @returns {Object} - The response data from the API.
 * @throws {Error} - Throws an error if the API call fails.
 */
export const submitCareIntakeForm = async (formData) => {
  try {
    const response = await axios.post(API_ENDPOINT, formData);
    return response.data;
  } catch (error) {
    console.error('Error submitting care intake form:', error);
    throw error;
  }
};