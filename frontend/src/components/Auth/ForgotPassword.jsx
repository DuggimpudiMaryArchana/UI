import React, { useState } from 'react';
import  {resetPassword}  from '../../services/authService';
import Snackbar from "@mui/material/Snackbar"
import MuiAlert from "@mui/material/Alert"
import 'bootstrap/dist/css/bootstrap.min.css';
const Alert = React.forwardRef(function Alert(props, ref){
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props}/>
})

const ForgotPasswordCard = ({ onClose, email }) => {
    const [formData, setFormData] = useState({
        email: email || '',
        newPassword: '',
        confirmPassword: ''
    })
    const [formErrorMessage, setFormErrorMessage] = useState({
        newPassword: [],
        confirmPassword: '',
    });

    const [formValid, setFormValid] = useState({
        newPassword: false,
        confirmPassword: false,
        buttonActive: false
    });

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    //const [progress, setProgress] = useState(0);

    const validateField = (fieldName, fieldValue) => {
        const newFormValid = { ...formValid };
        const newFormErrorMessage = { ...formErrorMessage };
        switch (fieldName) {
            case "newPassword":
                const pwdErrors = [];
                if (fieldValue === "") {
                    newFormValid.newPassword = false;
                    pwdErrors.push('Field required');
                }
                if (fieldValue.length < 8) {
                    newFormValid.newPassword = false;
                    pwdErrors.push("Password must be at least 8 characters");
                }
                if (!/[A-Z]/.test(fieldValue)) {
                    newFormValid.newPassword = false;
                    pwdErrors.push("Password must contain at least one uppercase letter");
                }
                if (!/[a-z]/.test(fieldValue)) {
                    newFormValid.password = false;
                    pwdErrors.push("Password must contain at least one lowercase letter");
                }
                if (!/\d/.test(fieldValue)) {
                    newFormValid.newPassword = false;
                    pwdErrors.push("Password must contain at least one digit");
                }
                if (!/[@$!%*?&]/.test(fieldValue)) {
                    newFormValid.newPassword = false;
                    pwdErrors.push("Password should contain at least one special character");
                }
                if (pwdErrors.length > 0) {
                    newFormValid.newPassword = false;
                    newFormErrorMessage.newPassword = pwdErrors;
                } else {
                    newFormErrorMessage.newPassword = [];
                    newFormValid.newPassword = true;
                }
                break;
            case "confirmPassword":
                if (fieldValue === "") {
                    newFormValid.confirmPassword = false;
                    newFormErrorMessage.confirmPassword = "Field required";
                } else if (fieldValue !== formData.newPassword) {
                    newFormValid.confirmPassword = false;
                    newFormErrorMessage.confirmPassword = "Passwords do not match";
                } else {
                    newFormValid.confirmPassword = true;
                    newFormErrorMessage.confirmPassword = "";
                }
                break;
            default:
                break;
        }
        newFormValid.buttonActive = newFormValid.newPassword && newFormValid.confirmPassword;
        setFormValid(newFormValid);
        setFormErrorMessage(newFormErrorMessage);
    }
    const handleChange = (e) => {
        const { name, value } = e.target;
        const updateFormData = { ...formData, [name]: value };
        setFormData(updateFormData);
        validateField(name, value);
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        //handleReset();
        setSnackbarOpen(true); // Open snackbar on success

    }

    const handleCloseSnackbar =()=>{
        setSnackbarOpen(false)
    }

    const handleReset = async () => {
        console.log("Hii");
        if(!formValid.buttonActive)
            return;
        try {
            const response = await resetPassword(email, formData.newPassword);
            if(response && response.success)
            {
                setSnackbarOpen(true);
                setTimeout(()=>{
                    onClose();
                }, 3000)
            }
            else
            {
                console.error("Reset failed");
                setSnackbarOpen(false)
            }
        }
        catch (error) {
            console.error("Error resetting password", error);
           setSnackbarOpen(false)
        }
    }



    return (
        <>
            <div className='position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center'
                style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", zIndex: 1050 }}>
                <div className='card p-4 shadow' style={{ width: '400px', borderRadius: "1rem" }}>
                    <h2 className='text-center mb-4' style={{ fontWeight: '700', color:'#0066cc' }}>Reset Password</h2>
                    <form onSubmit={handleSubmit}>
                        <div className='form-group mb-3'>
                            <label style={{fontWeight:'500'}}>Email</label>
                            <input
                                type='email'
                                className='form-control'
                                name='email'
                                value={email}
                                readOnly
                            />
                        </div>
                        <div className='form-group mb-3'>
                            <label style={{fontWeight:'500'}}>New Password</label>
                            <input
                                type='password'
                                className='form-control'
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder='Enter new Password'
                            />
                            {
                                formErrorMessage.newPassword.length > 0 && (
                                    <ul className='text-danger mt-1 mb-0' style={{ fontSize: '0.9rem' }}>
                                        {formErrorMessage.newPassword.map((error, idx) => (
                                            <li key={idx}>{error}</li>
                                        ))}
                                    </ul>
                                )
                            }
                        </div>
                        <div className='form-group mb-3'>
                            <label style={{fontWeight:'500'}}>Confirm Password</label>
                            <input
                                type='password'
                                className='form-control'
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder='Confirm Password'
                            />
                            {
                                formErrorMessage.confirmPassword && (
                                    <small className='text-danger'>{formErrorMessage.confirmPassword}</small>
                                )
                            }
                        </div>
                        <div className='d-flex justify-content-between mt-4'>
                            <button type='button' className='btn btn-primary w-50 me-2' onClick={()=>handleReset()} disabled={!formValid.buttonActive}>
                                Reset
                            </button>
                            <button type='button' className='btn btn-danger w-50 ms-2' onClick={onClose}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
            <Snackbar open={snackbarOpen}
  autoHideDuration={3000}
  onClose={() => setSnackbarOpen(false)}
  anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
>
  <Alert onClose={() => setSnackbarOpen(false)} severity="success">
    Password reset successfully!
  </Alert>
</Snackbar>

        </>
    )

}

export default ForgotPasswordCard;
