import React, { useEffect, useId, useMemo, useState } from 'react';

type WeatherState = {
  temperatureC: number;
  code: number;
  city: string;
  country: string;
};

const DEFAULT_WEATHER: WeatherState = {
  temperatureC: 23,
  code: 3,
  city: 'London',
  country: 'UK',
};

function compactLocationLabel(city: string, country: string) {
  const normalizedCountry = country === 'GB' ? 'UK' : country;
  const compactCity = city
    .replace(/^City of /i, '')
    .replace(/^London Borough of /i, '')
    .replace(/^Royal Borough of /i, '')
    .replace(/\s+City$/i, '')
    .replace(/\s+Metropolitan Borough$/i, '')
    .split(',')[0]
    .trim();
  const displayCity = /^Greater London$/i.test(compactCity)
    ? 'London'
    : compactCity === 'New York City' ? 'New York' : compactCity || DEFAULT_WEATHER.city;
  return {
    city: displayCity,
    country: normalizedCountry || DEFAULT_WEATHER.country,
  };
}

function GoogleCalendarBadge({ dayNumber }: { dayNumber: string }) {
  const uid = useId().replace(/:/g, '');
  const blueTop = `blueTop-${uid}`;
  const blueBottom = `blueBottom-${uid}`;
  const lowerGloss = `lowerGloss-${uid}`;
  const diagonalShadow = `diagonalShadow-${uid}`;
  const softIconShadow = `softIconShadow-${uid}`;
  const dotShadow = `dotShadow-${uid}`;
  const dotShadowRight = `dotShadowRight-${uid}`;
  const headerClip = `headerClip-${uid}`;
  const blueTopClip = `blueTopClip-${uid}`;
  const blueBottomClip = `blueBottomClip-${uid}`;

  return (
    <svg
      viewBox="0 0 1254 1254"
      aria-hidden="true"
      className="h-[42px] w-[42px] shrink-0 overflow-visible drop-shadow-[0_4px_8px_rgba(0,0,0,0.2)]"
    >
      <defs>
        <linearGradient id={blueTop} x1="168" y1="257" x2="1095" y2="676" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2B73ED" />
          <stop offset="0.48" stopColor="#2461D8" />
          <stop offset="1" stopColor="#1554C7" />
        </linearGradient>
        <linearGradient id={blueBottom} x1="190" y1="676" x2="1018" y2="1110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3D9BFF" />
          <stop offset="0.55" stopColor="#318BFB" />
          <stop offset="1" stopColor="#2580F4" />
        </linearGradient>
        <linearGradient id={lowerGloss} x1="625" y1="676" x2="625" y2="1110" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.06" />
          <stop offset="0.35" stopColor="#FFFFFF" stopOpacity="0.015" />
          <stop offset="1" stopColor="#000000" stopOpacity="0.03" />
        </linearGradient>
        <linearGradient id={diagonalShadow} x1="232" y1="681" x2="622" y2="1070" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0B55C9" stopOpacity="0.18" />
          <stop offset="1" stopColor="#0B55C9" stopOpacity="0" />
        </linearGradient>
        <filter id={softIconShadow} x="70" y="72" width="1114" height="1086" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="6" stdDeviation="10" floodColor="#000000" floodOpacity="0.45" />
        </filter>
        <filter id={dotShadow} x="350" y="140" width="140" height="140" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#8D8D8D" floodOpacity="0.35" />
        </filter>
        <filter id={dotShadowRight} x="767" y="140" width="140" height="140" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#8D8D8D" floodOpacity="0.35" />
        </filter>
        <clipPath id={headerClip}>
          <path d="M251 116H1003C1041.1 116 1072 146.9 1072 185V292H181V185C181 146.9 212.9 116 251 116Z" />
        </clipPath>
        <clipPath id={blueTopClip}>
          <path d="M181 257H1072C1098 257 1117 279 1117 310L1072 676H181L136 310C136 279 155 257 181 257Z" />
        </clipPath>
        <clipPath id={blueBottomClip}>
          <path d="M181 676H1072L1097 1044C1100 1081 1073 1107 1036 1107H218C181 1107 154 1081 157 1044L181 676Z" />
        </clipPath>
      </defs>

      <g filter={`url(#${softIconShadow})`}>
        <g clipPath={`url(#${headerClip})`}>
          <path
            d="M251 116H1003C1041.1 116 1072 146.9 1072 185V323H181V185C181 146.9 212.9 116 251 116Z"
            fill="#D9D9D9"
          />
        </g>

        <circle cx="416" cy="185" r="35" fill="#FFFFFF" filter={`url(#${dotShadow})`} />
        <circle cx="833" cy="185" r="35" fill="#FFFFFF" filter={`url(#${dotShadowRight})`} />

        <g clipPath={`url(#${blueTopClip})`}>
          <path
            d="M181 257H1072C1098 257 1117 279 1117 310L1072 676H181L136 310C136 279 155 257 181 257Z"
            fill={`url(#${blueTop})`}
          />
          <rect x="136" y="257" width="981" height="419" fill="#1C5DCF" opacity="0.08" />
        </g>

        <g clipPath={`url(#${blueBottomClip})`}>
          <path
            d="M181 676H1072L1097 1044C1100 1081 1073 1107 1036 1107H218C181 1107 154 1081 157 1044L181 676Z"
            fill={`url(#${blueBottom})`}
          />
          <path d="M181 676L578 1073H157V676H181Z" fill={`url(#${diagonalShadow})`} />
          <path
            d="M181 676H1072L1097 1044C1100 1081 1073 1107 1036 1107H218C181 1107 154 1081 157 1044L181 676Z"
            fill={`url(#${lowerGloss})`}
          />
        </g>

        <rect x="181" y="676" width="891" height="2" fill="#155BCB" opacity="0.30" />
        <rect x="181" y="678" width="891" height="7" fill="#FFFFFF" opacity="0.03" />

        <text
          x="627"
          y="820"
          textAnchor="middle"
          fontSize="450"
          fontWeight="300"
          letterSpacing="0"
          fill="#FFFFFF"
          fillOpacity="0.94"
          fontFamily="Google Sans, Inter, Arial, sans-serif"
        >
          {dayNumber}
        </text>
      </g>
    </svg>
  );
}

