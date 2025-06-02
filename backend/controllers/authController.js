const User = require('../models/employeeModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your_jwt_secret'; // Replace with your actual secret key

exports.loginUser = async (req, res) => {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if((user.role === 'employee' || user.role === 'hr') && user.status === 'rejected')
            {
                return res.status(403).json({
                    message : 'You have been rejected. No further login access',
                    userId: user._id
                })
            }

        // Handle pending verification status
        else if ((user.role === 'employee' || user.role === 'hr') && user.status !== 'approved') {
            return res.status(403).json({ 
                message: 'Your account is pending verification.',
                userId: user._id // Include user ID even for pending accounts
            });
        }


        const token = jwt.sign(
            { 
                id: user._id, 
                role: user.role, 
                name: user.name 
            }, 
            SECRET_KEY, 
            { expiresIn: '24h' }
        );

        // Return all necessary user information
        res.json({
            success: true,
            token,
            user: {
                _id: user._id,
                role: user.role,
                name: user.name,
                email: user.email,
                // Include any other relevant user fields
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ 
            success: false,
            message: 'Server error', 
            error: err.message 
        });
    }
};

exports.resetPassword=async(req,res)=>{
    const {email,newPassword}=req.body;

    if(!email || !newPassword){
        return res.status(400).json({message:'Email and new password are required'});
    }
    try{
        console.log("Received Request Body:",{email,newPassword});
        const user=await User.findOne({email});
        if(!user){
            console.log("user not found for email:",email);
            return res.status(404).json({messsage:'User not found'});
        }

        console.log("User found:",{id:user._id,email:user.email});
        console.log("original password:",user.password);
        
        let hashedPassword;
        try{
            hashedPassword=await bcrypt.hash(newPassword,10);
            console.log("new password:",newPassword);
            console.log("hashed password:",hashedPassword);
        }catch(error){
            console.log("error hashing password:",error);
            return res.status(500).json({
                success:false,
                message:"error hashing password",
                error:error.message,
            })
        }
        await User.updateOne({email},{$set:{password:hashedPassword}});
        console.log("user updated using updateone");

        const updatedUser=await User.findOne({email});
        console.log("updated password indb:",updatedUser.password);

        if(updatedUser.password===newPassword){
            console.log("password saved as plain text");
            return re.status(500).json({
                success:false,
                message:"failed to save hashed password",
            });
        }

        res.status(200).json({success:true,message:"Password reset successfully"});
    }catch(error){
        console.error('reset password error:',error);
        res.status(500).json({
            success:false,
            message:"server error",
            error:error.message,
        });
    }
    //     const hashedPassword=await bcrypt.hash(newPassword,10);

    //     console.log("hashed password:",hashedPassword);

    //     user.password=hashedPassword;
    //     // await user.save();
    //     await User.updateOne({email},{$set:{password:hashedPassword}});

    //     const updatedUser=await User.findOne({email});
    //     console.log("updated password:",updatedUser.password);

    //     res.status(200).json({success:true,message:'Password reset successfully'});
    // }catch(error){
    //     console.error('Reset password error:',error);
    //     re.status(500).json({success:false,message:'Server error',error:error.message,});
    // }
};
