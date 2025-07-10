# Clerk Authentication App

This is an example of a Next.js app that uses [Clerk](https://clerk.com) for authentication and user management. This project goes along with my [YouTube Tutorial]().

## Features

- **User Authentication**: Sign up, sign in, and profile management
- **Session Management**: Automatic logout on inactivity (15 minutes default)
- **Security**: Prevents session sharing between users in development
- **Custom Forms**: Beautiful, responsive authentication forms
- **Profile Management**: Edit profile information and avatar

## Session Security

This app includes automatic session management to prevent unauthorized access:

- **Inactivity Detection**: Automatically logs out users after 15 minutes of inactivity
- **Activity Tracking**: Monitors mouse, keyboard, and touch interactions
- **Visual Indicators**: Shows countdown timer when session is about to expire
- **Manual Logout**: Easy logout button in the header menu

## Usage

Go to your https://clerk.com dashboard and click on `Developer->API Keys` to copy your keys. Create a file named `.env.local` and add the following:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR KEY
CLERK_SECRET_KEY=YOUR KEY
```

### Optional Environment Variables

For session management customization:

```
# Enable/disable inactivity logout (default: true)
NEXT_PUBLIC_ENABLE_INACTIVITY_LOGOUT=true

# Session timeout in minutes (default: 15)
NEXT_PUBLIC_SESSION_TIMEOUT_MINUTES=15

# Show warning before logout (default: true)
NEXT_PUBLIC_SHOW_LOGOUT_WARNING=true
```

Install the dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Security Features

- **Automatic Logout**: Users are automatically logged out after 15 minutes of inactivity
- **Activity Monitoring**: Tracks user interactions to reset the session timer
- **Visual Feedback**: Shows remaining session time in the profile page
- **Warning System**: Displays a warning 1 minute before automatic logout
- **Manual Logout**: Easy logout option in the user menu

## Development Notes

- The app automatically detects user inactivity and logs them out
- Session timers reset on any user interaction (mouse, keyboard, touch)
- Visual indicators show when the session is about to expire
- Perfect for development environments where multiple users might access the same project
