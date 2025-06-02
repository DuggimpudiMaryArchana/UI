// src/services/skillService.js
import api from './api';
import { getAuthHeader } from './authService';

const API_URL = '/skills';

// Get all skills for an employee
export const getEmployeeSkills = async (employeeId) => {
  try {
    console.log('Fetching skills for employee:', employeeId);
    const response = await api.get(`${API_URL}/${employeeId}`);
    console.log('Skills response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching skills:', error.response || error);
    throw error.response?.data?.message || error.message;
  }
};

// Add a new skill with file upload
export const addSkill = async (employeeId, skillData) => {
  try {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('employeeId', employeeId);
    formData.append('skillName', skillData.skillName);
    formData.append('skillDescription', skillData.skillDescription || '');
    formData.append('proficiencyLevel', skillData.proficiencyLevel);
    formData.append('experienceYears', skillData.experienceYears);

    // Handle certificate file
    if (skillData.certificateFile) {
      formData.append('certificateFile', skillData.certificateFile);
    }

    // Handle project links
    if (skillData.projectLinks && skillData.projectLinks.length > 0) {
      formData.append('projectLinks', JSON.stringify(skillData.projectLinks));
    }

    console.log('Adding skill with data:', {
      employeeId,
      skillName: skillData.skillName,
      proficiencyLevel: skillData.proficiencyLevel,
      experienceYears: skillData.experienceYears,
      hasFile: !!skillData.certificateFile
    });

    const response = await api.post(API_URL, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Add skill response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in addSkill:', error.response || error);
    throw error.response?.data?.message || error.message;
  }
};

// Update a skill with optional file upload
export const updateSkill = async (skillId, skillData) => {
  try {
    const formData = new FormData();
    
    // Add basic fields
    formData.append('skillName', skillData.skillName);
    formData.append('skillDescription', skillData.skillDescription || '');
    formData.append('proficiencyLevel', skillData.proficiencyLevel);
    formData.append('experienceYears', skillData.experienceYears);

    // Handle certificate file
    if (skillData.certificateFile instanceof File) {
      formData.append('certificateFile', skillData.certificateFile);
    }

    // Handle project links
    if (skillData.projectLinks && skillData.projectLinks.length > 0) {
      formData.append('projectLinks', JSON.stringify(skillData.projectLinks));
    }

    console.log('Updating skill with data:', {
      skillId,
      skillName: skillData.skillName,
      proficiencyLevel: skillData.proficiencyLevel,
      experienceYears: skillData.experienceYears,
      hasFile: skillData.certificateFile instanceof File
    });

    const response = await api.put(`${API_URL}/${skillId}`, formData, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'multipart/form-data'
      }
    });
    
    console.log('Update skill response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in updateSkill:', error.response || error);
    throw error.response?.data?.message || error.message;
  }
};

// Delete a skill
export const deleteSkill = async (skillId) => {
  try {
    const response = await api.delete(`${API_URL}/${skillId}`);
    return response.data;
  } catch (error) {
    console.error('Error in deleteSkill:', error.response || error);
    throw error.response?.data?.message || error.message;
  }
};

// Get all skills pending verification
export const getAllPendingSkills = async () => {
  try {
    console.log('Fetching pending skills');
    const response = await api.get(`${API_URL}/pending`);
    console.log('Pending skills response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in getAllPendingSkills:', error.response || error);
    throw error.response?.data?.message || error.message;
  }
};

// Approve a skill
export const approveSkill = async (skillId) => {
  try {
    const response = await api.patch(`${API_URL}/${skillId}/approve`);
    console.log('Approve skill response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in approveSkill:', error.response || error);
    throw error.response?.data?.message || error.message;
  }
};

// Reject a skill
export const rejectSkill = async (skillId) => {
  try {
    const response = await api.patch(`${API_URL}/${skillId}/reject`);
    console.log('Reject skill response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error in rejectSkill:', error.response || error);
    throw error.response?.data?.message || error.message;
  }
};
