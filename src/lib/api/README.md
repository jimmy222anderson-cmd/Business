# API Client Documentation

This directory contains the API client implementation for the Earth Intelligence Platform, including error handling, loading states, and success notifications.

## Overview

The API client provides a centralized way to interact with the backend API, with built-in support for:
- Authentication token management
- Error handling with user-friendly messages
- Loading states for async operations
- Success/error toast notifications
- Type-safe API calls

## Core Components

### 1. API Client (`api-client.ts`)

The base API client handles all HTTP requests to the backend.

```typescript
import { apiClient } from '@/lib/api-client';

// GET request
const data = await apiClient.get('/endpoint');

// POST request
const result = await apiClient.post('/endpoint', { data });

// PUT request
const updated = await apiClient.put('/endpoint', { data });

// DELETE request
await apiClient.delete('/endpoint');

// File upload
const uploadResult = await apiClient.uploadFile('/upload', file);
```

**Features:**
- Automatic JWT token management
- JSON request/response handling
- Error parsing and handling
- File upload support

### 2. Error Handler (`errorHandler.ts`)

Provides comprehensive error handling with user-friendly messages.

```typescript
import { handleApiError, getUserFriendlyErrorMessage } from '@/lib/api/errorHandler';

try {
  await apiCall();
} catch (error) {
  const { message, statusCode } = handleApiError(error);
  console.error(`Error ${statusCode}: ${message}`);
}
```

**Error Types Handled:**
- Network errors (connection issues)
- Validation errors (400, 422)
- Authentication errors (401)
- Authorization errors (403)
- Not found errors (404)
- Server errors (500+)

**Helper Functions:**
- `isNetworkError(error)` - Check if error is a network error
- `isAuthError(error)` - Check if error is authentication error
- `isValidationError(error)` - Check if error is validation error
- `extractValidationErrors(error)` - Extract field-specific validation errors

### 3. API Helpers (`apiHelpers.ts`)

Utilities for common API operations with automatic toast notifications.

```typescript
import { executeApiCall, executeFormSubmission, executeWithRedirect } from '@/lib/api/apiHelpers';

// Execute API call with toast notifications
const result = await executeApiCall(
  () => createDemoBooking(data),
  {
    successTitle: 'Demo Booked!',
    successDescription: 'We will contact you soon.',
    onSuccess: (data) => console.log('Success:', data)
  }
);

// Execute form submission with auto-reset
const result = await executeFormSubmission(
  () => submitContactForm(data),
  reset, // form reset function
  {
    successTitle: 'Message Sent!',
    successDescription: 'We will get back to you soon.'
  }
);

// Execute with redirect on success
await executeWithRedirect(
  () => signIn(credentials),
  '/dashboard',
  navigate,
  { successTitle: 'Welcome back!' }
);
```

### 4. useAsync Hook (`hooks/use-async.ts`)

React hook for managing async operations with loading states.

```typescript
import { useAsync } from '@/hooks/use-async';

function MyComponent() {
  const { data, isLoading, error, execute } = useAsync(
    async (id: string) => fetchUser(id),
    {
      onSuccess: (user) => console.log('User loaded:', user),
      onError: (error) => console.error('Failed:', error)
    }
  );

  return (
    <div>
      {isLoading && <Spinner />}
      {error && <p>Error: {error}</p>}
      {data && <UserProfile user={data} />}
      <button onClick={() => execute('user-123')}>Load User</button>
    </div>
  );
}
```

**useAsyncForm Hook:**
```typescript
import { useAsyncForm } from '@/hooks/use-async';

function ContactForm() {
  const { isSubmitting, error, handleSubmit } = useAsyncForm(
    async (data) => submitContactForm(data),
    {
      onSuccess: () => {
        toast({ title: 'Form submitted!' });
        reset();
      }
    }
  );

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

## API Modules

### Authentication (`auth.ts`)

```typescript
import { signUp, signIn, signOut, getCurrentUser, forgotPassword, resetPassword } from '@/lib/api';

// Sign up
const { token, user } = await signUp({
  email: 'user@example.com',
  password: 'password123',
  fullName: 'John Doe'
});

// Sign in
const { token, user } = await signIn({
  email: 'user@example.com',
  password: 'password123'
});

// Sign out
await signOut();

// Get current user
const user = await getCurrentUser();

// Forgot password
await forgotPassword('user@example.com');

// Reset password
await resetPassword('reset-token', 'newPassword123');
```

### Demo Booking (`demo.ts`)

```typescript
import { createDemoBooking, getUserDemoBookings } from '@/lib/api';

// Create demo booking
const result = await createDemoBooking({
  fullName: 'John Doe',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  phoneNumber: '+1234567890',
  jobTitle: 'CEO',
  message: 'Interested in your platform'
});

