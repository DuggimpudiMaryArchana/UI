const Skill = require('../models/skillsModel');
const Employee = require('../models/employeeModel');

//getting all skills for a particular employee
exports.getSkills = async(req,res) => {
    try{
        const {employeeId} = req.params;
        const skills = await Skill.find({employeeId});
        res.status(200).json(skills);
    }catch(err){
        res.status(500).json({error:err.message});
    }
};

//Add a new skill to an employee
exports.addSkill = async(req,res) => {
    try{
        const{
            employeeId,
            skillName,
            skillDescription,
            proficiencyLevel,
            experienceYears,
            projectLinks//expect JSON string or array from frontend
        }=req.body;

        const certificateFile = req.file;
        const certificateFileUrl = certificateFile ? `/uploads/${certificateFile.filename}` : null;

        const newSkill = new Skill({
            employeeId,
            skillName,
            skillDescription,
            proficiencyLevel,
            experienceYears,
            certificateFileUrl,
            status: 'pending',
            projectLinks: typeof projectLinks === 'string' ? JSON.parse(projectLinks) : projectLinks
        });

        const savedSkill = await newSkill.save();

        await Employee.findByIdAndUpdate(employeeId,{$push:{skills:savedSkill}});

        res.status(201).json({message: 'Skill added successfully', skill:savedSkill});
    }
    catch(err){
        console.error('Error adding skill:', err);
        res.status(500).json({error:err.message});
    }
};

//update an existing skill
exports.updateSkill = async(req,res) => {
    try{
        const { id } = req.params;

        // Validate if skill exists
        const existingSkill = await Skill.findById(id);
        if (!existingSkill) {
            return res.status(404).json({ error: 'Skill not found' });
        }

        const {
            skillName,
            skillDescription,
            proficiencyLevel,
            experienceYears,
            projectLinks
        } = req.body;

        // Validate required fields
        if (!skillName || !proficiencyLevel || experienceYears === undefined) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const updatedFields = {
            skillName,
            skillDescription: skillDescription || '',
            proficiencyLevel,
            experienceYears: Number(experienceYears),
            lastUpdated: Date.now()
        };

        // Handle certificate file if provided
        if (req.file) {
            updatedFields.certificateFileUrl = `/uploads/${req.file.filename}`;
        }

        // Handle project links
        if (projectLinks) {
            try {
                updatedFields.projectLinks = typeof projectLinks === 'string' 
                    ? JSON.parse(projectLinks) 
                    : projectLinks;
            } catch (error) {
                return res.status(400).json({ error: 'Invalid project links format' });
            }
        }

        const updatedSkill = await Skill.findByIdAndUpdate(
            id, 
            updatedFields,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: 'Skill updated successfully',
            skill: updatedSkill
        });
    }
    catch(err){
        console.error('Error updating skill:', err);
        res.status(500).json({
            error: 'Failed to update skill',
            details: err.message
        });
    }
};

//delete a skill
exports.deleteSkill = async(req,res) => {
    try{
        const {id} = req.params;

        const deletedSkill = await Skill.findByIdAndDelete(id);

        if(!deletedSkill){
            return res.status(404).json({message:'Skill not found'});
        }

        await Employee.findByIdAndUpdate(deletedSkill.employeeId,{
            $pull:{skills:deletedSkill._id}
        });

        res.status(200).json({message:'Skill deleted successfully'});
    }
    catch(err){
        res.status(500).json({error:err.message});
    }
};

// Get all pending skills
exports.getPendingSkills = async (req, res) => {
  try {
    console.log('Fetching pending skills...');
    
    // First, check if we have any pending skills
    const count = await Skill.countDocuments({ status: 'pending' });
    console.log(`Found ${count} pending skills`);

    const skills = await Skill.find({ status: 'pending' })
      .populate({
        path: 'employeeId',
        select: 'name email avatar'
      })
      .sort({ lastUpdated: -1 });

    console.log('Pending skills:', skills);

    res.status(200).json(skills);
  } catch (err) {
    console.error('Error fetching pending skills:', err);
    res.status(500).json({ error: 'Failed to fetch pending skills' });
  }
};

// Approve a skill
exports.approveSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedSkill = await Skill.findByIdAndUpdate(
      id, 
      { 
        status: 'approved', 
        lastUpdated: Date.now() 
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate({
      path: 'employeeId',
      select: 'name email avatar'
    });

    if (!updatedSkill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.status(200).json(updatedSkill);
  } catch (err) {
    console.error('Error approving skill:', err);
    res.status(500).json({ error: 'Failed to approve skill' });
  }
};

// Reject a skill
exports.rejectSkill = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedSkill = await Skill.findByIdAndUpdate(
      id, 
      { 
        status: 'rejected', 
        lastUpdated: Date.now() 
      },
      { 
        new: true,
        runValidators: true 
      }
    ).populate({
      path: 'employeeId',
      select: 'name email avatar'
    });

    if (!updatedSkill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.status(200).json(updatedSkill);
  } catch (err) {
    console.error('Error rejecting skill:', err);
    res.status(500).json({ error: 'Failed to reject skill' });
  }
};
