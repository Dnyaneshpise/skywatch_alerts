# CONTRIBUTING.md

## Setting Up Your Development Environment

1.  **Fork and Clone the Repository**:
    ```bash
    git clone [https://github.com/your-username/skywatch_alerts.git](https://github.com/your-username/skywatch_alerts.git)
    cd skywatch_alerts
    ```
2.  **Install Dependencies**:
    ```bash
    npm install
    ```
3.  **Set Up Firebase**:
    * Create a new project in the [Firebase Console](https://console.firebase.google.com/).
    * Add a new Web App to your project.
    * Enable **Email/Password** and **Google** sign-in methods in the Authentication section.
    * Copy your Firebase configuration credentials.

4.  **Create Environment File**:
    * Create a `.env.local` file in the project root.
    * Add your Firebase credentials to it, following the format in `.env.example`.
        ```ini
        # .env.local
        NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
        # ... and so on
        ```
5.  **Run the Development Server**:
    ```bash
    npm run dev
    ```