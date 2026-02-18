import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  message,
  action,
  className = '',
}: EmptyStateProps) {
  return (
    <div className={`flex items-center justify-center py-12 ${className}`}>
      <Card className="p-8 max-w-md text-center">
        <div className="space-y-4">
          <Icon className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-muted-foreground">{message}</p>
          {action && (
            <Button onClick={action.onClick} variant="outline">
              {action.label}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
