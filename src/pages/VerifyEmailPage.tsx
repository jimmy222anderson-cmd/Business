import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { verifyEmail } from "@/lib/api/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

type VerificationStatus = 'verifying' | 'success' | 'error';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<VerificationStatus>('verifying');
  const [message, setMessage] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please check your email and try again.');
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail(token);
        setStatus('success');
        setMessage(response.message || 'Email verified successfully!');
        
        toast({
          title: "Email Verified!",
          description: "Your email has been verified. You can now sign in.",
        });
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. The link may have expired.');
        
        toast({
          title: "Verification Failed",
          description: error.message || "Failed to verify email. Please try again.",
          variant: "destructive",
        });
      }
    };

    verify();
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              {status === 'verifying' && (
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
              )}
              {status === 'success' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <XCircle className="w-10 h-10 text-red-600" />
                </div>
              )}
            </div>
            <CardTitle className="text-2xl font-bold text-center">
              {status === 'verifying' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </CardTitle>
            <CardDescription className="text-center">
              {message}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {status === 'success' && (
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/auth/signin')}
                  className="w-full"
                >
                  Sign In to Your Account
                </Button>
                <Button
                  onClick={() => navigate('/')}
                  variant="outline"
                  className="w-full"
                >
                  Go to Home
                </Button>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/auth/signup')}
                  className="w-full"
                >
                  Sign Up Again
                </Button>
                <Button
                  onClick={() => navigate('/contact')}
                  variant="outline"
                  className="w-full"
                >
                  Contact Support
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
