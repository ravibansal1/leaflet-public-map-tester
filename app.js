// Initialize the map
const map = L.map('map').setView([40.7128, -74.0060], 9);

// Add zoom level display
const zoomDisplay = L.control({position: 'bottomleft'});
zoomDisplay.onAdd = function(map) {
    const div = L.DomUtil.create('div', 'info zoom-display');
    div.innerHTML = 'Zoom Level: ' + map.getZoom();
    return div;
};
zoomDisplay.addTo(map);

// Update zoom level display when zoom changes
map.on('zoomend', function() {
    document.querySelector('.zoom-display').innerHTML = 'Zoom Level: ' + map.getZoom();
    console.log('Current zoom level:', map.getZoom());
});

// Add event listeners to debug tile loading
map.on('layeradd', function(e) {
    console.log('Layer added:', e.layer);
});

map.on('layerremove', function(e) {
    console.log('Layer removed:', e.layer);
});

// Add a base map (Google Maps style)
const baseLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 22,
  attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
}).addTo(map);

// Array to store all custom layers
const customLayers = [];

// Generate a unique ID for each layer
function generateLayerId() {
  return 'layer-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

// Function to create a shortened display name from a URL
function createDisplayName(url, type) {
  // Extract the domain and part of the path for display
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const pathParts = urlObj.pathname.split('/');
    const lastPathPart = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || '';
    return `${domain}/${lastPathPart}`.substring(0, 25);
  } catch (e) {
    // If URL parsing fails, just return a truncated version
    return url.substring(0, 25) + (url.length > 25 ? '...' : '');
  }
}

// Function to create a tile layer
function createTileLayer(url) {
  return L.tileLayer(url, {
    maxZoom: 22
  });
}

// Function to create a GeoJSON layer
function createGeoJSONLayer(url) {
  // Return a promise to handle async loading
  return new Promise((resolve, reject) => {
    fetch(url)
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const layer = L.geoJSON(data, {
          style: function(feature) {
            return {
              color: '#c75b1c',
              weight: 2,
              opacity: 1,
              fillColor: '#c75b1c',
              fillOpacity: 0.5
            };
          },
          pointToLayer: function(feature, latlng) {
            return L.circleMarker(latlng, {
              radius: 6,
              fillColor: '#c75b1c',
              color: '#c75b1c',
              weight: 1,
              opacity: 1,
              fillOpacity: 0.5
            });
          }
        });
        resolve(layer);
      })
      .catch(error => {
        console.error('Error loading GeoJSON:', error);
        reject(error);
      });
  });
}

// Function to create a Vector Grid layer
function createVectorGridLayer(url) {
  return L.vectorGrid.protobuf(url, {
    vectorTileLayerStyles: {
      layer: (properties, zoom) => {
        const maxZoom = 16;
        if(zoom > maxZoom) return {};
        const geometry = properties['geometry-type'];
        const color = '#c75b1c';
    
        if (geometry === 'Polygon') {
          return {
            fill: true,
            fillColor: color,
            fillOpacity: 0.5,
            stroke: true,
            color: color,
            opacity: 1,
            weight: 2
          };
        }
    
        if (geometry === 'LineString') {
          return {
            stroke: true,
            color: color,
            opacity: 0.5,
            weight: 2
          };
        }
    
        if (geometry === 'Point') {
          return {
            radius: 6,
            fill: true,
            fillColor: color,
            fillOpacity: 0.5,
            stroke: false
          };
        }
    
        // Default fallback style
        return {
          fill: true,
          fillColor: color,
          fillOpacity: 0.3,
          stroke: true,
          color: color,
          weight: 1
        };
      }
    },      
    interactive: true,
    maxZoom: 22
  });
}

// Function to add a layer to the active layers list
function addLayerToList(id, name, type, layer) {
  const layersList = document.getElementById('active-layers');
  
  // Create list item
  const listItem = document.createElement('li');
  listItem.className = 'layer-item';
  listItem.dataset.layerId = id;
  
  // Create layer info container
  const layerInfo = document.createElement('div');
  layerInfo.className = 'layer-info';
  
  // Add layer type badge
  const typeSpan = document.createElement('span');
  typeSpan.className = 'layer-type';
  typeSpan.textContent = type;
  layerInfo.appendChild(typeSpan);
  
  // Add layer name
  const nameSpan = document.createElement('span');
  nameSpan.className = 'layer-name';
  nameSpan.textContent = name;
  nameSpan.title = name; // For tooltip on hover
  layerInfo.appendChild(nameSpan);
  
  listItem.appendChild(layerInfo);
  
  // Add remove button
  const removeBtn = document.createElement('button');
  removeBtn.className = 'remove-layer';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', function() {
    // Remove layer from map
    map.removeLayer(layer);
    
    // Remove layer from array
    const index = customLayers.findIndex(l => l.id === id);
    if (index !== -1) {
      customLayers.splice(index, 1);
    }
    
    // Remove list item
    listItem.remove();
    
    console.log(`Layer ${id} removed`);
  });
  
  listItem.appendChild(removeBtn);
  layersList.appendChild(listItem);
}

// Handle the add map button click
document.getElementById('add-map-btn').addEventListener('click', async function() {
  const url = document.getElementById('url-input').value.trim();
  const mapType = document.getElementById('maptype-select').value;
  
  if (!url) {
    alert('Please enter a URL');
    return;
  }
  
  try {
    console.log(`Creating ${mapType} layer with URL: ${url}`);
    
    // Create a unique ID for this layer
    const layerId = generateLayerId();
    const displayName = createDisplayName(url, mapType);
    let layer;
    
    // Create the appropriate layer based on the selected type
    switch (mapType) {
      case 'TILE':
        layer = createTileLayer(url);
        break;
      case 'GEOJSON':
        layer = await createGeoJSONLayer(url);
        break;
      case 'VECTORGRID':
        layer = createVectorGridLayer(url);
        break;
      default:
        console.error('Unknown map type:', mapType);
        alert('Unknown map type selected');
        return;
    }
    
    // Add the layer to the map
    layer.addTo(map);
    
    // Add event listeners for debugging
    if (layer.on) {
      layer.on('loading', function() {
        console.log(`${mapType} layer (${layerId}) loading...`);
      }).on('load', function() {
        console.log(`${mapType} layer (${layerId}) loaded`);
      }).on('error', function(e) {
        console.error(`${mapType} layer (${layerId}) error:`, e);
      });
    }
    
    // Store the layer in our array
    customLayers.push({
      id: layerId,
      type: mapType,
      url: url,
      name: displayName,
      layer: layer
    });
    
    // Add the layer to the UI list
    addLayerToList(layerId, displayName, mapType, layer);
    
    console.log(`${mapType} layer (${layerId}) added to map`);
    
    // Clear the URL input field for the next layer
    document.getElementById('url-input').value = '';
    
  } catch (error) {
    console.error('Error creating layer:', error);
    alert(`Error creating layer: ${error.message}`);
  }
});

// Example URLs for testing:
// TILE: https://tile.openstreetmap.org/{z}/{x}/{y}.png
// GEOJSON: https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson
// VECTORGRID: https://api.ellipsis-drive.com/v3/ogc/mvt/476dbd15-c2fd-4bd1-a6e8-a6aeac887a16/{z}/{x}/{y}?timestampId=3b123728-d2bf-4a36-b2dc-634b5d8857d6&token=epat_mRt5CWMCDoO1cENhlq1PQmVLYDhydJMUyhkgyQd44WU5qX9dBMt0cv6Nwbr9R3Fk