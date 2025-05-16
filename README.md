# Generic Leaflet Tester

A simple web application that demonstrates the use of Leaflet.js with OpenStreetMap tile layers.

## Features

- Displays a map using Leaflet.js
- Uses OpenStreetMap tiles via the URL: `https://tile.openstreetmap.org/{z}/{x}/{y}.png`
- Includes a sample marker with popup
- Includes a scale control

## How to Run

1. Make sure you have Node.js installed
2. Navigate to the project directory
3. Run the server with: `node server.js`
4. Open your browser and go to: `http://localhost:3000`

## Project Structure

- `index.html` - The main HTML file
- `app.js` - JavaScript code for initializing Leaflet and adding the tile layer
- `server.js` - A simple Node.js server to serve the application

## Notes

This is a basic demonstration. OpenStreetMap tiles may have usage restrictions, so please review OpenStreetMap's terms of service before using in a production environment.
