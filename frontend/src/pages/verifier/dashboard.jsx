import React, { useEffect, useState } from 'react';
import { getPendingUsers, approveOrReject, getApprovedUsers } from '../../services/userService';
import { getAllPendingSkills, approveSkill, rejectSkill } from '../../services/skillService';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  CircularProgress,
  Container,
  Snackbar,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Avatar,
  LinearProgress,
  styled,
  createTheme,
  ThemeProvider,
  CssBaseline,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Link,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  VerifiedUser as VerifiedIcon,
  HourglassEmpty as PendingIcon,
  Description as CertificateIcon,
  Link as LinkIcon,
  Person as PersonIcon,
  Star as ProficiencyIcon,
  Work as ExperienceIcon,
  Info as DescriptionIcon,
  Logout as LogoutIcon
} from '@mui/icons-material';

// Create light theme
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
      },
    },
  },
});

// Styled components
const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: 
    status === 'approved' ? theme.palette.success.main :
    status === 'rejected' ? theme.palette.error.main :
    theme.palette.warning.main,
  color: theme.palette.getContrastText(
    status === 'approved' ? theme.palette.success.main :
    status === 'rejected' ? theme.palette.error.main :
    theme.palette.warning.main
  ),
  fontWeight: 500,
}));

const SkillCard = styled(Card)(({ theme }) => ({
  transition: 'transform 0.3s, box-shadow 0.3s',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: theme.shadows[8],
  },
}));

