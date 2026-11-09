import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

const Verify = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginUser } = useAuth();

  // email comes from the Register or Login page
  const email = location.state?.email;

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // no email means the user opened this page directly
  if (!email) {
    return (
      <div className="flex min-h-[calc(100vh-61px)] items-center justify-center bg-slate-100 px-4">
        <p className="text-center text-slate-600">
          Please{" "}
          <Link to="/register" className="font-medium text-blue-600 hover:underline">
            sign up
          </Link>{" "}
          first.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-email", { email, code });
      loginUser(res.data.token, res.data.user);
      toast.success("Email verified. Welcome!");
      navigate("/");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    try {
      const res = await api.post("/auth/resend-otp", { email, type: "verify" });
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
          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">Verify your email</h1>
          <p className="mt-1 text-sm text-slate-500">
            We sent a 6-digit code to <span className="font-medium">{email}</span>
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

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Verifying..." : "Verify"}
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

export default Verify;