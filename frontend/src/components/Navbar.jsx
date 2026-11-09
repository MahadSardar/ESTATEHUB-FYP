import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Building2, LogOut, Menu, X, User, LayoutDashboard } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success("Logged out");
        setOpen(false);
        navigate("/login");
    };

    return (
        <nav className="sticky top-0 z-40 border-b border-slate-800 bg-slate-900 shadow-sm">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                {/* logo */}
                <Link to="/" className="flex items-center gap-2 text-xl font-bold text-white">
                    <Building2 className="text-blue-400" size={26} />
                    EstateHub
                </Link>

                {/* desktop links */}
                <div className="hidden items-center gap-6 md:flex">
                    <Link to="/" className="text-gray-300 transition hover:text-white">
                        Home
                    </Link>

                    {user ? (
                        <>
                            <Link to="/create-listing" className="text-gray-300 transition hover:text-white">
                                Post Property
                            </Link>
                            <Link to="/my-listings" className="text-gray-300 transition hover:text-white">
                                My Listings
                            </Link>
                            {user.role === "admin" && (
                                <Link
                                    to="/admin"
                                    className="flex items-center gap-1 text-gray-300 transition hover:text-white"
                                >
                                    <LayoutDashboard size={18} /> Admin
                                </Link>
                            )}
                            <span className="flex items-center gap-1 text-gray-200">
                                <User size={18} /> {user.name}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="text-gray-300 transition hover:text-white">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>

                {/* mobile menu button */}
                <button className="text-white md:hidden" onClick={() => setOpen(!open)}>
                    {open ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {/* mobile menu */}
            {open && (
                <div className="flex flex-col gap-4 border-t border-slate-800 px-4 py-4 md:hidden">
                    <Link to="/" onClick={() => setOpen(false)} className="text-gray-300">
                        Home
                    </Link>

                    {user ? (
                        <>
                            <Link to="/create-listing" onClick={() => setOpen(false)} className="text-gray-300">
                                Post Property
                            </Link>
                            <Link to="/my-listings" onClick={() => setOpen(false)} className="text-gray-300">
                                My Listings
                            </Link>
                            {user.role === "admin" && (
                                <Link to="/admin" onClick={() => setOpen(false)} className="text-gray-300">
                                    Admin
                                </Link>
                            )}
                            <span className="text-gray-200">Hi, {user.name}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-white"
                            >
                                <LogOut size={18} /> Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" onClick={() => setOpen(false)} className="text-gray-300">
                                Login
                            </Link>
                            <Link
                                to="/register"
                                onClick={() => setOpen(false)}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-center text-white"
                            >
                                Sign up
                            </Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;