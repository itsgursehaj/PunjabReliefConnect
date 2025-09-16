# Punjab Flood Relief Connect

**A community-driven, open-source platform to connect flood-affected villages in Punjab with volunteers and aid providers.**

This project provides a centralized hub where individuals from affected villages can post their urgent needs, and volunteers can easily see where their help is required most. The platform is designed to be transparent, efficient, and accessible, with a bilingual interface in English and Punjabi.

## Key Features

### For the Public & Requesters
- **Submit Relief Requests:** A simple, mobile-friendly form for anyone to submit a relief request for their village, specifying needs like food, water, medicine, shelter, and more.
- **Bilingual Interface:** Full support for both English and Punjabi to ensure accessibility for local communities.
- **Privacy Focused:** Information is shared only with verified volunteers.
- **Resource Pages:** Access to important district helpline numbers, NGO contact information, and other resources.

### For Volunteers
- **Secure Authentication:** Sign up and log in securely using Google or an email and password. Email verification is required.
- **Interactive Dashboard:** View all active relief requests on an interactive map and in a filterable, sortable table.
- **Detailed Village View:** Click on any village to see aggregated needs, a list of contacts, current volunteers, and comments.
- **Join Relief Efforts:** Volunteers can publicly "join" a relief effort to show they are working on it.
- **Commenting System:** Communicate with other volunteers and post public updates directly on a village's request page.
- **Report Inaccurate Requests:** Flag requests that may be duplicates, spam, or resolved, helping to keep the data clean.
- **Vote to Close:** Volunteers can vote to close a request if they believe the needs have been met.

### For Administrators
- **Secure Admin Panel:** A dedicated section for administrators with powerful management tools.
- **User Management:** View all registered users, assign roles (admin, user), and block or unblock malicious users.
- **Contact Message Inbox:** Review and manage all messages sent through the site's contact form.
- **Comprehensive Audit Log:** A detailed, searchable log that tracks every significant action taken by users, including login events, API calls, and content modifications, complete with IP and location data.
- **Full Data Control:** Admins have the ability to delete individual requests or all requests associated with a village, manage comments, and dismiss reports.
- **Request Status Management:** Manually close or reopen all requests for a village based on verified information.

---

## Screenshots
- **Homepage**
  <img width="1588" height="2109" alt="homepage" src="https://github.com/user-attachments/assets/13a61dad-1162-49a2-aabd-3ad627db364f" />
- **Request Form**
  <img width="1588" height="1921" alt="Form" src="https://github.com/user-attachments/assets/1e923255-9a50-4358-92a2-fc7d7232e81a" />
- **Login/Sign up**
  <img width="1588" height="950" alt="Login" src="https://github.com/user-attachments/assets/01ab640e-c727-4b0c-b464-7c26cd0a2016" />
- **Dashboard**
  <img width="1588" height="1416" alt="Dashboard" src="https://github.com/user-attachments/assets/ccbd23bb-c468-4ee7-bb53-4019cb0fb7fd" />
- **Village Details**
  <img width="1588" height="2240" alt="Village" src="https://github.com/user-attachments/assets/565f2bac-49ef-4ce3-9445-6b593299173b" />

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [Google Firestore](https://firebase.google.com/docs/firestore)
- **Authentication:** [Firebase Authentication](https://firebase.google.com/docs/auth)
- **Deployment:** [Firebase App Hosting](https://firebase.google.com/docs/app-hosting)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Mapping:** [Google Maps Platform](https://developers.google.com/maps)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

- [Node.js](https://nodejs.org/) (v20 or later)
- [pnpm](https://pnpm.io/installation) (or npm/yarn)

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/punjab-flood-relief-connect.git
cd punjab-flood-relief-connect
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root of the project and add the following environment variables.

```env
# Firebase Public Configuration (Client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin SDK (Server-side)
# This MUST be a Base64-encoded string of your Firebase service account JSON file.
FIREBASE_SERVICE_ACCOUNT_KEY=

# Google Maps API Key
# Must have Geocoding API enabled in your Google Cloud project.
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=

# Primary Admin Email
# This email will have super-admin privileges and cannot be demoted.
FIREBASE_PRIMARY_ADMIN_EMAIL=
```

**How to get the `FIREBASE_SERVICE_ACCOUNT_KEY`:**
1.  In the Firebase console, go to **Project settings > Service accounts**.
2.  Click **Generate new private key** and save the JSON file.
3.  Encode the entire content of that JSON file into a Base64 string. You can use an online tool or the following terminal command:
    ```bash
    # For macOS/Linux
    base64 -i /path/to/your/service-account-file.json
    ```
4.  Copy the resulting Base64 string and paste it as the value for `FIREBASE_SERVICE_ACCOUNT_KEY`.

### 4. Run the Development Server

```bash
pnpm dev
```

The application should now be running at [http://localhost:9002](http://localhost:9002).

---

## Project Structure

```
/src
├── app/                  # Next.js App Router pages and layouts
│   ├── (admin)/          # Admin-only routes
│   ├── api/              # API routes (if any)
│   ├── actions.ts        # Server Actions for all database operations
│   └── page.tsx          # Home page
├── components/           # Reusable React components
│   ├── ui/               # shadcn/ui components
│   └── ...
├── hooks/                # Custom React hooks (e.g., useAuth, useReliefData)
├── lib/                  # Helper functions and utilities
│   ├── firebase-admin.ts # Server-side Firebase Admin SDK setup
│   ├── firebase.ts       # Client-side Firebase setup
│   └── ...
└── types/                # TypeScript type definitions (e.g., Village, User)
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or find a bug, please feel free to open an issue or submit a pull request.

## License

This project is open-source and available under the [MIT License](LICENSE).
