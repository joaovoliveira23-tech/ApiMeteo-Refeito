import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Search, MapPin, Wind, Droplets, Thermometer, Sunrise, Sunset,
  CloudRain, Sun, Cloud, CloudSun, RefreshCw, AlertCircle
} from 'lucide-react'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'

const DEFAULT_PLACE = {
  name: 'Salvador', admin1: 'Bahia', country: 'Brasil',
  latitude: -12.9714, longitude: -38.5014
}

function weatherInfo(code = 2) {
  if (code === 0) return { label: 'Céu limpo', Icon: Sun, theme: 'sunny' }
  if (code === 1 || code === 2) return { label: 'Parcialmente nublado', Icon: CloudSun, theme: 'partly' }
  if (code === 3) return { label: 'Nublado', Icon: Cloud, theme: 'cloudy' }
  if (code === 45 || code === 48) return { label: 'Neblina', Icon: Cloud, theme: 'cloudy' }
  if ([51, 53, 55, 56, 57].includes(code)) return { label: 'Garoa', Icon: CloudRain, theme: 'rainy' }
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return { label: 'Chuva', Icon: CloudRain, theme: 'rainy' }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return { label: 'Neve', Icon: Cloud, theme: 'cold' }
  if ([95, 96, 99].includes(code)) return { label: 'Tempestade', Icon: CloudRain, theme: 'storm' }
  return { label: 'Condição variável', Icon: CloudSun, theme: 'partly' }
}

function clock(value) {
  if (!value) return '--:--'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value.slice(-5)
    : new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(date)
}

function dayLabel(value, index) {
  if (index === 0) return 'Hoje'
  const date = new Date(`${value}T12:00:00`)
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' }).format(date)
}

