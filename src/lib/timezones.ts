
export interface Timezone {
    label: string;
    value: string;
    countryCode: string;
}

export const timezones: Timezone[] = [
  { label: 'Madrid', value: 'Europe/Madrid', countryCode: 'ES' },
  { label: 'Belgium', value: 'Europe/Brussels', countryCode: 'BE' },
  { label: 'Istanbul', value: 'Europe/Istanbul', countryCode: 'TR' },
  { label: 'London', value: 'Europe/London', countryCode: 'GB' },
  { label: 'Washington, DC', value: 'America/New_York', countryCode: 'US' },
  { label: 'Cupertino', value: 'America/Los_Angeles', countryCode: 'US' },
  { label: 'Bogota', value: 'America/Bogota', countryCode: 'CO' },
  { label: 'Beijing', value: 'Asia/Shanghai', countryCode: 'CN' },
  { label: 'Colombo', value: 'Asia/Colombo', countryCode: 'LK' },
  { label: 'Riyadh', value: 'Asia/Riyadh', countryCode: 'SA' },
  { label: 'Cape Verde', value: 'Atlantic/Cape_Verde', countryCode: 'CV' },
  { label: 'Mexico City', value: 'America/Mexico_City', countryCode: 'MX' },
  { label: 'Guatemala City', value: 'America/Guatemala', countryCode: 'GT' },
  { label: 'Caracas', value: 'America/Caracas', countryCode: 'VE' },
  { label: 'Brasilia', value: 'America/Sao_Paulo', countryCode: 'BR' },
  { label: 'Sao Paulo', value: 'America/Sao_Paulo', countryCode: 'BR' },
  { label: 'Santiago de Chile', value: 'America/Santiago', countryCode: 'CL' },
  { label: 'Canary Islands', value: 'Atlantic/Canary', countryCode: 'ES' },
  { label: 'Prague', value: 'Europe/Prague', countryCode: 'CZ' },
  { label: 'Moscow', value: 'Europe/Moscow', countryCode: 'RU' },
  { label: 'Ottawa', value: 'America/Toronto', countryCode: 'CA' },
  { label: 'Alaska', value: 'America/Anchorage', countryCode: 'US' },
  { label: 'Nuuk', value: 'America/Nuuk', countryCode: 'GL' },
  { label: 'New Delhi', value: 'Asia/Kolkata', countryCode: 'IN' },
  { label: 'Java', value: 'Asia/Jakarta', countryCode: 'ID' },
  { label: 'Sydney', value: 'Australia/Sydney', countryCode: 'AU' },
  { label: 'Western Australia', value: 'Australia/Perth', countryCode: 'AU' },
  { label: 'Auckland', value: 'Pacific/Auckland', countryCode: 'NZ' },
  { label: 'Caribbean', value: 'America/Port_of_Spain', countryCode: 'TT' },
  { label: 'French Polynesia', value: 'Pacific/Tahiti', countryCode: 'PF' },
  { label: 'Tokyo', value: 'Asia/Tokyo', countryCode: 'JP' },
  { label: 'Hong Kong', value: 'Asia/Hong_Kong', countryCode: 'HK' },
  { label: 'Singapore', value: 'Asia/Singapore', countryCode: 'SG' },
  { label: 'Mogadishu', value: 'Africa/Mogadishu', countryCode: 'SO' },
  { label: 'Madagascar', value: 'Indian/Antananarivo', countryCode: 'MG' },
];

