# 🍽️ Restaurant Ordering App

This is a React Native app built with Expo for restaurant staff to manage orders, tables, and menu items.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Configure API URL (Optional)

   Create a `.env` file in the root directory:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```
   
   If not set, the app will default to `http://localhost:3000/api/v1`

3. Start the app

   ```bash
   npx expo start
   ```

## Authentication

The app uses JWT authentication. Make sure your backend API Gateway is running at the configured URL.

### Login Endpoint
- **URL:** `POST /api/v1/auth/login`
- **Body:** `{ "username": "staff1", "password": "password123" }`
- **Response:** `{ "user": {...}, "accessToken": "...", "refreshToken": "..." }`

See `docs/brief_api.md` for full API documentation.

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
