import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getEmployeeSkills, 
  addSkill, 
  updateSkill, 
  deleteSkill 
} from '../../services/skillService';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Chip,
  Grid,
  Paper,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Alert,
  CircularProgress,
  Link,
  Fade,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifiedIcon,
  Pending as PendingIcon,
  Cancel as RejectedIcon,
  Description as CertificateIcon,
  Link as LinkIcon,
  Star as ProficiencyIcon,
  Work as ExperienceIcon,
  AddLink as AddLinkIcon,
  RemoveCircle as RemoveLinkIcon,
  Logout as LogoutIcon,
  Construction as SkillsIcon
} from '@mui/icons-material';
import EmployeeProjectsTable from '../../components/EmployeeProjectsTable';

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
    success: {
      main: '#66bb6a',
    },
    warning: {
      main: '#ffa726',
    },
    error: {
      main: '#f44336',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", "Roboto", sans-serif',
    h4: {
      fontWeight: 700,
      letterSpacing: '0.02em',
      background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    h5: {
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    h6: {
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
    subtitle1: {
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.02em',
    }
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid rgba(0,0,0,0.1)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.1)',
          },
        },
      },
    },
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
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
      },
    },
  },
});

const StatusIcon = ({ status }) => {
  const getStatusInfo = () => {
    switch(status) {
      case 'approved':
        return {
          icon: <VerifiedIcon />,
          label: 'Verified',
          color: 'success'
        };
      case 'rejected':
        return {
          icon: <RejectedIcon />,
          label: 'Rejected',
          color: 'error'
        };
      case 'pending':
      default:
        return {
          icon: <PendingIcon />,
          label: 'Pending Verification',
          color: 'warning'
        };
    }
  };

  const statusInfo = getStatusInfo();
  return (
    <Chip
      icon={statusInfo.icon}
      label={statusInfo.label}
      size="small"
      color={statusInfo.color}
      sx={{
        fontWeight: 500,
        '& .MuiChip-icon': {
          marginLeft: '8px'
        }
      }}
    />
  );
};

