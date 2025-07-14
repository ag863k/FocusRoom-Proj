# FocusRoom

A modern, lightweight Pomodoro timer application built with vanilla JavaScript and modern web technologies.

## Features

- Clean, minimal interface with glassmorphism design
- 25-minute focus sessions with 5-minute short breaks and 15-minute long breaks
- Session tracking and statistics
- Local storage for settings persistence
- Audio notifications for session completion
- Browser notifications support
- Responsive design for all devices
- No authentication required - works immediately

## Technology Stack

- **Frontend**: Vanilla JavaScript (ES6+), HTML5, CSS3
- **Storage**: LocalStorage for persistence
- **Build**: Static file deployment
- **Deployment**: Vercel (configured)

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- No server or build tools required

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/focusroom.git
   cd focusroom
   ```

2. Open `index.html` in your browser or serve the files with any static file server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```

### Usage

1. Open the application in your browser
2. Adjust timer settings if needed (focus time, break durations)
3. Click "Start" to begin a focus session
4. Take breaks when prompted
5. Track your progress with the built-in statistics

## Project Structure

```
focusroom/
├── index.html          # Main application page
├── timer.js           # Core timer functionality (ES6 class)
├── styles.css         # Glassmorphism styling
├── package.json       # Project configuration
├── vercel.json        # Deployment configuration
├── .gitignore         # Git ignore patterns
└── README.md          # Project documentation
```

## Features in Detail

### Timer Functionality
- Customizable focus and break durations
- Visual progress indicator with circular timer
- Session and cycle tracking
- Automatic progression through work/break cycles

### Statistics Tracking
- Daily session count
- Total time focused
- Current streak tracking
- Completed cycles counter

### Modern Design
- Glassmorphism UI with backdrop filters
- Responsive layout for mobile and desktop
- Professional brown color scheme
- Smooth animations and transitions

## Browser Support

- Chrome 88+
- Firefox 84+
- Safari 14+
- Edge 88+

## Performance

- Lightweight: ~50KB total size
- No external dependencies
- Optimized for fast loading
- Efficient local storage usage

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/improvement`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/improvement`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

The application is configured for deployment on Vercel with optimized caching and performance settings.

Deploy your own instance:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/focusroom)

## Contact

For questions or suggestions, please open an issue on GitHub.
