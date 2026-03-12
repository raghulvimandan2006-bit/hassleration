# **App Name**: RationEase

## Core Features:

- User Registration: Collect user details (Name, Address, Zone, Phone, Ration card) and register them using OTP verification via SMS gateway API.
- OTP Verification: Verify user's phone number using a 4-digit OTP sent via SMS, using the API at 'https://api.example.com/send-sms' and API key 'YOUR_SMS_API_KEY'.
- Unique ID Generation: Generate a unique ID for each user upon successful registration.
- Token Request and Slot Assignment: Automatically assign users to a time slot (9AM–12PM, 5 slots) upon token request and send confirmation SMS with token number and time via SMS gateway API.
- Admin Login: Secure admin login using Firebase Authentication.
- Dashboard Analytics: Display total registered users, individual user details, today’s token count, and stock levels (Rice, Wheat, Dhal, Sugar, Oil) in the admin dashboard.
- Token Management: Enable admin to view, manage tokens, and set daily token limits.

## Style Guidelines:

- Primary color: A calming blue (#64B5F6) to instill trust and reliability.
- Background color: Light, desaturated blue (#E3F2FD) to create a clean and airy feel.
- Accent color: A gentle green (#A5D6A7) to indicate availability and positive actions.
- Body and headline font: 'PT Sans' (sans-serif) for a modern yet approachable feel.
- Use simple, easily recognizable icons for navigation and key actions.
- Clean and intuitive layout with clear separation of content sections.
- Subtle animations and transitions to provide feedback and enhance user experience.