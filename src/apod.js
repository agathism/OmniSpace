import './style.css'

async function loadNasaData() {
  try {
    const response = await fetch('https://api.nasa.gov/planetary/apod?api_key=ENfDSNfvOzIxfLQVojzgevfoWX8ZPTDzT40ETB4e');
    const data = await response.json();
    
    document.getElementById('titre').textContent = data.title;
    document.getElementById('description').textContent = data.explanation;

    const container = document.getElementById('media-container');
    
    if (data.media_type === 'image') {
      const img = document.createElement('img');
      img.src = data.url;
      img.alt = data.title;
      container.appendChild(img);
    } 
  } catch (error) {
    document.getElementById('titre').textContent = "Erreur de chargement";
    console.error(error);
  }
}

loadNasaData();
