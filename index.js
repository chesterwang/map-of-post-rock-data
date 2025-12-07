const assert = require('assert');
const fs = require('fs');
const ITERATIONS_COUNT = 1000;

var createLayout = require('ngraph.forcelayout');
var createGraph = require('ngraph.graph');

// Load artist similarity data
const artistData = JSON.parse(fs.readFileSync('./artist_similarity_results.json', 'utf8'));

var graph = createGraph();

// Build graph from artist similarity data
artistData.forEach((artistEntry, index) => {
  const artistName = artistEntry.artist;
  
  // Add links between artist and their similar artists
  if (artistEntry.similar_artists && Array.isArray(artistEntry.similar_artists)) {
    artistEntry.similar_artists.forEach((similarArtist) => {
      if (artistName !== similarArtist.name && similarArtist.name) {
        graph.addLink(artistName, similarArtist.name);
      }
    });
  }
});

// Get body that represents node 1:
var layout = createLayout(graph);

for (var i = 0; i < ITERATIONS_COUNT; ++i) {
  if (i % 10 === 0) {
    console.log('Iteration: ' + i);
  }
  layout.step();
}

// Prepare GeoJSON feature collection
var features = [];
var labelIdCounter = 1;

graph.forEachNode(function(node) {
  var pos = layout.getNodePosition(node.id);
  console.log(node.id + ': ' + JSON.stringify(pos));
  
  // Create GeoJSON feature for each artist node
  features.push({
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [pos.x, pos.y]
    },
    properties: {
      name: node.id,
      symbolzoom: 2,
      labelId: String(labelIdCounter),
      ownerId: 1
    }
  });
  labelIdCounter++;
});

// Create GeoJSON FeatureCollection
var geoJsonData = {
  type: 'FeatureCollection',
  features: features
};

// Save to file
fs.writeFileSync('./places.geojson', JSON.stringify(geoJsonData, null, 2), 'utf8');
console.log('GeoJSON file saved to places.geojson');