function WeatherGlyph({ code }: { code: number }) {
  const storm = code >= 95;
  const snow = [71, 73, 75, 77, 85, 86].includes(code);
  const rain = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code);
  const cloudy = [1, 2, 3, 45, 48].includes(code);

  return (
    <div className="relative h-[38px] w-[38px] shrink-0">
      <div className={storm || rain || cloudy ? 'absolute left-[2px] top-[1px] h-[23px] w-[23px] rounded-full bg-[#FFC83D]' : 'absolute left-[3px] top-[2px] h-[24px] w-[24px] rounded-full bg-[#FFC83D]'} />
      {(cloudy || rain || snow || storm) && (
        <>
          <div className="absolute left-[11px] top-[14px] h-[11px] w-[14px] rounded-full bg-[#F1F2F4]" />
          <div className="absolute left-[5px] top-[18px] h-[10px] w-[20px] rounded-full bg-[linear-gradient(180deg,#F2F3F5_0%,#E3E5E8_100%)]" />
          <div className="absolute left-[9px] top-[13px] h-[10px] w-[10px] rounded-full bg-[#F7F8FA]" />
        </>
      )}
      {rain && (
        <div className="absolute left-[10px] top-[28px] flex gap-[2px]">
          <span className="h-[5px] w-[2px] rounded-full bg-[#5B9CFF]" />
          <span className="h-[6px] w-[2px] rounded-full bg-[#5B9CFF]" />
          <span className="h-[5px] w-[2px] rounded-full bg-[#5B9CFF]" />
        </div>
      )}
      {snow && (
        <div className="absolute left-[10px] top-[28px] flex gap-[2px] text-[5px] font-bold text-[#8EB8FF]">
          <span>*</span>
          <span>*</span>
          <span>*</span>
        </div>
      )}
      {storm && (
        <div className="absolute left-[12px] top-[23px] h-[8px] w-[6px] [clip-path:polygon(43%_0%,100%_0%,63%_46%,100%_46%,20%_100%,44%_58%,0%_58%)] bg-[#FABB05]" />
      )}
      {!cloudy && !rain && !snow && !storm && (
        <div className="absolute inset-[4px] rounded-full bg-[radial-gradient(circle_at_35%_30%,#FFD561_0%,#FFC83D_50%,#F4B400_100%)]" />
      )}
    </div>
  );
}

