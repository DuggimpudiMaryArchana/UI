const Employee =require('../models/employeeModel');
const Skill = require('../models/skillsModel');

//Get all regular Employees (exclude HR, verifiers, admins)
const getRegularEmployees = async(req,res)=>{
    try{
        console.log('Fetching regular employees...');
        
        // Strict filter for only role='employee' and status='approved'
        const employees = await Employee.find({
            role: 'employee',  // Only exact match for 'employee' role
            status: 'approved'
        })
        .select('name email experience status role')
        .sort({ name: 1 });
        
        console.log(`Found ${employees.length} regular employees`);
        console.log('Employee roles:', employees.map(emp => `${emp.name} (${emp.role})`));
        
        // Double-check to ensure only 'employee' roles are returned
        const filteredEmployees = employees.filter(emp => emp.role === 'employee');
        
        if (filteredEmployees.length !== employees.length) {
            console.warn(`Filtered out ${employees.length - filteredEmployees.length} non-employee records`);
        }
        
        res.status(200).json(filteredEmployees);
    }
    catch(error){
        console.error('Error fetching regular employees:', error);
        res.status(500).json({message: error.message});
    }
};

//Get all Employees (exclude password)
const getAllEmployees = async(req,res)=>{
    try{
        const employees = await Employee.find().select('-password');
        res.status(200).json(employees);
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
};

//Update Employee (promote or demote user by changing their role or other details)
const updateEmployee = async(req,res)=>{
    const {id} = req.params;
    const {role, status, ...otherUpdates} = req.body;
    try
    {
        const employee = await Employee.findById(id)
        if(!employee)
        {
            return res.status(404).json({message:"User not found"})
        }
        //Allow role update(promote/demote) only if provided
        if(role)
        {
            employee.role = role;
        }
        //optionally update status (approved, rejected , pending)
        if(status)
        {
            employee.status = status;
        }
        //update other fields if provided
        Object.assign(employee, otherUpdates);
        await employee.save();
        res.status(200).json({message:"User updated successfully", employee})
    }
    catch(error)
    {
        res.status(400).json({message : error.message})
    }
};

//Delete Employee
const deleteEmployee = async(req, res)=>{
    const {id} = req.params;
    try{
        await Employee.findByIdAndDelete(id);
        res.status(200).json({message:"Employee deleted"});
    }
    catch(error){
        res.status(400).json({message: error.message});
    }
};

//Create a new Employee
const createEmployee = async (req, res) => {
    const { name, email, password, experience, role } = req.body;
    try {

        const existingUser = await Employee.findOne({ email });
        if(existingUser){
            return res.status(400).json({ message: 'User with this email already exists!'});
        }
        let status = 'pending';
        if(role==='verifier' || role==='admin'){
            status='approved';
        }

        const newEmployee = new Employee({ name, email, password, experience:Number(experience) || 0, role, status });
        console.log(newEmployee)
        await newEmployee.save();
        res.status(200).json({ newEmployee });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

//verifier actions
const verifyUser = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // "approved" or "rejected"
  
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
  
    const user = await Employee.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });
  
    user.status = status;
    await user.save();
  
    res.json({ message: `User ${status} successfully.` });
  };

// Get all pending users (except verifiers)
const getPendingUsers = async (req, res) => {
    try {
        const pendingUsers = await Employee.find({ 
            status: 'pending', 
            role: { $ne: 'verifier' } 
        });
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: 'Server error while fetching pending users' });
    }
};

// Get all employees with their approved skills
const getEmployeesWithApprovedSkills = async (req, res) => {
    try {
        console.log('Fetching employees with approved skills...');
        
        // Get all regular employees (role='employee' and status='approved')
        const employees = await Employee.find({
            role: 'employee',
            status: 'approved'
        }, '-password').lean();
        
        console.log(`Found ${employees.length} regular employees`);

        // For each employee, get their approved skills
        const employeesWithSkills = await Promise.all(employees.map(async (employee) => {
            const approvedSkills = await Skill.find({
                employeeId: employee._id,
                status: 'approved'
            }).lean();

            console.log(`Found ${approvedSkills.length} approved skills for employee ${employee.name}`);

            return {
                ...employee,
                approvedSkills: approvedSkills || []
            };
        }));

        console.log('Successfully processed all employees with skills');
        
        res.status(200).json(employeesWithSkills);
    } catch (error) {
        console.error('Error fetching employees with skills:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        res.status(500).json({ 
            success: false,
            message: 'Error fetching employees data',
            error: error.message 
        });
    }
};

// Get specific employee's approved skills
const getEmployeeApprovedSkills = async (req, res) => {
    try {
        const { employeeId } = req.params;

        // Get employee details
        const employee = await Employee.findById(employeeId, '-password').lean();
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        // Get employee's approved skills
        const approvedSkills = await Skill.find({
            employeeId: employee._id,
            status: 'approved'
        }).lean();

        res.status(200).json({
            ...employee,
            approvedSkills
        });
    } catch (error) {
        console.error('Error fetching employee skills:', error);
        res.status(500).json({ message: 'Error fetching employee data' });
    }
};

//get all approved users by verifier
const getApprovedUsers = async(req, res)=>{
    try
    {
        const approvedUsers = await Employee.find({status : 'approved'})
            .select('_id name email role experience createdAt updatedAt')
        res.json(approvedUsers)
    }
    catch(error)
    {
        console.error("Error fetching approved users:", error);
        res.status(500).json({message : 'Server error while fetching approved users'})
    }
}

module.exports={
    getPendingUsers,verifyUser, getAllEmployees, getRegularEmployees, createEmployee, updateEmployee , deleteEmployee,
    getEmployeesWithApprovedSkills,
    getEmployeeApprovedSkills,
    getApprovedUsers 
};
