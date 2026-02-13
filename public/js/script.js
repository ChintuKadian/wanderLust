document.addEventListener("DOMContentLoaded", function () {

  // =============================
  // BOOTSTRAP FORM VALIDATION
  // =============================
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });


  // =============================
  // REVIEW STAR SYSTEM
  // =============================
  const stars = document.querySelectorAll("#starRating i");
  const ratingInput = document.querySelector("#ratingInput");

  if (stars.length > 0 && ratingInput) {
    stars.forEach((star) => {
      star.addEventListener("click", () => {
        const value = star.getAttribute("data-value");
        ratingInput.value = value;

        stars.forEach((s, index) => {
          if (index < value) {
            s.classList.remove("fa-regular");
            s.classList.add("fa-solid", "text-warning");
          } else {
            s.classList.remove("fa-solid", "text-warning");
            s.classList.add("fa-regular");
          }
        });
      });
    });
  }


  // =============================
  // INDEX PAGE MAP
  // =============================
  const indexMapDiv = document.getElementById("index-map");

  if (indexMapDiv) {
    const listings = JSON.parse(indexMapDiv.dataset.listings);

    const indexMap = L.map("index-map").setView([20, 0], 2);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(indexMap);

    listings.forEach(listing => {
      if (listing.geometry) {
        const marker = L.marker([
          listing.geometry.lat,
          listing.geometry.lng
        ]).addTo(indexMap);

        marker.bindPopup(`
          <b>${listing.title}</b><br>
          ₹${listing.price}<br>
          <a href="/listings/${listing._id}">View</a>
        `);
      }
    });
  }


  // =============================
  // SHOW + EDIT PAGE MAP
  // =============================
  const mapDiv = document.getElementById("map");

  if (mapDiv) {
    const geometry = JSON.parse(mapDiv.dataset.geometry);
    if (!geometry) return;

    const { lat, lng } = geometry;

    const map = L.map("map").setView([lat, lng], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      draggable: mapDiv.dataset.edit === "true"
    }).addTo(map);

    marker.bindPopup("Loading location...").openPopup();


    // Reverse Geocode
    async function reverseGeocode(lat, lng) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();

        const city =
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state ||
          "Unknown";

        const country = data.address.country || "Unknown";

        marker.setPopupContent(`<b>${city}</b><br>${country}`).openPopup();

        const locationInput = document.querySelector('input[name="listing[location]"]');
        const countryInput = document.querySelector('input[name="listing[country]"]');

        if (locationInput) locationInput.value = city;
        if (countryInput) countryInput.value = country;

      } catch (err) {
        marker.setPopupContent("Location not found").openPopup();
      }
    }

    reverseGeocode(lat, lng);

    // EDIT MODE DRAG
    if (mapDiv.dataset.edit === "true") {
      const latInput = document.getElementById("latInput");
      const lngInput = document.getElementById("lngInput");

      if (latInput && lngInput) {
        latInput.value = lat;
        lngInput.value = lng;

        marker.on("dragend", function (e) {
          const newPos = e.target.getLatLng();
          latInput.value = newPos.lat;
          lngInput.value = newPos.lng;
          reverseGeocode(newPos.lat, newPos.lng);
        });
      }
    }


    // =============================
    // FULLSCREEN TOGGLE
    // =============================
    const toggleBtn = document.querySelector(".map-toggle-btn");
    const wrapper = document.querySelector(".map-wrapper");

    if (toggleBtn && wrapper) {
      toggleBtn.addEventListener("click", function () {

        const isFullscreen = wrapper.classList.toggle("fullscreen");

        toggleBtn.innerHTML = isFullscreen
          ? '<i class="fa-solid fa-compress"></i>'
          : '<i class="fa-solid fa-expand"></i>';

        setTimeout(() => {
          map.invalidateSize();
          map.flyTo(
            map.getCenter(),
            isFullscreen ? 15 : 13,
            { animate: true, duration: 1 }
          );
        }, 400);
      });
    }
  }


  // =============================
  // MOBILE MAP BUTTON
  // =============================
  const mobileBtn = document.querySelector(".mobile-map-btn");
  const mapContainer = document.querySelector(".map-container");

  if (mobileBtn && mapContainer) {
    mobileBtn.addEventListener("click", function () {

      mapContainer.style.display = "block";
      mapContainer.style.position = "fixed";
      mapContainer.style.top = "0";
      mapContainer.style.left = "0";
      mapContainer.style.width = "100%";
      mapContainer.style.height = "100%";
      mapContainer.style.zIndex = "1000";

      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 200);
    });
  }

});
// =============================
// TOGGLE MAP OVERLAY
// =============================
const openMapBtn = document.getElementById("openMapBtn");
const closeMapBtn = document.getElementById("closeMapBtn");
const mapOverlay = document.getElementById("mapOverlay");

if (openMapBtn && mapOverlay) {

  let mapInstance; // Prevent duplicate map initialization

  openMapBtn.addEventListener("click", function () {

    mapOverlay.classList.add("active");

    if (!mapInstance) {
      const mapDiv = document.getElementById("index-map");
      const listings = JSON.parse(mapDiv.dataset.listings);

      mapInstance = L.map("index-map").setView([20, 0], 2);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstance);

      const markersGroup = new L.featureGroup();

      listings.forEach(listing => {
        if (listing.geometry) {
          const marker = L.marker([
            listing.geometry.lat,
            listing.geometry.lng
          ]);

          marker.bindPopup(`
            <b>${listing.title}</b><br>
            ₹${listing.price}<br>
            <a href="/listings/${listing._id}">View</a>
          `);

          marker.addTo(mapInstance);
          markersGroup.addLayer(marker);
        }
      });

      if (markersGroup.getLayers().length > 0) {
        mapInstance.fitBounds(markersGroup.getBounds());
      }
    }

    setTimeout(() => {
      mapInstance.invalidateSize();
    }, 300);
  });

  closeMapBtn.addEventListener("click", function () {
    mapOverlay.classList.remove("active");
  });
}
