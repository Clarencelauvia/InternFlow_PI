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
import UniversityLogin from './components/login/universitylogin'
import UniversityRegistration from './components/register/universityRegister'
import VerifyEmail from './components/register/VerifyEmail'
import Internships from './components/pages/Internships'
import MyInternships from './components/adminDashboard/MyInternships'
import UniversityDashboard from './components/dashboard/UnviersityDashboard/UniversityDashboard'
import InternshipApplication from './components/pages/InternshipApplication'
import NotificationBell from './components/adminDashboard/NotificationBell'
function App() {
 

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/student" element={<StudentRegistration />} />
        <Route path="/register/organisation" element={<OrganisationRegistration />} />
        <Route path= "/register/university" element={<UniversityRegistration />} />
        <Route path="/login" element={<ChoixConnexion />} />
        <Route path="/login/studentLogin" element={<StudentLogin />} />
        <Route path="/login/organisation" element={<OrganisationLogin />} />
        <Route path="/dashboard/studDashboard" element={<StudDashboard />} />
        <Route path="/dashboard/completeProfile" element={<CompleteProfile />} />
        <Route path="/admindashboard/completeOrgProfile" element={<CompleteOrgProfile />} />
        <Route path="/admindashboard/organisationDashboard" element={<OrganizationDashboard />} />
        <Route path="/login/universitylogin" element={<UniversityLogin />} />
        <Route path="/verifyEmail" element={<VerifyEmail />} />
        <Route path='/internships' element={<Internships />}/>
        <Route path='/myinternships' element={<MyInternships />}/>
        <Route path='/dashboard/universityDashboard' element={<UniversityDashboard />}/>
        <Route path='/internships/:id' element={<InternshipApplication />}/>
        <Route path='/notifications' element={<NotificationBell />}/>
      </Routes>
    </BrowserRouter>
    

     
    </>
  )
}

export default App
