# Luminous - Client & Appointment Management System

Luminous is a modern, full-stack web application designed to help freelancers and small businesses effortlessly manage their clients and appointments. It provides a clean, intuitive dashboard for scheduling, client tracking, and team collaboration.

## Core Features

- **Dashboard**: An at-a-glance overview of key metrics, including total clients, upcoming appointments, and weekly signups.
- **Client Management**: A complete CRM to add, view, edit, and delete client information. Includes fields for contact details, personal information, and custom notes.
- **Appointment Calendar**: A visual calendar to manage and track all client appointments. Click on any day to see scheduled events.
- **Team Collaboration**: Invite team members via email to collaborate. Team members can view and manage the shared client list and calendar.
- **Analytics**: Visualize client growth and appointment statuses with interactive charts.
- **User Feedback System**: An admin-only section to view user feedback and ratings submitted through the app.
- **Secure Authentication**: Robust sign-in and registration system using Firebase Authentication, with support for email/password, Google, and GitHub providers.
- **User Settings**: Users can customize their profile, including company name and timezone, to personalize their experience.

## Technology Stack

This project is built with a modern, type-safe, and performant technology stack.

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://reactjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **State Management**: React Context API & Hooks
- **Backend & Database**: [Firebase](https://firebase.google.com/) (Authentication & Firestore)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit) (for backend flows like sending feedback emails)
- **Form Handling**: [React Hook Form](https://react-hook-form.com/)
- **Schema Validation**: [Zod](https://zod.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Charts**: [Recharts](https://recharts.org/)

## Getting Started

To run this project locally, you will need to set up a Firebase project and configure the necessary environment variables.

### 1. Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- `npm` or `yarn`

### 2. Set up Firebase

1.  Go to the [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  Go to **Build > Authentication** and enable the following sign-in methods:
    -   Email/Password
    -   Google
    -   GitHub
3.  Go to **Build > Firestore Database** and create a new database in **Production mode**.
4.  Navigate to **Project Settings** > **General**. Under "Your apps", create a new **Web app**.
5.  Copy the `firebaseConfig` object. You will need these keys for the environment variables.

### 3. Configure Environment Variables

Create a `.env.local` file in the root of the project and add your Firebase configuration keys:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# You may also need to configure your admin email for certain features
NEXT_PUBLIC_ADMIN_EMAIL=your-admin-email@example.com
```

### 4. Install Dependencies

Open your terminal and run:

```bash
npm install
```

### 5. Run the Development Server

You can now start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Contributing

We welcome contributions from the community! Please read our [Contributing Guidelines](CONTRIBUTING.md) to learn how you can help.

All contributors are expected to adhere to our [Code of Conduct](CODE_OF_CONDUCT.md).

## License

This project is licensed under the Apache License, Version 2.0. See the [LICENSE](LICENSE) file for the full license text.

The Apache License is a permissive free software license that allows users to use the software for any purpose, to distribute it, to modify it, and to distribute modified versions of the software under the terms of the license, without worrying about royalties.
