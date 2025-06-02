import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import EmployeeProjectsTable from '../components/EmployeeProjectsTable';
import { getCurrentUser, isAuthenticated } from '../services/authService';
import { getEmployeeSkills } from '../services/skillService';

const EmployeeDashboard = () => {
    const [skills, setSkills] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const user = getCurrentUser();
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated()) {
            navigate('/login');
            return;
        }

        const fetchSkills = async () => {
            try {
                if (!user || !user.id) {
                    console.error('No user ID found:', user);
                    setError('User not authenticated');
                    setLoading(false);
                    return;
                }

                console.log('Current user:', user); // Debug log
                console.log('Fetching skills for user:', user.id); // Debug log
                
                const skills = await getEmployeeSkills(user.id);
                console.log('Fetched skills:', skills); // Debug log

                if (Array.isArray(skills)) {
                    setSkills(skills);
                } else {
                    console.error('Invalid skills data:', skills);
                    throw new Error('Invalid response format from server');
                }
                
                setLoading(false);
            } catch (err) {
                console.error('Error in fetchSkills:', err);
                if (err.message === 'User not authenticated') {
                    navigate('/login');
                    return;
                }
                setError(err.message || 'Failed to fetch skills');
                setLoading(false);
            }
        };

        fetchSkills();
    }, [user, navigate]);

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

    if (!isAuthenticated()) {
        return <Alert variant="warning">Please log in to view your dashboard.</Alert>;
    }

    if (!user) {
        return <Alert variant="warning">Unable to load user data. Please try logging in again.</Alert>;
    }

    return (
        <Container>
            <h2 className="my-4">Employee Dashboard</h2>
            
            {error && (
                <Alert variant="danger" className="mb-4" dismissible onClose={() => setError(null)}>
                    {error}
                </Alert>
            )}

            <Row>
                <Col md={12} lg={4} className="mb-4">
                    <Card>
                        <Card.Header as="h5">My Profile</Card.Header>
                        <Card.Body>
                            <Card.Title>{user?.name}</Card.Title>
                            <Card.Text>
                                <strong>Email:</strong> {user?.email}<br />
                                <strong>Role:</strong> {user?.role}<br />
                                <strong>ID:</strong> {user?.id} {/* Debug info */}
                            </Card.Text>
                        </Card.Body>
                    </Card>

                    <Card className="mt-4">
                        <Card.Header as="h5">My Skills</Card.Header>
                        <Card.Body>
                            {loading ? (
                                <div className="text-center">
                                    <Spinner animation="border" size="sm" />
                                    <span className="ms-2">Loading skills...</span>
                                </div>
                            ) : error ? (
                                <Alert variant="danger">{error}</Alert>
                            ) : skills && skills.length > 0 ? (
                                <div>
                                    {skills.map((skill) => (
                                        <Card key={skill._id} className="mb-2">
                                            <Card.Body className="p-2">
                                                <div className="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <strong>{skill.skillName}</strong>
                                                        <Badge 
                                                            bg={getProficiencyBadgeVariant(skill.proficiencyLevel)}
                                                            className="ms-2"
                                                        >
                                                            {skill.proficiencyLevel}
                                                        </Badge>
                                                    </div>
                                                    <small className="text-muted">
                                                        {skill.experienceYears} years
                                                    </small>
                                                </div>
                                                {skill.skillDescription && (
                                                    <small className="text-muted d-block mt-1">
                                                        {skill.skillDescription}
                                                    </small>
                                                )}
                                                <div className="mt-1">
                                                    <Badge 
                                                        bg={skill.status === 'approved' ? 'success' : 
                                                           skill.status === 'rejected' ? 'danger' : 'warning'}
                                                        className="me-2"
                                                    >
                                                        {skill.status}
                                                    </Badge>
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <Alert variant="info">
                                    No skills added yet. Add skills to your profile to get them verified.
                                </Alert>
                            )}
                        </Card.Body>
                    </Card>
                </Col>

                <Col md={12} lg={8}>
                    <EmployeeProjectsTable />
                </Col>
            </Row>
        </Container>
    );
};

export default EmployeeDashboard; 
