import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Box,
    IconButton,
    Avatar,
    CircularProgress,
    Alert,
    AvatarGroup,
    Tooltip,
    Stack
} from '@mui/material';
import {
    Person as PersonIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material';
import { getProjectAssignments } from '../services/projectService';

const ProjectAssignmentsTable = forwardRef(({ onError }, ref) => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAssignments = async () => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching project assignments...');
            const response = await getProjectAssignments();
            console.log('Project assignments response:', response);

            if (response.success) {
                console.log('Setting assignments:', response.data);
                setAssignments(response.data);
            } else {
                console.error('Failed to fetch assignments:', response.message);
                setError(response.message);
                onError?.(response.message || 'Failed to fetch project assignments');
            }
        } catch (error) {
            console.error('Error fetching project assignments:', error);
            setError(error.message || 'Failed to fetch project assignments');
            onError?.(error.message || 'Failed to fetch project assignments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('ProjectAssignmentsTable mounted, fetching assignments...');
        fetchAssignments();
    }, []);

    useImperativeHandle(ref, () => ({
        refreshAssignments: fetchAssignments
    }));

    const calculateProjectStatus = (startDate, endDate) => {
        const now = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (now < start) {
            return 'Pending';
        } else if (now > end) {
            return 'Completed';
        } else {
            return 'Active';
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'active':
                return {
                    color: '#2e7d32',
                    bgcolor: '#e8f5e9',
                    borderColor: '#a5d6a7'
                };
            case 'pending':
                return {
                    color: '#ed6c02',
                    bgcolor: '#fff4e5',
                    borderColor: '#ffb74d'
                };
            case 'completed':
                return {
                    color: '#1976d2',
                    bgcolor: '#e3f2fd',
                    borderColor: '#90caf9'
                };
            default:
                return {
                    color: '#757575',
                    bgcolor: '#f5f5f5',
                    borderColor: '#e0e0e0'
                };
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert 
                    severity="error" 
                    action={
                        <IconButton
                            color="inherit"
                            size="small"
                            onClick={fetchAssignments}
                        >
                            <RefreshIcon />
                        </IconButton>
                    }
                >
                    {error}
                </Alert>
            </Box>
        );
    }

    if (!assignments || assignments.length === 0) {
        return (
            <TableContainer component={Paper} sx={{ mt: 2 }}>
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography variant="h6" color="textSecondary">
                        No projects assigned yet
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                        Projects will appear here once they are assigned.
                    </Typography>
                    <IconButton
                        onClick={fetchAssignments}
                        sx={{ mt: 2 }}
                        color="primary"
                    >
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </TableContainer>
        );
    }

    return (
        <TableContainer 
            component={Paper} 
            sx={{ 
                mt: 2,
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                '& .MuiTable-root': {
                    borderCollapse: 'separate',
                    borderSpacing: '0'
                }
            }}
        >
            <Box 
                sx={{ 
                    p: 3, 
                    background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <Typography 
                    variant="h6" 
                    sx={{ 
                        color: '#fff',
                        fontWeight: 600,
                        fontSize: '1.25rem',
                        textShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                >
                    Project Assignments
                </Typography>
                <Tooltip title="Refresh projects">
                    <IconButton 
                        onClick={fetchAssignments} 
                        size="small"
                        sx={{
                            color: 'white',
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.2)'
                            },
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
            </Box>
            <Table>
                <TableHead>
                    <TableRow
                        sx={{
                            '& th': {
                                backgroundColor: '#f8fafc',
                                borderBottom: '2px solid #e9ecef',
                                color: '#1e293b',
                                fontSize: '0.875rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                padding: '16px'
                            }
                        }}
                    >
                        <TableCell>Project Name</TableCell>
                        <TableCell>Team Members</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Timeline</TableCell>
                        <TableCell>Priority</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Required Skills</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {assignments.map((project) => (
                        <TableRow
                            key={project._id}
                            sx={{ 
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    backgroundColor: '#f8fafc',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                },
                                '& td': {
                                    borderBottom: '1px solid #e9ecef',
                                    padding: '16px',
                                    fontSize: '0.875rem'
                                }
                            }}
                        >
                            <TableCell>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 500,
                                        color: '#1e293b'
                                    }}
                                >
                                    {project.name}
                                </Typography>
                                {project.description && (
                                    <Typography 
                                        variant="caption" 
                                        color="textSecondary" 
                                        display="block"
                                        sx={{ mt: 0.5 }}
                                    >
                                        {project.description}
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {project.assignedEmployees && project.assignedEmployees.length > 0 ? (
                                        <>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                                <AvatarGroup 
                                                    max={3}
                                                    sx={{
                                                        '& .MuiAvatar-root': {
                                                            width: 24,
                                                            height: 24,
                                                            fontSize: '0.75rem',
                                                            bgcolor: '#1976d2'
                                                        }
                                                    }}
                                                >
                                                    {project.assignedEmployees.map((employee) => (
                                                        <Avatar 
                                                            key={employee.employeeId}
                                                            sx={{ bgcolor: '#1976d2' }}
                                                        >
                                                            {employee.name.charAt(0)}
                                                        </Avatar>
                                                    ))}
                                                </AvatarGroup>
                                                <Typography 
                                                    variant="caption" 
                                                    sx={{ color: '#64748b' }}
                                                >
                                                    {project.assignedEmployees.length} {project.assignedEmployees.length === 1 ? 'member' : 'members'}
                                                </Typography>
                                            </Box>
                                            <Box 
                                                sx={{ 
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: 0.5,
                                                    pl: 1,
                                                    borderLeft: '2px solid #e2e8f0'
                                                }}
                                            >
                                                {project.assignedEmployees.map((employee, index) => (
                                                    <Box 
                                                        key={employee.employeeId}
                                                        sx={{ 
                                                            display: 'flex', 
                                                            alignItems: 'center',
                                                            gap: 1,
                                                            p: 0.75,
                                                            borderRadius: '4px',
                                                            bgcolor: 'rgba(25, 118, 210, 0.04)',
                                                            '&:hover': {
                                                                bgcolor: 'rgba(25, 118, 210, 0.08)'
                                                            }
                                                        }}
                                                    >
                                                        <Typography 
                                                            variant="body2"
                                                            sx={{ 
                                                                fontWeight: 500,
                                                                color: '#1e293b'
                                                            }}
                                                        >
                                                            {employee.name}
                                                        </Typography>
                                                        <Typography 
                                                            variant="caption"
                                                            sx={{ 
                                                                color: '#64748b',
                                                                bgcolor: 'rgba(100, 116, 139, 0.1)',
                                                                px: 1,
                                                                py: 0.25,
                                                                borderRadius: '4px'
                                                            }}
                                                        >
                                                            {employee.role}
                                                        </Typography>
                                                    </Box>
                                                ))}
                                            </Box>
                                        </>
                                    ) : (
                                        <Typography 
                                            variant="caption" 
                                            sx={{ color: '#94a3b8' }}
                                        >
                                            No team members assigned
                                        </Typography>
                                    )}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Typography 
                                    variant="body2"
                                    sx={{ color: '#475569' }}
                                >
                                    {project.description}
                                </Typography>
                            </TableCell>
                            <TableCell>
                                <Box>
                                    <Typography variant="body2" sx={{ color: '#1e293b' }}>
                                        Start: {formatDate(project.startDate)}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#1e293b', mt: 0.5 }}>
                                        End: {formatDate(project.endDate)}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={project.priority}
                                    size="small"
                                    color={
                                        project.priority === 'High' ? 'error' :
                                        project.priority === 'Medium' ? 'warning' :
                                        'success'
                                    }
                                    sx={{ 
                                        height: '24px',
                                        fontSize: '0.75rem'
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={calculateProjectStatus(project.startDate, project.endDate)}
                                    size="small"
                                    sx={{ 
                                        height: '24px',
                                        fontSize: '0.75rem',
                                        ...getStatusColor(calculateProjectStatus(project.startDate, project.endDate))
                                    }}
                                />
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {project.requiredSkills?.map((skill, index) => (
                                        <Chip
                                            key={index}
                                            label={typeof skill === 'string' ? skill : skill.skillName}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                            sx={{ 
                                                height: '24px',
                                                fontSize: '0.75rem'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
});

export default ProjectAssignmentsTable;
