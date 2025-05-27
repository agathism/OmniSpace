import './style.css'

async function loadNasaData() {
  try {
    const response = await fetch('https://api.nasa.gov/neo/rest/v1/neo/3542519?api_key=ENfDSNfvOzIxfLQVojzgevfoWX8ZPTDzT40ETB4e');
    const data = await response.json();
    
    document.getElementById('titre').textContent = data.title;
    document.getElementById('description').textContent = data.explanation;
    
  } catch (error) {
    document.getElementById('titre').textContent = "Erreur de chargement";
    console.error(error);
  }
}

loadNasaData();