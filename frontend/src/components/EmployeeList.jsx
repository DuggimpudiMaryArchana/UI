import React, { useState, useEffect } from 'react';
import { Table, Card, Badge, Button, Spinner, Alert, Collapse } from 'react-bootstrap';
import { getAllRegularEmployees } from '../services/employeeService';
import { getEmployeeSkills } from '../services/skillService';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedEmployee, setExpandedEmployee] = useState(null);

    useEffect(() => {
        fetchEmployeesWithSkills();
    }, []);

    const fetchEmployeesWithSkills = async () => {
        try {
            setLoading(true);
            // Get only regular employees
            const regularEmployees = await getAllRegularEmployees();
            console.log('Regular employees before processing:', regularEmployees);

            // Strict filter - only role='employee'
            const onlyEmployees = regularEmployees.filter(emp => emp.role === 'employee');
            
            if (onlyEmployees.length !== regularEmployees.length) {
                console.warn(`Filtered out ${regularEmployees.length - onlyEmployees.length} non-employee records`);
                console.warn('Removed roles:', 
                    regularEmployees
                        .filter(emp => emp.role !== 'employee')
                        .map(emp => `${emp.name} (${emp.role})`));
            }

            // Fetch skills for each employee
            const employeesWithSkills = await Promise.all(
                onlyEmployees.map(async (employee) => {
                    try {
                        const skills = await getEmployeeSkills(employee._id);
                        return {
                            ...employee,
                            skills: skills.filter(skill => skill.status === 'approved')
                        };
                    } catch (err) {
                        console.error(`Error fetching skills for employee ${employee._id}:`, err);
                        return {
                            ...employee,
                            skills: []
                        };
                    }
                })
            );

            console.log('Final processed employees:', employeesWithSkills);
            setEmployees(employeesWithSkills);
            setError(null);
        } catch (err) {
            console.error('Error fetching employees:', err);
            setError(err.message || 'Failed to fetch employees');
        } finally {
            setLoading(false);
        }
    };

    const getProficiencyBadgeVariant = (level) => {
        switch (level) {
            case 'Beginner':
                return 'info';
            case 'Intermediate':
                return 'primary';
            case 'Expert':
                return 'success';
            default:
                return 'secondary';
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-4">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading employees...</span>
                </Spinner>
            </div>
        );
    }

    if (error) {
        return (
            <Alert variant="danger" className="mt-4">
                {error}
            </Alert>
        );
    }

    if (!employees.length) {
        return (
            <Alert variant="info" className="mt-4">
                No regular employees found in the system.
            </Alert>
        );
    }

    return (
        <Card className="mt-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Regular Employees List</h5>
                <small className="text-muted">
                    Showing {employees.length} employee{employees.length !== 1 ? 's' : ''}
                </small>
            </Card.Header>
            <Card.Body>
                <Table responsive striped bordered hover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Experience</th>
                            <th>Approved Skills</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {employees.map((employee) => (
                            <React.Fragment key={employee._id}>
                                <tr>
                                    <td>{employee.name}</td>
                                    <td>{employee.email}</td>
                                    <td>{employee.experience} years</td>
                                    <td>
                                        {employee.skills?.length > 0 ? (
                                            <>
                                                {employee.skills.slice(0, 3).map((skill) => (
                                                    <Badge
                                                        key={skill._id}
                                                        bg={getProficiencyBadgeVariant(skill.proficiencyLevel)}
                                                        className="me-1 mb-1"
                                                    >
                                                        {skill.skillName}
                                                    </Badge>
                                                ))}
                                                {employee.skills.length > 3 && (
                                                    <Badge bg="secondary" className="me-1">
                                                        +{employee.skills.length - 3} more
                                                    </Badge>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-muted">No approved skills</span>
                                        )}
                                    </td>
                                    <td>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            className="me-2"
                                            onClick={() => setExpandedEmployee(
                                                expandedEmployee === employee._id ? null : employee._id
                                            )}
                                        >
                                            {expandedEmployee === employee._id ? 'Hide Details' : 'View Details'}
                                        </Button>
                                    </td>
                                </tr>
                                <tr>
                                    <td colSpan="5" className="p-0">
                                        <Collapse in={expandedEmployee === employee._id}>
                                            <div className="p-3">
                                                <h6>All Approved Skills:</h6>
                                                {employee.skills?.length > 0 ? (
                                                    <Table size="sm" className="mt-2">
                                                        <thead>
                                                            <tr>
                                                                <th>Skill</th>
                                                                <th>Proficiency</th>
                                                                <th>Experience</th>
                                                                <th>Description</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {employee.skills.map((skill) => (
                                                                <tr key={skill._id}>
                                                                    <td>{skill.skillName}</td>
                                                                    <td>
                                                                        <Badge bg={getProficiencyBadgeVariant(skill.proficiencyLevel)}>
                                                                            {skill.proficiencyLevel}
                                                                        </Badge>
                                                                    </td>
                                                                    <td>{skill.experienceYears} years</td>
                                                                    <td>{skill.skillDescription || '-'}</td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </Table>
                                                ) : (
                                                    <p className="text-muted mb-0">No approved skills available.</p>
                                                )}
                                            </div>
                                        </Collapse>
                                    </td>
                                </tr>
                            </React.Fragment>
                        ))}
                    </tbody>
                </Table>
            </Card.Body>
        </Card>
    );
};

export default EmployeeList; 
