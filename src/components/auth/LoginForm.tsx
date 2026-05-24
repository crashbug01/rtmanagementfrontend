import { useState } from "react";
import { useNavigate } from "react-router-dom";
// 1. IMPORT INSTANCE API DARI UTIL (Sesuaikan path folder util.tsx Anda)
import api from "../../util/api";
import { EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Button from "../ui/button/Button";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  // State untuk form login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // Fungsi untuk menangani submit form
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    // VALIDASI MANUAL
    if (!email || !password) {
      setError("Email dan Password wajib diisi.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // 2. MENGGUNAKAN API INSTANCE
      // Cukup panggil "/login", baseURL otomatis digabungkan dari util.tsx
      const response = await api.post("/login", {
        email: email,
        password: password,
      });

      // Simpan token ke localStorage
      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Redirect ke dashboard
      navigate("/");
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Terjadi kesalahan saat menghubungi server.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
          </div>

          <div>
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                {/* Menampilkan Error */}
                {error && (
                  <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg dark:bg-red-500/10 dark:border-red-500/20">
                    {error}
                  </div>
                )}

                <div>
                  <Label>
                    Email <span className="text-error-500">*</span>{" "}
                  </Label>
                  <Input
                    type="email"
                    placeholder="info@gmail.com"
                    value={email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label>
                    Password <span className="text-error-500">*</span>{" "}
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setPassword(e.target.value)
                      }
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                    >
                      {showPassword ? (
                        <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      ) : (
                        <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between"></div>

                <div>
                  <Button
                    type="submit"
                    className="w-full"
                    size="sm"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing in..." : "Sign in"}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
