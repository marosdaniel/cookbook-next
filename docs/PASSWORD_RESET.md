
# Password Reset Implementation

This documentation describes the password reset flow and its technical details.

## Overview

The password reset process consists of two main steps:
1. **Request password reset**: The user provides their email address
2. **Set new password**: The user sets a new password using the token received in the email

## Technical Details

### Backend (GraphQL Resolvers)

#### `resetPassword` Mutation
- **File**: `src/lib/graphql/resolvers/user/mutations/resetPassword.ts`
- **How it works**:
  1. Checks if a user exists with the given email address
  2. Generates a unique token (UUID)
  3. Stores the token as a SHA256 hash in the database
  4. Sets the token expiration time (1 hour)
  5. Sends an email to the user with the token
  
**Security features**:
- Email enumeration protection: always returns a success message, even if the user does not exist
- Token hashing: only the hash is stored in the database
- Expiry: the token becomes invalid after 1 hour

#### `setNewPassword` Mutation
- **File**: `src/lib/graphql/resolvers/user/mutations/setNewPassword.ts`
- **How it works**:
  1. Checks the validity of the token by hashing
  2. Validates the strength of the new password (min. 8 characters, lowercase, uppercase, number)
  3. Sets the new password (bcrypt hash)
  4. Deletes the reset token from the database

**Password requirements**:
- Minimum 8 characters
- At least 1 lowercase letter
- At least 1 uppercase letter
- At least 1 number

### Email Service

**File**: `src/lib/email/nodemailer.ts`

**Functions**:
- `sendPasswordResetEmail`: Sends a formatted HTML email with the reset link
- `generateResetToken`: Generates a UUID-based token

**Email template includes**:
- Formatted HTML message with gradient header
- Call-to-action button
- Expiry warning for the token
- Plain text alternative

### Frontend Components

#### ResetPasswordForm
- **File**: `src/app/(auth)/reset-password/ResetPasswordForm.tsx`
- **Route**: `/reset-password`
- **Features**:
  - Email input
  - Form validation (Formik + Zod)
  - Success message display
  - Option to resend email

#### SetNewPasswordForm
- **File**: `src/app/(auth)/reset-password/[token]/SetNewPasswordForm.tsx`
- **Route**: `/reset-password/[token]`
- **Features**:
  - New password and confirmation input
  - Password strength validation
  - Automatic redirect to login on success
  - Token validity check

## Prisma Schema

The `User` model contains the token fields:

```prisma
model User {
  // ... other fields
  resetPasswordToken    String?
  resetPasswordExpires  DateTime?
  // ...
}
```

## Environment Variables

Configure the following in your `.env` file:

```env
# Email Configuration
EMAIL_HOST=<contact admin for credentials>
EMAIL_PORT=<contact admin for credentials>
EMAIL_SECURE=<contact admin for credentials>
EMAIL_USER=<contact admin for credentials>
EMAIL_PASSWORD=<contact admin for credentials>
EMAIL_FROM=<contact admin for credentials>
EMAIL_FROM_NAME=Cookbook

# Application URL
NEXTAUTH_URL=http://localhost:3000
```

> **⚠️ Note**: For email configuration credentials (EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM), please contact the project administrator.

### Gmail Setup (For Administrators)

1. Enable 2-factor authentication on your Google account
2. Generate an "App Password": https://myaccount.google.com/apppasswords
3. Use this password as the value for `EMAIL_PASSWORD`
4. Ensure the app password has no spaces when stored in environment variables

## Security Considerations

1. **Token Hashing**: Tokens are stored as SHA256 hashes
2. **Token Expiry**: Tokens automatically expire after 1 hour
3. **Email Enumeration Protection**: The system never reveals if an email exists
4. **Password Strength**: Strict validation against weak passwords
5. **HTTPS Recommended**: Always use HTTPS in production

## Testing

### Manual Testing Steps

1. Go to the `/reset-password` page
2. Enter an existing email address
3. Check your email inbox
4. Click the link or paste the token
5. Set a new password
6. Log in with the new password

### Edge Cases

- Non-existent email: success message, but no email sent
- Expired token: error message, request a new reset
- Weak password: validation error message
- Token reuse: only works once

## Translations

The system supports multiple languages:
- 🇬🇧 English (`en-gb.json`)
- 🇭🇺 Hungarian (`hu.json`)
- 🇩🇪 German (`de.json`)

All error messages and UI text are translated in all three languages.

## Developer Notes

- Uses Mantine component library for UI
- Formik + Zod for form handling and validation
- Apollo Client for GraphQL operations
- Nodemailer for email sending
- Prisma as the database ORM

## Related Files

```
src/
├── app/(auth)/reset-password/
│   ├── ResetPasswordForm.tsx
│   ├── page.tsx
│   ├── types.ts
│   └── [token]/
│       ├── SetNewPasswordForm.tsx
│       ├── page.tsx
│       └── types.ts
├── lib/
│   ├── email/
│   │   └── nodemailer.ts
│   ├── graphql/
│   │   ├── mutations.ts
│   │   └── resolvers/user/mutations/
│   │       ├── resetPassword.ts
│   │       └── setNewPassword.ts
│   └── validation/
│       └── validation.ts
└── locales/
    ├── en-gb.json
    ├── hu.json
    └── de.json
```
