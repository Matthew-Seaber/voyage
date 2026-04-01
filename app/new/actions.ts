"use server";

export async function fetchFlights(
  departureCode: string,
  arrivalCode: string,
  targetDate: string
) {
  if (!process.env.AVIATION_STACK_API_KEY) {
    throw new Error("API key missing");
  }

  const urlParams = new URLSearchParams({
    access_key: process.env.AVIATION_STACK_API_KEY,
    dep_iata: departureCode,
    arr_iata: arrivalCode,
  });

  const targetUrl = `[URL HERE]`;

  const response = await fetch(targetUrl, {
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error:", errorText);
    throw new Error("Failed to fetch flight data");
  }

  const data = await response.json();
  
  const flights = data.data || [];
  
  return flights;
}