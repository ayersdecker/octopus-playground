# Virtual Octopus 🐙

A cute interactive pet octopus with AI-powered chat, built with vanilla HTML/CSS/JS and Groq API.

## Features

- 🎮 **Feed & Play**: Manage hunger and happiness with interactive buttons
- 💬 **AI Chat**: Talk naturally with your octopus powered by Groq's Mixtral model
- 🎨 **Animations**: Wiggle reactions, confetti, bubbles, and color-changing mood
- 💾 **Persistence**: Your octopus state saves automatically

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Get a free Groq API key

1. Visit [console.groq.com](https://console.groq.com)
2. Sign up (free, no credit card needed)
3. Create an API key

### 3. Run the server

```bash
GROQ_API_KEY=your_api_key_here npm start
```

The server will start on `http://localhost:3000`. Open it in your browser!

### 4. Chat with your octopus

- Type messages in the chat box
- Feed, give toys, and reset as needed
- Your octopus responds with AI-generated replies

## Development

To run in development mode:

```bash
GROQ_API_KEY=your_api_key_here node server.js
```

### Project Structure

- `index.html` - UI with SVG octopus and controls
- `styles.css` - Styling and animations
- `script.js` - Game logic and chat handling
- `server.js` - Express backend that proxies to Groq API

## How It Works

1. User types a message in the chat input
2. Frontend sends request to `/api/chat` endpoint
3. Server proxies the request to Groq API with stored key
4. Groq returns AI-generated response as a playful octopus
5. Response displays in chat with typing animation
6. Octopus reacts with wiggle and bubbles

## API Endpoint

### POST `/api/chat`

Send a chat message to get an octopus response.

**Request:**
```json
{
  "message": "Tell me a joke!"
}
```

**Response:**
```json
{
  "reply": "Why did the octopus cross the road? To get to the other tide! 🐙"
}
```

## Notes

- Requires Node.js and npm
- Free Groq API tier has generous limits for this use case
- Chat history is saved locally in browser
- Octopus state (hunger, happiness) persists in localStorage

## License

MIT
