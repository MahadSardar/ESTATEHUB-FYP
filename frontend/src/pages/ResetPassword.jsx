import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();


  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  if (!email) {
    return (
      <div className="flex min-h-[calc(100vh-61px)] items-center justify-center bg-slate-100 px-4">
        <p className="text-center text-slate-600">
          Please start from{" "}
          <Link to="/forgot-password" className="font-medium text-blue-600 hover:underline">
            Forgot password
          </Link>
          .
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/reset-password", { email, code, newPassword });
      toast.success(res.data.message);
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      const res = await api.post("/auth/resend-otp", { email, type: "reset" });
      toast.success(res.data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-61px)] items-center justify-center bg-slate-100 px-4 py-8">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center">
          <ShieldCheck className="mx-auto mb-2 text-blue-600" size={36} />
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Reset password</h1>
          <p className="mt-1 text-sm text-slate-500">
            Enter the code sent to <span className="font-medium">{email}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full rounded-lg border border-slate-300 py-3 text-center text-2xl tracking-widest outline-none focus:border-blue-600"
          />

          <div className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 focus-within:border-blue-600">
            <Lock size={18} className="text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Didn't get the code?{" "}
          <button onClick={handleResend} className="font-medium text-blue-600 hover:underline">
            Resend code
          </button>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;