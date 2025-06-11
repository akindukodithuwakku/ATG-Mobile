# ATG Healthcare Care Plan Manager

A mobile and web-based application designed to streamline healthcare management by providing an intuitive platform for care plan management, appointment scheduling, medication tracking, and client-care navigator communication. This project includes features like user registration, profile management, readiness questionnaires, and an admin panel for overseeing care plans and generating reports.

## Features
- **User Registration & Profile Management**: For both clients and care navigators.
- **Readiness Questionnaire**: Helps clients assess whether they need a consultation.
- **Care Plan Management**: Clients can view and manage their care plans.
- **Appointment Scheduling**: Integrated with Calendly for easy appointment booking.
- **Admin Panel**: Admins can approve or reject care plans and generate reports.
- **Notification System**: Countdown notifications for upcoming appointments.

## Tech Stack
- **Frontend**: React Native with Expo
- **Backend**: AWS Lambda (serverless architecture)
- **Database**: Firebase
- **Other**: Calendly for appointment scheduling integration

## Installation

To install the necessary dependencies for the project, you have two options:

### Option 1: Standard Installation
Simply run the following command to install all the dependencies listed in the `package.json` file:

```bash
npm install
```

### Option 2: Custom Touch Installation
If you'd like to try out our custom installation process, we've added an extra touch with a `dependencies.txt` file and an installation script.

To use it, follow the instructions for your platform:

- **For macOS/Linux** (or any bash-compatible terminal):
  Run the following command:
  ```bash
  bash install-deps.sh
  ```

- **For Windows** (PowerShell):
  Run the following command:
  ```powershell
  .\install-deps.ps1
  ```

> **Note**: This step is optional. Both methods are equally valid for setting up the project.

## Usage

After installing the dependencies, start the development server by running:

```bash
npx expo start
```

This will start the Expo development server and display a QR code. From here, you have several options:

- Scan the QR code with Expo Go on your iOS or Android device
- Press 'w' to open in your web browser
- Press 'i' to open in iOS Simulator
- Press 'a' to open in Android Emulator

### Notes
- Make sure you have the Expo Go app installed on your mobile device for testing
- For iOS Simulator or Android Emulator usage, ensure you have the appropriate development tools installed
- For more information on setting up the development environment, refer to the official [Expo documentation](https://docs.expo.dev/get-started/installation/)


//kavindya_02
//kavin@123