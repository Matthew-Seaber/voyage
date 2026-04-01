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

function ChooseFlightPage() {
  const [departureDate, setDepartureDate] = React.useState<Date>();
  const [returnDate, setReturnDate] = React.useState<Date>();
  const [departureCode, setDepartureCode] = React.useState("");
  const [arrivalCode, setArrivalCode] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [flights, setFlights] = React.useState<{ departure: any[]; return: any[] }>({
    departure: [],
    return: [],
  });

  async function getFlightData() {
    if (!departureDate || !returnDate || !departureCode || !arrivalCode) {
      toast.error("Both departure and return dates, and airports must be filled in.");
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
      const departureFlights = await fetchFlights(departureCode, arrivalCode, departureDateString);

      // Fetch return flights
      const returnFlights = await fetchFlights(arrivalCode, departureCode, returnDateString);

      setFlights({
        departure: departureFlights,
        return: returnFlights,
      });

      toast.success("Flights retrieved!");
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

      <Button className="mt-2" onClick={getFlightData} disabled={loading}>
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Check flights!
      </Button>
      <Toaster />
    </div>
  );
}

export default ChooseFlightPage;