// Get user's bookings
const bookings = await getUserDemoBookings(userId);
```

### Contact (`contact.ts`)

```typescript
import { submitContactForm, createContactInquiry } from '@/lib/api';

// Submit contact form (simplified)
const result = await submitContactForm({
  fullName: 'John Doe',
  email: 'john@example.com',
  subject: 'Question about pricing',
  message: 'I would like to know more about your pricing plans.'
});

// Create contact inquiry (detailed)
const inquiry = await createContactInquiry({
  inquiry_type: 'general',
  full_name: 'John Doe',
  email: 'john@example.com',
  subject: 'Question',
  message: 'Message content'
});
```

### Quote Request (`quote.ts`)

```typescript
import { createQuoteRequest, getUserQuoteRequests } from '@/lib/api';

// Create quote request
const result = await createQuoteRequest({
  fullName: 'John Doe',
  email: 'john@example.com',
  companyName: 'Acme Corp',
  phoneNumber: '+1234567890',
  industry: 'Financial Services',
  estimatedDataVolume: '10-50 TB/month',
  requirements: 'Need high-resolution satellite imagery for financial analysis'
});

// Get user's quote requests
const quotes = await getUserQuoteRequests(userId);
```

### Content (`content.ts`)

```typescript
import { getPrivacyPolicy, getTermsOfService } from '@/lib/api';

// Get privacy policy
const privacyPolicy = await getPrivacyPolicy();

// Get terms of service
const terms = await getTermsOfService();
```

## Loading States

### Spinner Component

```typescript
import { Spinner, LoadingOverlay, ButtonSpinner } from '@/components/ui/spinner';

// Basic spinner
<Spinner size="md" />

// Loading overlay
<LoadingOverlay message="Loading data..." />

// Button with spinner
<button disabled={isLoading}>
  {isLoading && <ButtonSpinner />}
  Submit
</button>
```

## Best Practices

### 1. Always Handle Errors

```typescript
try {
  const result = await apiCall();
  // Handle success
} catch (error) {
  const { message } = handleApiError(error);
  // Show error to user
  toast({
    title: 'Error',
    description: message,
    variant: 'destructive'
  });
}
```

### 2. Use Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

async function handleSubmit() {
  setIsLoading(true);
  try {
    await apiCall();
  } finally {
    setIsLoading(false);
  }
}

// Or use useAsync hook
const { isLoading, execute } = useAsync(apiCall);
```

### 3. Show Success Feedback

```typescript
await executeApiCall(
  () => submitForm(data),
  {
    successTitle: 'Success!',
    successDescription: 'Your form has been submitted.',
    showSuccessToast: true
  }
);
```

### 4. Disable Buttons During Submission

```typescript
<button type="submit" disabled={isSubmitting}>
  {isSubmitting ? (
    <>
      <ButtonSpinner />
      Submitting...
    </>
  ) : (
    'Submit'
  )}
</button>
```

### 5. Reset Forms After Success

```typescript
await executeFormSubmission(
  () => submitForm(data),
  reset, // React Hook Form reset function
  {
    successTitle: 'Form submitted!',
    successDescription: 'Thank you for your submission.'
  }
);
```

## Environment Variables

Configure the API base URL in your `.env` file:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

For production:

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

## Testing

When testing components that use the API client:

```typescript
import { apiClient } from '@/lib/api-client';

// Mock API client in tests
jest.mock('@/lib/api-client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  }
}));

// In test
(apiClient.post as jest.Mock).mockResolvedValue({ data: 'success' });
```

## Migration from Phase 2 to Phase 3

When migrating from placeholder implementations to real backend calls:

1. Replace `handleFormSubmission` with actual API calls:

```typescript
// Before (Phase 2)
await handleFormSubmission(data, {
  successTitle: 'Success!',
  onSuccess: () => reset()
});

// After (Phase 3)
await executeFormSubmission(
  () => createDemoBooking(data),
  reset,
  {
    successTitle: 'Demo Booked!',
    successDescription: 'We will contact you soon.'
  }
);
```

2. Update form components to use API functions:

```typescript
// Import API function
import { createDemoBooking } from '@/lib/api';

// Use in form submit handler
const onSubmit = async (data: FormData) => {
  await executeFormSubmission(
    () => createDemoBooking(data),
    reset,
    {
      successTitle: 'Demo Booked!',
      successDescription: 'We will contact you soon.'
    }
  );
};
```

## Troubleshooting

### CORS Errors

If you encounter CORS errors, ensure the backend is configured to allow requests from your frontend origin:

```javascript
// Backend (Express)
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
```

### Authentication Errors

If you get 401 errors, check that:
1. The JWT token is being stored correctly
2. The token is being sent in the Authorization header
3. The token hasn't expired

### Network Errors

If you get network errors:
1. Check that the API_BASE_URL is correct
2. Verify the backend server is running
3. Check your internet connection
4. Look for firewall or proxy issues
