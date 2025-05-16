# Generic Leaflet Tester

A simple web application that demonstrates the use of Leaflet.js with Google Maps tile layers.

## Features

- Displays a map using Leaflet.js
- Uses Google Maps tiles via the URL: `https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}`
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

This is a basic demonstration. Google Maps tiles may have usage restrictions, so please review Google's terms of service before using in a production environment.
