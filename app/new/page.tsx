/* eslint-disable @next/next/no-img-element */
"use client";

import React from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Toaster, toast } from "sonner";
import { ChevronDownIcon, Loader2 } from "lucide-react";
import { fetchFlights } from "./actions";

interface AirportInfo {
  name: string;
  id: string;
  time: string;
}

interface FlightSegment {
  departure_airport: AirportInfo;
  arrival_airport: AirportInfo;
  duration: number;
  airplane: string;
  airline: string;
  airline_logo: string;
  travel_class: string;
  flight_number: string;
  legroom?: string;
  extensions?: string[];
  often_delayed_by_over_30_min?: boolean;
}

interface Layover {
  duration: number;
  name: string;
  id: string;
  overnight?: boolean;
}

interface Flight {
  flights: FlightSegment[];
  layovers?: Layover[];
  total_duration: number;
  carbon_emissions?: {
    this_flight: number;
    typical_for_this_route: number;
    difference_percent: number;
  };
  price: number;
  type: string;
  airline_logo: string;
  extensions?: string[];
  departure_token?: string;
  booking_token?: string;
}

interface FlightData {
  departure: Flight[];
  return: Flight[];
}

function ChooseFlightPage() {
  const [departureDate, setDepartureDate] = React.useState<Date>();
  const [returnDate, setReturnDate] = React.useState<Date>();
  const [departureCode, setDepartureCode] = React.useState("");
  const [arrivalCode, setArrivalCode] = React.useState("");
  const [selectedDepFlight, setSelectedDepFlight] =
    React.useState<Flight | null>(null);
  const [selectedRetFlight, setSelectedRetFlight] =
    React.useState<Flight | null>(null);
  const [flightsFetched, setFlightsFetched] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [flights, setFlights] = React.useState<FlightData>({
    departure: [],
    return: [],
  });

  async function getFlightData() {
    if (!departureDate || !returnDate || !departureCode || !arrivalCode) {
      toast.error(
        "Both departure and return dates, and airports must be filled in.",
      );
      return;
    }

    if (returnDate < departureDate) {
      toast.error("Return date cannot be before the departure date.");
      return;
    }

    setLoading(true);
    setFlights({ departure: [], return: [] });

    try {
      const departureDateString = formatDate(departureDate);
      const returnDateString = formatDate(returnDate);

      // Fetch departure flights
      const departureFlights = await fetchFlights(
        departureCode,
        arrivalCode,
        departureDateString,
      );

      // Fetch return flights
      const returnFlights = await fetchFlights(
        arrivalCode,
        departureCode,
        returnDateString,
      );

      setFlights({
        departure: departureFlights,
        return: returnFlights,
      });

      toast.success("Flights retrieved!");
      setFlightsFetched(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch flights. Please try again later.");
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: Date) {
    return date.toISOString().split("T")[0];
  }

  return (
    <div>
      <Input
        placeholder="Departure airport code"
        maxLength={3}
        className="mb-4"
        value={departureCode}
        onChange={(e) => setDepartureCode(e.target.value.toUpperCase())}
      />
      <Input
        placeholder="Destination airport code"
        maxLength={3}
        value={arrivalCode}
        onChange={(e) => setArrivalCode(e.target.value.toUpperCase())}
      />

      <div className="my-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!departureDate}
              className="w-52 justify-between text-left font-normal data-[empty=true]:text-muted-foreground mr-2"
            >
              {departureDate ? (
                formatDate(departureDate)
              ) : (
                <span>Pick a date</span>
              )}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={departureDate}
              onSelect={setDepartureDate}
              defaultMonth={departureDate}
            />
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!returnDate}
              className="w-52 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
            >
              {returnDate ? formatDate(returnDate) : <span>Pick a date</span>}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={returnDate}
              onSelect={setReturnDate}
              defaultMonth={returnDate}
            />
          </PopoverContent>
        </Popover>
      </div>

      <Button
        className="mt-2 cursor-pointer"
        onClick={getFlightData}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Check flights!
      </Button>

      {flights.departure.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Departure Flights</h2>
          <div className="space-y-4">
            {flights.departure.slice(0, 5).map((flight, idx) => (
              <div
                key={idx}
                className={`cursor-pointer border p-4 rounded-md shadow-sm hover:shadow-md ${selectedDepFlight === flight ? "border-primary" : ""}`}
                onClick={() => setSelectedDepFlight(flight)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={flight.airline_logo}
                      alt="Airline logo"
                      className="h-8 w-8 object-contain"
                    />
                    <div>
                      <p className="font-semibold">${flight.price}</p>
                      <p className="text-sm text-muted-foreground">
                        {flight.flights
                          .map((flght) => flght.airline)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p>
                      {Math.floor(flight.total_duration / 60)}h{" "}
                      {flight.total_duration % 60}m
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {flight.flights.length > 1
                        ? `${flight.flights.length - 1} stops`
                        : "Direct"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : flightsFetched ? (
        <p className="mt-4 text-muted-foreground">
          No departure flights found for the selected date.
        </p>
      ) : null}

      {flights.return.length > 0 ? (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Return Flights</h2>
          <div className="space-y-4">
            {flights.return.slice(0, 5).map((flight, idx) => (
              <div
                key={idx}
                className={`cursor-pointer border p-4 rounded-md shadow-sm hover:shadow-md ${selectedRetFlight === flight ? "border-primary" : ""}`}
                onClick={() => setSelectedRetFlight(flight)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={flight.airline_logo}
                      alt="Airline logo"
                      className="h-8 w-8 object-contain"
                    />
                    <div>
                      <p className="font-semibold">${flight.price}</p>
                      <p className="text-sm text-muted-foreground">
                        {flight.flights
                          .map((flght) => flght.airline)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p>
                      {Math.floor(flight.total_duration / 60)}h{" "}
                      {flight.total_duration % 60}m
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {flight.flights.length > 1
                        ? `${flight.flights.length - 1} stops`
                        : "Direct"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : flightsFetched ? (
        <p className="mt-4 text-muted-foreground">
          No return flights found for the selected date.
        </p>
      ) : null}

      {selectedDepFlight && selectedRetFlight && (
        <Button className="cursor-pointer mt-8">Confirm flights</Button>
      )}

      <Toaster />
    </div>
  );
}

export default ChooseFlightPage;