export default function HeaderUtilityChips({ compact = false }: { compact?: boolean }) {
  const [today, setToday] = useState(() => new Date());
  const [weather, setWeather] = useState<WeatherState>(DEFAULT_WEATHER);

  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadWeather = async (latitude: number, longitude: number) => {
      const [forecastRes, reverseRes] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius&forecast_days=1`,
        ),
        fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=jsonv2&zoom=10&addressdetails=1`,
          { headers: { Accept: 'application/json' } },
        ),
      ]);

      if (!forecastRes.ok) throw new Error(`Weather request failed (${forecastRes.status})`);
      const forecast = await forecastRes.json();
      const reverse = reverseRes.ok ? await reverseRes.json() : null;
      const address = reverse?.address ?? {};
      const rawCity =
        address.city ||
        address.town ||
        address.village ||
        address.county ||
        address.state_district ||
        DEFAULT_WEATHER.city;
      const rawCountry = address.country_code ? String(address.country_code).toUpperCase() : DEFAULT_WEATHER.country;
      const { city, country } = compactLocationLabel(rawCity, rawCountry);

      if (cancelled) return;
      setWeather({
        temperatureC: Math.round(forecast?.current?.temperature_2m ?? DEFAULT_WEATHER.temperatureC),
        code: Number(forecast?.current?.weather_code ?? DEFAULT_WEATHER.code),
        city,
        country,
      });
    };

    const fallback = () => loadWeather(51.5072, -0.1276).catch(() => {
      if (!cancelled) setWeather(DEFAULT_WEATHER);
    });

    if (!navigator.geolocation) {
      fallback();
      return () => {
        cancelled = true;
      };
    }

    navigator.geolocation.getCurrentPosition(
      position => {
        loadWeather(position.coords.latitude, position.coords.longitude).catch(fallback);
      },
      () => fallback(),
      { enableHighAccuracy: false, timeout: 5000, maximumAge: 10 * 60 * 1000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  const dateBits = useMemo(() => {
    const weekday = new Intl.DateTimeFormat('en-GB', { weekday: 'long' }).format(today);
    const month = new Intl.DateTimeFormat('en-GB', { month: 'long' }).format(today);
    const day = new Intl.DateTimeFormat('en-GB', { day: 'numeric' }).format(today);
    return { weekday, month, day };
  }, [today]);

  return (
    <div className={compact ? 'flex items-center gap-[10px] shrink-0 max-w-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]' : 'flex items-center gap-[14px] shrink-0 max-w-full transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]'}>
      <div className={compact ? 'flex items-center gap-0 min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]' : 'flex items-center gap-[9px] min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]'}>
        <GoogleCalendarBadge dayNumber={dateBits.day} />
        {!compact && <div className="min-w-0">
          <div className="text-[12px] font-semibold leading-[1.02] text-[#111111] dark:text-[#F3F6FB]">{dateBits.weekday}</div>
          <div className="mt-[2px] text-[15px] font-semibold leading-none text-[#000000] dark:text-white">
            {dateBits.month} {dateBits.day}
          </div>
        </div>}
      </div>
      <div className={compact ? 'h-[28px] w-px bg-[#D9DEE5] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] dark:bg-white/14' : 'h-[34px] w-px bg-[#D9DEE5] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] dark:bg-white/14'} />
      <div className={compact ? 'flex items-center gap-[6px] min-w-0 transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]' : 'flex items-center gap-[9px] min-w-0 max-w-[170px] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)]'}>
        <WeatherGlyph code={weather.code} />
        {compact ? (
          <div className="text-[15px] font-semibold leading-none text-[#000000] dark:text-white">
            {weather.temperatureC}&deg;C
          </div>
        ) : (
          <div className="min-w-0">
            <div className="truncate text-[12px] font-semibold leading-[1.08] text-[#111111] dark:text-[#F3F6FB]">
              {weather.city}, {weather.country}
            </div>
            <div className="mt-[2px] text-[15px] font-semibold leading-none text-[#000000] dark:text-white">
              {weather.temperatureC}&deg;C
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
