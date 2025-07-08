import { Cloud, Droplets, Sun, Wind, CloudRain, CloudSnow, CloudFog, CloudLightning } from "lucide-react"

export default function WeatherDisplay({ weather }) {
  // Function to determine which icon to display based on weather condition
  const getWeatherIcon = () => {
    const condition = weather.condition.toLowerCase()

    if (condition.includes("clear") || condition.includes("sunny")) {
      return <Sun className="h-16 w-16 text-yellow-300" />
    } else if (condition.includes("rain") || condition.includes("drizzle")) {
      return <CloudRain className="h-16 w-16 text-blue-300" />
    } else if (condition.includes("cloud")) {
      return <Cloud className="h-16 w-16 text-gray-300" />
    } else if (condition.includes("snow")) {
      return <CloudSnow className="h-16 w-16 text-white" />
    } else if (condition.includes("fog") || condition.includes("mist")) {
      return <CloudFog className="h-16 w-16 text-gray-300" />
    } else if (condition.includes("thunder")) {
      return <CloudLightning className="h-16 w-16 text-yellow-300" />
    } else {
      return <Sun className="h-16 w-16 text-yellow-300" />
    }
  }

  return (
    <div className="text-white animate-fadeIn">
      <div className="flex flex-col items-center mb-6">
        <h2 className="text-3xl font-bold mb-1">{weather.city}</h2>
        <p className="text-xl opacity-80">{weather.condition}</p>
      </div>

      <div className="flex justify-center mb-6">
        {weather.icon ? (
          <img
            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
            alt={weather.condition}
            className="h-24 w-24"
          />
        ) : (
          getWeatherIcon()
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Sun className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm opacity-80">Temperature</p>
            <p className="text-xl font-semibold">{weather.temperature}°C</p>
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm opacity-80">Humidity</p>
            <p className="text-xl font-semibold">{weather.humidity}%</p>
          </div>
        </div>

        <div className="bg-white/10 p-4 rounded-lg flex items-center gap-3 md:col-span-2">
          <div className="bg-white/20 p-2 rounded-full">
            <Wind className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm opacity-80">Wind Speed</p>
            <p className="text-xl font-semibold">{weather.windSpeed} km/h</p>
          </div>
        </div>
      </div>
    </div>
  )
}
