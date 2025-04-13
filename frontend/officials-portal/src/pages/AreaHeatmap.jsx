import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, GeoJSON, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.heat";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Generate mock data (unchanged)
const generateMockData = () => {
  const departments = ["Water Department", "Electricity", "Roads", "Sanitation"];
  const statuses = ["Pending", "In Progress", "Completed"];
  const priorities = ["High", "Medium", "Low"];
  const cities = [
    { name: "Mumbai", lat: 19.076, lng: 72.877, weight: 30 },
    { name: "Pune", lat: 18.52, lng: 73.856, weight: 25 },
    { name: "Nagpur", lat: 21.146, lng: 79.088, weight: 20 },
    { name: "Nashik", lat: 19.997, lng: 73.79, weight: 15 },
    { name: "Aurangabad", lat: 19.877, lng: 75.343, weight: 12 },
    { name: "Solapur", lat: 17.671, lng: 75.91, weight: 10 },
    { name: "Amravati", lat: 20.937, lng: 77.752, weight: 8 },
    { name: "Kolhapur", lat: 16.705, lng: 74.243, weight: 10 },
    { name: "Sangli", lat: 16.856, lng: 74.569, weight: 8 },
    { name: "Jalgaon", lat: 21.013, lng: 75.563, weight: 7 },
  ];

  const points = [];
  cities.forEach((city) => {
    const numIssues = city.weight * 5;
    for (let i = 0; i < numIssues; i++) {
      const spreadFactor = 0.05 * (Math.sqrt(numIssues) / 10);
      points.push({
        lat: city.lat + (Math.random() - 0.5) * spreadFactor,
        lng: city.lng + (Math.random() - 0.5) * spreadFactor,
        intensity: Math.random() * city.weight + 5,
        department: departments[Math.floor(Math.random() * departments.length)],
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        details: `Issue #${Math.floor(Math.random() * 10000)}`,
      });
    }
  });

  for (let i = 0; i < 100; i++) {
    const latMin = 15.6,
      latMax = 22.0,
      lngMin = 72.6,
      lngMax = 80.9;
    points.push({
      lat: latMin + Math.random() * (latMax - latMin),
      lng: lngMin + Math.random() * (lngMax - lngMin),
      intensity: Math.random() * 5 + 1,
      department: departments[Math.floor(Math.random() * departments.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      priority: priorities[Math.floor(Math.random() * priorities.length)],
      details: `Issue #${Math.floor(Math.random() * 10000)}`,
    });
  }

  return points;
};

// Simplified Maharashtra GeoJSON
const maharashtraGeoJSON = {
  type: "Feature",
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [72.7, 16.8],
        [73.5, 15.8],
        [74.2, 15.9],
        [74.8, 16.4],
        [75.6, 15.7],
        [76.9, 15.8],
        [77.8, 16.2],
        [78.9, 17.5],
        [79.8, 18.0],
        [80.3, 19.2],
        [80.0, 20.5],
        [79.5, 21.3],
        [78.3, 21.8],
        [77.1, 21.9],
        [76.2, 21.5],
        [75.2, 20.9],
        [74.7, 20.0],
        [73.8, 20.5],
        [73.3, 19.8],
        [72.9, 19.1],
        [72.6, 18.2],
        [72.7, 16.8],
      ],
    ],
  },
};

// Major cities (unchanged)
const majorCities = [
  { name: "Mumbai", lat: 19.076, lng: 72.877 },
  { name: "Pune", lat: 18.52, lng: 73.856 },
  { name: "Nagpur", lat: 21.146, lng: 79.088 },
  { name: "Nashik", lat: 19.997, lng: 73.79 },
  { name: "Aurangabad", lat: 19.877, lng: 75.343 },
];

// Region GeoJSONs (completed)
const regionGeoJSONs = {
  "North West": {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[72.6, 18.5], [74, 18.5], [74, 22], [72.6, 22], [72.6, 18.5]]] },
  },
  "North Central": {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[74, 18.5], [77, 18.5], [77, 22], [74, 22], [74, 18.5]]] },
  },
  "North East": {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[77, 18.5], [80.9, 18.5], [80.9, 22], [77, 22], [77, 18.5]]] },
  },
  "South West": {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[72.6, 15.6], [74, 15.6], [74, 18.5], [72.6, 18.5], [72.6, 15.6]]] },
  },
  "South Central": {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[74, 15.6], [77, 15.6], [77, 18.5], [74, 18.5], [74, 15.6]]] },
  },
  "South East": {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[77, 15.6], [80.9, 15.6], [80.9, 18.5], [77, 18.5], [77, 15.6]]] },
  },
  Other: {
    type: "Feature",
    geometry: { type: "Polygon", coordinates: [[[72.6, 15.6], [80.9, 15.6], [80.9, 22], [72.6, 22], [72.6, 15.6]]] },
  },
};

