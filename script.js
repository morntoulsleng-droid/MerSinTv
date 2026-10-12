// បើកដំណើរការ Telegram Web App SDK
let tg = window.Telegram.WebApp;
tg.expand();

// ទិន្នន័យគំរូជាងម៉ូតូ
const mechanicsData = [
    { id: 1, name: "ជាង វុធ ប៉ះកង់ម៉ូតូ", lat: 11.5564, lng: 104.9282, phone: "012345678", services: "ប៉ះកង់, ដូរប្រេងម៉ាស៊ីន" },
    { id: 2, name: "ជាង ម៉ៅ ជួសជុលទូទៅ", lat: 11.5624, lng: 104.9160, phone: "098765432", services: "ជួសជុលម៉ាស៊ីន, ប៉ះកង់តាមផ្លូវ" },
    { id: 3, name: "ហាង ជួសជុលម៉ូតូ ២៤ម៉ោង", lat: 11.5500, lng: 104.9350, phone: "011223344", services: "សេវាសង្គ្រោះបន្ទាន់ ២៤ម៉ោង" }
];

let map;
let userMarker;

document.addEventListener("DOMContentLoaded", () => {
    // កំណត់ផែនទីដំបូងនៅភ្នំពេញ
    map = L.map('map').setView([11.5564, 104.9282], 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    displayMechanics(mechanicsData);
});

// មុខងារស្វែងរកទីតាំងបច្ចុប្បន្ន
function findNearbyMechanics() {
    const statusDiv = document.getElementById("status");
    
    if (!navigator.geolocation) {
        statusDiv.innerHTML = "❌ Browser មិនាំទ្រទ្រង់ទ្រាយទីតាំងទេ។";
        return;
    }

    statusDiv.innerHTML = "📡 កំពុងទាញយកទីតាំងបច្ចុប្បន្នរបស់អ្នក...";

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const userLat = position.coords.latitude;
            const userLng = position.coords.longitude;

            statusDiv.innerHTML = "✅ រកឃើញទីតាំងរបស់អ្នកជោគជ័យ!";
            map.setView([userLat, userLng], 14);

            if (userMarker) {
                map.removeLayer(userMarker);
            }
            userMarker = L.marker([userLat, userLng]).addTo(map)
                .bindPopup("<b>📍 ទីតាំងរបស់អ្នក</b>").openPopup();

            calculateDistanceAndSort(userLat, userLng);
        },
        () => {
            statusDiv.innerHTML = "❌ សូមបើក GPS របស់អ្នកដើម្បីស្វែងរកជាង។";
        }
    );
}

// រូបមន្តគណនាចម្ងាយ (Km)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// គណនាចម្ងាយ តម្រៀប និងបង្ហាញបញ្ជី
function calculateDistanceAndSort(userLat, userLng) {
    const container = document.getElementById("list-container");
    container.innerHTML = "";

    const sortedMechanics = mechanicsData.map(mech => {
        const dist = calculateDistance(userLat, userLng, mech.lat, mech.lng);
        return { ...mech, distance: dist };
    }).sort((a, b) => a.distance - b.distance);

    sortedMechanics.forEach(mech => {
        L.marker([mech.lat, mech.lng]).addTo(map)
            .bindPopup(`<b>${mech.name}</b><br>${mech.services}<br>ចម្ងាយ: ${mech.distance.toFixed(2)} គីឡូម៉ែត្រ`);

        const card = document.createElement("div");
        card.className = "mechanic-card";
        card.innerHTML = `
            <div class="mechanic-info">
                <h3>${mech.name}</h3>
                <p>🛠️ ${mech.services}</p>
                <p>📍 ចម្ងាយ: <b>${mech.distance.toFixed(2)} គីឡូម៉ែត្រ</b></p>
            </div>
            <a href="tel:${mech.phone}" class="call-btn">📞 ខល</a>
        `;
        container.appendChild(card);
    });
}

function displayMechanics(data) {
    const container = document.getElementById("list-container");
    container.innerHTML = "";
    data.forEach(mech => {
        L.marker([mech.lat, mech.lng]).addTo(map).bindPopup(`<b>${mech.name}</b><br>${mech.services}`);
        
        const card = document.createElement("div");
        card.className = "mechanic-card";
        card.innerHTML = `
            <div class="mechanic-info">
                <h3>${mech.name}</h3>
                <p>🛠️ ${mech.services}</p>
            </div>
            <a href="tel:${mech.phone}" class="call-btn">📞 ខល</a>
        `;
        container.appendChild(card);
    });
}