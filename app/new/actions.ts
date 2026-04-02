"use server";

export async function fetchFlights(
  departureCode: string,
  arrivalCode: string,
  targetDate: string
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
    cache: 'no-store'
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