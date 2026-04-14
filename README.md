# 🎨 AI Collaborative Whiteboard

A real-time collaborative whiteboard application built with React, Vite, and Socket.io. Multiple users can draw together on the same canvas in real-time.

## Features

✨ **Real-time Collaboration** - Draw simultaneously with multiple users
🎨 **Smooth Drawing** - High-performance canvas rendering
👥 **User Presence** - See how many users are connected
🔄 **Real-time Sync** - All strokes synchronized across clients
🎯 **Simple & Fast** - Built with Vite for instant HMR

## Project Structure

```
ai-whiteboard/
├── src/                    # Frontend (React + Vite)
│   ├── components/
│   │   ├── Whiteboard.jsx
│   │   └── Whiteboard.css
│   ├── App.jsx
│   ├── App.css
│   └── main.jsx
├── server/                 # Backend (Node.js + Socket.io)
│   ├── server.js
│   └── package.json
├── package.json
├── vite.config.js
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js 16+ and npm

### Step 1: Install Frontend Dependencies

```bash
npm install
```

### Step 2: Install Server Dependencies

```bash
cd server
npm install
cd ..
```

## Running the Application

You'll need **two terminal windows**:

### Terminal 1: Start the WebSocket Server

```bash
cd server
npm run dev
# or npm start for production
```

Expected output:
```
✨ Whiteboard server running on port 3001
🚀 WebSocket server ready for connections
```

### Terminal 2: Start the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173`

## Development Scripts

### Frontend (main repo)
- `npm run dev` - Start Vite dev server with HMR
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Backend (server/)
- `npm start` - Start server
- `npm run dev` - Start server with auto-reload

## How to Use

1. Open `http://localhost:5173` in multiple browser windows/tabs
2. Each browser tab represents a different user
3. Start drawing on the canvas
4. See all strokes appear in real-time on other browsers
5. Check the user count in the top right corner
6. Use "Clear Canvas" button to clear for all users

## Architecture

### Frontend (React)
- Canvas-based drawing using HTML5 Canvas API
- Socket.io client for real-time communication
- React hooks for state management
- Responsive UI with CSS

### Backend (Node.js)
- Express HTTP server
- Socket.io for WebSocket communication
- Room-based collaboration
- Drawing history tracking
- User session management

## Real-time Protocol

The app uses Socket.io events:

- `join-room` - User joins a collaboration room
- `draw-start` - Start drawing stroke
- `draw-line` - Continue drawing line
- `draw-end` - End drawing stroke
- `clear-canvas` - Clear canvas for all users
- `user-joined` - Notify others user joined
- `user-left` - Notify others user left

## Future Enhancements

- 🎨 Color picker for different colors
- ✏️ Stroke width adjustment
- 🗑️ Undo/Redo functionality
- 💾 Save/Export drawings
- 👥 Named users and avatars
- 🔒 Room passwords
- 📝 Text tool
- 🎯 Shape tools (rectangle, circle, line)
- 🤖 AI features (background generation, style transfer, etc.)

## Troubleshooting

### "Cannot GET /" error
- Ensure the backend server is running on port 3001

### Drawing not syncing
- Check browser console for errors
- Verify both frontend and backend are running
- Ensure localhost:3001 is accessible

### Port already in use
- Backend: Change `PORT` in `server/server.js`
- Frontend: Change port in `vite.config.js`

## Development Tips

- Use React DevTools for component debugging
- Use Socket.io DevTools to inspect WebSocket events
- Check browser console and server logs for errors

## License

MIT
