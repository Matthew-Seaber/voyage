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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Check,
  ChevronDownIcon,
  Loader2,
  Printer,
  Share,
  Star,
} from "lucide-react";
import {
  fetchFlights,
  fetchRoundTripFlights,
  fetchHotels,
  fetchEvents,
  fetchWeather,
} from "./actions";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface WeatherData {
  date: string;
  minTemp: number;
  maxTemp: number;
  type: string;
  icon: string;
  rainfall: number;
}

interface EventData {
  title: string;
  date: {
    start_date: string;
    when: string;
  };
  address: string[];
  link: string;
  description: string;
  thumbnail: string;
}

interface HotelData {
  type: string;
  name: string;
  description: string;
  link: string;
  check_in_time?: string;
  check_out_time?: string;
  rate_per_night?: {
    lowest: string;
    extracted_lowest: number;
    before_taxes_fees: string;
    extracted_before_taxes_fees: number;
  };
  total_rate?: {
    lowest: string;
    extracted_lowest: number;
    before_taxes_fees: string;
    extracted_before_taxes_fees: number;
  };
  images?: {
    thumbnail: string;
    original_image: string;
  }[];
  overall_rating?: number;
  reviews?: number;
  location_rating?: number;
  amenities?: string[];
}

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

function NewTripPage() {
  const [view, setView] = React.useState<"create" | "view">("create");
  const [departureDate, setDepartureDate] = React.useState<Date>();
  const [returnDate, setReturnDate] = React.useState<Date>();
  const [departureCode, setDepartureCode] = React.useState("");
  const [arrivalCode, setArrivalCode] = React.useState("");
  const [roundTrip, setRoundTrip] = React.useState(false);
  const [location, setLocation] = React.useState("");
  const [adults, setAdults] = React.useState(1);
  const [children, setChildren] = React.useState(0);
  const [activeStep, setActiveStep] = React.useState<string>("flights");
  const [flightsConfirmed, setFlightsConfirmed] = React.useState(false);
  const [hotelConfirmed, setHotelConfirmed] = React.useState(false);
  const [eventsConfirmed, setEventsConfirmed] = React.useState(false);
  const [selectedDepFlight, setSelectedDepFlight] =
    React.useState<Flight | null>(null);
  const [selectedRetFlight, setSelectedRetFlight] =
    React.useState<Flight | null>(null);
  const [selectedHotel, setSelectedHotel] = React.useState<HotelData | null>(
    null,
  );
  const [selectedEvents, setSelectedEvents] = React.useState<EventData[]>([]);
  const [flightsFetched, setFlightsFetched] = React.useState(false);
  const [flightsLoading, setFlightsLoading] = React.useState(false);
  const [hotelsLoading, setHotelsLoading] = React.useState(false);
  const [weatherLoading, setWeatherLoading] = React.useState(false);
  const [eventsLoading, setEventsLoading] = React.useState(false);
  const [eventsFetched, setEventsFetched] = React.useState(false);
  const [flights, setFlights] = React.useState<FlightData>({
    departure: [],
    return: [],
  });
  const [roundTripFlights, setRoundTripFlights] = React.useState<Flight[]>([]);
  const [hotels, setHotels] = React.useState<HotelData[]>([]);
  const [events, setEvents] = React.useState<EventData[]>([]);
  const [weather, setWeather] = React.useState<WeatherData[]>([]);

  function handlePrint() {
    window.print();
  }

  async function handleShare() {
    const summary = `${location} Trip ${departureDate?.getFullYear()}
Dates: ${departureDate?.toLocaleDateString("en-US")} to ${returnDate?.toLocaleDateString("en-US")}
Flights: $${(selectedDepFlight?.price ?? 0) + (selectedRetFlight?.price ?? 0)} total
Hotel: ${selectedHotel?.name} (${selectedHotel?.total_rate?.lowest || "Unknown"})
Total estimated cost: $${(
      (selectedDepFlight?.price ?? 0) +
      (selectedRetFlight?.price ?? 0) +
      (selectedHotel?.total_rate?.extracted_lowest ?? 0)
    ).toFixed(2)}
    
Created with Voyage - your new favorite travel planner!`;

    try {
      await navigator.clipboard.writeText(summary);
      if (navigator.share) {
        await navigator.share({
          title: `${location} TRIP ${departureDate?.getFullYear()}`,
          text: summary,
        });
      } else {
        await navigator.clipboard.writeText(summary);
        toast.success("Trip details copied to clipboard!");
      }
    } catch (error) {
      console.error("Error sharing:", error);
      toast.error("Sharing failed. Please try again later.");
    }
  }

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

    setFlightsLoading(true);
    setFlights({ departure: [], return: [] });
    setRoundTripFlights([]);

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

      // Fetch round trip flights
      const roundTripFlights = await fetchRoundTripFlights(
        departureCode,
        arrivalCode,
        departureDateString,
        returnDateString,
      );

      setFlights({
        departure: departureFlights || [],
        return: returnFlights || [],
      });
      setRoundTripFlights(roundTripFlights || []);

      if (
        !departureFlights?.length &&
        !returnFlights?.length &&
        !roundTripFlights?.length
      ) {
        toast.info("No flights were found for the selected dates.");
      }

      setFlightsFetched(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch flights. Please try again later.");
    } finally {
      setFlightsLoading(false);
    }
  }

  async function getHotelData() {
    if (!location || !departureDate || !returnDate) {
      toast.error("All location and date fields must be filled in.");
      return;
    }

    if (returnDate < departureDate) {
      toast.error("Return date cannot be before the departure date.");
      return;
    }

    setHotelsLoading(true);

    try {
      const departureDateString = formatDate(departureDate);
      const returnDateString = formatDate(returnDate);

      // Fetch hotel data
      const hotelsResponse = await fetchHotels(
        location,
        departureDateString,
        returnDateString,
        adults,
        children,
      );

      setHotels(hotelsResponse || []);

      if (!hotelsResponse?.length) {
        toast.info("No hotels were found for the selected location and dates.");
      }

      // setHotelsFetched(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch hotels. Please try again later.");
    } finally {
      setHotelsLoading(false);
    }
  }

  async function getEventData() {
    if (!location || !departureDate) {
      toast.error("All location and date fields must be filled in.");
      return;
    }

    const todayInTwoMonths = new Date();
    todayInTwoMonths.setMonth(todayInTwoMonths.getMonth() + 2);

    if (departureDate > todayInTwoMonths) {
      toast.warning(
        "Events are only available for dates within the next two months.",
      );
      return;
    }

    setEventsLoading(true);
    setWeatherLoading(true);

    const startDateString = formatDate(departureDate);
    const endDateString = returnDate ? formatDate(returnDate) : startDateString;

    try {
      const weatherResponse = await fetchWeather(
        location,
        startDateString,
        endDateString,
      );
      setWeather(weatherResponse || []);
    } catch (weatherError) {
      console.error("Failed to fetch weather:", weatherError);
      toast.error("Could not load weather forecast.");
      setWeather([]);
    }

    setWeatherLoading(false);

    try {
      // Fetch event data
      const eventsResponse = await fetchEvents(location, startDateString);

      const fetchedEvents = eventsResponse || [];
      const sortedEvents = fetchedEvents.sort((a, b) => {
        if (!a.date?.start_date) return 1;
        if (!b.date?.start_date) return -1;

        return (
          new Date(a.date.start_date).getTime() -
          new Date(b.date.start_date).getTime()
        );
      });

      setEvents(sortedEvents);

      if (!sortedEvents.length) {
        toast.info("No events were found for the selected location and dates.");
      }

      setEventsFetched(true);
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch events. Please try again later.");
    } finally {
      setEventsLoading(false);
    }
  }

  function formatDate(date: Date) {
    // Prevent timezone offset from shifting the date to the previous day
    const localDate = new Date(date);
    localDate.setMinutes(
      localDate.getMinutes() - localDate.getTimezoneOffset(),
    );
    return localDate.toISOString().split("T")[0];
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {view === "create" ? (
        <>
          <h1 className="text-3xl font-bold mb-8">Plan Your Trip</h1>
          <Accordion
            type="single"
            collapsible
            value={activeStep}
            onValueChange={setActiveStep}
            className="w-full space-y-4"
          >
            <AccordionItem
              value="flights"
              className="border px-6 py-2 rounded-lg bg-card"
            >
              <AccordionTrigger className="text-2xl font-semibold hover:no-underline cursor-pointer">
                <div className="flex items-center gap-4">
                  1. Choose your flights
                  {flightsConfirmed && (
                    <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full flex items-center">
                      <Check className="w-4 h-4 mr-1" />
                      Done
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-8">
                <h2 className="text-xl font-bold mb-4">Outline Your Trip</h2>
                <p className="text-muted-foreground">
                  To get started, let&apos;s sort out the basics.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    placeholder="Departure airport code (e.g. LAX)"
                    maxLength={3}
                    value={departureCode}
                    onChange={(e) =>
                      setDepartureCode(e.target.value.toUpperCase())
                    }
                  />
                  <Input
                    placeholder="Destination airport code (e.g. JFK)"
                    maxLength={3}
                    value={arrivalCode}
                    onChange={(e) =>
                      setArrivalCode(e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        data-empty={!departureDate}
                        className="w-full sm:w-52 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                      >
                        {departureDate ? (
                          formatDate(departureDate)
                        ) : (
                          <span>Pick departure date</span>
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
                        className="w-full sm:w-52 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                      >
                        {returnDate ? (
                          formatDate(returnDate)
                        ) : (
                          <span>Pick return date</span>
                        )}
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

                <div className="flex space-x-2 mb-6">
                  <Switch
                    id="round-trip"
                    defaultChecked={roundTrip}
                    checked={roundTrip}
                    onCheckedChange={setRoundTrip}
                  />
                  <Label htmlFor="round-trip">Include round trip flights</Label>
                </div>

                <div className="mt-4 flex flex-col items-start">
                  <Button
                    className="w-full sm:w-auto cursor-pointer"
                    onClick={getFlightData}
                    disabled={flightsLoading}
                  >
                    {flightsLoading && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Check flights
                  </Button>
                </div>

                {roundTripFlights.length > 0 && roundTrip ? (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">
                      Round Trip Flights
                    </h2>
                    <div className="space-y-4">
                      {roundTripFlights.slice(0, 5).map((flight, idx) => (
                        <div
                          key={idx}
                          className={`cursor-pointer border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow ${selectedDepFlight === flight ? "border-primary" : ""}`}
                          onClick={() => {
                            setSelectedDepFlight(flight);
                            setSelectedRetFlight(flight);
                          }}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={flight.airline_logo}
                                alt="Airline logo"
                                className="h-8 w-8 object-contain shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold">${flight.price}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {flight.flights
                                    .map((flght) => flght.airline)
                                    .join(", ")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p>
                                Outbound:{" "}
                                {Math.floor(flight.total_duration / 60)}h{" "}
                                {flight.total_duration % 60}m (
                                {
                                  flight.flights[0].departure_airport.time.split(
                                    " ",
                                  )[1]
                                }{" "}
                                -{" "}
                                {
                                  flight.flights[0].arrival_airport.time.split(
                                    " ",
                                  )[1]
                                }{" "}
                                local time)
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {flight.flights.length > 1
                                  ? `${flight.flights.length - 1} stop${flight.flights.length - 1 === 1 ? "" : "s"}`
                                  : "Direct"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Inbound data currently unknown
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : flightsFetched && roundTrip ? (
                  <p className="mt-4 text-muted-foreground">
                    No round trip flights found for the selected dates.
                  </p>
                ) : null}

                {flights.departure.length > 0 ? (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">
                      Departure Flights
                    </h2>
                    <div className="space-y-4">
                      {flights.departure.slice(0, 5).map((flight, idx) => (
                        <div
                          key={idx}
                          className={`cursor-pointer border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow ${selectedDepFlight === flight ? "border-primary" : ""}`}
                          onClick={() => setSelectedDepFlight(flight)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={flight.airline_logo}
                                alt="Airline logo"
                                className="h-8 w-8 object-contain shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold">${flight.price}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {flight.flights
                                    .map((flght) => flght.airline)
                                    .join(", ")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p>
                                {Math.floor(flight.total_duration / 60)}h{" "}
                                {flight.total_duration % 60}m (
                                {
                                  flight.flights[0].departure_airport.time.split(
                                    " ",
                                  )[1]
                                }{" "}
                                -{" "}
                                {
                                  flight.flights[0].arrival_airport.time.split(
                                    " ",
                                  )[1]
                                }{" "}
                                local time)
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {flight.flights.length > 1
                                  ? `${flight.flights.length - 1} stop${flight.flights.length - 1 === 1 ? "" : "s"}`
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
                          className={`cursor-pointer border p-4 rounded-md shadow-sm hover:shadow-md transition-shadow ${selectedRetFlight === flight ? "border-primary" : ""}`}
                          onClick={() => setSelectedRetFlight(flight)}
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={flight.airline_logo}
                                alt="Airline logo"
                                className="h-8 w-8 object-contain shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="font-semibold">${flight.price}</p>
                                <p className="text-sm text-muted-foreground truncate">
                                  {flight.flights
                                    .map((flght) => flght.airline)
                                    .join(", ")}
                                </p>
                              </div>
                            </div>
                            <div className="text-right shrink-0">
                              <p>
                                {Math.floor(flight.total_duration / 60)}h{" "}
                                {flight.total_duration % 60}m (
                                {
                                  flight.flights[0].departure_airport.time.split(
                                    " ",
                                  )[1]
                                }{" "}
                                -{" "}
                                {
                                  flight.flights[0].arrival_airport.time.split(
                                    " ",
                                  )[1]
                                }{" "}
                                local time)
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {flight.flights.length > 1
                                  ? `${flight.flights.length - 1} stop${flight.flights.length - 1 === 1 ? "" : "s"}`
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
                  <Button
                    className="cursor-pointer mt-8 w-full md:w-auto"
                    onClick={() => {
                      setFlightsConfirmed(true);
                      setActiveStep("hotels");
                    }}
                  >
                    Confirm flights
                  </Button>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="hotels"
              className="border px-6 py-2 rounded-lg bg-card"
              disabled={!flightsConfirmed}
            >
              <AccordionTrigger className="text-2xl font-semibold hover:no-underline cursor-pointer data-disabled:opacity-50">
                <div className="flex items-center gap-4">
                  2. Find a hotel
                  {hotelConfirmed && (
                    <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full flex items-center">
                      <Check className="w-4 h-4 mr-1" />
                      Done
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-8">
                <div className="space-y-4">
                  <p className="text-muted-foreground">
                    Now that your flights are all sorted, let&apos;s find a
                    place to stay.
                  </p>
                  <div className="gap-4 mt-4">
                    <Input
                      placeholder="Location (e.g. Paris)"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                      <div className="flex flex-col gap-2">
                        <label htmlFor="adults">Adults</label>
                        <Input
                          placeholder="Adults"
                          id="adults"
                          type="number"
                          min="1"
                          value={adults}
                          onChange={(e) =>
                            setAdults(parseInt(e.target.value, 10) || 1)
                          }
                        />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label htmlFor="children">Children (&lt;18)</label>
                        <Input
                          placeholder="Children"
                          id="children"
                          type="number"
                          min="0"
                          value={children}
                          onChange={(e) =>
                            setChildren(parseInt(e.target.value, 10) || 0)
                          }
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full md:w-auto"
                      onClick={getHotelData}
                      disabled={hotelsLoading}
                    >
                      {hotelsLoading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Find hotels
                    </Button>
                  </div>

                  {hotels.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 mt-8">
                      {hotels.slice(0, 10).map((hotel, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col sm:flex-row gap-4 border p-4 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-shadow ${selectedHotel === hotel ? "border-primary" : ""}`}
                          onClick={() => setSelectedHotel(hotel)}
                        >
                          {hotel.images?.[0]?.thumbnail && (
                            <div className="w-full sm:w-48 h-32 shrink-0 rounded-md overflow-hidden bg-muted">
                              <img
                                src={hotel.images[0].thumbnail}
                                alt={`Picture of ${hotel.name}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <h3 className="font-semibold text-lg line-clamp-1">
                                  {hotel.name}
                                </h3>
                                {hotel.overall_rating && (
                                  <div className="flex items-center text-sm text-muted-foreground">
                                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                                    <span className="font-medium text-foreground mr-1">
                                      {hotel.overall_rating.toFixed(1)}{" "}
                                      {/* Sets to 1 decimal point */}
                                    </span>
                                    {hotel.reviews && (
                                      <p>({hotel.reviews} reviews)</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                {hotel.rate_per_night?.lowest ? (
                                  <>
                                    <p className="font-bold text-lg">
                                      {hotel.rate_per_night.lowest}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      per night
                                    </p>
                                  </>
                                ) : (
                                  <p className="font-medium text-muted-foreground">
                                    Nightly rate unknown
                                  </p>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {hotel.description}
                            </p>
                            {hotel.amenities && hotel.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-auto pt-4">
                                {hotel.amenities
                                  .slice(0, 3)
                                  .map((amenity, i) => (
                                    <span
                                      key={i}
                                      className="text-xs px-2 py-1 bg-secondary rounded-md"
                                    >
                                      {amenity}
                                    </span>
                                  ))}
                                {hotel.amenities.length > 3 && (
                                  <span
                                    className="text-xs px-2 py-1 bg-secondary rounded-md"
                                    title={hotel.amenities.join(", ")}
                                  >
                                    +{hotel.amenities.length - 3} more
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {selectedHotel && (
                        <Button
                          className="cursor-pointer mt-4 w-full md:w-auto"
                          onClick={() => {
                            setHotelConfirmed(true);
                            setActiveStep("events/weather");
                            getEventData();
                          }}
                        >
                          Confirm hotel selection
                        </Button>
                      )}
                    </div>
                  ) : hotelsLoading ? (
                    <div className="border-2 border-dashed border-border rounded-lg p-12 flex items-center justify-center flex-col text-center text-muted-foreground mt-8 bg-muted/20">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                      <p className="text-lg font-medium text-foreground mb-2">
                        Searching for hotels...
                      </p>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border rounded-lg p-12 flex items-center justify-center flex-col text-center text-muted-foreground mt-8 bg-muted/20">
                      <p className="text-lg font-medium text-foreground mb-2">
                        No hotels found
                      </p>
                      <p className="text-sm">
                        Search for a location to view hotel options.
                      </p>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="events/weather"
              className="border px-6 py-2 rounded-lg bg-card"
              disabled={!flightsConfirmed && !hotelConfirmed}
            >
              <AccordionTrigger className="text-2xl font-semibold hover:no-underline cursor-pointer">
                <div className="flex items-center gap-4">
                  3. Pick some events
                  {eventsConfirmed && (
                    <span className="text-xs bg-green-100 text-green-700 font-medium px-2 py-1 rounded-full flex items-center">
                      <Check className="w-4 h-4 mr-1" />
                      Done
                    </span>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent className="pt-4 pb-8">
                <h2 className="text-xl font-bold mb-4">Weather Forecast</h2>
                <p className="text-muted-foreground">
                  Use the weather forecast to plan some activities.
                </p>

                {weatherLoading ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-12 flex items-center justify-center flex-col text-center text-muted-foreground mt-8 bg-muted/20">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Loading forecast...
                    </p>
                  </div>
                ) : weather.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6">
                    {weather.map((day, idx) => (
                      <div
                        key={idx}
                        className="border p-4 rounded-md shadow-sm flex flex-col items-center justify-center text-center bg-card hover:bg-muted/50 transition-colors"
                      >
                        <p className="font-semibold text-sm mb-1">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <img
                          src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                          alt={day.type}
                          className="w-16 h-16"
                        />
                        <p className="text-sm font-medium capitalize mb-2">
                          {day.type}
                        </p>
                        <div className="flex gap-3 text-sm">
                          <span className="font-bold text-foreground">
                            {day.maxTemp}°
                          </span>
                          <span className="text-muted-foreground">
                            {day.minTemp}°
                          </span>
                        </div>
                        {day.rainfall > 0 && (
                          <p className="text-xs text-blue-500 font-medium mt-2">
                            {day.rainfall}mm rain
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : eventsFetched ? (
                  <div className="py-8 text-center text-muted-foreground bg-muted/20 rounded-lg mt-4 border-2 border-dashed">
                    <p className="font-medium text-foreground mb-1">
                      Weather forecast unavailable
                    </p>
                    <p className="text-sm">
                      Forecasts are typically only available for the next 5
                      days.
                    </p>
                  </div>
                ) : null}

                {events.length > 0 ? (
                  <div className="mt-8">
                    <h2 className="text-xl font-bold mb-4">Available Events</h2>
                    <div className="space-y-4">
                      {events.slice(0, 10).map((event, idx) => (
                        <div
                          key={idx}
                          className={`flex flex-col sm:flex-row gap-4 border p-4 rounded-md shadow-sm hover:shadow-md cursor-pointer transition-shadow ${selectedEvents.includes(event) ? "border-primary" : ""}`}
                          onClick={() => {
                            setSelectedEvents((prev) =>
                              prev.includes(event)
                                ? prev.filter((e) => e !== event)
                                : [...prev, event],
                            );
                          }}
                        >
                          {event.thumbnail && (
                            <div className="w-full sm:w-32 h-32 shrink-0 rounded-md overflow-hidden bg-muted">
                              <img
                                src={event.thumbnail}
                                alt={`Picture of ${event.title}`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex justify-between items-start gap-4">
                              <div className="space-y-1">
                                <h3 className="font-semibold text-lg line-clamp-1">
                                  {event.title}
                                </h3>
                                <div className="text-sm text-muted-foreground">
                                  <span className="font-medium text-foreground mr-1">
                                    {event.address?.join(", ")}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                {event.date?.when ? (
                                  <p className="text-xs text-muted-foreground w-40">
                                    {event.date.when}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                              {event.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : eventsLoading ? (
                  <div className="border-2 border-dashed border-border rounded-lg p-12 flex items-center justify-center flex-col text-center text-muted-foreground mt-8 bg-muted/20">
                    <Loader2 className="h-8 w-8 animate-spin mb-4 text-primary" />
                    <p className="text-lg font-medium text-foreground mb-2">
                      Searching for events...
                    </p>
                  </div>
                ) : eventsFetched ? (
                  <p className="mt-4 text-muted-foreground">
                    No events found for the selected dates.
                  </p>
                ) : null}

                <Button
                  className="cursor-pointer mt-8 w-full md:w-auto"
                  onClick={() => {
                    setEventsConfirmed(true);
                    setActiveStep("");
                  }}
                >
                  Done
                </Button>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {selectedDepFlight &&
            selectedRetFlight &&
            selectedHotel && ( // # MUST REMOVE !s
              <Button
                className="cursor-pointer mt-4 w-full md:w-auto p-5 text-md"
                onClick={() => setView("view")}
              >
                Create schedule
              </Button>
            )}
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div id="top-bar" className="flex items-center gap-2 justify-between">
            <Button variant="outline" onClick={() => setView("create")}>
              <ArrowLeft />
              Back
            </Button>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={handlePrint}>
                <Printer />
                Print
              </Button>
              <Button onClick={handleShare}>
                <Share />
                Share
              </Button>
            </div>
          </div>

          <div id="printable-content" className="space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold uppercase">
                {location} TRIP {departureDate?.getFullYear()}
              </h1>
              <p className="text-muted-foreground">
                {departureDate?.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}{" "}
                --&gt;{" "}
                {returnDate?.toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-md md:text-xl font-semibold mb-2">Flights</h2>

              <p>
                Outbound:{" "}
                {selectedDepFlight?.flights[0]?.departure_airport?.name} -{" "}
                {selectedDepFlight?.flights[0]?.arrival_airport?.name} (
                {Math.floor((selectedDepFlight?.total_duration ?? 0) / 60)}h{" "}
                {(selectedDepFlight?.total_duration ?? 0) % 60}m)
              </p>
              <p>
                Return: {selectedRetFlight?.flights[0]?.departure_airport?.name}{" "}
                - {selectedRetFlight?.flights[0]?.arrival_airport?.name} (
                {Math.floor((selectedRetFlight?.total_duration ?? 0) / 60)}h{" "}
                {(selectedRetFlight?.total_duration ?? 0) % 60}m)
              </p>
              <p>
                Total cost: $
                {(selectedDepFlight?.price ?? 0) +
                  (selectedRetFlight?.price ?? 0)}
              </p>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-md md:text-xl font-semibold mb-2">Hotels</h2>

              <p>
                Total cost: {selectedHotel?.total_rate?.lowest || "Unknown"} for{" "}
                {Math.max(
                  0,
                  Math.ceil(
                    ((returnDate?.getTime() ?? 0) -
                      (departureDate?.getTime() ?? 0)) /
                      (1000 * 60 * 60 * 24),
                  ),
                )}{" "}
                nights
              </p>
              <p>Check in: {selectedHotel?.check_in_time}</p>
              <p>Check out: {selectedHotel?.check_out_time}</p>
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-md md:text-xl font-semibold mb-2">Weather</h2>
              {weather.length > 0 ? (
                weather.map((day) => (
                  <p key={day.date}>
                    {new Date(day.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    })}
                    : {day.type}, {day.maxTemp}°/{day.minTemp}°
                  </p>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Weather forecast unavailable.
                </p>
              )}
            </div>

            <div className="border rounded-lg p-4">
              <h2 className="text-md md:text-xl font-semibold mb-4">Events</h2>

              {selectedEvents.length > 0 ? (
                <div className="space-y-3">
                  {selectedEvents.map((event, index) => (
                    <div
                      key={index}
                      className="rounded-md border bg-muted/20 p-3 space-y-1"
                    >
                      <p className="font-medium text-foreground">
                        {event.title}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.address?.join(", ")}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {event.date?.when}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No events selected
                </p>
              )}
            </div>

            <h3 className="font-semibold">
              Total cost (excluding events): $
              {(
                (selectedDepFlight?.price ?? 0) +
                (selectedRetFlight?.price ?? 0) +
                (selectedHotel?.total_rate?.extracted_lowest ?? 0)
              ).toFixed(2)}
            </h3>
          </div>
        </div>
      )}

      <footer className="text-center text-stone-500 mt-12">
        <p>&copy; 2026 Voyage. All rights reserved.</p>
      </footer>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }

          #printable-content *,
          footer * {
            visibility: visible;
          }

          #printable-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }

          footer {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
          }

          #top-bar {
            display: none;
          }
        }
      `}</style>

      <Toaster />
    </div>
  );
}

export default NewTripPage;
