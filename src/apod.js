import './style.css'


async function loadNasaData() {
  const apiKey = 'ENfDSNfvOzIxfLQVojzgevfoWX8ZPTDzT40ETB4e';
  const url = `https://api.nasa.gov/planetary/apod?api_key=${apiKey}`;
  try {
    const response = await fetch(url);
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


