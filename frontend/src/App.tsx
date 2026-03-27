import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/pages/homepage'
import RegisterPage from './components/register/chooseRegister'
import StudentRegistration from './components/register/studentRegister'
import OrganisationRegistration from './components/register/organisationRegister'
import UniversityRegistration from './components/register/universityRegister'
import ChoixConnexion from './components/login/chooselogin'
import StudentLogin from './components/login/studentlogin'
import UniversityLogin from './components/login/universitylogin'
import OrganisationLogin from './components/login/organisationlogin'

function App() {
 

  return (
    <>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/register/student" element={<StudentRegistration />} />
        <Route path="/register/organisation" element={<OrganisationRegistration />} />
        <Route path="/register/university" element={<UniversityRegistration />} />
        <Route path="/login" element={<ChoixConnexion />} />
        <Route path="/login/student" element={<StudentLogin />} />
        <Route path="/login/university" element={<UniversityLogin />} />
        <Route path="/login/organisation" element={<OrganisationLogin />} />
      </Routes>
    </BrowserRouter>
    

     
    </>
  )
}

export default App
