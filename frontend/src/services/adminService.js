import api from './api';

//get all users employees, hrs and verifiers;
export const getAllEmployees = async()=>{
    try
    {
        const response = await api.get('/employees/admin/all-users');
        return response.data;
    }
    catch(error)
    {
        console.error("Error fetching employees", error);
        throw error;
    }
}

export const updateEmployee = async(id, data)=>{
    try
    {
        const response =await api.put(`/employees/admin/update-user/${id}`, data);
        return response.data;
    }
    catch(error)
    {
        console.error("Error updating employee with id"+id+":"+error);
        throw error;
    }
}

export const deleteEmployee = async(id)=>{
    try
    {
        const response = await api.delete(`/employees/admin/delete-user/${id}`);
        return response.data;
    }
    catch(error)
    {
        console.error(`Error deleting employee with id:${id}:`, error)
        throw error;
    }
}
