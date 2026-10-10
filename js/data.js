// WanderWise Master State & Presets
// Dedicated for: Kamran Mohsin

const DESTINATION_TEMPLATES = {
  "swat": {
    name: "Swat Valley, Pakistan",
    hotelName: "Swat Serena Hotel, Saidu Sharif",
    hotelLocalScript: "ہوٹل سوات سیرینا، مین سیدو شریف روڈ، سوات",
    bookingRef: "SWAT-PKR-2292",
    weather: { tempC: 22, tempF: 72, condition: "Light Rain Expected", humidity: "68%", rainProbability: "65%", icon: "🌧️" },
    dailyPlans: [
      {
        title: "Arrival & Local Heritage",
        activities: [
          { time: "09:00 AM", title: "Arrival at Islamabad & Scenic Drive", type: "transport", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "3 hrs" },
          { time: "01:00 PM", title: "Transfer across Swat Motorway & Green Pass", type: "transport", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "2.5 hrs" },
          { time: "04:00 PM", title: "Check-in at Swat Serena Hotel & Refresh", type: "rest", outdoor: false, intensity: "Low", fatigueCost: -15, duration: "1.5 hrs" },
          { time: "06:00 PM", title: "Swat River Riverside Stroll & Sunset View", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "1.5 hrs" },
          { time: "08:30 PM", title: "Traditional Trout Fish Dinner in Mingora", type: "food", outdoor: false, intensity: "Low", fatigueCost: 5, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Swat Archaeological Museum Visit", type: "Indoor Culture", icon: "🏛️", duration: "2 hrs" },
          { title: "Traditional Shawl & Gemstone Bazaar", type: "Indoor Shopping", icon: "🛍️", duration: "1.5 hrs" },
          { title: "Qissa Khwani Style Kehwa Tea Lounge", type: "Indoor Dining", icon: "☕", duration: "1 hr" }
        ]
      },
      {
        title: "Kalam Valley Expedition",
        activities: [
          { time: "08:30 AM", title: "Scenic Mountain Drive to Kalam Valley", type: "transport", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "3 hrs" },
          { time: "12:00 PM", title: "Ushu Pine Forest Nature Walk & Photography", type: "outdoor", outdoor: true, intensity: "High", fatigueCost: 25, duration: "2 hrs" },
          { time: "02:30 PM", title: "Riverside Chapli Kebab Lunch", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:30 PM", title: "Matiltan Waterfall Excursion", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "2 hrs" },
          { time: "08:00 PM", title: "Cedar Wood Bonfire & Acoustic Stargazing", type: "leisure", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Cedar Wood Carving & Craft Emporium", type: "Indoor Workshop", icon: "🪵", duration: "2 hrs" },
          { title: "Cozy Fireside Boardgames & Hot Cocoa", type: "Lounge Retreat", icon: "🔥", duration: "2.5 hrs" },
          { title: "Kalam Alpine Cultural Library", type: "Indoor Gallery", icon: "📖", duration: "1.5 hrs" }
        ]
      },
      {
        title: "Lake Mahodand 4x4 Safari",
        activities: [
          { time: "07:30 AM", title: "Rugged 4x4 Jeep Safari to Mahodand Lake", type: "adventure", outdoor: true, intensity: "High", fatigueCost: 30, duration: "3.5 hrs" },
          { time: "11:30 AM", title: "Alpine Turquoise Lake Boating & Lakeside Walk", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "2 hrs" },
          { time: "02:00 PM", title: "Fresh Catch Trout BBQ Lunch by Glacier", type: "food", outdoor: true, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:00 PM", title: "Saifullah Lake Glacier Viewpoint Trek", type: "outdoor", outdoor: true, intensity: "High", fatigueCost: 25, duration: "2 hrs" },
          { time: "07:30 PM", title: "Return to Hotel & Warm Herbal Sauna", type: "rest", outdoor: false, intensity: "Low", fatigueCost: -20, duration: "1.5 hrs" }
        ],
        rainAlternatives: [
          { title: "Swat Luxury Spa & Heated Thermal Pool", type: "Indoor Wellness", icon: "🧖", duration: "2.5 hrs" },
          { title: "Indoor Trout Kitchen Cooking Masterclass", type: "Indoor Culinary", icon: "🍳", duration: "2 hrs" },
          { title: "Historic Butkara Stupa Pavilion", type: "Sheltered Historic", icon: "🏛️", duration: "1.5 hrs" }
        ]
      },
      {
        title: "Malam Jabba Ski Resort & Heights",
        activities: [
          { time: "09:00 AM", title: "Ascent to Malam Jabba 9,000ft Ridge", type: "transport", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "11:30 AM", title: "Panoramic Chairlift Ride Over Pine Canopies", type: "adventure", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "1.5 hrs" },
          { time: "02:00 PM", title: "Lunch at Peak View Alpine Bistro", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:00 PM", title: "High Altitude Zipline or Forest Canopy Trail", type: "adventure", outdoor: true, intensity: "High", fatigueCost: 25, duration: "2 hrs" },
          { time: "07:30 PM", title: "Swat Folk Music & Dambora Evening", type: "culture", outdoor: false, intensity: "Low", fatigueCost: 5, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Malam Jabba Indoor Arcade & VR Zone", type: "Indoor Entertainment", icon: "🎮", duration: "2 hrs" },
          { title: "Mountain Peak Glass Cafe & Espresso Lounge", type: "Panoramic Indoor", icon: "☕", duration: "2 hrs" },
          { title: "Traditional Pashmina Weaving Experience", type: "Indoor Art", icon: "🧣", duration: "1.5 hrs" }
        ]
      },
      {
        title: "Souvenirs & Homeward Journey",
        activities: [
          { time: "09:30 AM", title: "Mingora Bazaar: Pure Honey & Walnuts Hunt", type: "leisure", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "12:30 PM", title: "Farewell Feast at White Palace Marghuzar", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "2 hrs" },
          { time: "03:00 PM", title: "Return Drive & Departure", type: "transport", outdoor: false, intensity: "Medium", fatigueCost: 20, duration: "4 hrs" }
        ],
        rainAlternatives: [
          { title: "White Palace Heritage Museum Tour", type: "Indoor Historic", icon: "🏰", duration: "2 hrs" },
          { title: "Swat Organic Dry Fruits & Saffron House", type: "Indoor Shopping", icon: "🌰", duration: "1.5 hrs" }
        ]
      }
    ]
  },

  "hunza": {
    name: "Hunza Valley, Gilgit-Baltistan",
    hotelName: "Serena Baltit Inn, Karimabad",
    hotelLocalScript: "ہوٹل سیرینا بالتت ان، کریم آباد، گلگت بلتستان",
    bookingRef: "HNZ-GB-9821",
    weather: { tempC: 16, tempF: 61, condition: "Crisp Mountain Breeze", humidity: "42%", rainProbability: "15%", icon: "🏔️" },
    dailyPlans: [
      {
        title: "Karakoram Highway Drive & Arrival",
        activities: [
          { time: "08:00 AM", title: "Scenic Departure along Karakoram Highway", type: "transport", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "4 hrs" },
          { time: "01:00 PM", title: "Stop at Rakaposhi Viewpoint & Kehwa", type: "food", outdoor: true, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:30 PM", title: "Check-in at Serena Baltit Inn Karimabad", type: "rest", outdoor: false, intensity: "Low", fatigueCost: -15, duration: "1.5 hrs" },
          { time: "06:30 PM", title: "Sunset Watch from Eagle's Nest Duikar", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "1.5 hrs" },
          { time: "08:30 PM", title: "Hunza Traditional Chapshuro Feast", type: "food", outdoor: false, intensity: "Low", fatigueCost: 5, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Hunza Cultural Heritage Museum", type: "Indoor Historic", icon: "🏛️", duration: "2 hrs" },
          { title: "Karimabad Gemstones & Dry Apricot Arcade", type: "Indoor Shopping", icon: "💎", duration: "1.5 hrs" }
        ]
      },
      {
        title: "Historical Forts & Royal Gardens",
        activities: [
          { time: "09:00 AM", title: "Guided Exploration of 700-Year Baltit Fort", type: "culture", outdoor: false, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "11:30 AM", title: "Altit Fort & 1000-Year Ancient Old Settlement", type: "culture", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "2 hrs" },
          { time: "02:00 PM", title: "Kha Basi Cafe Royal Apricot Lunch", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:30 PM", title: "Ganish Ancient Silk Road Heritage Walk", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "08:00 PM", title: "Fireside Dambora Music & Stargazing", type: "leisure", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Women Woodcarving Center (CIQAM)", type: "Indoor Workshop", icon: "🪵", duration: "2 hrs" },
          { title: "Cozy Mountain Espresso & Walnut Cafe", type: "Lounge Retreat", icon: "☕", duration: "1.5 hrs" }
        ]
      },
      {
        title: "Attabad Lake & Passu Glacier",
        activities: [
          { time: "08:30 AM", title: "Drive to Turquoise Attabad Lake", type: "transport", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "1 hr" },
          { time: "10:00 AM", title: "Speedboat Cruise & Jet Skiing in Glacier Waters", type: "adventure", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "2 hrs" },
          { time: "01:30 PM", title: "Passu Cones Cathedral Peaks Photography", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "1.5 hrs" },
          { time: "03:30 PM", title: "Suspension Bridge Crossing at Hussaini", type: "adventure", outdoor: true, intensity: "High", fatigueCost: 30, duration: "2 hrs" },
          { time: "07:30 PM", title: "Yak Steak & Yak Cheese Traditional Dinner", type: "food", outdoor: false, intensity: "Low", fatigueCost: 5, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Glacial Valley Indoor Art Gallery", type: "Indoor Culture", icon: "🎨", duration: "2 hrs" },
          { title: "Traditional Wool Shawl Weaving Lounge", type: "Indoor Craft", icon: "🧣", duration: "1.5 hrs" }
        ]
      },
      {
        title: "Khunjerab Pass (Pak-China Border)",
        activities: [
          { time: "07:00 AM", title: "Ascent to Khunjerab Pass (15,397 ft Highest Border)", type: "adventure", outdoor: true, intensity: "High", fatigueCost: 35, duration: "4 hrs" },
          { time: "12:00 PM", title: "Photography at Zero-Point Monument & World's Highest ATM", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "1.5 hrs" },
          { time: "03:00 PM", title: "Sost Dry Port & Border Market Snacks", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "07:00 PM", title: "Return to Karimabad & Hot Bath Relaxation", type: "rest", outdoor: false, intensity: "Low", fatigueCost: -20, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Sost Border Silk Route Emporium", type: "Indoor Bazaar", icon: "🛍️", duration: "2 hrs" },
          { title: "Upper Hunza Herbal Kehwa Tasting", type: "Indoor Dining", icon: "🍵", duration: "1.5 hrs" }
        ]
      },
      {
        title: "Farewell Hunza & Return",
        activities: [
          { time: "09:00 AM", title: "Karimabad Souvenirs (Pure Shilajit & Hunza Walnuts)", type: "leisure", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "2 hrs" },
          { time: "12:30 PM", title: "Farewell Lunch at Gilgit Serena", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "2 hrs" },
          { time: "03:00 PM", title: "Gilgit Airport / Motorway Homeward Journey", type: "transport", outdoor: false, intensity: "Medium", fatigueCost: 20, duration: "4 hrs" }
        ],
        rainAlternatives: [
          { title: "Gilgit Cultural Handloom Center", type: "Indoor Tour", icon: "🏛️", duration: "2 hrs" }
        ]
      }
    ]
  },

  "skardu": {
    name: "Skardu & Deosai Plains, Baltistan",
    hotelName: "Shangrila Resort Hotel, Kachura Skardu",
    hotelLocalScript: "شنگریلا ریزورٹ ہوٹل، کچورہ سکردو، بلتستان",
    bookingRef: "SKD-BLT-5510",
    weather: { tempC: 18, tempF: 64, condition: "Clear High Altitude Skies", humidity: "35%", rainProbability: "10%", icon: "☀️" },
    dailyPlans: [
      {
        title: "Arrival & Shangrila Heaven on Earth",
        activities: [
          { time: "09:00 AM", title: "Arrival at Skardu via Scenic Flight or Jaglot Road", type: "transport", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "12:00 PM", title: "Check-in at Shangrila Resort Lower Kachura", type: "rest", outdoor: false, intensity: "Low", fatigueCost: -15, duration: "1.5 hrs" },
          { time: "03:00 PM", title: "Heart-Shaped Lake Boating & Pagoda Tour", type: "outdoor", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "2 hrs" },
          { time: "06:30 PM", title: "Sunset at Upper Kachura Turquoise Lake", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "08:30 PM", title: "Balti Trout Fish Dinner & Kehwa", type: "food", outdoor: false, intensity: "Low", fatigueCost: 5, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Shangrila Aircraft Museum & Lounge", type: "Indoor Historic", icon: "✈️", duration: "2 hrs" },
          { title: "Kachura Cedarwood Fireside Retreat", type: "Indoor Lounge", icon: "🔥", duration: "2 hrs" }
        ]
      },
      {
        title: "Cold Desert & Sarfaranga Dunes",
        activities: [
          { time: "09:00 AM", title: "Drive to Sarfaranga High Altitude Cold Desert", type: "transport", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "1 hr" },
          { time: "11:00 AM", title: "ATV Quad Biking & Sand Dune Safari", type: "adventure", outdoor: true, intensity: "High", fatigueCost: 30, duration: "2.5 hrs" },
          { time: "02:00 PM", title: "Traditional Balti Marzan & Butter Tea Lunch", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:30 PM", title: "Blind Lake Shigar Viewpoint", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "08:00 PM", title: "Desert Stargazing under Milky Way Canopies", type: "leisure", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Shigar Cultural Handicrafts Center", type: "Indoor Art", icon: "🪵", duration: "2 hrs" }
        ]
      },
      {
        title: "Deosai Plains: Land of the Giants",
        activities: [
          { time: "07:30 AM", title: "4x4 Jeep Expedition to Deosai (14,000 ft Plateau)", type: "adventure", outdoor: true, intensity: "High", fatigueCost: 35, duration: "4 hrs" },
          { time: "12:00 PM", title: "Sheosar Lake Alpine Turquoise Panorama", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "2 hrs" },
          { time: "02:30 PM", title: "Bara Pani Suspension Bridge & Wilderness Picnic", type: "food", outdoor: true, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "05:00 PM", title: "Brown Bear Sanctuary Wildlife Watch", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "2 hrs" },
          { time: "08:30 PM", title: "Return to Skardu & Warm Herbal Compress", type: "rest", outdoor: false, intensity: "Low", fatigueCost: -20, duration: "1.5 hrs" }
        ],
        rainAlternatives: [
          { title: "Skardu Organic Apricot Processing House", type: "Indoor Tour", icon: "🍑", duration: "2 hrs" }
        ]
      },
      {
        title: "Shigar Fort & Palace of Rocks",
        activities: [
          { time: "09:30 AM", title: "Drive to Historic Shigar Valley", type: "transport", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "1 hr" },
          { time: "11:00 AM", title: "Shigar Fort (Fong-Khar) Royal Chambers Tour", type: "culture", outdoor: false, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "02:00 PM", title: "Royal Garden Lunch under Walnut Trees", type: "food", outdoor: true, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:30 PM", title: "Manthoka High Waterfall Cascade", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "2 hrs" },
          { time: "08:00 PM", title: "Folk Music & Balti Storytelling Evening", type: "culture", outdoor: false, intensity: "Low", fatigueCost: 5, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Shigar Royal Museum & Library", type: "Indoor Museum", icon: "🏛️", duration: "2 hrs" }
        ]
      },
      {
        title: "Departure & Bazaar Hunt",
        activities: [
          { time: "09:00 AM", title: "Skardu Bazaar for Pure Shilajit & Dry Fruits", type: "leisure", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "12:30 PM", title: "Farewell Lunch & Airport Transfer", type: "transport", outdoor: false, intensity: "Low", fatigueCost: 15, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Skardu Heritage Gem Gallery", type: "Indoor Shop", icon: "💎", duration: "2 hrs" }
        ]
      }
    ]
  },

  "murree": {
    name: "Murree & Galiyat Foothills",
    hotelName: "PC Bhurban / Hotel One Mall Road",
    hotelLocalScript: "ہوٹل ون مال روڈ / پی سی بھوربن، مری، پنجاب",
    bookingRef: "MUR-GLY-3301",
    weather: { tempC: 21, tempF: 70, condition: "Pleasant & Breezy", humidity: "65%", rainProbability: "30%", icon: "⛅" },
    dailyPlans: [
      {
        title: "Expressway Ascent & Mall Road",
        activities: [
          { time: "09:00 AM", title: "Departure from Islamabad via Murree Expressway", type: "transport", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "1.5 hrs" },
          { time: "11:30 AM", title: "Check-in at Hotel One Mall Road / PC Bhurban", type: "rest", outdoor: false, intensity: "Low", fatigueCost: -15, duration: "1.5 hrs" },
          { time: "02:00 PM", title: "Lunch at Gloria Jean's with Pine Forest Views", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:30 PM", title: "Mall Road Stroll & Traditional Chana Chaat", type: "leisure", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2.5 hrs" },
          { time: "08:00 PM", title: "Hot Kehwa & Kashmiri Karahi Dinner", type: "food", outdoor: false, intensity: "Low", fatigueCost: 5, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "PC Bhurban Indoor Heated Pool & Bowling", type: "Indoor Resort", icon: "🎳", duration: "2 hrs" },
          { title: "Mall Road Handloom & Pashmina Arcade", type: "Indoor Shopping", icon: "🛍️", duration: "2 hrs" }
        ]
      },
      {
        title: "Patriata Cable Car & Pine Treks",
        activities: [
          { time: "09:30 AM", title: "Drive to New Murree (Patriata)", type: "transport", outdoor: true, intensity: "Low", fatigueCost: 10, duration: "45 min" },
          { time: "10:30 AM", title: "Panoramic Chairlift & World-Class Cable Car", type: "adventure", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" },
          { time: "01:30 PM", title: "Pines Ridge Barbeque Lunch", type: "food", outdoor: true, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:00 PM", title: "Horse Riding through Chinar Tree Trails", type: "outdoor", outdoor: true, intensity: "Medium", fatigueCost: 20, duration: "2 hrs" },
          { time: "08:00 PM", title: "Fireside Coffee & Live Acoustic Music", type: "leisure", outdoor: false, intensity: "Low", fatigueCost: 5, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Patriata Indoor Arcade & Cinema", type: "Indoor Entertainment", icon: "🎮", duration: "2 hrs" }
        ]
      },
      {
        title: "Nathia Gali Pipeline Trek & Return",
        activities: [
          { time: "09:00 AM", title: "Scenic Drive to Nathia Gali", type: "transport", outdoor: true, intensity: "Medium", fatigueCost: 15, duration: "1 hr" },
          { time: "10:30 AM", title: "Ayubia to Dunga Gali Pipeline Walking Trek", type: "outdoor", outdoor: true, intensity: "High", fatigueCost: 25, duration: "3 hrs" },
          { time: "02:00 PM", title: "Taj Mahal Hotel Famous Roast Chicken Lunch", type: "food", outdoor: false, intensity: "Low", fatigueCost: -10, duration: "1.5 hrs" },
          { time: "04:30 PM", title: "Drive Back & Trip Wrap-Up", type: "transport", outdoor: false, intensity: "Medium", fatigueCost: 15, duration: "2 hrs" }
        ],
        rainAlternatives: [
          { title: "Nathia Gali Forest Lodge Indoor Tea Room", type: "Indoor Cafe", icon: "☕", duration: "2 hrs" }
        ]
      }
    ]
  }
};

// Generic Generator for Any Custom City or Extended Days
function generateDynamicItinerary(destination, startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  
  // Calculate total days (minimum 1, maximum 14)
  const diffTime = Math.abs(end - start);
  let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  if (isNaN(totalDays) || totalDays < 1) totalDays = 5;
  if (totalDays > 14) totalDays = 14;

  const destLower = (destination || "").toLowerCase();
  let matchedTemplate = DESTINATION_TEMPLATES["swat"];

  if (destLower.includes("hunza") || destLower.includes("gilgit")) {
    matchedTemplate = DESTINATION_TEMPLATES["hunza"];
  } else if (destLower.includes("skardu") || destLower.includes("deosai") || destLower.includes("baltistan")) {
    matchedTemplate = DESTINATION_TEMPLATES["skardu"];
  } else if (destLower.includes("murree") || destLower.includes("galiyat") || destLower.includes("bhurban")) {
    matchedTemplate = DESTINATION_TEMPLATES["murree"];
  }

  const daysResult = [];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  for (let i = 0; i < totalDays; i++) {
    const curDate = new Date(start);
    curDate.setDate(curDate.getDate() + i);

    const dNum = i + 1;
    const dateLabel = `${curDate.getDate()} ${monthNames[curDate.getMonth()]} (${dayNames[curDate.getDay()]})`;

    // Pick plan from template or generate generic
    const planIndex = i % matchedTemplate.dailyPlans.length;
    const basePlan = matchedTemplate.dailyPlans[planIndex];

    // Clone activities and ensure 12-hour AM/PM format
    const clonedActivities = basePlan.activities.map((act, aIdx) => ({
      id: `act_${dNum}_${aIdx + 1}`,
      time: act.time,
      title: act.title.replace("Swat", destination.split(',')[0]),
      type: act.type,
      outdoor: act.outdoor,
      intensity: act.intensity,
      fatigueCost: act.fatigueCost,
      duration: act.duration,
      completed: aIdx === 0 && dNum === 1 // first activity checked
    }));

    daysResult.push({
      dayNumber: dNum,
      dateLabel: dateLabel,
      title: basePlan.title.replace("Swat", destination.split(',')[0]),
      baseFatiguePercent: 70,
      activities: clonedActivities,
      rainAlternatives: basePlan.rainAlternatives || [
        { title: `${destination.split(',')[0]} Cultural Arts Center`, type: "Indoor Culture", icon: "🏛️", duration: "2 hrs" },
        { title: `Traditional Covered Bazaar Tour`, type: "Indoor Shopping", icon: "🛍️", duration: "1.5 hrs" },
        { title: `Local Kehwa Tea Lounge & Boardgames`, type: "Indoor Dining", icon: "☕", duration: "1 hr" }
      ]
    });
  }

  return {
    days: daysResult,
    hotelName: matchedTemplate.hotelName.replace("Swat", destination.split(',')[0]),
    hotelLocalScript: matchedTemplate.hotelLocalScript.replace("سوات", destination.split(',')[0]),
    bookingRef: `${destination.substring(0, 3).toUpperCase()}-PKR-${Math.floor(1000 + Math.random() * 9000)}`,
    weather: matchedTemplate.weather,
    totalDays: totalDays
  };
}

function generateDynamicExpenses(destination, budget, travelers, members) {
  const destName = (destination || 'Swat').split(',')[0].trim();
  const b = Math.max(2000, Number(budget) || 25000);
  const mList = members && members.length > 0 ? members : [
    { id: "m1", name: "Kamran Mohsin (You)", avatar: "👨‍💻", color: "#10b981", initialSpent: 0 }
  ];
  const m1Id = mList[0].id;
  const m2Id = mList.length > 1 ? mList[1].id : m1Id;
  const m3Id = mList.length > 2 ? mList[2].id : m1Id;

  const stayCost = Math.round(b * 0.35);
  const transportCost = Math.round(b * 0.30);
  const foodCost = Math.round(b * 0.20);
  const activityCost = Math.max(0, b - (stayCost + transportCost + foodCost));

  return [
    {
      id: `exp_stay_${Date.now()}`,
      title: `${destName} Hotel & Stay Booking`,
      amount: stayCost,
      payerId: m1Id,
      category: "Stay",
      date: "Day 1"
    },
    {
      id: `exp_trans_${Date.now() + 1}`,
      title: `Fuel & Road Transport to ${destName}`,
      amount: transportCost,
      payerId: m2Id,
      category: "Transport",
      date: "Day 1"
    },
    {
      id: `exp_food_${Date.now() + 2}`,
      title: `Local Dining & Traditional Meals`,
      amount: foodCost,
      payerId: m1Id,
      category: "Food",
      date: "Day 2"
    },
    {
      id: `exp_act_${Date.now() + 3}`,
      title: `${destName} Sightseeing & Passes`,
      amount: activityCost,
      payerId: m3Id,
      category: "Activities",
      date: "Day 3"
    }
  ];
}

// Global master state
const INITIAL_DATA = {
  trip: {
    departureCity: "",
    destination: "",
    country: "Pakistan",
    startDate: "",
    endDate: "",
    datesDisplay: "",
    vibe: "Chill",
    travelers: 2,
    rainMode: false,
    currency: "PKR",
    currencySymbol: "Rs",
    tempUnit: "C",
    totalBudget: 25000,
    hotelName: "",
    hotelLocalScript: "",
    bookingRef: "",
    userName: "",
    isPro:false,
    weather: {
      tempC: 22,
      tempF: 72,
      condition: "Light Rain Expected",
      humidity: "68%",
      rainProbability: "65%",
      icon: "🌧️"
    }
  },

  popularDestinations: [
    { name: "Swat Valley, Pakistan", region: "Khyber Pakhtunkhwa", icon: "🏔️", days: 5, budget: 350000 },
    { name: "Hunza Valley, Gilgit-Baltistan", region: "Northern Areas", icon: "🌄", days: 7, budget: 480000 },
    { name: "Skardu & Deosai Plains", region: "Baltistan", icon: "🏜️", days: 6, budget: 520000 },
    { name: "Kumrat Valley & Jahaz Banda", region: "Upper Dir", icon: "🌲", days: 4, budget: 280000 },
    { name: "Naran, Kaghan & Babusar Top", region: "Mansehra", icon: "🚗", days: 4, budget: 260000 },
    { name: "Murree & Galiyat Foothills", region: "Punjab", icon: "☕", days: 3, budget: 140000 },
    { name: "Chitral & Kalash Valley", region: "Hindukush", icon: "🪕", days: 6, budget: 390000 },
    { name: "Antalya & Cappadocia", region: "Turkey", icon: "🎈", days: 7, budget: 950000 },
    { name: "Bali & Ubud Rainforest", region: "Indonesia", icon: "🌴", days: 6, budget: 850000 },
    { name: "Dubai & Desert Safari", region: "UAE", icon: "🏙️", days: 5, budget: 780000 }
  ],
  
  vibeProfiles: [
    {
      id: "Chill",
      title: "Chill",
      subtitle: "Relax & Explore",
      icon: "🌿",
      badgeColor: "#10b981",
      description: "Gentle pacing, scenic cafes, nature walks, low physical strain.",
      recommendedGapMinutes: 60,
      dailyMaxEnergy: 75
    },
    {
      id: "High Adventure",
      title: "High Adventure",
      subtitle: "Thrill & Explore",
      icon: "⛰️",
      badgeColor: "#3b82f6",
      description: "Rigorous mountain trails, 4x4 expeditions, adrenaline sports.",
      recommendedGapMinutes: 30,
      dailyMaxEnergy: 95
    },
    {
      id: "Foodie",
      title: "Foodie",
      subtitle: "Eat & Discover",
      icon: "🍲",
      badgeColor: "#f59e0b",
      description: "Culinary explorations, night bazaars, traditional feasts.",
      recommendedGapMinutes: 45,
      dailyMaxEnergy: 65
    },
    {
      id: "Fast Explorer",
      title: "Fast Explorer",
      subtitle: "See More, Do More",
      icon: "⚡",
      badgeColor: "#8b5cf6",
      description: "High speed itinerary covering maximum landmarks in record time.",
      recommendedGapMinutes: 20,
      dailyMaxEnergy: 90
    }
  ],

  itineraryDays: [],

  members: [],

  expenses: [],

  vaultCategories: [
    {
      id: "docs",
      title: "Documents & Money",
      icon: "💼",
      items: [
        { id: "v1", text: "CNIC / Passport (Original + 2 photocopies)", checked: true },
        { id: "v2", text: "Hotel & Transport Booking Confirmations", checked: true },
        { id: "v3", text: "Emergency Cash (Rs 30,000 in Rs 500/1000 notes)", checked: true },
        { id: "v4", text: "Debit / ATM Cards (Meezan & Backup)", checked: false }
      ]
    },
    {
      id: "clothes",
      title: "Clothing & Footwear",
      icon: "🧥",
      items: [
        { id: "v5", text: "Waterproof Windbreaker / Rain Jacket", checked: true },
        { id: "v6", text: "Warm Fleece Hoodies for Mountain Nights", checked: true },
        { id: "v7", text: "Comfortable Ankle-Support Hiking Boots", checked: true },
        { id: "v8", text: "Thermal Woolen Socks (3 pairs)", checked: false },
        { id: "v9", text: "Quick-dry Breathable T-Shirts", checked: true }
      ]
    },
    {
      id: "toiletries",
      title: "Toiletries & Personal Care",
      icon: "🧴",
      items: [
        { id: "v10", text: "High SPF 50+ Sunscreen (Mountain UV is high)", checked: true },
        { id: "v11", text: "Lip Balm & Heavy Moisturizer", checked: true },
        { id: "v12", text: "Toothbrush, Herbal Toothpaste & Floss", checked: true },
        { id: "v13", text: "Fast Absorb Microfiber Travel Towel", checked: false }
      ]
    },
    {
      id: "tech",
      title: "Tech, Power & Emergency Meds",
      icon: "⚡",
      items: [
        { id: "v14", text: "20,000 mAh High-Speed Power Bank", checked: true },
        { id: "v15", text: "Altitude Sickness (Diamox), Painkillers & ORS", checked: true },
        { id: "v16", text: "Offline Google Maps downloaded for Destination", checked: true },
        { id: "v17", text: "Headlamp / High-Beam LED Flashlight", checked: false }
      ]
    }
  ],

  emergencyOneSheet: {
    hotelName: "Swat Serena Hotel",
    hotelAddress: "Saidu Sharif Road, Opposite Circuit House, KP",
    hotelLocalScript: "ہوٹل سوات سیرینا، مین سیدو شریف روڈ، بالمقابل سرکٹ ہاؤس، سوات",
    emergencyNumbers: [
      { name: "Police Emergency Helpline", number: "15", desc: "24/7 Rapid Response" },
      { name: "Rescue & Emergency Ambulance", number: "1122", desc: "Medical & Mountain Rescue" },
      { name: "Regional Tourist Police", number: "1422", desc: "Tourist assistance" },
      { name: "Motorway & Highway Police", number: "130", desc: "Highway patrol & roadside help" },
      { name: "Fire Brigade", number: "16", desc: "Fire emergency response" }
    ],
    tripContacts: [
      { role: "Tour Operator / Jeep Agent", name: "Malik Shahzad", phone: "+92 300 9821430" },
      { role: "Serena Hotel Concierge", name: "Front Desk 24/7", phone: "+92 946 710201" },
      { role: "Certified Local Guide", name: "Kareemullah Swati", phone: "+92 312 8765432" }
    ],
    quickNotes: [
      "Keep CNIC/Passport physical copies in your daypack; mobile signals in high mountain valleys are intermittent.",
      "Stay strictly connected with group members; agree on a fixed meeting point if cell connectivity drops.",
      "Drink only sealed bottled spring water or boiled kehwa tea."
    ]
  },

  proPlans: {
    free: {
      name: "Explorer Free",
      price: "0",
      features: [
        "1 Active Trip Plan",
        "Basic Daily Itinerary",
        "Standard Checklist",
        "Limited Debt Tracking (up to 3 members)"
      ],
      isCurrent: false
    },
    pro: {
      name: "WanderWise PRO Lifetime",
      pricePKR: 100,
      badge: "POPULAR & RECOMMENDED",
      bankDetails: {
        bankName: "Meezan Bank",
        accountNumber: "03046942398",
        accountTitle: "WanderWise Services (Kamran Mohsin)",
        branchCode: "0102 - Islamic Banking Online"
      },
      features: [
        "Unlimited Trips & Custom Destinations",
        "⚡ Real-Time Fatigue & Burnout Prediction Engine",
        "☔ Instant Rain Mode with 100+ Indoor Backup Spots",
        "💸 Smart FairShare Debt Minimizer Algorithm",
        "🚨 1-Click Printable Offline Emergency One-Sheet (PDF)",
        "🌦️ Live Satellite Cloud & Weather Radar",
        "Priority Customer VIP Support 24/7"
      ]
    }
  }
};