const VerifierDashboard = () => {
  const navigate = useNavigate();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [approvedUsers, setApprovedUsers] = useState([]);
  const [pendingSkills, setPendingSkills] = useState([]);
  const [loading, setLoading] = useState({
    users: true,
    skills: true,
    approved:true
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const verifierName = localStorage.getItem('name');

  // Get current greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  // Fetch pending users and skills on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading({ users: true, skills: true, approved:true });
        
        // Fetch users
        try {
          const users = await getPendingUsers();
          setPendingUsers(users || []);
        } catch (err) {
          console.error('Error fetching pending users:', err);
          setSnackbar({
            open: true,
            message: 'Failed to load pending users',
            severity: 'error'
          });
        } finally {
          setLoading(prev => ({ ...prev, users: false }));
        }
        
        // Fetch skills
        try {
          console.log('Fetching pending skills...');
          const skills = await getAllPendingSkills();
          console.log('Received skills:', skills);
          if (Array.isArray(skills)) {
            setPendingSkills(skills);
          } else {
            console.error('Received invalid skills data:', skills);
            throw new Error('Invalid skills data received');
          }
        } catch (err) {
          console.error('Error fetching pending skills:', err);
          setSnackbar({
            open: true,
            message: 'Failed to load pending skills. Please try refreshing the page.',
            severity: 'error'
          });
        } finally {
          setLoading(prev => ({ ...prev, skills: false }));
        }

        //Fetch approved users
        try
        {
          const approved = await getApprovedUsers();
          setApprovedUsers(approved || []);
        }
        catch(err)
        {
            console.error("Error fetching approved users", err)
            setSnackbar({
              open:true,
              message:"Failed to load pending users",
              severity:'error'
            })
        }
        finally{
          setLoading(prev => ({...prev, approved:false}))
        }
      } catch (err) {
        console.error('Error in fetchData:', err);
      }
    };
    
    fetchData();
  }, []);

  // Handle user approve or reject
  const handleUserAction = async (userId, status) => {
    try {
      await approveOrReject(userId, status);
      setPendingUsers(prev => prev.filter(user => user._id !== userId));
      if(status === 'approved')
      {
        //fetch the updated approved users list
        const approved = await getApprovedUsers();
        setApprovedUsers(approved || [])
      }
      setSnackbar({
        open: true,
        message: `User ${status} successfully`,
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Action failed. Please try again.',
        severity: 'error'
      });
    }
  };

  // Handle skill approval
  const handleApproveSkill = async (skillId) => {
    try {
      setLoading(prev => ({ ...prev, skills: true }));
      await approveSkill(skillId);
      setPendingSkills(prev => prev.filter(skill => skill._id !== skillId));
      setSnackbar({
        open: true,
        message: 'Skill approved successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error approving skill:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to approve skill',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, skills: false }));
    }
  };

  // Handle skill rejection
  const handleRejectSkill = async (skillId) => {
    try {
      setLoading(prev => ({ ...prev, skills: true }));
      await rejectSkill(skillId);
      setPendingSkills(prev => prev.filter(skill => skill._id !== skillId));
      setSnackbar({
        open: true,
        message: 'Skill rejected successfully',
        severity: 'success'
      });
    } catch (err) {
      console.error('Error rejecting skill:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to reject skill',
        severity: 'error'
      });
    } finally {
      setLoading(prev => ({ ...prev, skills: false }));
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  // Safe date formatting
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'N/A' : date.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const isLoading = loading.users || loading.skills;

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
                {getGreeting()}, {verifierName}
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
                boxShadow: '0 4px 12px rgba(86, 13, 13, 0.1)',
              }}
            >
              Logout
            </Button>
          </Box>
        </Paper>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          {isLoading && (
            <Box sx={{ width: '100%', mb: 4 }}>
              <LinearProgress color="secondary" />
            </Box>
          )}

          {/* Registration Verification Section */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mb: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 4,
              gap: 2
            }}>
              <VerifiedIcon color="primary" sx={{ fontSize: 40 }} />
              <Typography variant="h4" component="h2" fontWeight="600">
                Registration Verification
              </Typography>
              <Chip 
                label={`${pendingUsers.length} Pending`} 
                color="warning" 
                variant="outlined"
                sx={{ ml: 'auto', px: 2 }}
                icon={<PendingIcon />}
              />
            </Box>

            {loading.users ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : pendingUsers.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2
              }}>
                <PendingIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No pending registration requests
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  All users have been processed
                </Typography>
              </Box>
            ) : (
              <TableContainer component={Paper} elevation={3} sx={{ borderRadius: 3 }}>
                <Table sx={{ minWidth: 650 }} aria-label="verification table">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: '600' }}>User</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Submitted On</TableCell>
                      <TableCell sx={{ fontWeight: '600' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: '600' }} align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingUsers.map((user) => (
                      <StyledTableRow key={user._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar src={user.avatar} alt={user.name} />
                            <Typography fontWeight="500">{user.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          {user.createdAt ? formatDate(user.createdAt) : 'N/A'}
                        </TableCell>
                        <TableCell>
                          <StatusChip 
                            label="Pending" 
                            status="pending" 
                            size="small" 
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              startIcon={<ApproveIcon />}
                              onClick={() => handleUserAction(user._id, 'approved')}
                              sx={{ textTransform: 'none' }}
                            >
                              Approve
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              startIcon={<RejectIcon />}
                              onClick={() => handleUserAction(user._id, 'rejected')}
                              sx={{ textTransform: 'none' }}
                            >
                              Reject
                            </Button>
                          </Box>
                        </TableCell>
                      </StyledTableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>

          {/* Skills Verification Section */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mt: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 4,
              gap: 2
            }}>
              <VerifiedIcon color="secondary" sx={{ fontSize: 40 }} />
              <Typography variant="h4" component="h2" fontWeight="600">
                Skills Verification
              </Typography>
              <Chip 
                label={`${pendingSkills.length} Pending`} 
                color="warning" 
                variant="outlined"
                sx={{ ml: 'auto', px: 2 }}
                icon={<PendingIcon />}
              />
            </Box>

            {loading.skills ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                <CircularProgress />
              </Box>
            ) : pendingSkills.length === 0 ? (
              <Box sx={{ 
                textAlign: 'center', 
                py: 8,
                border: '1px dashed',
                borderColor: 'divider',
                borderRadius: 2
              }}>
                <PendingIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No pending skill verification requests
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
                  All skills have been processed
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3}>
                {pendingSkills.map((skill) => (
                  <Grid item xs={12} sm={6} md={4} key={skill._id}>
                    <Card sx={{ height: '100%',border:'1px solid #0066cc', borderRadius:'10px' }}>
                      <CardHeader
                        avatar={
                          <Avatar>
                            {skill.employeeId?.name?.charAt(0) || '?'}
                          </Avatar>
                        }
                        title={skill.skillName}
                        subheader={`Submitted by: ${skill.employeeId?.name || 'Unknown'}`}
                      />
                      <CardContent>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <ProficiencyIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Proficiency Level"
                              secondary={skill.proficiencyLevel}
                            />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <ExperienceIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText 
                              primary="Experience"
                              secondary={`${skill.experienceYears} years`}
                            />
                          </ListItem>
                          {skill.skillDescription && (
                            <ListItem>
                              <ListItemIcon>
                                <DescriptionIcon color="primary" />
                              </ListItemIcon>
                              <ListItemText 
                                primary="Description"
                                secondary={skill.skillDescription}
                              />
                            </ListItem>
                          )}
                        </List>

                        {skill.certificateFileUrl && (
                          <Button
                            startIcon={<CertificateIcon />}
                            component="a"
                            href={skill.certificateFileUrl}
                            target="_blank"
                            variant="outlined"
                            size="small"
                            sx={{ mt: 1 }}
                          >
                            View Certificate
                          </Button>
                        )}

                        {skill.projectLinks?.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography variant="subtitle2" gutterBottom>
                              Project Links:
                            </Typography>
                            <List dense>
                              {skill.projectLinks.map((link, index) => (
                                <ListItem key={index} dense>
                                  <ListItemIcon>
                                    <LinkIcon fontSize="small" />
                                  </ListItemIcon>
                                  <ListItemText>
                                    <Link href={link.url} target="_blank" rel="noopener noreferrer">
                                      {link.label || 'Project Link'}
                                    </Link>
                                  </ListItemText>
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        )}

                        <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<ApproveIcon />}
                            onClick={() => handleApproveSkill(skill._id)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<RejectIcon />}
                            onClick={() => handleRejectSkill(skill._id)}
                          >
                            Reject
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
          
          {/* Approved users Section */}
          <Paper elevation={3} sx={{ p: 3, borderRadius: 3, mt: 4 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              mb: 4,
              gap: 2
            }}>
              <VerifiedIcon color="success" sx={{ fontSize: 40 }} />
              <Typography variant="h4" component="h2" fontWeight="600">
                Approved Users
              </Typography>
              <Chip 
                label={`${approvedUsers.length} Approved`} 
                color="success" 
                variant="outlined"
                sx={{ ml: 'auto', px: 2 }}
                icon={<ApproveIcon />}
              />
            </Box>

            {
              loading.approved ? (
                  <Box sx={{display:'flex', justifyContent:'center', py:8}}>
                      <CircularProgress/>
                  </Box>
              )
              :
              approvedUsers.length === 0 ? (
                <Box sx={{textAlign:'center', py:8, border:'1px dashed', borderColor:'divider', borderRadius:2}}>
                    <ApproveIcon sx={{fontSize:60, color:'text.disabled', mb:2}}/>
                    <Typography variant='h6' color='text.secondary'>
                        No approved users
                    </Typography>
                </Box>
              )
              :
              (
                <>
                  <Typography>Count:{approvedUsers.length}</Typography>
                  <Grid container spacing={3}>
                      {
                        approvedUsers.map((user)=>(
                            <Grid item xs={12} sm={6} md={4} key={user._id}>
                                <Card sx={{height:'100%', border:'1px solid #0066cc', borderRadius:'10px'}}>
                                    <CardHeader 
                                          avatar={<Avatar>{user.name?.charAt(0) || '?'}</Avatar>}
                                          title={user.name}
                                          subheader={user.email}   
                                    />
                                    <CardContent>
                                        <List dense>
                                            <ListItem>
                                                <ListItemIcon><PersonIcon color='primary' /></ListItemIcon>
                                                <ListItemText
                                                    primary="Role"
                                                    secondary={user.role || 'N/A'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><ExperienceIcon color='primary' /></ListItemIcon>
                                                <ListItemText
                                                    primary="Experience"
                                                    secondary={user.experience ? `${user.experience} years`:'N/A'}
                                                />
                                            </ListItem>
                                            <ListItem>
                                                <ListItemIcon><DescriptionIcon color='primary' /></ListItemIcon>
                                                <ListItemText
                                                    primary="Approved On"
                                                    secondary={user.updatedAt ? formatDate(user.updatedAt):'N/A'}
                                                />
                                            </ListItem>
                                        </List>
                                    </CardContent>
                                </Card>
                            </Grid>  
                      ))
                      }
                  </Grid>
                 </> 
              )
            }
          </Paper>

          <Snackbar
            open={snackbar.open}
            autoHideDuration={6000}
            onClose={handleCloseSnackbar}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert 
              onClose={handleCloseSnackbar} 
              severity={snackbar.severity}
              sx={{ width: '100%' }}
            >
              {snackbar.message}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default VerifierDashboard;
