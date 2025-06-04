import './style.css';

const map = L.map('map').setView([0, 0], 2);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors', noWrap: true,  
}).addTo(map);

async function eventsNASAData() {
    const url = 'https://eonet.gsfc.nasa.gov/api/v2.1/events?limit=10&status=open';
    
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
                    
                    const isWildfire = event.categories.some(category => 
                        category.id === 8 || category.title.toLowerCase().includes('wildfire')
                    );
                    const isStorm = event.categories.some(category => 
                        category.id === 10 || category.title.toLowerCase().includes('severeStorms')
                    );
                    
                    let markerIcon;

                    if (isWildfire) {
                        markerIcon = L.divIcon({
                            html: '<div style="font-size: 24px;">🔥</div>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 15],
                            popupAnchor: [0, -15],
                            className: 'fire-marker'
                        });
                    } else if (isStorm) {
                        markerIcon = L.divIcon({
                            html: '<div style="font-size: 24px;">🌀</div>',
                            iconSize: [30, 30],
                            iconAnchor: [15, 15],
                            popupAnchor: [0, -15],
                            className: 'storm-marker'
                        });
                    } // Sinon, on ne définit pas d’icône : ce sera l’icône par défaut

                    // Crée un seul marqueur, avec l’icône si elle existe
                    const marker = L.marker([lat, lng], markerIcon ? { icon: markerIcon } : {}).addTo(map);
                    
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