

async function geocodeLocation(location, country) {
  const query = encodeURIComponent(`${location}, ${country}`);
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "WanderLust-App" // REQUIRED by Nominatim
    }
  });

  const data = await res.json();

  if (!data || data.length === 0) {
    return null;
  }

  return {
    lat: parseFloat(data[0].lat),
    lng: parseFloat(data[0].lon)
  };
}

module.exports = geocodeLocation;
