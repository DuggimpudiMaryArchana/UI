import React, {useState, useEffect} from 'react'
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
    Select,
    MenuItem,
    IconButton,
    ThemeProvider,
    createTheme,
    CssBaseline,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
} from '@mui/material';

import {
    Delete as DeleteIcon,
    Edit as EditIcon,
    Logout as LogoutIcon
} from '@mui/icons-material'

import { useNavigate } from 'react-router-dom';

import {
    getAllEmployees, updateEmployee, deleteEmployee
} from '../../services/adminService';

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

const AdminDashboard = ()=>{
    const navigate = useNavigate();
    const name = localStorage.getItem('name');
    const [loading, setLoading] = useState(true);
    const [employees, setEmployees] = useState([]);
    const [error, setError] = useState('');
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [newRole, setNewRole] = useState('');

    // Get current greeting based on time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    useEffect(()=>{
        const fetchEmployees = async()=>{
            try
            {
                setLoading(true);
                const data = await getAllEmployees();
                setEmployees(data);
            }
            catch(err)
            {
                setError("Failed to fetch employees")
            }
            finally
            {
                setLoading(false);
            }
        }
        fetchEmployees();
    },[])

    const handleLogout = ()=>{
        localStorage.clear();
        navigate('/login');
    }

    const handleRoleChange = (employee) => {
        setSelectedEmployee(employee)
        setNewRole(employee.role);
        setOpenDialog(true);
    }

    const handleRoleUpdate = async ()=>{
        try
        {
            await updateEmployee(selectedEmployee._id, {role:newRole})
            setEmployees((prev)=> 
                prev.map((emp)=>
                    emp._id === selectedEmployee._id ? {...emp, role:newRole} : emp
                )
            )
            setOpenDialog(false)
            setSelectedEmployee(null);
        }
        catch(err)
        {
            setError("Failed to update role");
        }
    }

    const handleDelete = async(id) => {
        try
        {
            await deleteEmployee(id);
            setEmployees((prev)=>prev.filter((emp) => emp._id !== id));
        }
        catch(err)
        {
            setError("Failed to delete employee")
        }
    }

    return (
        <ThemeProvider theme={lightTheme}>
            <CssBaseline/>
            <Box sx={{minHeight: '100vh', bgcolor:'background.default'}}>
                <Paper
                    elevation={0}
                    sx={{
                        py:3,
                        px:4,
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
                    }}>
                        <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        maxWidth: 1200,
                        mx: 'auto',
                        position: 'relative',
                        zIndex: 1,
                    }}>
                        <Typography 
                        variant="h5" 
                        component="h1" 
                        sx={{ 
                            color: '#fff',
                            fontWeight: 600,
                            textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                            mb: 0.5
                        }}>
                            {getGreeting()}, {name}
                        </Typography>
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
                        }}>
                            Logout
                        </Button>
                        </Box>
                </Paper>

                <Container maxWidth="lg" sx={{py:4}}>
                <Box sx={{ mb: 4 }}>
                        <Typography variant="h4" component="h2" gutterBottom fontWeight="600" color='#1a237e'>
                            Admin Dashboard
                        </Typography>
                        {error && (
                        <Alert severity="error" sx={{ mb: 3 }}>
                            {error}
                        </Alert>
                        )}

                        {
                            loading ? (
                                <Box sx={{
                                    display:'flex',
                                    justifyContent : 'center',
                                    py:4
                                }}>
                                <CircularProgress/>    
                                </Box>    
                            )
                            :
                            (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Name</TableCell>
                                                <TableCell>Email</TableCell>
                                                <TableCell>Role</TableCell>
                                                <TableCell>Actions</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {
                                                employees.map((emp)=>(
                                                    <TableRow key={emp._id}>
                                                        <TableCell>{emp.name}</TableCell>
                                                        <TableCell>{emp.email}</TableCell>
                                                        <TableCell>{emp.role}</TableCell>
                                                        <TableCell align='center'>
                                                            <IconButton color='primary' onClick={()=>handleRoleChange(emp)}>
                                                                <EditIcon/>
                                                            </IconButton>
                                                            <IconButton color='error' onClick={()=>handleDelete(emp._id)}>
                                                                <DeleteIcon/>
                                                            </IconButton>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            }
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )
                        }
                        <Dialog open={openDialog} onClose={()=>setOpenDialog(false)}>
                            <DialogTitle>
                                Change Role
                            </DialogTitle>
                            <DialogContent>
                                <Select fullWidth value={newRole} onChange={(e)=>setNewRole(e.target.value)}>
                                    <MenuItem value="employee">Employee</MenuItem>
                                    <MenuItem value="verifier">Verifier</MenuItem>
                                    <MenuItem value="hr">HR</MenuItem>
                                    <DialogActions>
                                        <Button onClick={()=>setOpenDialog(false)}>
                                            Cancel
                                        </Button>
                                        <Button variant='contained' onClick={handleRoleUpdate}>
                                            Update
                                        </Button>
                                    </DialogActions>
                                </Select>
                            </DialogContent>
                        </Dialog>
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    )
}

export default AdminDashboard
