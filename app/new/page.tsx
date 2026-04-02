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
import { Check, ChevronDownIcon, Loader2, Star } from "lucide-react";
import { fetchFlights, fetchHotels } from "./actions";

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

function ChooseFlightPage() {
  const [departureDate, setDepartureDate] = React.useState<Date>();
  const [returnDate, setReturnDate] = React.useState<Date>();
  const [departureCode, setDepartureCode] = React.useState("");
  const [arrivalCode, setArrivalCode] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [adults, setAdults] = React.useState(1);
  const [children, setChildren] = React.useState(0);
  const [activeStep, setActiveStep] = React.useState<string>("flights");
  const [flightsConfirmed, setFlightsConfirmed] = React.useState(false);
  const [hotelsConfirmed, setHotelsConfirmed] = React.useState(false);
  const [selectedDepFlight, setSelectedDepFlight] =
    React.useState<Flight | null>(null);
  const [selectedRetFlight, setSelectedRetFlight] =
    React.useState<Flight | null>(null);
  const [selectedHotel, setSelectedHotel] = React.useState<HotelData | null>(
    null,
  );
  const [flightsFetched, setFlightsFetched] = React.useState(false);
  const [flightsLoading, setFlightsLoading] = React.useState(false);
  const [hotelsLoading, setHotelsLoading] = React.useState(false);
  const [flights, setFlights] = React.useState<FlightData>({
    departure: [],
    return: [],
  });
  const [hotels, setHotels] = React.useState<HotelData[]>([]);

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
        departure: departureFlights || [],
        return: returnFlights || [],
      });

      if (!departureFlights?.length && !returnFlights?.length) {
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
                onChange={(e) => setDepartureCode(e.target.value.toUpperCase())}
              />
              <Input
                placeholder="Destination airport code (e.g. JFK)"
                maxLength={3}
                value={arrivalCode}
                onChange={(e) => setArrivalCode(e.target.value.toUpperCase())}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
                    className="w-full sm:w-52 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                  >
                    {returnDate ? (
                      formatDate(returnDate)
                    ) : (
                      <span>Pick a date</span>
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

            <div className="mt-4 flex flex-col items-start">
              <Button
                className="w-full sm:w-auto cursor-pointer"
                onClick={getFlightData}
                disabled={flightsLoading}
              >
                {flightsLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Check flights!
              </Button>
            </div>

            {flights.departure.length > 0 ? (
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">Departure Flights</h2>
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
        >
          <AccordionTrigger className="text-2xl font-semibold hover:no-underline cursor-pointer data-disabled:opacity-50">
            <div className="flex items-center gap-4">2. Choose your hotel</div>
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-8">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Now that your flights are all sorted, let&apos;s find a place to
                stay.
              </p>
              <div className="gap-4 mt-4">
                <Input
                  placeholder="Location (e.g. Paris, France)"
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
                  Find hotels!
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
                            {hotel.amenities.slice(0, 3).map((amenity, i) => (
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
                        setHotelsConfirmed(true);
                        setActiveStep("events");
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
      </Accordion>
      <Toaster />
    </div>
  );
}

export default ChooseFlightPage;
