import './style.css';

const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', 
    noWrap: true,  
}).addTo(map);

// Configuration des catégories avec leurs emojis et classes CSS
const categoryConfig = {
    6: { emoji: '🌵', className: 'drought-marker', keywords: ['drought'] },
    7: { emoji: '🌫️', className: 'dust-haze-marker', keywords: ['dust', 'haze'] },
    16: { emoji: '🌍', className: 'earthquake-marker', keywords: ['earthquake'] },
    9: { emoji: '🌊', className: 'flood-marker', keywords: ['flood'] },
    14: { emoji: '🏔️', className: 'landslide-marker', keywords: ['landslide'] },
    19: { emoji: '🏭', className: 'manmade-marker', keywords: ['manmade'] },
    15: { emoji: '🧊', className: 'sea-lake-ice-marker', keywords: ['sea', 'lake ice', 'iceberg'] },
    10: { emoji: '🌀', className: 'severe-storm-marker', keywords: ['storm', 'hurricane', 'cyclone'] },
    17: { emoji: '❄️', className: 'snow-marker', keywords: ['snow'] },
    18: { emoji: '🌡️', className: 'temperature-extreme-marker', keywords: ['temperature'] },
    12: { emoji: '🌋', className: 'volcano-marker', keywords: ['volcano'] },
    13: { emoji: '🌊', className: 'water-color-marker', keywords: ['water color'] },
    8: { emoji: '🔥', className: 'wildfire-marker', keywords: ['wildfire'] }
};

// Fonction pour déterminer la catégorie d'un événement
function getEventCategory(event) {
    for (const [categoryId, config] of Object.entries(categoryConfig)) {
        const hasCategory = event.categories.some(category => {
            const matchesId = category.id === parseInt(categoryId);
            const matchesKeyword = config.keywords.some(keyword => 
                category.title.toLowerCase().includes(keyword.toLowerCase())
            );
            return matchesId || matchesKeyword;
        });
        
        if (hasCategory) {
            return config;
        }
    }
    return null; // Aucune catégorie trouvée
}

async function eventsNASAData() {
    const url = 'https://eonet.gsfc.nasa.gov/api/v2.1/events?limit=40&status=open';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('Données reçues:', data); 
        return data.events; 
    } catch (error) {
        console.error('Error fetching NASA data:', error);
        return [];
    }
}

function addEventMarkers(events) {
    events.forEach(event => {
        if (event.geometries && event.geometries.length > 0) {
            event.geometries.forEach(geometry => {
                if (geometry.coordinates) {
                    let lat, lng;
                    if (geometry.type === 'Point') {
                        lng = geometry.coordinates[0];
                        lat = geometry.coordinates[1];
                    } else {
                        lng = geometry.coordinates[0];
                        lat = geometry.coordinates[1];
                    }

                    // Détermine la catégorie de l'événement
                    const eventCategory = getEventCategory(event);
                    
                    let markerIcon;
                    
                    if (eventCategory) {
                        markerIcon = L.divIcon({
                            html: `<div style="font-size: 24px;">${eventCategory.emoji}</div>`,
                            iconSize: [30, 30],
                            iconAnchor: [15, 15],
                            popupAnchor: [0, -15],
                            className: eventCategory.className
                        });
                    } else {
                        // Marqueur par défaut si aucune catégorie n'est trouvée
                        markerIcon = L.divIcon({
                            html: '<div style="font-size: 24px;">❓</div>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 15],
                            popupAnchor: [0, -15],
                            className: 'default-marker'
                        });
                    }

                    // Crée un seul marqueur avec l'icône appropriée
                    const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
                    
                    marker.bindPopup(`
                        <h3>${event.title}</h3>
                        <p><strong>Type:</strong> ${event.categories[0]?.title || 'Non spécifié'}</p>
                        <p><strong>Date:</strong> ${new Date(geometry.date).toLocaleDateString()}</p>
                        <p><strong>Statut:</strong> ${event.closed ? 'Fermé' : 'Ouvert'}</p>
                        <p><strong>Coordonnées:</strong> ${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                        ${event.sources && event.sources.length > 0 ? 
                            `<p><a href="${event.sources[0].url}" target="_blank">Plus d'infos</a></p>` : 
                            ''}
                    `);
                }
            });
        }
    });
}

async function loadAndDisplayEvents() {
    console.log('Chargement des événements NASA...');
    
    const events = await eventsNASAData();
    
    if (events && events.length > 0) {
        console.log(`${events.length} événements trouvés`);
        addEventMarkers(events);
        
        if (events.length > 0) {
            const group = new L.featureGroup();
            events.forEach(event => {
                if (event.geometries && event.geometries.length > 0) {
                    event.geometries.forEach(geometry => {
                        if (geometry.coordinates) {
                            const lat = geometry.coordinates[1];
                            const lng = geometry.coordinates[0];
                            group.addLayer(L.marker([lat, lng]));
                        }
                    });
                }
            });
            
            if (group.getLayers().length > 0) {
                map.fitBounds(group.getBounds(), { padding: [20, 20] });
            }
        }
    } else {
        console.log('Aucun événement trouvé');
    }
}

loadAndDisplayEvents();