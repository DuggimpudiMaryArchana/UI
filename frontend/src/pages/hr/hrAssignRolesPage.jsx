import React , { useEffect , useState } from 'react';
import axios from 'axios';

const AssignRoles =()=>{
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    //Fetch employees from backend on component mount
    useEffect(()=>{
        const fetchEmployees = async()=>{
            try{
                const response = await axios.get('/api/employees'); //the API route
                setEmployees(response.data);
            }
            catch(error){
                console.error('Error fetching employees:', error);
            }
            finally{
                setLoading(false);
            }
        };
        fetchEmployees();
    },[]);

    const handleAssign = async(id, team)=>{
        try{
            await axios.put(`/api/employees/${id}/assign-team`,{team});
            alert(`Assigned ${team} to employee ID ${id}`);

            //Refreshing the employee list
            setEmployees((prev)=> 
            prev.map((emp)=> emp.id === id? {...emp, currentTeam: team}: emp));
        }
    catch(error){
        console.error('Error assigning team :', error);
    }
};
 if(loading) return <div style={{ padding:'5rem', textAlign:'center', fontSize:'1.5rem'}}>Loading...</div>;
 return(
    <div style={{ minHeight:'100vh', background:'linear-gradient(to-right, #e0f7fa, #ffffff)', padding:'2rem 0'}}>
        <div className="container">
            <div style={{ backgroundColor: '#007bff', color:'white',
                padding:'1.5rem 2rem', borderRadius:'10px',
                marginBottom:'2rem', boxShadow:'0 4px 10px rgba(0,0,0,0.2)', textAlign:'center'
            }}>
                <h2 className="fw-bold mb-0">Assign Employees to Teams</h2>
                <p className="mb-0" style={{ fontSize:'1.1rem'}}>
                    Organize your workforce by assigning them to the right teams.
                </p>
            </div>
            <table className="table table-hover shadow-sm"
            style={{ backgroundColor:'white',
                borderRadius:'8px',
                overflow:'hidden'
            }}>
                <thead style={{
                    backgroundColor:'#0d6efd',
                    color:'white'
                }}>
                    <tr>
                        <th>Name</th>
                        <th>Current Team</th>
                        <th>Assign To</th>
                    </tr>
                </thead>
                <tbody>
                    {employees.map((emp)=>(
                        <tr key={emp._id}>
                            <td style={{ fontWeight:'500'}}>{emp.name}</td>
                            <td>
                                {emp.currentTeam ? (
                                    <span style={{ padding:'4px 8px',
                                        borderRadius:'5px',
                                        backgroundColor:'#e2f0fb',
                                        color:'#007bff',
                                        fontWeight:'500'
                                    }}>{emp.currentTeam}</span>):(
                                        <span style={{color:'#888'}}>None</span>
                                )}
                            </td>
                            <td>
                                <select className="form-select" defaultValue=""
                                style={{
                                    borderColor:'#007bff',
                                    color:'#007bff',
                                    fontWeight:'500'
                                }} onChange={(e)=>
                                    e.target.value && handleAssign(emp._id, e.target.value)
                                }>
                                    <option value="" disabled>
                                        Select Team
                                    </option>
                                    <option value="Frontend">Frontend</option>
                                    <option value="Backend">Backend</option>
                                    <option value="Data">Data</option>
                                </select>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
 );
};

export default AssignRoles;
