import React from 'react';
import { Container } from 'react-bootstrap';
import EmployeeList from '../components/EmployeeList';
import EmployeeProjectAssignmentsTable from '../components/EmployeeProjectAssignmentsTable';

const HRDashboard = () => {
    return (
        <Container>
            <h2 className="my-4">HR Dashboard</h2>
            
            {/* Employee List showing only regular employees */}
            <EmployeeList />
            
            {/* Project Assignments Table */}
            <EmployeeProjectAssignmentsTable />
        </Container>
    );
};

export default HRDashboard; 
