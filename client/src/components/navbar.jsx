import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/authContext';
import { FaArrowRight, FaTicket } from 'react-icons/fa6';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="site-nav">
            <div className="site-nav__inner">
                <Link to="/" className="brand">
                    <span className="brand__mark"><FaTicket aria-hidden="true" /></span>
                    <span>Eventizr</span>
                </Link>
                <div className="site-nav__links">
                    <Link to="/" className="nav-link">Discover</Link>
                    {user && <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="nav-link">My space</Link>}
                    {user ? (
                        <button onClick={handleLogout} className="nav-button nav-button--quiet">Sign out</button>
                    ) : (
                        <>
                            <Link to="/login" className="nav-link">Sign in</Link>
                            <Link to="/register" className="nav-button">Join now <FaArrowRight aria-hidden="true" /></Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
