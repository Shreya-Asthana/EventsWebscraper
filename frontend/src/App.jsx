import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState("");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch locations on mount
  useEffect(() => {
    setLoading(true);
    axios.get("https://eventswebscraper.onrender.com/api/locations")
      .then(res => setLocations(res.data))
      .finally(() => setLoading(false));
  }, []);

  // Handle location change
  const handleLocationChange = (e) => {
    const city = e.target.value;
    setSelected(city);
    setLoading(true);

    axios.get(`https://eventswebscraper.onrender.com/api/events?city=${city}`)
      .then(res => setEvents(res.data))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-white p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
          Discover Events Around You
        </h1>

        {/* Location Dropdown */}
        <div className="mb-6">
          <select
            className="w-full px-4 py-3 rounded-lg border border-blue-300 focus:ring-2 focus:ring-blue-500 outline-none transition"
            onChange={handleLocationChange}
            value={selected}
          >
            <option value="">Select a location</option>
            {locations.length > 0 ? (
              locations.map((loc, i) => (
                <option key={i} value={loc}>{loc}</option>
              ))
            ) : (
              <option value="">Loading...</option>
            )}
          </select>
        </div>

        {/* Event Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {loading && (
            <div className="col-span-2 flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-3 text-gray-600">Fetching events...</span>
            </div>
          )}


          {!loading && events.length > 0 && events.map((e, idx) => (
            <div key={idx} className="p-5 rounded-xl border shadow hover:shadow-lg transition bg-gray-50">
              <h2 className="text-xl font-semibold text-gray-800">{e.title}</h2>
              <p className="text-sm text-gray-600">{e.date}</p>
              <p className="text-sm text-gray-700 mb-4">{e.location}</p>

              {/* Get Tickets */}
              <form
                action={e.url}
                method="GET"
                onSubmit={(ev) => {
                  ev.preventDefault();
                  const email = prompt("Enter your email to get tickets:");
                  if (email) {
                    window.location.href = e.url;
                  }
                }}
              >
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition">
                  🎫 Get Tickets
                </button>
              </form>
            </div>
          ))}

          {!loading && events.length === 0 && selected && (
            <p className="col-span-2 text-center text-gray-500">
              No events found for <strong>{selected}</strong>.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
