// Country detection utility based on phone number country codes
export const COUNTRY_CODES: Record<string, string> = {
  '+1': 'US', // United States
  '+7': 'RU', // Russia
  '+20': 'EG', // Egypt
  '+27': 'ZA', // South Africa
  '+30': 'GR', // Greece
  '+31': 'NL', // Netherlands
  '+32': 'BE', // Belgium
  '+33': 'FR', // France
  '+34': 'ES', // Spain
  '+36': 'HU', // Hungary
  '+39': 'IT', // Italy
  '+40': 'RO', // Romania
  '+41': 'CH', // Switzerland
  '+43': 'AT', // Austria
  '+44': 'GB', // United Kingdom
  '+45': 'DK', // Denmark
  '+46': 'SE', // Sweden
  '+47': 'NO', // Norway
  '+48': 'PL', // Poland
  '+49': 'DE', // Germany
  '+51': 'PE', // Peru
  '+52': 'MX', // Mexico
  '+54': 'AR', // Argentina
  '+55': 'BR', // Brazil
  '+56': 'CL', // Chile
  '+57': 'CO', // Colombia
  '+60': 'MY', // Malaysia
  '+61': 'AU', // Australia
  '+62': 'ID', // Indonesia
  '+63': 'PH', // Philippines
  '+64': 'NZ', // New Zealand
  '+65': 'SG', // Singapore
  '+66': 'TH', // Thailand
  '+81': 'JP', // Japan
  '+82': 'KR', // South Korea
  '+84': 'VN', // Vietnam
  '+86': 'CN', // China
  '+90': 'TR', // Turkey
  '+91': 'IN', // India
  '+92': 'PK', // Pakistan
  '+93': 'AF', // Afghanistan
  '+94': 'LK', // Sri Lanka
  '+95': 'MM', // Myanmar
  '+98': 'IR', // Iran
  '+212': 'MA', // Morocco
  '+213': 'DZ', // Algeria
  '+216': 'TN', // Tunisia
  '+218': 'LY', // Libya
  '+220': 'GM', // Gambia
  '+221': 'SN', // Senegal
  '+222': 'MR', // Mauritania
  '+223': 'ML', // Mali
  '+224': 'GN', // Guinea
  '+225': 'CI', // Côte d'Ivoire
  '+226': 'BF', // Burkina Faso
  '+227': 'NE', // Niger
  '+228': 'TG', // Togo
  '+229': 'BJ', // Benin
  '+230': 'MU', // Mauritius
  '+231': 'LR', // Liberia
  '+232': 'SL', // Sierra Leone
  '+233': 'GH', // Ghana
  '+234': 'NG', // Nigeria
  '+235': 'TD', // Chad
  '+236': 'CF', // Central African Republic
  '+237': 'CM', // Cameroon
  '+238': 'CV', // Cape Verde
  '+239': 'ST', // São Tomé and Príncipe
  '+240': 'GQ', // Equatorial Guinea
  '+241': 'GA', // Gabon
  '+242': 'CG', // Republic of the Congo
  '+243': 'CD', // Democratic Republic of the Congo
  '+244': 'AO', // Angola
  '+245': 'GW', // Guinea-Bissau
  '+246': 'IO', // British Indian Ocean Territory
  '+248': 'SC', // Seychelles
  '+249': 'SD', // Sudan
  '+250': 'RW', // Rwanda
  '+251': 'ET', // Ethiopia
  '+252': 'SO', // Somalia
  '+253': 'DJ', // Djibouti
  '+254': 'KE', // Kenya
  '+255': 'TZ', // Tanzania
  '+256': 'UG', // Uganda
  '+257': 'BI', // Burundi
  '+258': 'MZ', // Mozambique
  '+260': 'ZM', // Zambia
  '+261': 'MG', // Madagascar
  '+262': 'RE', // Réunion
  '+263': 'ZW', // Zimbabwe
  '+264': 'NA', // Namibia
  '+265': 'MW', // Malawi
  '+266': 'LS', // Lesotho
  '+267': 'BW', // Botswana
  '+268': 'SZ', // Eswatini
  '+269': 'KM', // Comoros
  '+290': 'SH', // Saint Helena
  '+291': 'ER', // Eritrea
  '+297': 'AW', // Aruba
  '+298': 'FO', // Faroe Islands
  '+299': 'GL', // Greenland
  '+350': 'GI', // Gibraltar
  '+351': 'PT', // Portugal
  '+352': 'LU', // Luxembourg
  '+353': 'IE', // Ireland
  '+354': 'IS', // Iceland
  '+355': 'AL', // Albania
  '+356': 'MT', // Malta
  '+357': 'CY', // Cyprus
  '+358': 'FI', // Finland
  '+359': 'BG', // Bulgaria
  '+370': 'LT', // Lithuania
  '+371': 'LV', // Latvia
  '+372': 'EE', // Estonia
  '+373': 'MD', // Moldova
  '+374': 'AM', // Armenia
  '+375': 'BY', // Belarus
  '+376': 'AD', // Andorra
  '+377': 'MC', // Monaco
  '+378': 'SM', // San Marino
  '+380': 'UA', // Ukraine
  '+381': 'RS', // Serbia
  '+382': 'ME', // Montenegro
  '+383': 'XK', // Kosovo
  '+385': 'HR', // Croatia
  '+386': 'SI', // Slovenia
  '+387': 'BA', // Bosnia and Herzegovina
  '+389': 'MK', // North Macedonia
  '+420': 'CZ', // Czech Republic
  '+421': 'SK', // Slovakia
  '+423': 'LI', // Liechtenstein
  '+500': 'FK', // Falkland Islands
  '+501': 'BZ', // Belize
  '+502': 'GT', // Guatemala
  '+503': 'SV', // El Salvador
  '+504': 'HN', // Honduras
  '+505': 'NI', // Nicaragua
  '+506': 'CR', // Costa Rica
  '+507': 'PA', // Panama
  '+508': 'PM', // Saint Pierre and Miquelon
  '+509': 'HT', // Haiti
  '+590': 'GP', // Guadeloupe
  '+591': 'BO', // Bolivia
  '+592': 'GY', // Guyana
  '+593': 'EC', // Ecuador
  '+594': 'GF', // French Guiana
  '+595': 'PY', // Paraguay
  '+596': 'MQ', // Martinique
  '+597': 'SR', // Suriname
  '+598': 'UY', // Uruguay
  '+599': 'CW', // Curaçao
  '+670': 'TL', // East Timor
  '+672': 'NF', // Norfolk Island
  '+673': 'BN', // Brunei
  '+674': 'NR', // Nauru
  '+675': 'PG', // Papua New Guinea
  '+676': 'TO', // Tonga
  '+677': 'SB', // Solomon Islands
  '+678': 'VU', // Vanuatu
  '+679': 'FJ', // Fiji
  '+680': 'PW', // Palau
  '+681': 'WF', // Wallis and Futuna
  '+682': 'CK', // Cook Islands
  '+683': 'NU', // Niue
  '+684': 'AS', // American Samoa
  '+685': 'WS', // Samoa
  '+686': 'KI', // Kiribati
  '+687': 'NC', // New Caledonia
  '+688': 'TV', // Tuvalu
  '+689': 'PF', // French Polynesia
  '+690': 'TK', // Tokelau
  '+691': 'FM', // Micronesia
  '+692': 'MH', // Marshall Islands
  '+850': 'KP', // North Korea
  '+852': 'HK', // Hong Kong
  '+853': 'MO', // Macau
  '+855': 'KH', // Cambodia
  '+856': 'LA', // Laos
  '+880': 'BD', // Bangladesh
  '+886': 'TW', // Taiwan
  '+960': 'MV', // Maldives
  '+961': 'LB', // Lebanon
  '+962': 'JO', // Jordan
  '+963': 'SY', // Syria
  '+964': 'IQ', // Iraq
  '+965': 'KW', // Kuwait
  '+966': 'SA', // Saudi Arabia
  '+967': 'YE', // Yemen
  '+968': 'OM', // Oman
  '+970': 'PS', // Palestine
  '+971': 'AE', // United Arab Emirates
  '+972': 'IL', // Israel
  '+973': 'BH', // Bahrain
  '+974': 'QA', // Qatar
  '+975': 'BT', // Bhutan
  '+976': 'MN', // Mongolia
  '+977': 'NP', // Nepal
  '+992': 'TJ', // Tajikistan
  '+993': 'TM', // Turkmenistan
  '+994': 'AZ', // Azerbaijan
  '+995': 'GE', // Georgia
  '+996': 'KG', // Kyrgyzstan
  '+998': 'UZ', // Uzbekistan
}

