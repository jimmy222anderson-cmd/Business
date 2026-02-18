import { AlertCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}: ErrorStateProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Card className="p-8 max-w-md text-center">
        <div className="space-y-4">
          <div className="text-destructive">
            <AlertCircle className="h-12 w-12 mx-auto mb-4" />
            <h3 className="text-lg font-semibold">{title}</h3>
          </div>
          <p className="text-muted-foreground">{message}</p>
          {onRetry && (
            <Button onClick={onRetry} variant="outline">
              {retryLabel}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
