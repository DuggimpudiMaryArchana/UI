import api from './api';

// Get all pending users (only for verifier)
export const getPendingUsers = async () => {
  try {
    const response = await api.get('/employees/pending-users');
    return response.data;
  } catch (error) {
    console.error("Error fetching pending users:", error);
    return [];
  }
};

// Approve or reject a user (only for verifier)
export const approveOrReject = async (userId, status) => {
  try {
    const response = await api.put(`/employees/verify/${userId}`, { status });
    return response.data;
  } catch (error) {
    console.error(`Error updating status for user ${userId}:`, error);
    throw error;
  }
};


//get all users approved by current verifier
export const getApprovedUsers = async()=>{
  try
  {
    const response = await api.get('/employees/approved-users')
    return response.data
  }
  catch(error)
  {
    console.error("Error fetching approved users", error)
    return [];
  }
}
