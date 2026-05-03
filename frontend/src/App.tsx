import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/pages/homepage'
import RegisterPage from './components/register/chooseRegister'
import StudentRegistration from './components/register/studentRegister'
import OrganisationRegistration from './components/register/organisationRegister'
import ChoixConnexion from './components/login/chooselogin'
import StudentLogin from './components/login/studentlogin'
import OrganisationLogin from './components/login/organisationlogin'
import StudDashboard from './components/dashboard/studDashboard'
import CompleteProfile from './components/dashboard/CompleteProfile'
import CompleteOrgProfile from './components/adminDashboard/completOrgProfile'
import OrganizationDashboard from './components/adminDashboard/organisationDashboard'
function App() {
 

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/student" element={<StudentRegistration />} />
        <Route path="/register/organisation" element={<OrganisationRegistration />} />
        <Route path="/login" element={<ChoixConnexion />} />
        <Route path="/login/studentLogin" element={<StudentLogin />} />
        <Route path="/login/organisation" element={<OrganisationLogin />} />
        <Route path="/dashboard/studDashboard" element={<StudDashboard />} />
        <Route path="/dashboard/completeProfile" element={<CompleteProfile />} />
        <Route path="/admindashboard/completeOrgProfile" element={<CompleteOrgProfile />} />
        <Route path="/admindashboard/organisationDashboard" element={<OrganizationDashboard />} />
      </Routes>
    </BrowserRouter>
    

     
    </>
  )
}

export default App