export const COUNTRY_NAMES: Record<string, string> = {
  'US': 'United States',
  'RU': 'Russia',
  'EG': 'Egypt',
  'ZA': 'South Africa',
  'GR': 'Greece',
  'NL': 'Netherlands',
  'BE': 'Belgium',
  'FR': 'France',
  'ES': 'Spain',
  'HU': 'Hungary',
  'IT': 'Italy',
  'RO': 'Romania',
  'CH': 'Switzerland',
  'AT': 'Austria',
  'GB': 'United Kingdom',
  'DK': 'Denmark',
  'SE': 'Sweden',
  'NO': 'Norway',
  'PL': 'Poland',
  'DE': 'Germany',
  'PE': 'Peru',
  'MX': 'Mexico',
  'AR': 'Argentina',
  'BR': 'Brazil',
  'CL': 'Chile',
  'CO': 'Colombia',
  'MY': 'Malaysia',
  'AU': 'Australia',
  'ID': 'Indonesia',
  'PH': 'Philippines',
  'NZ': 'New Zealand',
  'SG': 'Singapore',
  'TH': 'Thailand',
  'JP': 'Japan',
  'KR': 'South Korea',
  'VN': 'Vietnam',
  'CN': 'China',
  'TR': 'Turkey',
  'IN': 'India',
  'PK': 'Pakistan',
  'AF': 'Afghanistan',
  'LK': 'Sri Lanka',
  'MM': 'Myanmar',
  'IR': 'Iran',
  'MA': 'Morocco',
  'DZ': 'Algeria',
  'TN': 'Tunisia',
  'LY': 'Libya',
  'GM': 'Gambia',
  'SN': 'Senegal',
  'MR': 'Mauritania',
  'ML': 'Mali',
  'GN': 'Guinea',
  'CI': 'Côte d\'Ivoire',
  'BF': 'Burkina Faso',
  'NE': 'Niger',
  'TG': 'Togo',
  'BJ': 'Benin',
  'MU': 'Mauritius',
  'LR': 'Liberia',
  'SL': 'Sierra Leone',
  'GH': 'Ghana',
  'NG': 'Nigeria',
  'TD': 'Chad',
  'CF': 'Central African Republic',
  'CM': 'Cameroon',
  'CV': 'Cape Verde',
  'ST': 'São Tomé and Príncipe',
  'GQ': 'Equatorial Guinea',
  'GA': 'Gabon',
  'CG': 'Republic of the Congo',
  'CD': 'Democratic Republic of the Congo',
  'AO': 'Angola',
  'GW': 'Guinea-Bissau',
  'IO': 'British Indian Ocean Territory',
  'SC': 'Seychelles',
  'SD': 'Sudan',
  'RW': 'Rwanda',
  'ET': 'Ethiopia',
  'SO': 'Somalia',
  'DJ': 'Djibouti',
  'KE': 'Kenya',
  'TZ': 'Tanzania',
  'UG': 'Uganda',
  'BI': 'Burundi',
  'MZ': 'Mozambique',
  'ZM': 'Zambia',
  'MG': 'Madagascar',
  'RE': 'Réunion',
  'ZW': 'Zimbabwe',
  'NA': 'Namibia',
  'MW': 'Malawi',
  'LS': 'Lesotho',
  'BW': 'Botswana',
  'SZ': 'Eswatini',
  'KM': 'Comoros',
  'SH': 'Saint Helena',
  'ER': 'Eritrea',
  'AW': 'Aruba',
  'FO': 'Faroe Islands',
  'GL': 'Greenland',
  'GI': 'Gibraltar',
  'PT': 'Portugal',
  'LU': 'Luxembourg',
  'IE': 'Ireland',
  'IS': 'Iceland',
  'AL': 'Albania',
  'MT': 'Malta',
  'CY': 'Cyprus',
  'FI': 'Finland',
  'BG': 'Bulgaria',
  'LT': 'Lithuania',
  'LV': 'Latvia',
  'EE': 'Estonia',
  'MD': 'Moldova',
  'AM': 'Armenia',
  'BY': 'Belarus',
  'AD': 'Andorra',
  'MC': 'Monaco',
  'SM': 'San Marino',
  'UA': 'Ukraine',
  'RS': 'Serbia',
  'ME': 'Montenegro',
  'XK': 'Kosovo',
  'HR': 'Croatia',
  'SI': 'Slovenia',
  'BA': 'Bosnia and Herzegovina',
  'MK': 'North Macedonia',
  'CZ': 'Czech Republic',
  'SK': 'Slovakia',
  'LI': 'Liechtenstein',
  'FK': 'Falkland Islands',
  'BZ': 'Belize',
  'GT': 'Guatemala',
  'SV': 'El Salvador',
  'HN': 'Honduras',
  'NI': 'Nicaragua',
  'CR': 'Costa Rica',
  'PA': 'Panama',
  'PM': 'Saint Pierre and Miquelon',
  'HT': 'Haiti',
  'GP': 'Guadeloupe',
  'BO': 'Bolivia',
  'GY': 'Guyana',
  'EC': 'Ecuador',
  'GF': 'French Guiana',
  'PY': 'Paraguay',
  'MQ': 'Martinique',
  'SR': 'Suriname',
  'UY': 'Uruguay',
  'CW': 'Curaçao',
  'TL': 'East Timor',
  'NF': 'Norfolk Island',
  'BN': 'Brunei',
  'NR': 'Nauru',
  'PG': 'Papua New Guinea',
  'TO': 'Tonga',
  'SB': 'Solomon Islands',
  'VU': 'Vanuatu',
  'FJ': 'Fiji',
  'PW': 'Palau',
  'WF': 'Wallis and Futuna',
  'CK': 'Cook Islands',
  'NU': 'Niue',
  'AS': 'American Samoa',
  'WS': 'Samoa',
  'KI': 'Kiribati',
  'NC': 'New Caledonia',
  'TV': 'Tuvalu',
  'PF': 'French Polynesia',
  'TK': 'Tokelau',
  'FM': 'Micronesia',
  'MH': 'Marshall Islands',
  'KP': 'North Korea',
  'HK': 'Hong Kong',
  'MO': 'Macau',
  'KH': 'Cambodia',
  'LA': 'Laos',
  'BD': 'Bangladesh',
  'TW': 'Taiwan',
  'MV': 'Maldives',
  'LB': 'Lebanon',
  'JO': 'Jordan',
  'SY': 'Syria',
  'IQ': 'Iraq',
  'KW': 'Kuwait',
  'SA': 'Saudi Arabia',
  'YE': 'Yemen',
  'OM': 'Oman',
  'PS': 'Palestine',
  'AE': 'United Arab Emirates',
  'IL': 'Israel',
  'BH': 'Bahrain',
  'QA': 'Qatar',
  'BT': 'Bhutan',
  'MN': 'Mongolia',
  'NP': 'Nepal',
  'TJ': 'Tajikistan',
  'TM': 'Turkmenistan',
  'AZ': 'Azerbaijan',
  'GE': 'Georgia',
  'KG': 'Kyrgyzstan',
  'UZ': 'Uzbekistan',
}

export function getCountryFromPhoneNumber(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return 'N/A'
  
  // Clean the phone number
  const cleanPhone = phoneNumber.replace(/\s+/g, '').trim()
  
  // Find the longest matching country code
  let bestMatch = ''
  let bestCode = ''
  
  for (const [code, country] of Object.entries(COUNTRY_CODES)) {
    if (cleanPhone.startsWith(code) && code.length > bestCode.length) {
      bestMatch = country
      bestCode = code
    }
  }
  
  if (bestMatch) {
    return COUNTRY_NAMES[bestMatch] || bestMatch
  }
  
  return 'N/A'
}

export function getCountryCodeFromPhoneNumber(phoneNumber: string | null | undefined): string {
  if (!phoneNumber) return 'N/A'
  
  const cleanPhone = phoneNumber.replace(/\s+/g, '').trim()
  
  for (const [code, country] of Object.entries(COUNTRY_CODES)) {
    if (cleanPhone.startsWith(code)) {
      return country
    }
  }
  
  return 'N/A'
}
