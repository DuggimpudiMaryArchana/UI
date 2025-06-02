import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    Box,
    Chip,
    Alert,
    Autocomplete,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';

const ProjectAssignmentDialog = ({
    open,
    onClose,
    employees,
    projectDetails,
    setProjectDetails,
    error,
    setError,
    successMessage,
    setSuccessMessage,
    allSkills,
    onAssign
}) => {
    const handleClose = () => {
        onClose();
        setError('');
        setProjectDetails({
            name: '',
            description: '',
            startDate: '',
            endDate: '',
            requiredSkills: [],
            teamSize: 1,
            priority: 'Medium',
            status: 'Active',
            assignedEmployees: []
        });
    };

    // Initialize project details if they're empty
    React.useEffect(() => {
        if (open && (!projectDetails || Object.keys(projectDetails).length === 0)) {
            setProjectDetails({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                requiredSkills: [],
                teamSize: 1,
                priority: 'Medium',
                status: 'Active',
                assignedEmployees: []
            });
        }
    }, [open, projectDetails, setProjectDetails]);

    const handleSkillChange = (_, newValue) => {
        console.log('New skills selected:', newValue);
        setProjectDetails(prev => ({
            ...prev,
            requiredSkills: newValue
        }));
    };

    // Filter employees based on required skills
    const getAvailableEmployees = () => {
        if (!projectDetails.requiredSkills || projectDetails.requiredSkills.length === 0) {
            return employees;
        }

        return employees.filter(employee => {
            // Get all skills of the employee
            const employeeSkills = employee.approvedSkills?.map(skill => skill.skillName) || [];
            
            // Check if employee has all required skills
            return projectDetails.requiredSkills.every(requiredSkill => 
                employeeSkills.includes(requiredSkill)
            );
        });
    };

    // Handle employee selection
    const handleEmployeeSelect = (_, selectedEmployees) => {
        if (!selectedEmployees) return;

        // Convert selected employees to the required format
        const newAssignments = selectedEmployees.map(employee => ({
            employeeId: employee.id,
            name: employee.name,
            role: 'Team Member'
        }));

        setProjectDetails(prev => ({
            ...prev,
            assignedEmployees: newAssignments
        }));
    };

    // Get filtered employees
    const availableEmployees = getAvailableEmployees();

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
        >
            <DialogTitle>
                <Typography variant="h6">
                    Create New Project
                </Typography>
            </DialogTitle>
            <DialogContent dividers>
                <Grid container spacing={3}>
                    {error && (
                        <Grid item xs={12}>
                            <Alert 
                                severity="error" 
                                sx={{ mb: 2 }}
                                onClose={() => setError('')}
                            >
                                {error}
                            </Alert>
                        </Grid>
                    )}

                    {successMessage && (
                        <Grid item xs={12}>
                            <Alert 
                                severity="success" 
                                sx={{ mb: 2 }}
                                onClose={() => setSuccessMessage('')}
                            >
                                {successMessage}
                            </Alert>
                        </Grid>
                    )}

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="Project Name"
                            value={projectDetails?.name || ''}
                            onChange={(e) => setProjectDetails(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                            required
                            error={!projectDetails?.name}
                            helperText={!projectDetails?.name ? "Project name is required" : ""}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            multiline
                            rows={4}
                            label="Project Description"
                            value={projectDetails?.description || ''}
                            onChange={(e) => setProjectDetails(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                            required
                            error={!projectDetails?.description}
                            helperText={!projectDetails?.description ? "Project description is required" : ""}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            InputLabelProps={{ shrink: true }}
                            value={projectDetails?.startDate || ''}
                            onChange={(e) => setProjectDetails(prev => ({
                                ...prev,
                                startDate: e.target.value
                            }))}
                            required
                            error={!projectDetails?.startDate}
                            helperText={!projectDetails?.startDate ? "Start date is required" : ""}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            InputLabelProps={{ shrink: true }}
                            value={projectDetails?.endDate || ''}
                            onChange={(e) => setProjectDetails(prev => ({
                                ...prev,
                                endDate: e.target.value
                            }))}
                            required
                            error={!projectDetails?.endDate}
                            helperText={!projectDetails?.endDate ? "End date is required" : ""}
                        />
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                            <InputLabel>Priority</InputLabel>
                            <Select
                                value={projectDetails?.priority || 'Medium'}
                                onChange={(e) => setProjectDetails(prev => ({
                                    ...prev,
                                    priority: e.target.value
                                }))}
                                label="Priority"
                            >
                                <MenuItem value="Low">Low</MenuItem>
                                <MenuItem value="Medium">Medium</MenuItem>
                                <MenuItem value="High">High</MenuItem>
                                <MenuItem value="Urgent">Urgent</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <TextField
                            fullWidth
                            type="number"
                            label="Team Size"
                            value={projectDetails?.teamSize || 1}
                            onChange={(e) => setProjectDetails(prev => ({
                                ...prev,
                                teamSize: Math.max(1, parseInt(e.target.value) || 1)
                            }))}
                            InputProps={{ inputProps: { min: 1 } }}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Autocomplete
                            multiple
                            options={allSkills || []}
                            value={projectDetails?.requiredSkills || []}
                            onChange={handleSkillChange}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Required Skills"
                                    placeholder="Select skills"
                                    required
                                    error={!projectDetails?.requiredSkills?.length}
                                    helperText={!projectDetails?.requiredSkills?.length ? "At least one skill is required" : ""}
                                />
                            )}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Box sx={{ mb: 2 }}>
                            <Typography variant="subtitle1" gutterBottom>
                                Assign Team Members
                            </Typography>
                            {projectDetails.requiredSkills?.length > 0 && availableEmployees.length > 0 && (
                                <Button
                                    variant="outlined"
                                    size="small"
                                    onClick={() => {
                                        const allEmployees = availableEmployees.map(employee => ({
                                            employeeId: employee.id,
                                            name: employee.name,
                                            role: 'Team Member'
                                        }));
                                        setProjectDetails(prev => ({
                                            ...prev,
                                            assignedEmployees: allEmployees
                                        }));
                                    }}
                                    sx={{ mb: 2 }}
                                    disabled={projectDetails.assignedEmployees.length === availableEmployees.length}
                                >
                                    Assign All {availableEmployees.length} Filtered Employees
                                </Button>
                            )}
                        </Box>
                        <Autocomplete
                            multiple
                            options={availableEmployees}
                            getOptionLabel={(option) => option.name}
                            value={projectDetails.assignedEmployees.map(emp => 
                                availableEmployees.find(e => e.id === emp.employeeId)
                            ).filter(Boolean)}
                            onChange={handleEmployeeSelect}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Select Team Members"
                                    placeholder={
                                        projectDetails.requiredSkills?.length === 0
                                            ? "Please select required skills first"
                                            : availableEmployees.length === 0
                                                ? "No employees found with all required skills"
                                                : "Search and select multiple employees"
                                    }
                                    fullWidth
                                    required
                                    error={!projectDetails.assignedEmployees?.length}
                                    helperText={
                                        !projectDetails.assignedEmployees?.length 
                                            ? "At least one team member is required" 
                                            : `${availableEmployees.length} employee(s) available with selected skills`
                                    }
                                />
                            )}
                            disabled={projectDetails.requiredSkills?.length === 0}
                        />
                    </Grid>

                    {projectDetails.assignedEmployees?.length > 0 && (
                        <Grid item xs={12}>
                            <Box sx={{ 
                                mt: 2, 
                                p: 2, 
                                bgcolor: '#f8fafc',
                                borderRadius: 1,
                                border: '1px solid #e2e8f0'
                            }}>
                                <Typography variant="subtitle2" gutterBottom sx={{ color: '#475569' }}>
                                    Selected Team Members ({projectDetails.assignedEmployees.length}):
                                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {projectDetails.assignedEmployees.map((emp) => (
                                        <Chip
                                            key={emp.employeeId}
                                            label={emp.name}
                                            size="small"
                                            sx={{ 
                                                bgcolor: '#e3f2fd',
                                                color: '#1976d2',
                                                border: '1px solid #90caf9'
                                            }}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        </Grid>
                    )}
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={onAssign}
                    disabled={
                        !projectDetails?.name ||
                        !projectDetails?.description ||
                        !projectDetails?.startDate ||
                        !projectDetails?.endDate ||
                        !projectDetails?.requiredSkills?.length ||
                        !projectDetails?.assignedEmployees?.length ||
                        projectDetails.assignedEmployees.length > projectDetails.teamSize
                    }
                >
                    Create Project
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ProjectAssignmentDialog;
