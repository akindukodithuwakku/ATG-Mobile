// services/careIntakeFormApi.js
import axios from 'axios';

const API_BASE_URL = 'https://fcmivh95rf.execute-api.ap-south-1.amazonaws.com/dev';
const SUBMIT_ENDPOINT = '/submit';

export const submitCareIntakeForm = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}${SUBMIT_ENDPOINT}`, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error submitting form:', error);
    throw error;
  }
};