async function getJson(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Falha na consulta (${response.status}). Tente novamente.`)
  return response.json()
}

export default function App() {
  const [place, setPlace] = useState(DEFAULT_PLACE)
  const [query, setQuery] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  const loadWeather = useCallback(async (target = place) => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams({
        latitude: String(target.latitude),
        longitude: String(target.longitude),
        current: 'temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,wind_speed_10m',
        hourly: 'temperature_2m,precipitation_probability,weather_code',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max',
        timezone: 'auto',
        forecast_days: '5'
      })
      const result = await getJson(`${FORECAST_URL}?${params}`)
      setData(result)
    } catch (err) {
      setError(err.message || 'Não foi possível carregar a previsão. Verifique sua conexão.')
    } finally {
      setLoading(false)
    }
  }, [place])

  useEffect(() => { loadWeather(DEFAULT_PLACE) }, []) // initial load

  async function handleSearch(event) {
    event.preventDefault()
    const term = query.trim()
    if (!term || searching) return
    setSearching(true)
    setError('')
    try {
      const params = new URLSearchParams({ name: term, count: '1', language: 'pt', format: 'json' })
      const result = await getJson(`${GEOCODING_URL}?${params}`)
      if (!result.results?.length) throw new Error('Cidade não encontrada. Confira o nome e tente novamente.')
      const item = result.results[0]
      const nextPlace = {
        name: item.name,
        admin1: item.admin1 || '',
        country: item.country || '',
        latitude: item.latitude,
        longitude: item.longitude
      }
      setPlace(nextPlace)
      setQuery('')
      await loadWeather(nextPlace)
    } catch (err) {
      setError(err.message || 'Não foi possível pesquisar essa cidade.')
    } finally {
      setSearching(false)
    }
  }

  const current = data?.current
  const daily = data?.daily
  const conditions = weatherInfo(current?.weather_code)
  const CurrentIcon = conditions.Icon

  const hourly = useMemo(() => {
    if (!data?.hourly?.time?.length) return []
    const h = data.hourly
    const currentIndex = Math.max(0, h.time.findIndex(t => t >= (current?.time || '')))
    return Array.from({ length: 8 }, (_, i) => {
      const index = Math.min(currentIndex + i * 3, h.time.length - 1)
      return {
        time: h.time[index],
        temp: h.temperature_2m[index],
        rain: h.precipitation_probability?.[index] ?? 0,
        code: h.weather_code[index]
      }
    })
  }, [data, current?.time])

  return (
    <main className={`app theme-${conditions.theme}`}>
      <div className="glow glow-a" /><div className="glow glow-b" />
      {(conditions.theme === 'rainy' || conditions.theme === 'storm') && (
        <div className="rain" aria-hidden="true">
          {Array.from({ length: 30 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${-(i % 8) * .55}s` }} />)}
        </div>
      )}

      <div className="container">
        <header className="header">
          <a className="logo" href="#" aria-label="ApiMeteo início"><span className="logo-icon"><CloudSun size={22} /></span>Api<span>Meteo</span></a>
          <div className="live"><i /> PREVISÃO DO TEMPO</div>
          <button className="icon-button" onClick={() => loadWeather()} aria-label="Atualizar previsão" title="Atualizar"><RefreshCw size={17} /></button>
        </header>

        <section className="hero">
          <div className="hero-text">
            <p className="eyebrow">CLIMA EM TEMPO REAL</p>
            <h1>Entenda o tempo.<br /><span>Planeje melhor.</span></h1>
            <p className="intro">Informações meteorológicas da sua cidade, com uma experiência simples e intuitiva.</p>
            <form className="search" onSubmit={handleSearch}>
              <Search size={19} />
              <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Digite uma cidade..." aria-label="Digite uma cidade" />
              <button disabled={searching || !query.trim()}>{searching ? 'Buscando...' : 'Buscar'}</button>
            </form>
            {error && <div className="error"><AlertCircle size={16} />{error}</div>}
          </div>

          <div className="earth-area" aria-label="Ilustração decorativa do planeta Terra">
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="earth"><div className="earth-map map-one" /><div className="earth-map map-two" /><div className="earth-shine" /></div>
            <div className="earth-label"><i /> MONITORAMENTO METEOROLÓGICO</div>
          </div>
        </section>

        <section className="place-line">
          <div><h2><MapPin size={18} />{place.name}</h2><p>{[place.admin1, place.country].filter(Boolean).join(', ')}</p></div>
          <span>{current?.time ? `Atualizado às ${clock(current.time)}` : loading ? 'Carregando dados...' : 'Dados indisponíveis'}</span>
        </section>

        <section className="summary-grid">
          <article className="panel current-panel">
            <div className="panel-head"><span>CONDIÇÕES ATUAIS</span><b>{conditions.label}</b></div>
            {loading && !current ? <div className="placeholder">Carregando condições meteorológicas...</div> : (
              <>
                <div className="current-main">
                  <div><strong className="temperature">{current ? Math.round(current.temperature_2m) : '--'}<sup>°</sup></strong><p>Sensação térmica de {current ? Math.round(current.apparent_temperature) : '--'}°</p></div>
                  <CurrentIcon className="weather-icon" />
                </div>
                <div className="metrics">
                  <div><Thermometer /><span><b>{current ? Math.round(current.apparent_temperature) : '--'}°</b><small>Sensação</small></span></div>
                  <div><Droplets /><span><b>{current?.relative_humidity_2m ?? '--'}%</b><small>Umidade</small></span></div>
                  <div><Wind /><span><b>{current?.wind_speed_10m ?? '--'} km/h</b><small>Vento</small></span></div>
                </div>
              </>
            )}
          </article>

          <article className="panel sun-panel">
            <div className="panel-head"><span>DETALHES DO DIA</span><b>HOJE</b></div>
            <div className="sun-row"><span className="sun-symbol"><Sunrise /></span><div><small>Nascer do sol</small><strong>{clock(daily?.sunrise?.[0])}</strong></div><i /></div>
            <div className="sun-row"><span className="sun-symbol"><Sunset /></span><div><small>Pôr do sol</small><strong>{clock(daily?.sunset?.[0])}</strong></div><i /></div>
            <div className="rain-prob"><CloudRain /><span>Chance máxima de chuva</span><strong>{daily?.precipitation_probability_max?.[0] ?? '--'}%</strong></div>
          </article>
        </section>

        <section className="section">
          <div className="section-title"><div><p className="eyebrow">ACOMPANHE</p><h2>Próximas horas</h2></div><span>Previsão horária</span></div>
          <div className="panel hourly">
            {hourly.length ? hourly.map((item, index) => {
              const Icon = weatherInfo(item.code).Icon
              return <div className="hour" key={`${item.time}-${index}`}><small>{index === 0 ? 'Agora' : clock(item.time)}</small><Icon /><b>{Math.round(item.temp)}°</b><span><Droplets size={12} />{item.rain}%</span></div>
            }) : <p className="placeholder">{loading ? 'Carregando previsão horária...' : 'Previsão horária indisponível.'}</p>}
          </div>
        </section>

        <section className="section">
          <div className="section-title"><div><p className="eyebrow">OLHE ADIANTE</p><h2>Previsão para 5 dias</h2></div><span>Máxima e mínima</span></div>
          <div className="panel forecast">
            {daily?.time?.length ? daily.time.map((date, index) => {
              const Icon = weatherInfo(daily.weather_code[index]).Icon
              return <div className="forecast-row" key={date}>
                <b>{dayLabel(date, index)}</b><Icon /><span>{weatherInfo(daily.weather_code[index]).label}</span>
                <div className="range"><b>{Math.round(daily.temperature_2m_max[index])}°</b><i /><small>{Math.round(daily.temperature_2m_min[index])}°</small></div>
                <div className="probability"><Droplets size={14} />{daily.precipitation_probability_max?.[index] ?? 0}%</div>
              </div>
            }) : <p className="placeholder">{loading ? 'Carregando previsão...' : 'Previsão diária indisponível.'}</p>}
          </div>
        </section>

        <footer><a className="logo footer-logo" href="#"><span className="logo-icon"><CloudSun size={18} /></span>Api<span>Meteo</span></a><p>Dados meteorológicos fornecidos por Open-Meteo.</p></footer>
      </div>
    </main>
  )
}
