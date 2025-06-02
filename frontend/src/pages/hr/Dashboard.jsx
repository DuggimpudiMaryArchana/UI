import React, { useState, useEffect, useRef } from 'react';
import { getCurrentUser } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { getEmployeesWithApprovedSkills } from '../../services/hrService';
import { createProject, getProjectAssignments } from '../../services/projectService';
import ProjectAssignmentDialog from '../../components/ProjectAssignmentDialog';
import {
    Box,
    Container,
    Typography,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    IconButton,
    ThemeProvider,
    createTheme,
    CssBaseline,
    CircularProgress,
    Card,
    CardContent,
    Grid,
    Alert,
    TextField,
    MenuItem,
    Autocomplete,
    FormControl,
    InputLabel,
    Select,
    Snackbar,
    AlertTitle,
    Collapse,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
} from '@mui/material';
import {
    Visibility as ViewIcon,
    CheckCircle as VerifiedIcon,
    Star as ProficiencyIcon,
    Work as ExperienceIcon,
    Description as CertificateIcon,
    Link as LinkIcon,
    Close as CloseIcon,
    Logout as LogoutIcon,
    FilterList as FilterIcon,
    Sort as SortIcon,
    Add as AddIcon,
    KeyboardArrowDown as ExpandMoreIcon,
    KeyboardArrowUp as ExpandLessIcon,
    Person as PersonIcon,
    Email as EmailIcon,
    Work as WorkIcon,
} from '@mui/icons-material';
import ProjectAssignmentsTable from '../../components/ProjectAssignmentsTable';

// Create light theme to match other dashboards
const lightTheme = createTheme({
    palette: {
        mode: 'light',
        primary: {
            main: '#1976d2',
            light: '#42a5f5',
            dark: '#1565c0',
        },
        secondary: {
            main: '#9c27b0',
            light: '#ba68c8',
            dark: '#7b1fa2',
        },
        background: {
            default: '#f5f5f5',
            paper: '#ffffff',
        },
        success: {
            main: '#66bb6a',
        }
    },
    typography: {
        fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
        h5: {
            fontWeight: 600,
            letterSpacing: '0.01em',
        },
        button: {
            fontWeight: 600,
            letterSpacing: '0.02em',
        }
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    textTransform: 'none',
                    fontWeight: 600,
                    padding: '8px 20px',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                        transform: 'translateY(-2px)',
                    },
                },
            }
        },
    }
});

