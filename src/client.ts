import { BASE_URL, DEFAULT_HEADERS } from './constants';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'none';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  none: 4
};

function writeLog(level: LogLevel, configuredLevel: LogLevel, message: string, ...args: any[]): void {
  if (LOG_LEVELS[level] < LOG_LEVELS[configuredLevel]) {
    return;
  }

  const prefix = `[NCT-API] [${level.toUpperCase()}]`;
  const formattedMessage = `${prefix} ${message}`;

  switch (level) {
    case 'debug':
      console.debug(formattedMessage, ...args);
      break;
    case 'info':
      console.log(formattedMessage, ...args);
      break;
    case 'warn':
      console.warn(formattedMessage, ...args);
      break;
    case 'error':
      console.error(formattedMessage, ...args);
      break;
  }
}

/**
 * Clean serialization of query parameters
 */
export function serializeParams(params: Record<string, any>): string {
  const parts: string[] = [];
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

export async function request(
  path: string,
  params: Record<string, any> = {},
  customHeaders: Record<string, string> = {},
  method: string = 'GET',
  body: any = null,
  logLevel: LogLevel = 'none'
): Promise<any> {
  const queryStr = serializeParams(params);
  const url = `${BASE_URL}${path}${queryStr}`;

  const headers: Record<string, string> = {
    ...DEFAULT_HEADERS,
    ...customHeaders
  };

  const options: RequestInit = {
    method,
    headers
  };

  if (body !== null && body !== undefined) {
    options.body = body;
  }

  writeLog('info', logLevel, `Sending ${method} request to ${url}`);
  writeLog('debug', logLevel, 'Request options:', { headers, body: body ? String(body).substring(0, 500) : null });

  const startTime = Date.now();
  try {
    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    writeLog('info', logLevel, `Received response ${response.status} ${response.statusText} in ${duration}ms`);

    if (!response.ok) {
      writeLog('error', logLevel, `HTTP Error: ${response.status} ${response.statusText}`);
      throw new Error(`NhacCuaTui API HTTP Error: ${response.status} ${response.statusText}`);
    }

    const json = await response.json();
    writeLog('debug', logLevel, 'Response JSON:', json);

    if (json.success === false || json.code !== 0) {
      writeLog('warn', logLevel, `API returned error: code ${json.code} - ${json.msg || 'Unknown error'}`);
      throw new Error(`NhacCuaTui API Error: code ${json.code} - ${json.msg || 'Unknown error'}`);
    }

    return json.data;
  } catch (error: any) {
    writeLog('error', logLevel, `Request failed: ${error.message}`);
    throw error;
  }
}
