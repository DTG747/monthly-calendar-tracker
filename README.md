# Monthly Calendar Tracker

A collaborative web application that allows 7 people to select multiple dates that work for them, automatically identifies the top 3 most popular dates, and displays participant names for each selected date.

## Features

- **7 Participant Support** - Pre-configured for: Amit, Ben, Brian, Chris, Ilya, Krystian, and Tom
- **Multi-date Selection** - Each person can select multiple available dates
- **Real-time Visual Feedback** - Selected dates show participant initials and selection counts
- **Top 3 Calculation** - Automatically identifies and highlights the most popular dates
- **Dynamic Summary Panel** - Shows top 3 dates with participant names and counts
- **Month Navigation** - Previous/next month buttons with smooth transitions
- **Auto-refresh** - Automatically updates to current month when month changes
- **Data Persistence** - All selections saved in localStorage
- **Export Functionality** - Download summary as text file
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

## How to Use

1. **Open `calendar.html`** in any modern web browser
2. **Click any date** to open the participant selection modal
3. **Select participants** who are available on that date
4. **Save selections** to update the calendar
5. **View the summary panel** to see the top 3 most selected dates
6. **Navigate months** using the arrow buttons
7. **Export results** using the export button

## Files

- `calendar.html` - Main HTML structure
- `calendar.css` - Styling and responsive design
- `calendar.js` - JavaScript functionality and logic

## Technical Details

- **Frontend**: Vanilla HTML5, CSS3, ES6+ JavaScript
- **Data Storage**: localStorage for persistence
- **No Dependencies**: Pure static files, no external libraries required
- **Browser Support**: All modern browsers (Chrome, Firefox, Safari, Edge)

## Installation

1. Clone this repository:
   ```bash
   git clone [your-repo-url]
   ```

2. Open `calendar.html` in your web browser

3. Start selecting dates!

## Usage Instructions

### For Team Leads:
1. Share the app with your team members
2. Each person opens the app and selects their available dates
3. Review the top 3 dates in the summary panel
4. Make final scheduling decisions based on group availability

### For Participants:
1. Open the calendar app
2. Click on dates that work for you
3. Select your name in the modal dialog
4. Save your selections
5. Your availability will be visible to the team

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE). 