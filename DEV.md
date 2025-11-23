# Development Environment Guide

This guide will help you set up and work with the development environment for the AC Website project.

## 🚀 Quick Start

```bash
# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

The development server will start at `http://localhost:5173`

## 📋 Prerequisites

- **Node.js**: >= 20.19.0 (see `.nvmrc` for exact version)
- **npm**: Comes with Node.js

### Using nvm (Node Version Manager)

If you use `nvm`, the project includes a `.nvmrc` file:

```bash
# Automatically use the correct Node version
nvm use

# Or install if not available
nvm install
```

## 🛠️ Available Development Scripts

### Development Server

```bash
# Start dev server (default)
npm run dev

# Start dev server and open browser automatically
npm run dev:open

# Start dev server with network access (accessible from other devices)
npm run dev:host
```

### Preview Production Build

```bash
# Preview production build locally
npm run preview

# Preview and open browser automatically
npm run preview:open
```

### Build & Optimization

```bash
# Build for production
npm run build

# Optimize assets and build for production
npm run build:prod

# Optimize images only
npm run optimize
```

### Code Quality

```bash
# Lint JavaScript files
npm run lint

# Format code with Prettier
npm run format
```

### Utilities

```bash
# Clean build artifacts and cache
npm run clean

# Full setup (install + start dev server)
npm run setup
```

## 🔧 Development Server Features

The Vite development server includes:

- **Hot Module Replacement (HMR)**: Instant updates without page refresh
- **Fast Refresh**: Preserves component state during updates
- **Source Maps**: Full debugging support
- **Network Access**: Accessible from other devices on your network
- **Error Overlay**: Clear error messages in the browser

### Server Configuration

- **Port**: 5173 (default, will try next available if in use)
- **Host**: `true` (accessible from network)
- **CORS**: Enabled
- **Cache**: Disabled for development (no-cache headers)

## 📁 Project Structure

```
AC Website/
├── src/              # Source JavaScript files
│   ├── cursor.js
│   ├── draggable.js
│   └── drag-scroll.js
├── assets/           # Static assets (images, fonts, etc.)
├── index.html        # Main entry point
├── work.html         # Work page
├── about.html        # About page
├── musings.html      # Musings page
├── styles.css        # Main stylesheet
├── vite.config.js    # Vite configuration
└── package.json      # Dependencies and scripts
```

## 🔄 Development Workflow

1. **Start the dev server**:
   ```bash
   npm run dev
   ```

2. **Make changes** to your files:
   - HTML files in root directory
   - JavaScript in `src/` directory
   - CSS in `styles.css`

3. **See changes instantly** - Vite's HMR will update the browser automatically

4. **Test production build**:
   ```bash
   npm run build
   npm run preview
   ```

## 🐛 Debugging

### Browser DevTools

- Open Chrome/Firefox DevTools (F12)
- Use the Sources tab to set breakpoints
- Source maps are enabled for full debugging

### Console Logging

In development mode, `console.log` statements are preserved. They will be removed in production builds.

### Common Issues

**Port already in use:**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

**Dependencies out of sync:**
```bash
# Clean and reinstall
npm run clean
rm -rf node_modules package-lock.json
npm install
```

**Build cache issues:**
```bash
# Clear Vite cache
npm run clean
```

## 🌐 Network Access

To access the dev server from other devices on your network:

```bash
npm run dev:host
```

Then access via your machine's IP address:
- Find your IP: `ifconfig` (Mac/Linux) or `ipconfig` (Windows)
- Access: `http://YOUR_IP:5173`

## 📝 Environment Variables

The project uses a `.env` file for environment-specific configuration:

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update values as needed (currently minimal, but ready for expansion)

## 🚀 Next Steps

- Make your changes in the source files
- The dev server will automatically reload
- Test your changes in the browser
- When ready, build for production with `npm run build:prod`

## 💡 Tips

- Keep the dev server running while developing
- Use browser DevTools for debugging
- Check the terminal for build errors
- Use `npm run preview` to test production builds locally
- Run `npm run lint` before committing code

---

For more information, see the main [README.md](./README.md)

