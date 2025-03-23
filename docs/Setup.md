# Setup & Build Process

## Installation

This project uses submodules, so instead of the usual cloning process, you need to use the `--recurse-submodules` flag:

```bash
git clone --recurse-submodules <repo-url>
```

This ensures that both the main project repository and its submodules are downloaded.

---

Once the project has been cloned, install all dependencies for both the Vite server and the API using:

```bash
npm run install:all
```

## Configuration

### Development Mode

To speed up development, a dev mode is available that runs the essential parts of the project—the frontend and the file management server.

Run the following command to start the app in development mode:

```bash
npm run dev:all
```

This will launch both the Vite server and the Nodemon server with the `DEBUG` environment variable injected into both.

**Note:** When running the server in development mode, the frontend’s file access API will not be available. To configure the server, update the settings in `server/settings.json` by specifying the file paths and allowed file types.

## Running the Full Application

To run the application outside of debug mode, you need to follow the [Tauri prerequisites guide](https://tauri.app/start/prerequisites/) to set up your environment for Windows, macOS, or Linux.

Once you have completed the setup, follow these steps:

1. **Install all dependencies**

   ```bash
   npm run install:all
   ```

2. **Build the server sidecar**

   ```bash
   npm run build:server
   ```

   This generates an executable of the server inside the `server/dist` folder.

3. **Move the server executable to the Tauri binaries folder**

   Since Tauri requires a specific naming convention for binaries, use the following command to handle renaming and placement:

   ```bash
   npm run build:server:bin
   ```

4. **Run the application**

   ```bash
   npm run tauri dev
   ```

Now, the full application should be up and running!
