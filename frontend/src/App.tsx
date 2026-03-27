import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './components/pages/homepage'
import RegisterPage from './components/register/chooseRegister'
import StudentRegistration from './components/register/studentRegister'
import OrganisationRegistration from './components/register/organisationRegister'
import UniversityRegistration from './components/register/universityRegister'

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
      </Routes>
    </BrowserRouter>
    

     
    </>
  )
}

export default App
