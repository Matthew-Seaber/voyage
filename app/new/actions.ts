"use server";

export async function fetchFlights(
  departureCode: string,
  arrivalCode: string,
  targetDate: string,
) {
  if (!process.env.SERPAPI_KEY) {
    throw new Error("API key missing");
  }

  const urlParams = new URLSearchParams({
    api_key: process.env.SERPAPI_KEY,
    departure_id: departureCode,
    arrival_id: arrivalCode,
    currency: "USD",
    type: "2",
    outbound_date: targetDate,
  });

  const targetUrl = `https://serpapi.com/search?engine=google_flights&${urlParams}`;

  const response = await fetch(targetUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error("Failed to fetch flight data");
  }

  const data = await response.json();

  const flights = [];
  if (data.best_flights) {
    flights.push(...data.best_flights);
  }
  if (data.other_flights) {
    flights.push(...data.other_flights);
  }

  return flights;
}

export async function fetchRoundTripFlights(
  departureCode: string,
  arrivalCode: string,
  targetOutboundDate: string,
  targetReturnDate: string,
) {
  if (!process.env.SERPAPI_KEY) {
    throw new Error("API key missing");
  }

  const urlParams = new URLSearchParams({
    api_key: process.env.SERPAPI_KEY,
    departure_id: departureCode,
    arrival_id: arrivalCode,
    currency: "USD",
    type: "1",
    outbound_date: targetOutboundDate,
    return_date: targetReturnDate,
  });

  const targetUrl = `https://serpapi.com/search?engine=google_flights&${urlParams}`;

  const response = await fetch(targetUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error("Failed to fetch flight data");
  }

  const data = await response.json();

  const flights = [];
  if (data.best_flights) {
    flights.push(...data.best_flights);
  }
  if (data.other_flights) {
    flights.push(...data.other_flights);
  }

  return flights;
}

export async function fetchReturnFlights(
  departureToken: string,
  departureCode: string,
  arrivalCode: string,
  targetDepartureDate: string,
  targetReturnDate: string,
) {
  if (!process.env.SERPAPI_KEY) {
    throw new Error("API key missing");
  }

  const urlParams = new URLSearchParams({
    api_key: process.env.SERPAPI_KEY,
    departure_token: departureToken,
    departure_id: departureCode,
    arrival_id: arrivalCode,
    currency: "USD",
    type: "1",
    outbound_date: targetDepartureDate,
    return_date: targetReturnDate,
  });

  const targetUrl = `https://serpapi.com/search?engine=google_flights&${urlParams}`;

  const response = await fetch(targetUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error("Failed to fetch flight data");
  }

  const data = await response.json();

  const flights = [];
  if (data.best_flights) {
    flights.push(...data.best_flights);
  }
  if (data.other_flights) {
    flights.push(...data.other_flights);
  }

  return flights;
}

export async function fetchHotels(
  location: string,
  checkInDate: string,
  checkOutDate: string,
  adults: number,
  children: number,
) {
  if (!process.env.SERPAPI_KEY) {
    throw new Error("API key missing");
  }

  const urlParams = new URLSearchParams({
    api_key: process.env.SERPAPI_KEY,
    q: location,
    check_in_date: checkInDate,
    check_out_date: checkOutDate,
    currency: "USD",
    adults: adults.toString(),
    children: children.toString(),
  });

  const targetUrl = `https://serpapi.com/search?engine=google_hotels&${urlParams}`;

  const response = await fetch(targetUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error("Failed to fetch hotel data");
  }

  const data = await response.json();

  const hotels = [];
  if (data.properties) {
    hotels.push(...data.properties);
  }

  return hotels;
}

export async function fetchWeather(
  location: string,
  startDate: string,
  endDate: string,
) {
  if (!process.env.OPEN_WEATHER_KEY) {
    throw new Error("API key missing");
  }

  const urlParams = new URLSearchParams({
    q: location,
    appid: process.env.OPEN_WEATHER_KEY,
    units: "metric",
  });

  const targetUrl = `https://api.openweathermap.org/data/2.5/forecast?${urlParams}`;

  const response = await fetch(targetUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    return [];
  }

  const data = await response.json();

  const dailyWeather = new Map();

  if (data.list) {
    for (const item of data.list) {
      const date = item.dt_txt.split(" ")[0];

      if (date < startDate || date > endDate) {
        // Ensures all returned data is within the inputted range
        continue;
      }

      const rainfall = item.rain ? item.rain["3h"] || 0 : 0;

      if (!dailyWeather.has(date)) {
        dailyWeather.set(date, {
          date: date,
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          weatherTypes: [item.weather[0].main],
          icon: item.weather[0].icon,
          rainfall: rainfall,
        });
      } else {
        const day = dailyWeather.get(date);
        day.minTemp = Math.min(day.minTemp, item.main.temp_min);
        day.maxTemp = Math.max(day.maxTemp, item.main.temp_max);
        day.weatherTypes.push(item.weather[0].main);
        day.rainfall += rainfall;
      }
    }
  }

  return Array.from(dailyWeather.values()).map((day) => {
    const counts = day.weatherTypes.reduce(
      (acc: Record<string, number>, curr: string) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
      },
      {},
    );
    const mostFrequentWeather = Object.keys(counts).reduce(
      (a, b) => (counts[a] > counts[b] ? a : b), // Decides on what weather type to show for each day
    );

    return {
      date: day.date,
      minTemp: Math.round(day.minTemp),
      maxTemp: Math.round(day.maxTemp),
      type: mostFrequentWeather,
      icon: day.icon,
      rainfall: Math.round(day.rainfall * 10) / 10,
    };
  });
}

export async function fetchEvents(location: string, startDate: string) {
  if (!process.env.SERPAPI_KEY) {
    throw new Error("API key missing");
  }

  const start = new Date(startDate);

  start.setHours(0, 0, 0, 0);

  const options: Intl.DateTimeFormatOptions = {
    month: "long",
    day: "numeric",
    year: "numeric",
  };
  const formattedDate = start.toLocaleDateString("en-US", options);

  const urlParams = new URLSearchParams({
    api_key: process.env.SERPAPI_KEY,
    q: `Events in ${location} around ${formattedDate}`,
  });

  const targetUrl = `https://serpapi.com/search?engine=google_events&${urlParams}`;

  const response = await fetch(targetUrl, {
    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error("Failed to fetch event data");
  }

  const data = await response.json();

  const events = [];
  if (data.events_results) {
    events.push(...data.events_results);
  }

  return events;
}
