import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Spinner, Alert } from 'react-bootstrap';
import { getAllProjects } from '../services/projectService';
import { getAllRegularEmployees } from '../services/employeeService';

const EmployeeProjectAssignmentsTable = () => {
    const [employeeProjects, setEmployeeProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Get only regular employees and all projects
                const [projectsResponse, employees] = await Promise.all([
                    getAllProjects(),
                    getAllRegularEmployees()
                ]);

                console.log('Fetched employees:', employees);
                console.log('Fetched projects:', projectsResponse);

                // Create a map of employee assignments (only for regular employees)
                const employeeAssignments = employees.map(employee => {
                    const assignedProjects = projectsResponse.data.filter(project =>
                        project.assignedEmployees.some(
                            assignment => assignment.employeeId._id === employee._id
                        )
                    );

                    return {
                        _id: employee._id,
                        name: employee.name,
                        email: employee.email,
                        experience: employee.experience,
                        projects: assignedProjects.map(project => ({
                            projectId: project._id,
                            projectName: project.name,
                            role: project.assignedEmployees.find(
                                a => a.employeeId._id === employee._id
                            ).role,
                            status: project.status,
                            startDate: project.startDate,
                            endDate: project.endDate
                        }))
                    };
                });

                console.log('Processed employee assignments:', employeeAssignments);
                setEmployeeProjects(employeeAssignments);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError(err.message || 'Failed to fetch data');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const getStatusBadgeVariant = (status) => {
        switch (status) {
            case 'Not Started':
                return 'secondary';
            case 'In Progress':
                return 'primary';
            case 'Completed':
                return 'success';
            case 'On Hold':
                return 'warning';
            default:
                return 'info';
        }
    };

    if (loading) return (
        <div className="text-center mt-4">
            <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading project assignments...</span>
            </Spinner>
        </div>
    );
    
    if (error) return (
        <Alert variant="danger" className="mt-4">
            Error loading project assignments: {error}
        </Alert>
    );

    if (employeeProjects.length === 0) {
        return (
            <Alert variant="info" className="mt-4">
                No regular employees found in the system.
            </Alert>
        );
    }

    return (
        <Card className="mt-4">
            <Card.Header as="h5">Employee Project Assignments</Card.Header>
            <Card.Body>
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Employee Name</th>
                            <th>Email</th>
                            <th>Experience</th>
                            <th>Assigned Projects</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employeeProjects.map((employee) => (
                            <tr key={employee._id}>
                                <td>{employee.name}</td>
                                <td>{employee.email}</td>
                                <td>{employee.experience} years</td>
                                <td>
                                    {employee.projects.length > 0 ? (
                                        <Table size="sm" className="mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Project</th>
                                                    <th>Role</th>
                                                    <th>Status</th>
                                                    <th>Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {employee.projects.map((project, idx) => (
                                                    <tr key={`${employee._id}-${project.projectId}`}>
                                                        <td>{project.projectName}</td>
                                                        <td>{project.role}</td>
                                                        <td>
                                                            <Badge bg={getStatusBadgeVariant(project.status)}>
                                                                {project.status}
                                                            </Badge>
                                                        </td>
                                                        <td>
                                                            {new Date(project.startDate).toLocaleDateString()}
                                                            {' - '}
                                                            {new Date(project.endDate).toLocaleDateString()}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    ) : (
                                        <span className="text-muted">No projects assigned</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default EmployeeProjectAssignmentsTable; 
