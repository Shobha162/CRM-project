import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { setToken } from "../Redux/Auth/authSlice";
import CircularProgress from "@mui/material/CircularProgress";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "https://vrd.konceptsoftwaresolutions.com/crystalion/w-auth/login",
        { email, password },
        { withCredentials: true }
      );

      const token = res.data?.token;

      if (!token) {
        throw new Error("Token not received");
      }

      const user = res.data?.user;
      const role = user?.role;

      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${token}`;

      dispatch(
        setToken({
          token,
          role: role,
          name: user?.name || null,
          email: user?.email || null,
          phone: user?.phone || [],
          ability: {
            departments: user?.departments || [],
            profile: role,
          },
        })
      );

      localStorage.setItem("token", token);

      toast.success(res.data.message || "Login successful!");

      navigate(`/${role}/dashboard`);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Login failed! Please try again.";

      toast.error(message);

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "linear-gradient(135deg, rgba(5,117,97,0.08), rgba(189,186,6,0.08))",
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl px-8 py-10 shadow-2xl"
        style={{
          background: "#ffffff",
          border: "1px solid rgba(5,117,97,0.15)",
        }}
      >
        {/* Heading */}
        <div className="text-center mb-10">
          <h1
            className="text-3xl font-bold"
            style={{
              background: "var(--gradient-primary)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Welcome Back
          </h1>

          <p
            className="mt-2 text-lg font-bold "
            style={{ color: "var(--text-primary)" }}
          >
            Login to continue
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="text-sm px-4 py-3 rounded-xl mb-5"
            style={{
              background: "rgba(151, 6, 203, 0.08)",
              border: "1px solid rgba(151, 6, 203, 0.25)",
              color: "var(--red-soft)",
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin}>
          {/* Email */}
          <div className="relative mb-7">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="peer w-full px-2 pt-6 pb-2 bg-transparent border-b-2 focus:outline-none transition-all"
              style={{
                color: "var(--text-primary)",
                borderColor: "rgba(5,117,97,0.4)",
              }}
            />

            <label
              className="absolute left-2 top-2 text-md transition-all
              peer-focus:top-0 peer-focus:text-sm"
              style={{
                color: "var(--pink-soft)",
              }}
            >
              Email
            </label>
          </div>

          {/* Password */}
          <div className="relative mb-8">
            <input
              type={showPass ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="peer w-full px-2 pt-6 pb-2 bg-transparent border-b-2 focus:outline-none transition-all"
              style={{
                color: "var(--text-primary)",
                borderColor: "rgba(5,117,97,0.4)",
              }}
            />

            <label
              className="absolute left-2 top-2 text-md transition-all
              peer-focus:top-0 peer-focus:text-sm"
              style={{
                color: "var(--pink-soft)",
              }}
            >
              Password
            </label>

            {/* Toggle */}
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-2 bottom-3 transition-all"
              style={{
                color: "var(--pink-soft)",
              }}
            >
              {showPass ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-2xl text-white font-semibold text-lg transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: "var(--gradient-primary)",
              boxShadow:
                "0 10px 20px rgba(5,117,97,0.25)",
            }}
          >
            {loading ? (
              <div className="flex items-center justify-center gap-3">
                <CircularProgress
                  size={20}
                  color="inherit"
                />
                Authenticating...
              </div>
            ) : (
              "Login"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;