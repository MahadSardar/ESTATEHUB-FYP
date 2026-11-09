import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, Building2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", { email, password });
      loginUser(res.data.token, res.data.user);
      toast.success("Welcome back!");
      navigate("/");
    } catch (error) {
      // email not verified yet: go to the Verify page
      if (error.response?.data?.needsVerification) {
        toast.error(error.response.data.message);
        navigate("/verify", { state: { email: error.response.data.email } });
      } else {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-[calc(100vh-61px)] items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center">
          <Building2 className="mx-auto mb-2 text-blue-600" size={36} />
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Log in to your EstateHub account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-blue-600">
            <Mail size={18} className="text-slate-400" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 text-sm outline-none sm:text-base"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-blue-600">
            <Lock size={18} className="text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full py-3 text-sm outline-none sm:text-base"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;