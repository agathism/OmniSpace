

async function displayImagesInGallery() {
    const apiKey = 'ENfDSNfvOzIxfLQVojzgevfoWX8ZPTDzT40ETB4e';
    const url = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY=${apiKey}`;
    const images = await fetchImagesFromAPI(url);
    const gallery = document.getElementById('gallery');

    images.forEach(imageUrl => {
        const imgElement = document.createElement('img');
        imgElement.src = imageUrl;
        imgElement.className = 'w-full h-auto rounded-lg shadow-md';
        gallery.appendChild(imgElement);
    });
}

const apiUrl = 'https://api.example.com/images';
displayImagesInGallery(apiurl);