const EmployeeDashboard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState(null);
  
  const [formData, setFormData] = useState({
    skillName: '',
    skillDescription: '',
    proficiencyLevel: 'Beginner',
    experienceYears: 0,
    certificateFile: null,
    certificateFileUrl: '',
    projectLinks: [{ label: '', url: '' }]
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const data = await getEmployeeSkills(id);
        setSkills(data);
      } catch (err) {
        setError('Failed to fetch skills');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSkills();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'experienceYears') {
      const numValue = Math.max(0, parseInt(value) || 0);
      setFormData(prev => ({ ...prev, [name]: numValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        e.target.value = '';
        return;
      }
      
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        setError('Only PDF, JPG, and PNG files are allowed');
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({ ...prev, certificateFile: file }));
      setError('');
    }
  };

  const handleProjectLinkChange = (index, field, value) => {
    const updatedLinks = [...formData.projectLinks];
    updatedLinks[index][field] = value;
    setFormData(prev => ({ ...prev, projectLinks: updatedLinks }));
  };

  const addProjectLink = () => {
    setFormData(prev => ({
      ...prev,
      projectLinks: [...prev.projectLinks, { label: '', url: '' }]
    }));
  };

  const removeProjectLink = (index) => {
    const updatedLinks = formData.projectLinks.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, projectLinks: updatedLinks }));
  };

  const startAddingSkill = () => {
    setFormData({
      skillName: '',
      skillDescription: '',
      proficiencyLevel: 'Beginner',
      experienceYears: 0,
      certificateFile: null,
      certificateFileUrl: '',
      projectLinks: [{ label: '', url: '' }]
    });
    setEditingSkillId(null);
    setIsAddingSkill(true);
  };

  const startEditingSkill = (skill) => {
    setFormData({
      skillName: skill.skillName || '',
      skillDescription: skill.skillDescription || '',
      proficiencyLevel: skill.proficiencyLevel || 'Beginner',
      experienceYears: skill.experienceYears || 0,
      certificateFile: null,
      certificateFileUrl: skill.certificateFileUrl || '',
      projectLinks: skill.projectLinks?.length > 0 
        ? skill.projectLinks.map(link => ({ ...link }))
        : [{ label: '', url: '' }]
    });
    setEditingSkillId(skill._id);
    setIsAddingSkill(false);
    setError('');
  };

  const cancelForm = () => {
    setFormData({
      skillName: '',
      skillDescription: '',
      proficiencyLevel: 'Beginner',
      experienceYears: 0,
      certificateFile: null,
      certificateFileUrl: '',
      projectLinks: [{ label: '', url: '' }]
    });
    setIsAddingSkill(false);
    setEditingSkillId(null);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);

      if (!formData.skillName.trim()) {
        throw new Error('Skill Name is required');
      }
      if (!formData.proficiencyLevel) {
        throw new Error('Proficiency Level is required');
      }
      if (formData.experienceYears < 0) {
        throw new Error('Experience Years must be 0 or greater');
      }

      const validProjectLinks = formData.projectLinks.filter(
        link => link.label.trim() && link.url.trim()
      );

      const dataToSubmit = new FormData();
      dataToSubmit.append('skillName', formData.skillName.trim());
      dataToSubmit.append('skillDescription', formData.skillDescription.trim());
      dataToSubmit.append('proficiencyLevel', formData.proficiencyLevel);
      dataToSubmit.append('experienceYears', formData.experienceYears.toString());
      
      if (formData.certificateFile) {
        dataToSubmit.append('certificateFile', formData.certificateFile);
      }
      
      if (validProjectLinks.length > 0) {
        dataToSubmit.append('projectLinks', JSON.stringify(validProjectLinks));
      }

      let response;
      if (editingSkillId) {
        response = await updateSkill(editingSkillId, formData);
        if (response && response.skill) {
          setSkills(prev => prev.map(skill => 
            skill._id === editingSkillId ? response.skill : skill
          ));
          cancelForm();
        } else {
          throw new Error('Invalid response from server');
        }
      } else {
        response = await addSkill(id, formData);
        if (response && response.skill) {
          setSkills(prev => [...prev, response.skill]);
          cancelForm();
        } else {
          throw new Error('Invalid response from server');
        }
      }
    } catch (err) {
      console.error('Error saving skill:', err);
      setError(err.message || 'Failed to save skill. Please check all required fields and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (window.confirm('Are you sure you want to delete this skill?')) {
      try {
        setLoading(true);
        await deleteSkill(skillId);
        setSkills(prev => prev.filter(skill => skill._id !== skillId));
      } catch (err) {
        setError(err.message || 'Failed to delete skill');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const name = localStorage.getItem('name');

  return (
    <ThemeProvider theme={lightTheme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
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
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            mb: 4
          }}>
            <Typography variant="h4" component="h2">
              My Skills
            </Typography>
            {!isAddingSkill && !editingSkillId && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={startAddingSkill}
              >
                Add Skill
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {(isAddingSkill || editingSkillId) && (
            <Paper 
              elevation={3} 
              sx={{ 
                p: 4, 
                mb: 4,
                borderRadius: 2,
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
              }}
            >
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{
                  mb: 3,
                  fontWeight: 600,
                  color: 'primary.main'
                }}
              >
                {editingSkillId ? 'Edit Skill' : 'Add New Skill'}
              </Typography>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Skill Name"
                      name="skillName"
                      value={formData.skillName}
                      onChange={handleInputChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Proficiency Level</InputLabel>
                      <Select
                        name="proficiencyLevel"
                        value={formData.proficiencyLevel}
                        onChange={handleInputChange}
                        label="Proficiency Level"
                        sx={{
                          borderRadius: 2
                        }}
                      >
                        <MenuItem value="Beginner">Beginner</MenuItem>
                        <MenuItem value="Intermediate">Intermediate</MenuItem>
                        <MenuItem value="Expert">Expert</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      required
                      type="number"
                      label="Experience (years)"
                      name="experienceYears"
                      value={formData.experienceYears}
                      onChange={handleInputChange}
                      InputProps={{ 
                        inputProps: { min: 0 },
                        sx: { borderRadius: 2 }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Description"
                      name="skillDescription"
                      value={formData.skillDescription}
                      onChange={handleInputChange}
                      variant="outlined"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      type="file"
                      label="Certificate"
                      name="certificateFile"
                      onChange={handleFileChange}
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        accept: '.pdf,.jpg,.jpeg,.png'
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2
                        }
                      }}
                    />
                    <Typography 
                      variant="caption" 
                      color="textSecondary"
                      sx={{ 
                        display: 'block',
                        mt: 1,
                        ml: 1
                      }}
                    >
                      Accepted formats: PDF, JPG, JPEG, PNG (max 5MB)
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12}>
                    <Typography 
                      variant="subtitle1" 
                      gutterBottom
                      sx={{
                        fontWeight: 500,
                        color: 'primary.main',
                        mb: 2
                      }}
                    >
                      Project Links
                    </Typography>
                    {formData.projectLinks.map((link, index) => (
                      <Box 
                        key={index} 
                        sx={{ 
                          display: 'flex', 
                          gap: 2, 
                          mb: 2,
                          alignItems: 'center'
                        }}
                      >
                        <TextField
                          label="Project Name"
                          value={link.label}
                          onChange={(e) => handleProjectLinkChange(index, 'label', e.target.value)}
                          sx={{ 
                            flex: 1,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                        <TextField
                          label="Project URL"
                          value={link.url}
                          onChange={(e) => handleProjectLinkChange(index, 'url', e.target.value)}
                          sx={{ 
                            flex: 2,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2
                            }
                          }}
                        />
                        {formData.projectLinks.length > 1 && (
                          <IconButton 
                            color="error"
                            onClick={() => removeProjectLink(index)}
                            sx={{
                              '&:hover': {
                                transform: 'scale(1.1)',
                                backgroundColor: 'error.lighter'
                              }
                            }}
                          >
                            <RemoveLinkIcon />
                          </IconButton>
                        )}
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddLinkIcon />}
                      onClick={addProjectLink}
                      sx={{ 
                        mt: 1,
                        borderRadius: 2
                      }}
                    >
                      Add Project Link
                    </Button>
                  </Grid>
                </Grid>

                <Box 
                  sx={{ 
                    mt: 4, 
                    display: 'flex', 
                    gap: 2, 
                    justifyContent: 'flex-end'
                  }}
                >
                  <Button
                    variant="outlined"
                    onClick={cancelForm}
                    sx={{ 
                      borderRadius: 2,
                      px: 4
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                    sx={{ 
                      borderRadius: 2,
                      px: 4
                    }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Save Skill'}
                  </Button>
                </Box>
              </form>
            </Paper>
          )}

          {loading && skills.length === 0 ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {skills.length > 0 ? (
                <Fade in={skills.length > 0}>
                  <Grid container spacing={3}>
                    {skills.map(skill => (
                      <Grid item xs={12} sm={6} md={4} key={skill._id}>
                        <Card sx={{ 
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                          },
                          border:'1px solid #0066cc;'
                        }}>
                          <CardHeader
                            title={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography 
                                  variant="h6" 
                                  component="div"
                                  sx={{ 
                                    fontWeight: 500,
                                    background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                  }}
                                >
                                  {skill.skillName}
                                </Typography>
                                <StatusIcon status={skill.status} />
                              </Box>
                            }
                            subheader={
                              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                                <Chip
                                  icon={<ProficiencyIcon />}
                                  label={skill.proficiencyLevel}
                                  size="small"
                                  color={
                                    skill.proficiencyLevel === 'Expert' ? 'success' :
                                    skill.proficiencyLevel === 'Intermediate' ? 'warning' : 
                                    'primary'
                                  }
                                  sx={{ fontWeight: 500 }}
                                />
                                <Chip
                                  icon={<ExperienceIcon />}
                                  label={`${skill.experienceYears} years`}
                                  size="small"
                                  color="secondary"
                                  sx={{ fontWeight: 500 }}
                                />
                              </Box>
                            }
                          />
                          <CardContent sx={{ 
                            flexGrow: 1,
                            '& .MuiTypography-root': {
                              transition: 'color 0.2s ease',
                            }
                          }}>
                            {skill.skillDescription && (
                              <Typography 
                                variant="body2" 
                                color="text.secondary" 
                                gutterBottom
                                sx={{
                                  lineHeight: 1.6,
                                  '&:hover': {
                                    color: 'text.primary',
                                  }
                                }}
                              >
                                {skill.skillDescription}
                              </Typography>
                            )}
                            
                            {skill.certificateFileUrl && (
                              <Button
                                startIcon={<CertificateIcon />}
                                component="a"
                                href={skill.certificateFileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                size="small"
                                variant="outlined"
                                sx={{ 
                                  mt: 1,
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                  }
                                }}
                              >
                                View Certificate
                              </Button>
                            )}

                            {skill.projectLinks?.length > 0 && (
                              <Box sx={{ mt: 2 }}>
                                <Typography 
                                  variant="subtitle2" 
                                  gutterBottom
                                  sx={{
                                    color: 'primary.main',
                                    fontWeight: 500,
                                  }}
                                >
                                  Project Links:
                                </Typography>
                                {skill.projectLinks.map((link, index) => (
                                  <Link
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 1,
                                      mb: 0.5,
                                      color: 'text.secondary',
                                      textDecoration: 'none',
                                      transition: 'all 0.2s ease',
                                      '&:hover': {
                                        color: 'primary.main',
                                        transform: 'translateX(4px)',
                                      }
                                    }}
                                  >
                                    <LinkIcon fontSize="small" />
                                    {link.label || 'Project Link'}
                                  </Link>
                                ))}
                              </Box>
                            )}
                          </CardContent>

                          {skill.status !== 'approved' && (
                            <CardActions sx={{ 
                              justifyContent: 'flex-end', 
                              gap: 1,
                              borderTop: '1px solid rgba(0,0,0,0.1)',
                              py: 1.5,
                            }}>
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => startEditingSkill(skill)}
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                  }
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                color="error"
                                startIcon={<DeleteIcon />}
                                onClick={() => handleDeleteSkill(skill._id)}
                                sx={{
                                  transition: 'all 0.2s ease',
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                  }
                                }}
                              >
                                Delete
                              </Button>
                            </CardActions>
                          )}
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Fade>
              ) : (
                !isAddingSkill && (
                  <Fade in={skills.length === 0 && !isAddingSkill}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      minHeight: '50vh'
                    }}>
                      <Card sx={{ 
                        maxWidth: 500,
                        textAlign: 'center',
                        p: 4,
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          height: 6,
                        },
                        border:'1px #1976d2 solid'
                      }}>
                        <SkillsIcon sx={{
                          fontSize: 100,
                          mx: 'auto',
                          mb: 3,
                          color: 'primary.main',
                          opacity: 0.8
                        }} />
                        <Typography 
                          variant="h5" 
                          gutterBottom
                          sx={{
                            fontWeight: 600,
                            mb: 2,
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                          }}
                        >
                          Hey {name}, add your skills!
                        </Typography>
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          sx={{ mb: 3 }}
                        >
                          Showcase your expertise so HR can easily match you with exciting projects.
                        </Typography>
                        {/* <Button
                          variant="contained"
                          size="large"
                          startIcon={<AddIcon />}
                          onClick={startAddingSkill}
                          sx={{
                            mt: 2,
                            px: 4,
                            py: 1.5,
                            borderRadius: 3,
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                            boxShadow: '0 4px 12px rgba(25, 118, 210, 0.3)',
                            '&:hover': {
                              transform: 'translateY(-2px)',
                              boxShadow: '0 6px 16px rgba(25, 118, 210, 0.4)',
                            }
                          }}
                        >
                          Add Your First Skill
                        </Button> */}
                      </Card>
                    </Box>
                  </Fade>
                )
              )}
            </>
          )}

          {/* Projects Section */}
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" component="h2" gutterBottom fontWeight="600" color="#1a237e">
              My Assigned Projects
            </Typography>
            <EmployeeProjectsTable employeeId={id} />
          </Box>
        </Container>
      </Box>
    </ThemeProvider>
  );
};

export default EmployeeDashboard; 