// Heatmap component
function HeatmapLayer({ data, setSelectedRegion, selectedDepartment }) {
  const map = useMap();
  const heatLayersRef = useRef([]);

  useEffect(() => {
    heatLayersRef.current.forEach((layer) => map.removeLayer(layer));
    heatLayersRef.current = [];

    const departmentColors = {
      "Water Department": { 0.4: "#1f77b4", 0.6: "#7bc8f6", 1.0: "#d1e5f0" },
      Electricity: { 0.4: "#ff7f0e", 0.6: "#ffbb78", 1.0: "#ffecd9" },
      Roads: { 0.4: "#2ca02c", 0.6: "#98df8a", 1.0: "#d4f0d4" },
      Sanitation: { 0.4: "#9467bd", 0.6: "#c5b0d5", 1.0: "#e8d8f0" },
    };

    const defaultGradient = {
      0.0: "#1a9850",
      0.2: "#91cf60",
      0.4: "#d9ef8b",
      0.6: "#fee08b",
      0.8: "#fc8d59",
      1.0: "#d73027",
    };

    const maxIntensity = Math.max(...data.map((d) => d.intensity), 1);

    if (selectedDepartment === "All") {
      Object.keys(departmentColors).forEach((dept) => {
        const deptData = data.filter((d) => d.department === dept);
        const points = deptData.map((d) => {
          const multiplier = { High: 1.5, Medium: 1.0, Low: 0.5 }[d.priority] || 1.0;
          return [d.lat, d.lng, (d.intensity / maxIntensity) * multiplier];
        });
        if (points.length > 0) {
          const layer = L.heatLayer(points, {
            radius: 25,
            blur: 15,
            maxZoom: 18,
            gradient: departmentColors[dept],
          }).addTo(map);
          heatLayersRef.current.push(layer);
        }
      });
    } else {
      const points = data.map((d) => {
        const multiplier = { High: 1.5, Medium: 1.0, Low: 0.5 }[d.priority] || 1.0;
        return [d.lat, d.lng, (d.intensity / maxIntensity) * multiplier];
      });
      const layer = L.heatLayer(points, {
        radius: 25,
        blur: 15,
        maxZoom: 18,
        gradient: departmentColors[selectedDepartment] || defaultGradient,
      }).addTo(map);
      heatLayersRef.current.push(layer);
    }

    const onMapClick = (e) => {
      const { lat, lng } = e.latlng;
      let region = "Other";
      if (lng < 74 && lat > 18.5) region = "North West";
      else if (lng >= 74 && lng < 77 && lat > 18.5) region = "North Central";
      else if (lng >= 77 && lat > 18.5) region = "North East";
      else if (lng < 74 && lat <= 18.5) region = "South West";
      else if (lng >= 74 && lng < 77 && lat <= 18.5) region = "South Central";
      else if (lng >= 77 && lat <= 18.5) region = "South East";
      setSelectedRegion(region);
    };

    map.on("click", onMapClick);

    return () => {
      heatLayersRef.current.forEach((layer) => map.removeLayer(layer));
      heatLayersRef.current = [];
      map.off("click", onMapClick);
    };
  }, [data, map, setSelectedRegion, selectedDepartment]);

  return null;
}

// Region Layer
function RegionLayer({ hoveredRegion }) {
  const map = useMap();

  useEffect(() => {
    const layers = Object.entries(regionGeoJSONs).map(([region, geojson]) => {
      const layer = L.geoJSON(geojson, {
        style: {
          fillColor: region === hoveredRegion ? "#ffeda0" : "transparent",
          weight: 1,
          color: "#333",
          fillOpacity: region === hoveredRegion ? 0.5 : 0,
        },
      }).addTo(map);
      return layer;
    });

    return () => {
      layers.forEach((layer) => map.removeLayer(layer));
    };
  }, [hoveredRegion, map]);

  return null;
}

