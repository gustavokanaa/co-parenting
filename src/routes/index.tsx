import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Cadastro from '../pages/Cadastro'
import Login from '../pages/Login'
import Home from '../pages/Home'
import Calendario from '../pages/Calendario'
import Perfil from '../pages/Perfil'
import Diario from '../pages/Diario'
import Familia from '../pages/Familia'

export default function AppRoutes() {
    return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<Navigate to="/cadastro" replace />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/diario" element={<Diario />} />
        <Route path="/familia" element={<Familia />} />
        </Routes>
    </BrowserRouter>
    )
}