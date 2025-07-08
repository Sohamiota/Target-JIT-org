import { NextResponse } from "next/server"

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city")

  if (!city) {
    return NextResponse.json({ message: "City parameter is required" }, { status: 400 })
  }

  try {
    // You would need to replace this with your actual API key
    const API_KEY = process.env.OPENWEATHER_API_KEY

    if (!API_KEY) {
      return NextResponse.json({ message: "Weather API key is not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
    )

    if (!response.ok) {
      const errorData = await response.json()
      if (response.status === 404) {
        return NextResponse.json(
          { message: "City not found. Please check the spelling and try again." },
          { status: 404 },
        )
      }
      throw new Error(errorData.message || "Failed to fetch weather data")
    }

    const data = await response.json()

    const weatherData = {
      city: data.name,
      temperature: Math.round(data.main.temp),
      condition: data.weather[0].main,
      humidity: data.main.humidity,
      windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
      icon: data.weather[0].icon,
    }

    return NextResponse.json(weatherData)
  } catch (error) {
    console.error("Weather API error:", error)
    return NextResponse.json({ message: "Failed to fetch weather data" }, { status: 500 })
  }
}