// Heatmap Legend
function HeatmapLegend({ selectedDepartment }) {
  const departmentColors = {
    "Water Department": { name: "Water", color: "#1f77b4" },
    Electricity: { name: "Electricity", color: "#ff7f0e" },
    Roads: { name: "Roads", color: "#2ca02c" },
    Sanitation: { name: "Sanitation", color: "#9467bd" },
  };

  if (selectedDepartment !== "All") {
    return (
      <div className="absolute bottom-10 left-10 bg-white p-2 rounded shadow z-[1000]">
        <h3 className="text-sm font-medium">Issue Density</h3>
        <div
          className="w-40 h-4 mt-1"
          style={{
            background: `linear-gradient(to right, #1a9850, #91cf60, #d9ef8b, #fee08b, #fc8d59, #d73027)`,
          }}
        ></div>
        <div className="flex justify-between text-xs mt-1">
          <span>Low</span>
          <span>High</span>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute bottom-10 left-10 bg-white p-2 rounded shadow z-[1000]">
      <h3 className="text-sm font-medium">Departments</h3>
      <div className="mt-1">
        {Object.entries(departmentColors).map(([dept, { name, color }]) => (
          <div key={dept} className="flex items-center mt-1">
            <div className="w-4 h-4 mr-2" style={{ backgroundColor: color }}></div>
            <span className="text-xs">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AreaHeatmap() {
  const departments = ["All", "Water Department", "Electricity", "Roads", "Sanitation"];
  const statuses = ["All", "Pending", "In Progress", "Completed"];
  const priorities = ["All", "High", "Medium", "Low"];

  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedPriority, setSelectedPriority] = useState("All");
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [issueData, setIssueData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [hoveredRegion, setHoveredRegion] = useState(null);

  useEffect(() => {
    const mockData = generateMockData();
    setIssueData(mockData);
    setFilteredData(mockData);
  }, []);

  useEffect(() => {
    let filtered = issueData;

    if (selectedDepartment !== "All") {
      filtered = filtered.filter((issue) => issue.department === selectedDepartment);
    }
    if (selectedStatus !== "All") {
      filtered = filtered.filter((issue) => issue.status === selectedStatus);
    }
    if (selectedPriority !== "All") {
      filtered = filtered.filter((issue) => issue.priority === selectedPriority);
    }
    if (selectedRegion) {
      filtered = filtered.filter((issue) => {
        let region = "Other";
        if (issue.lng < 74 && issue.lat > 18.5) region = "North West";
        else if (issue.lng >= 74 && issue.lng < 77 && issue.lat > 18.5) region = "North Central";
        else if (issue.lng >= 77 && issue.lat > 18.5) region = "North East";
        else if (issue.lng < 74 && issue.lat <= 18.5) region = "South West";
        else if (issue.lng >= 74 && issue.lng < 77 && issue.lat <= 18.5) region = "South Central";
        else if (issue.lng >= 77 && issue.lat <= 18.5) region = "South East";
        return region === selectedRegion;
      });
    }

    setFilteredData(filtered);
  }, [selectedDepartment, selectedStatus, selectedPriority, selectedRegion, issueData]);

  // Calculate metrics
  const statusCounts = {
    Pending: filteredData.filter((d) => d.status === "Pending").length,
    "In Progress": filteredData.filter((d) => d.status === "In Progress").length,
    Completed: filteredData.filter((d) => d.status === "Completed").length,
  };

  const departmentCounts = {
    "Water Department": filteredData.filter((d) => d.department === "Water Department").length,
    Electricity: filteredData.filter((d) => d.department === "Electricity").length,
    Roads: filteredData.filter((d) => d.department === "Roads").length,
    Sanitation: filteredData.filter((d) => d.department === "Sanitation").length,
  };

  const regionData = {};
  filteredData.forEach((issue) => {
    let region = "Other";
    if (issue.lng < 74 && issue.lat > 18.5) region = "North West";
    else if (issue.lng >= 74 && issue.lng < 77 && issue.lat > 18.5) region = "North Central";
    else if (issue.lng >= 77 && issue.lat > 18.5) region = "North East";
    else if (issue.lng < 74 && issue.lat <= 18.5) region = "South West";
    else if (issue.lng >= 74 && issue.lng < 77 && issue.lat <= 18.5) region = "South Central";
    else if (issue.lng >= 77 && issue.lat <= 18.5) region = "South East";
    regionData[region] = (regionData[region] || 0) + 1;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md min-h-screen">
      <h2 className="text-2xl font-semibold mb-4">Grievance Heatmap</h2>
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="bg-white p-4 border-b border-gray-300 shadow-sm">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Maharashtra Issues Heatmap</h1>
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                className="border border-gray-300 rounded-md p-2"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                className="border border-gray-300 rounded-md p-2"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                className="border border-gray-300 rounded-md p-2"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
            </div>
            {selectedRegion && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <button
                  className="border border-gray-300 rounded-md p-2 bg-red-500 text-white"
                  onClick={() => setSelectedRegion(null)}
                >
                  Clear Region: {selectedRegion}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-3/5 p-4">
            <div className="bg-white p-4 rounded-lg shadow h-full flex flex-col">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Issue Distribution Heatmap</h2>
              <div className="flex-1 relative">
                <MapContainer
                  center={[19, 76.5]}
                  zoom={7}
                  style={{ height: "100%", width: "100%" }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  <GeoJSON
                    data={maharashtraGeoJSON}
                    style={{
                      fillColor: "#f0f0f0",
                      weight: 1.5,
                      color: "#333",
                      fillOpacity: 0.5,
                    }}
                  />
                  <RegionLayer hoveredRegion={hoveredRegion} />
                  <HeatmapLayer
                    data={filteredData}
                    setSelectedRegion={setSelectedRegion}
                    selectedDepartment={selectedDepartment}
                  />
                </MapContainer>
                <HeatmapLegend selectedDepartment={selectedDepartment} />
              </div>
            </div>
          </div>

          <div className="w-2/5 p-4 overflow-y-auto">
            <div className="bg-white p-4 rounded-lg shadow mb-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Issue Analysis</h2>
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2 text-gray-700">Summary</h3>
                <p className="text-2xl font-bold text-gray-900">{filteredData.length} Issues</p>
                {selectedDepartment !== "All" && (
                  <p className="text-sm text-gray-600">Department: {selectedDepartment}</p>
                )}
                {selectedStatus !== "All" && (
                  <p className="text-sm text-gray-600">Status: {selectedStatus}</p>
                )}
                {selectedPriority !== "All" && (
                  <p className="text-sm text-gray-600">Priority: {selectedPriority}</p>
                )}
                {selectedRegion && (
                  <p className="text-sm text-gray-600">Region: {selectedRegion}</p>
                )}
              </div>
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2 text-gray-700">Status Breakdown</h3>
                <div className="space-y-2">
                  {["Pending", "In Progress", "Completed"].map((status) => (
                    <div key={status} className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            status === "Pending"
                              ? "bg-red-600"
                              : status === "In Progress"
                              ? "bg-yellow-500"
                              : "bg-green-600"
                          }`}
                          style={{
                            width: `${
                              filteredData.length
                                ? (statusCounts[status] / filteredData.length) * 100
                                : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700 w-24 text-right">
                        {status}: {statusCounts[status]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mb-6">
                <h3 className="text-md font-medium mb-2 text-gray-700">Department Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(departmentCounts).map(([dept, count]) => (
                    <div key={dept} className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full"
                          style={{
                            width: `${
                              filteredData.length ? (count / filteredData.length) * 100 : 0
                            }%`,
                          }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700 w-24 text-right">
                        {dept.split(" ")[0]}: {count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-md font-medium mb-2 text-gray-700">Regional Distribution</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(regionData).map(([region, count]) => (
                    <div
                      key={region}
                      className="bg-gray-100 p-2 rounded border border-gray-200 hover:bg-gray-200 cursor-pointer"
                      onMouseEnter={() => setHoveredRegion(region)}
                      onMouseLeave={() => setHoveredRegion(null)}
                      onClick={() => setSelectedRegion(region)}
                    >
                      <p className="font-medium text-gray-800">{region}</p>
                      <p className="text-sm text-gray-600">
                        {count} issues (
                        {filteredData.length ? Math.round((count / filteredData.length) * 100) : 0}
                        %)
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Using This Heatmap</h2>
              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
                <li>The heatmap shows issue concentration across Maharashtra</li>
                <li>Red areas indicate high issue density, green indicates fewer issues</li>
                <li>Use filters to analyze by department, status, or priority</li>
                <li>Click on the map to drill down by region</li>
                <li>Zoom and scroll to explore the map interactively</li>
                <li>The analysis panel shows breakdowns by status, department, and region</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AreaHeatmap;