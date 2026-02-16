import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Reset Password Form Schema
const resetPasswordSchema = z.object({
  newPassword: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Extract token from URL on component mount
  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      toast({
        title: "Invalid Reset Link",
        description: "The password reset link is invalid or missing. Please request a new one.",
        variant: "destructive",
      });
      navigate('/auth/forgot-password');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams, navigate, toast]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      toast({
        title: "Error",
        description: "Reset token is missing. Please try again.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to reset password');
      }

      setIsSuccess(true);
      toast({
        title: "Password Reset Successful",
        description: "Your password has been changed. You can now sign in with your new password.",
      });

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/auth/signin');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "Failed to reset password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const newPassword = watch("newPassword");

  // Password strength indicator
  const getPasswordStrength = (password: string) => {
    if (!password) return { strength: 0, label: "" };
    
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { strength, label: "Weak", color: "bg-red-500" };
    if (strength === 3) return { strength, label: "Fair", color: "bg-yellow-500" };
    if (strength === 4) return { strength, label: "Good", color: "bg-blue-500" };
    return { strength, label: "Strong", color: "bg-green-500" };
  };

  const passwordStrength = getPasswordStrength(newPassword || "");

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-white">Password Reset Successful!</CardTitle>
              <CardDescription className="text-gray-400">
                Your password has been changed successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center text-gray-300">
                You will be redirected to the sign in page in a few seconds...
              </p>
              <Button
                onClick={() => navigate('/auth/signin')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                Sign In Now
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black flex items-center justify-center p-4">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Reset Your Password</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* New Password Field */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-white">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-sm text-red-400">{errors.newPassword.message}</p>
                )}
                
                {/* Password Strength Indicator */}
                {newPassword && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded ${
                            level <= passwordStrength.strength
                              ? passwordStrength.color
                              : "bg-gray-600"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      Password strength: <span className="font-semibold">{passwordStrength.label}</span>
                    </p>
                  </div>
                )}

                <div className="text-xs text-gray-400 space-y-1">
                  <p>Password must contain:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    <li className={newPassword?.length >= 8 ? "text-green-400" : ""}>
                      At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(newPassword || "") ? "text-green-400" : ""}>
                      One uppercase letter
                    </li>
                    <li className={/[a-z]/.test(newPassword || "") ? "text-green-400" : ""}>
                      One lowercase letter
                    </li>
                    <li className={/[0-9]/.test(newPassword || "") ? "text-green-400" : ""}>
                      One number
                    </li>
                  </ul>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-white">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm new password"
                    className="bg-gray-700/50 border-gray-600 text-white placeholder:text-gray-400 pr-10"
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </Button>

              {/* Back to Sign In Link */}
              <div className="text-center">
                <Link
                  to="/auth/signin"
                  className="text-sm text-yellow-500 hover:text-yellow-400"
                >
                  Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