const HRDashboard = () => {
    const name = localStorage.getItem('name');
    const role = localStorage.getItem('role');
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [error, setError] = useState('');

    // Filter and sort states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [proficiencyFilter, setProficiencyFilter] = useState('all');
    const [experienceFilter, setExperienceFilter] = useState(0);
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState('asc');
    const [allSkills, setAllSkills] = useState([]);

    // Add project assignment states
    const [openProjectDialog, setOpenProjectDialog] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [projectDetails, setProjectDetails] = useState({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        requiredSkills: [],
        teamSize: 1,
        priority: 'Medium',
        assignedEmployees: []
    });

    // Add Snackbar states
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');

    // Add project assignments state
    const [projectAssignments, setProjectAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [expandedRows, setExpandedRows] = useState(new Set());

    // Add ref for ProjectAssignmentsTable
    const projectAssignmentsRef = useRef(null);

    // Get current greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Fetch approved employees
    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching employees...'); // Debug log
            const response = await getEmployeesWithApprovedSkills();
            console.log('Response received:', response); // Debug log
            
            if (!response.success) {
                throw new Error(response.message);
            }

            if (!Array.isArray(response.data)) {
                console.error('Invalid data format:', response.data);
                throw new Error('Invalid data format received from server');
            }
            
            // Transform the data to match the expected format
            const transformedData = response.data.map(employee => {
                console.log('Processing employee:', employee); // Debug log
                return {
                    id: employee._id,
                    name: employee.name,
                    email: employee.email,
                    department: employee.department || 'Not Assigned',
                    role: employee.role || 'employee',
                    approvedSkills: Array.isArray(employee.approvedSkills) 
                        ? employee.approvedSkills.map(skill => ({
                            skillName: skill.skillName,
                            proficiencyLevel: skill.proficiencyLevel,
                            experienceYears: skill.experienceYears,
                            certificateFileUrl: skill.certificateFileUrl,
                            projectLinks: skill.projectLinks || []
                        }))
                        : []
                };
            });
            
            console.log('Transformed data:', transformedData); // Debug log
            setEmployees(transformedData);

            // Extract unique skills from all employees
            const skillSet = new Set();
            transformedData.forEach(employee => {
                if (Array.isArray(employee.approvedSkills)) {
                    employee.approvedSkills.forEach(skill => {
                        if (skill.skillName) {
                            skillSet.add(skill.skillName);
                        }
                    });
                }
            });
            const uniqueSkills = Array.from(skillSet);
            console.log('Extracted skills:', uniqueSkills); // Debug log
            setAllSkills(uniqueSkills);
        } catch (error) {
            console.error('Error fetching employees:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                response: error.response
            });
            setError(error.message || 'Failed to fetch employees. Please try again later.');
            setEmployees([]);
            setAllSkills([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch project assignments
    useEffect(() => {
        fetchProjectAssignments();
    }, []);

    const fetchProjectAssignments = async () => {
        try {
            setLoadingAssignments(true);
            const response = await getProjectAssignments();
            setProjectAssignments(response.data || []);
        } catch (error) {
            console.error('Error fetching project assignments:', error);
        } finally {
            setLoadingAssignments(false);
        }
    };

    // Filter and sort functions
    const getFilteredAndSortedEmployees = () => {
        return employees
            .filter(employee => {
                // Filter by role
                if (employee.role !== 'employee') return false;

                // Filter by search term
                const matchesSearch = 
                    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    employee.email.toLowerCase().includes(searchTerm.toLowerCase());
                if (!matchesSearch) return false;

                // Filter by selected skills
                const matchesSkills = 
                    selectedSkills.length === 0 ||
                    selectedSkills.every(skill => 
                        employee.approvedSkills.some(empSkill => empSkill.skillName === skill)
                    );
                if (!matchesSkills) return false;

                // Filter by proficiency
                if (proficiencyFilter !== 'all') {
                    const hasRequiredProficiency = employee.approvedSkills.some(
                        skill => skill.proficiencyLevel === proficiencyFilter
                    );
                    if (!hasRequiredProficiency) return false;
                }

                // Filter by experience
                if (experienceFilter > 0) {
                    const hasRequiredExperience = employee.approvedSkills.some(
                        skill => skill.experienceYears >= experienceFilter
                    );
                    if (!hasRequiredExperience) return false;
                }

                return true;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'name':
                        return sortOrder === 'asc' 
                            ? a.name.localeCompare(b.name)
                            : b.name.localeCompare(a.name);
                    case 'experience':
                        const maxExpA = Math.max(...a.approvedSkills.map(s => s.experienceYears));
                        const maxExpB = Math.max(...b.approvedSkills.map(s => s.experienceYears));
                        return sortOrder === 'asc' 
                            ? maxExpA - maxExpB
                            : maxExpB - maxExpA;
                    case 'skillCount':
                        return sortOrder === 'asc'
                            ? a.approvedSkills.length - b.approvedSkills.length
                            : b.approvedSkills.length - a.approvedSkills.length;
                    default:
                        return 0;
                }
            });
    };

    const handleViewDetails = (employee) => {
        setSelectedEmployee(employee);
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedEmployee(null);
    };

    const handleAssignRoles = () => {
        navigate('/hr/assign-roles');
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    const handleAssignProject = async () => {
        try {
            setError('');
            setSuccessMessage('');

            if (!projectDetails.assignedEmployees?.length) {
                setError('At least one employee must be selected');
                return;
            }

            // Validate form fields
            const validationErrors = [];
            if (!projectDetails.name?.trim()) validationErrors.push('Project name is required');
            if (!projectDetails.description?.trim()) validationErrors.push('Project description is required');
            if (!projectDetails.startDate) validationErrors.push('Start date is required');
            if (!projectDetails.endDate) validationErrors.push('End date is required');
            if (!projectDetails.requiredSkills?.length) validationErrors.push('At least one skill is required');

            if (validationErrors.length > 0) {
                setError(validationErrors.join(', '));
                return;
            }

            // Validate dates
            const startDate = new Date(projectDetails.startDate);
            const endDate = new Date(projectDetails.endDate);
            if (endDate <= startDate) {
                setError('End date must be after start date');
                return;
            }

            // Check if all assigned employees have the required skills
            const missingSkillsByEmployee = [];
            projectDetails.assignedEmployees.forEach(emp => {
                const employee = employees.find(e => e.id === emp.employeeId);
                if (employee) {
                    const employeeSkills = new Set(employee.approvedSkills.map(skill => skill.skillName));
                    const missingSkills = projectDetails.requiredSkills.filter(skill => !employeeSkills.has(skill));
                    if (missingSkills.length > 0) {
                        missingSkillsByEmployee.push(`${employee.name} lacks skills: ${missingSkills.join(', ')}`);
                    }
                }
            });
            
            if (missingSkillsByEmployee.length > 0) {
                setError(missingSkillsByEmployee.join('\n'));
                return;
            }

            console.log('Project details before formatting:', projectDetails);

            // Format the project data
            const projectData = {
                name: projectDetails.name.trim(),
                description: projectDetails.description.trim(),
                startDate: projectDetails.startDate,
                endDate: projectDetails.endDate,
                priority: projectDetails.priority || 'Medium',
                teamSize: parseInt(projectDetails.teamSize) || 1,
                status: 'Active',
                requiredSkills: projectDetails.requiredSkills,
                assignedEmployees: projectDetails.assignedEmployees
            };

            console.log('Formatted project data:', JSON.stringify(projectData, null, 2));

            // Create the project
            const response = await createProject(projectData);
            console.log('Project creation response:', response);
            
            if (!response.success) {
                console.error('Project creation failed:', response);
                throw new Error(response.message || 'Failed to create project');
            }

            // Show success message
            setSuccessMessage('Project created successfully!');
            setSnackbarMessage('Project created successfully!');
            setSnackbarOpen(true);
            
            // Reset form
            setProjectDetails({
                name: '',
                description: '',
                startDate: '',
                endDate: '',
                requiredSkills: [],
                teamSize: 1,
                priority: 'Medium',
                assignedEmployees: []
            });
            setOpenProjectDialog(false);
            
            // Refresh data
            await fetchEmployees();
            if (projectAssignmentsRef.current) {
                console.log('Refreshing project assignments table...');
                await projectAssignmentsRef.current.refreshAssignments();
            }
        } catch (error) {
            console.error('Project assignment error:', {
                error: error,
                message: error.message,
                stack: error.stack
            });
            setError(error.message || 'Failed to create project. Please try again.');
            // Keep the dialog open when there's an error
            setOpenProjectDialog(true);
        }
    };

    // Add handleSnackbarClose function
    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    const handleExpandRow = (projectId) => {
        setExpandedRows(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline />
            <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
                {/* Enhanced Header with Dark Gradient */}
                <Paper 
                    elevation={0} 
                    sx={{ 
                        py: 3, 
                        px: 4, 
                        background: 'linear-gradient(135deg, #1a237e 0%, #0d47a1 100%)',
                        borderRadius: 0,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle at top right, rgba(255,255,255,0.1) 0%, transparent 60%)',
                            pointerEvents: 'none',
                        }
                    }}
                >
                    <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        maxWidth: 1200,
                        mx: 'auto',
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        <Box>
                            <Typography 
                                variant="h5" 
                                component="h1" 
                                sx={{ 
                                    color: '#fff',
                                    fontWeight: 600,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                                    mb: 0.5
                                }}
                            >
                                {getGreeting()}, {name}
                            </Typography>
                        </Box>
                        <Button
                            variant="contained"
                            color="error"
                            startIcon={<LogoutIcon />}
                            onClick={handleLogout}
                            sx={{
                                bgcolor: 'rgba(196, 22, 22, 0.87)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(196, 22, 22, 0.87)',
                                },
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            }}
                        >
                            Logout
                        </Button>
                    </Box>
                </Paper>

                <Container maxWidth="lg" sx={{ py: 4 }}>
                    {/* Header */}
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" component="h2" gutterBottom fontWeight="600" color='#1a237e'>
                            Employee Skills Management
                        </Typography>
                    </Box>

                    {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                    )}

                    {/* Filter and Sort Panel */}
                    <Paper sx={{ p: 3, mb: 3, borderRadius: 2, boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)' }}>
                        <Grid container spacing={3}>
                            <Grid item xs={12} md={4}>
                                <TextField
                                    fullWidth
                                    label="Search Employees"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} md={8}>
                                <Autocomplete
                                    multiple
                                    options={allSkills}
                                    value={selectedSkills}
                                    onChange={(_, newValue) => setSelectedSkills(newValue)}
                                    renderInput={(params) => (
                                        <TextField
                                            {...params}
                                            label="Filter by Skills"
                                            size="small"
                                        />
                                    )}
                                />
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Proficiency Level</InputLabel>
                                    <Select
                                        value={proficiencyFilter}
                                        onChange={(e) => setProficiencyFilter(e.target.value)}
                                        label="Proficiency Level"
                                    >
                                        <MenuItem value="all">All Levels</MenuItem>
                                        <MenuItem value="Beginner">Beginner</MenuItem>
                                        <MenuItem value="Intermediate">Intermediate</MenuItem>
                                        <MenuItem value="Expert">Expert</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Minimum Experience</InputLabel>
                                    <Select
                                        value={experienceFilter}
                                        onChange={(e) => setExperienceFilter(e.target.value)}
                                        label="Minimum Experience"
                                    >
                                        <MenuItem value={0}>Any Experience</MenuItem>
                                        <MenuItem value={1}>1+ Year</MenuItem>
                                        <MenuItem value={2}>2+ Years</MenuItem>
                                        <MenuItem value={5}>5+ Years</MenuItem>
                                        <MenuItem value={10}>10+ Years</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} md={4}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>Sort By</InputLabel>
                                    <Select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        label="Sort By"
                                    >
                                        <MenuItem value="name">Name</MenuItem>
                                        <MenuItem value="experience">Experience</MenuItem>
                                        <MenuItem value="skillCount">Skill Count</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                                    <Button
                                        variant="outlined"
                                        startIcon={<SortIcon />}
                                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                    >
                                        {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                                    </Button>
                                    <Button
                                        variant="contained"
                                        onClick={() => setOpenProjectDialog(true)}
                                        sx={{
                                            bgcolor: '#1976d2',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#1565c0'
                                            },
                                            px: 3,
                                            py: 1,
                                            borderRadius: 2,
                                            boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                                            transition: 'all 0.2s ease'
                                        }}
                                    >
                                        Assign Project
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* Employees Table */}
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                            <CircularProgress />
                        </Box>
                    ) : employees.length === 0 ? (
                        <Paper sx={{ p: 4, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                No employees with approved skills found.
                            </Typography>
                        </Paper>
                    ) : (
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
                                    Employees
                                </Typography>
                            </Box>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Employee Name</TableCell>
                                        <TableCell>Email</TableCell>
                                        <TableCell>Approved Skills</TableCell>
                                        <TableCell align="center">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {getFilteredAndSortedEmployees().map((employee) => (
                                        <TableRow key={employee.id} hover>
                                            <TableCell>{employee.name}</TableCell>
                                            <TableCell>{employee.email}</TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                                    {employee.approvedSkills.map((skill, index) => (
                                                        <Chip
                                                            key={index}
                                                            label={`${skill.skillName} (${skill.proficiencyLevel})`}
                                                            size="small"
                                                            color="primary"
                                                            variant="outlined"
                                                        />
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    color="info"
                                                    onClick={() => handleViewDetails(employee)}
                                                    title="View Details"
                                                >
                                                    <ViewIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}

                    {/* Project Assignments Section */}
                    <Box sx={{ mt: 4 }}>
                        <ProjectAssignmentsTable ref={projectAssignmentsRef} />
                    </Box>

                    {/* Employee Details Dialog */}
                    <Dialog
                        open={openDialog}
                        onClose={handleCloseDialog}
                        maxWidth="md"
                        fullWidth
                    >
                        {selectedEmployee && (
                            <>
                                <DialogTitle>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6">
                                            {selectedEmployee.name}'s Skills
                                        </Typography>
                                    </Box>
                                </DialogTitle>
                                <DialogContent dividers>
                                    {selectedEmployee.approvedSkills.length === 0 ? (
                                        <Box sx={{
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            minHeight: '200px',
                                            width: '100%'
                                        }}>
                                            <Typography 
                                                variant="h6" 
                                                sx={{ 
                                                    color: 'black',
                                                    fontWeight: 500,
                                                    whiteSpace: 'nowrap',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {selectedEmployee.name} hasn't added any skills yet.
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Grid 
                                            container 
                                            spacing={3} 
                                            sx={{ 
                                                justifyContent: 'flex-start',
                                                alignItems: 'flex-start',
                                                p: 1
                                            }}
                                        >
                                            {selectedEmployee.approvedSkills.map((skill, index) => (
                                                <Grid item xs={12} sm={6} md={4} key={index}>
                                                    <Card 
                                                        sx={{
                                                            backgroundColor: 'black', 
                                                            borderRadius: '10px',
                                                            height: '100%'
                                                        }}
                                                    >
                                                        <CardContent>
                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                                                <Typography variant="h6" component="div" sx={{ 
                                                                    fontWeight: 500,
                                                                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                                                    WebkitBackgroundClip: 'text',
                                                                    WebkitTextFillColor: 'transparent',
                                                                }}>
                                                                    {skill.skillName}
                                                                </Typography>
                                                                <Chip
                                                                    icon={<VerifiedIcon />}
                                                                    label="Verified"
                                                                    size="small"
                                                                    color="success"
                                                                />
                                                            </Box>
                                                            
                                                            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                                                <Chip
                                                                    icon={<ProficiencyIcon />}
                                                                    label={skill.proficiencyLevel}
                                                                    size="small"
                                                                    color={
                                                                        skill.proficiencyLevel === 'Expert' ? 'success' :
                                                                        skill.proficiencyLevel === 'Intermediate' ? 'warning' : 
                                                                        'primary'
                                                                    }
                                                                />
                                                                <Chip
                                                                    icon={<ExperienceIcon />}
                                                                    label={`${skill.experienceYears} years`}
                                                                    size="small"
                                                                    color="secondary"
                                                                />
                                                            </Box>

                                                            {skill.certificateFileUrl && (
                                                                <Button
                                                                    startIcon={<CertificateIcon />}
                                                                    component="a"
                                                                    href={skill.certificateFileUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    size="small"
                                                                    variant="outlined"
                                                                    sx={{ mb: 2, color: 'white', borderColor: 'white' }}
                                                                >
                                                                    View Certificate
                                                                </Button>
                                                            )}

                                                            {skill.projectLinks?.length > 0 && (
                                                                <Box>
                                                                    <Typography variant="subtitle2" gutterBottom sx={{ color: 'primary.main' }}>
                                                                        Project Links:
                                                                    </Typography>
                                                                    {skill.projectLinks.map((link, idx) => (
                                                                        <Button
                                                                            key={idx}
                                                                            startIcon={<LinkIcon />}
                                                                            component="a"
                                                                            href={link.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            size="small"
                                                                            sx={{ mr: 1, color: 'white' }}
                                                                        >
                                                                            {link.label}
                                                                        </Button>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    )}
                                </DialogContent>
                                <DialogActions>
                                    <Button 
                                        onClick={handleCloseDialog}
                                        variant="contained"
                                        sx={{
                                            bgcolor: '#1976d2',
                                            color: 'white',
                                            '&:hover': {
                                                bgcolor: '#1565c0'
                                            }
                                        }}
                                    >
                                        Close
                                    </Button>
                                </DialogActions>
                            </>
                        )}
                    </Dialog>

                    {/* Project Assignment Dialog */}
                    <ProjectAssignmentDialog
                        open={openProjectDialog}
                        onClose={() => {
                            setOpenProjectDialog(false);
                            setError('');
                            setProjectDetails({
                                name: '',
                                description: '',
                                startDate: '',
                                endDate: '',
                                requiredSkills: [],
                                teamSize: 1,
                                priority: 'Medium',
                                assignedEmployees: []
                            });
                        }}
                        employees={employees}
                        projectDetails={projectDetails}
                        setProjectDetails={setProjectDetails}
                        error={error}
                        setError={setError}
                        successMessage={successMessage}
                        setSuccessMessage={setSuccessMessage}
                        allSkills={allSkills}
                        onAssign={handleAssignProject}
                    />
                </Container>

                {/* Modify the Snackbar component */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleSnackbarClose}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    sx={{ mb: 2, mr: 2 }}
                >
                    <Alert 
                        onClose={handleSnackbarClose}
                        severity="success"
                        variant="filled"
                        sx={{ 
                            width: '100%',
                            backgroundColor: '#2e7d32', // Darker green
                            '& .MuiAlert-message': {
                                color: 'white',
                                fontWeight: 500
                            }
                        }}
                    >
                        <AlertTitle>Success</AlertTitle>
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </ThemeProvider>
    );
};

export default HRDashboard;
