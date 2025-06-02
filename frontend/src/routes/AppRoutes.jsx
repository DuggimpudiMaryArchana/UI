// import React from 'react';
// import {Routes, Route} from 'react-router-dom';
// import Login from '../pages/Login';
// import Register from '../pages/Register';
// import EmployeeDashboard from '../pages/employee/Dashboard';
// import HRDashboard from '../pages/hr/Dashboard';
// import VerifierDashboard from '../pages/verifier/Dashboard';
// import AdminDashboard from '../pages/admin/Dashboard'
// import ProtectedRoute from '../routes/ProtectedRoute';
// import LandingPage from '../pages/LandingPage';
// import SkillTrackingPage from '../pages/SkillTrackingPage';
// import TeamInsightsPage from '../pages/TeamInsightsPage';
// import CertificationPage from '../pages/CertificationPage';
// import { Navigate } from 'react-router-dom';
// const AppRoutes = () => {
//     return (
//         <Routes>
//             <Route path='/' element={<LandingPage/>}/>
//             <Route path="/login" element={<Login/>}/>
//             <Route path="/register" element={<Register/>}/>
//             <Route 
//             path="/employee/dashboard/:id" 
//             element={
//             <ProtectedRoute role="employee">
//                 <EmployeeDashboard/>
//                 </ProtectedRoute>
//             }
//             />
//             <Route 
//             path="/verifier/dashboard/:id" 
//             element={
//             <ProtectedRoute role="verifier">
//                 <VerifierDashboard/>
//                 </ProtectedRoute>
//             }
//             />
//             <Route 
//             path="/hr/dashboard/:id" 
//             element={
//             <ProtectedRoute role="hr">
//                 <HRDashboard/>
//                 </ProtectedRoute>
//             }
//             />
//             <Route 
//             path="/admin/dashboard/:id" 
//             element={
//             <ProtectedRoute role="admin">
//                 <AdminDashboard/>
//                 </ProtectedRoute>
//             }
//             />
//             <Route
//             path='/feature/skill-tracking'
//             element={<SkillTrackingPage/>}/>
//             <Route
//             path='/feature/team-insights'
//             element={<TeamInsightsPage/>}/>
//             <Route
//             path='/feature/certifications'
//             element={<CertificationPage/>}/>
//         </Routes>
//     );
// };

// export default AppRoutes;


import React from 'react';
import {Routes, Route} from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import EmployeeDashboard from '../pages/employee/Dashboard';
import HRDashboard from '../pages/hr/Dashboard';
import VerifierDashboard from '../pages/verifier/Dashboard';
import ProtectedRoute from '../routes/ProtectedRoute';
import LandingPage from '../pages/LandingPage';
import AdminDashboard from '../pages/admin/Dashboard'
import { Navigate } from 'react-router-dom';
const AppRoutes = () => {
    return (
        <Routes>
            <Route path='/' element={<LandingPage/>}/>
            <Route path="/login" element={<Login/>}/>
            <Route path="/register" element={<Register/>}/>
            <Route 
            path="/employee/dashboard/:id" 
            element={
            <ProtectedRoute role="employee">
                <EmployeeDashboard/>
                </ProtectedRoute>
            }
            />
            <Route 
            path="/verifier/dashboard/:id" 
            element={
            <ProtectedRoute role="verifier">
                <VerifierDashboard/>
                </ProtectedRoute>
            }
            />
            <Route 
            path="/hr/dashboard/:id" 
            element={
            <ProtectedRoute role="hr">
                <HRDashboard/>
                </ProtectedRoute>
            }
            />
             <Route 
            path="/admin/dashboard/:id" 
            element={
            <ProtectedRoute role="admin">
                <AdminDashboard/>
                </ProtectedRoute>
            }
            />
            <Route/>

        </Routes>
    );
};

export default AppRoutes;
