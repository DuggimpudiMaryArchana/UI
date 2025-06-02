import React, { useState, useEffect } from 'react';
import {
    Table,
    Paper,
    TableContainer,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    Chip,
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { getEmployeeProjects } from '../services/projectService';

const EmployeeProjectsTable = ({ employeeId }) => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProjects();
    }, [employeeId]);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            
            console.log('Fetching projects for employee:', employeeId);
            const response = await getEmployeeProjects(employeeId);
            console.log('Projects response:', response);

            if (!response.success) {
                throw new Error(response.message || 'Failed to fetch projects');
            }

            setProjects(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError(error.message || 'Failed to fetch assigned projects');
            setProjects([]);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert 
                severity="error" 
                sx={{ m: 2 }}
                action={
                    <Chip
                        label="Retry"
                        color="error"
                        variant="outlined"
                        onClick={fetchProjects}
                        sx={{ cursor: 'pointer' }}
                    />
                }
            >
                {error}
            </Alert>
        );
    }

    if (projects.length === 0) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                No projects assigned yet.
            </Alert>
        );
    }

    return (
        <TableContainer component={Paper} sx={{ mt: 3, mb: 3 }}>
            <Table>
                <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>Project Name</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Timeline</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Priority</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Required Skills</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }}>Team Size</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {projects.map((project) => (
                        <TableRow 
                            key={project.id}
                            sx={{
                                '&:nth-of-type(odd)': { backgroundColor: '#fafafa' },
                                '&:last-child td, &:last-child th': { border: 0 }
                            }}
                        >
                            <TableCell>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                    {project.name}
                                </Typography>
                                {project.description && (
                                    <Typography variant="caption" color="textSecondary" display="block">
                                        {project.description}
                                    </Typography>
                                )}
                            </TableCell>
                            <TableCell>
                                <Box>
                                    <Typography variant="body2">
                                        Start: {new Date(project.startDate).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="body2">
                                        End: {new Date(project.endDate).toLocaleDateString()}
                                    </Typography>
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={project.priority}
                                    color={
                                        project.priority === 'High' ? 'error' :
                                        project.priority === 'Medium' ? 'warning' :
                                        'success'
                                    }
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                                    {project.requiredSkills.map((skill, idx) => (
                                        <Chip
                                            key={idx}
                                            label={skill.skillName || skill}
                                            size="small"
                                            variant="outlined"
                                            color="primary"
                                        />
                                    ))}
                                </Box>
                            </TableCell>
                            <TableCell>
                                <Chip
                                    label={project.status.label}
                                    color={project.status.color}
                                    size="small"
                                />
                            </TableCell>
                            <TableCell>
                                <Chip 
                                    label={`${project.currentTeamCount}/${project.teamSize}`}
                                    color={
                                        project.currentTeamCount >= project.teamSize 
                                            ? 'success' 
                                            : 'warning'
                                    }
                                    size="small"
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default EmployeeProjectsTable; 
