# Class Timer Widget for Notion

A beautiful, modern countdown timer widget for tracking study goals across multiple classes. Features a clean, light green color scheme perfect for productivity and focus.

## Features

- ⏱️ **Countdown Timer** - Set goals in hours and minutes for each class
- ➕ **Add Multiple Classes** - Track as many classes as you need
- ▶️ **Start/Pause/Reset Controls** - Full control over each timer
- 📊 **Progress Tracking** - Visual progress bar for each class
- 💾 **Persistent Storage** - Your data is automatically saved in the browser
- 🎨 **Modern Design** - Beautiful light green gradient color scheme
- ✅ **Goal Completion** - Clear indication when you've reached your goal

## How to Use in Notion

### Method 1: Using a File Server (Recommended)

1. Host the `index.html` file on a web server or use a service like:
   - GitHub Pages
   - Netlify
   - Vercel
   - Any static file hosting service

2. In Notion, type `/embed` and paste the URL to your hosted file

### Method 2: Using a Local Server

1. Install a simple HTTP server (e.g., using Python):
   ```bash
   python -m http.server 8000
   ```

2. In Notion, type `/embed` and use: `http://localhost:8000/index.html`

### Method 3: Using Online Code Editors

1. Copy the contents of `index.html` to:
   - CodePen
   - JSFiddle
   - CodeSandbox

2. Get the preview/embed URL and add it to Notion using `/embed`

## Usage Instructions

### Adding a Class

1. Enter the class name (e.g., "Mathematics")
2. Set your goal duration in hours and minutes
3. Click "Add Class"

### Using the Timer

- **Start**: Begin the countdown timer
- **Pause**: Pause the timer (time remains saved)
- **Reset**: Reset the timer back to the original goal

### Managing Classes

- Click the **×** button in the top-right corner of any class card to delete it
- Your progress is automatically saved as you work

## Features in Detail

### Countdown Timer
Each class has its own independent countdown timer that tracks remaining time as you study.

### Progress Bar
Visual indicator showing how much time has been spent toward your goal.

### Persistent Storage
All your classes and timer states are saved in your browser's local storage, so you won't lose progress when you refresh the page.

### Goal Completion
When a timer reaches zero, you'll see a completion message and the timer will stop automatically.

## Color Scheme

The widget uses a modern, calming light green color palette:
- Background: Light green gradient (#e8f5e9 to #c8e6c9)
- Primary: Fresh green (#66bb6a to #43a047)
- Accents: Forest green (#2e7d32, #558b2f)
- Contrast: Clean white cards with subtle shadows

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Technical Details

- Pure HTML/CSS/JavaScript (no dependencies)
- Responsive design
- LocalStorage for data persistence
- Real-time timer updates

## Troubleshooting

**Timer not saving between refreshes?**
- Make sure your browser allows localStorage
- Check if you're in private/incognito mode (localStorage may not persist)

**Widget not displaying in Notion?**
- Ensure the file is hosted on a public URL with HTTPS
- Some embeds may require specific CORS headers

**Timer not starting?**
- Make sure the goal is greater than 0
- Try resetting the timer if it's stuck

## Customization

To customize colors or layout, edit the CSS section in `index.html`. The main color variables are clearly defined in the styles.

---

Made with 💚 for productive studying!
