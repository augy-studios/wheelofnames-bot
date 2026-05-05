import { env } from 'node:process';

const { WHEEL_OF_NAMES_API_KEY } = env;
if (!WHEEL_OF_NAMES_API_KEY) throw Error('WHEEL_OF_NAMES_API_KEY not set!');

export interface WheelEntry {
  text: string;
  discordId?: string;
  color?: string;
}

export interface WheelConfig {
  entries: WheelEntry[];
  spinTime?: number;
  maxNames?: number;
  pageBackgroundColor?: string;
  winnerMessage?: string;
  colorSettings?: { color: string; enabled: boolean }[];
  shuffleEntries?: boolean;
  loop?: boolean;
}

export async function getSpinAnimation(wheelConfig: WheelConfig): Promise<{
  animation: Buffer;
  imageFormat: 'gif' | 'webp';
  winner: WheelEntry;
}> {
  // Change this to `gif` if you want GIFs instead. GIFs render faster, but have a larger file size.
  const imageFormat = 'webp' satisfies 'gif' | 'webp' as 'gif' | 'webp';
  // Change this to `json` if you want JSON responses instead. JSON responses are ~33% larger over
  // the network than FormData responses, since the animation needs to be base64-encoded rather than
  // being sent in raw binary.
  const responseFormat = 'formData' satisfies 'formData' | 'json' as 'formData' | 'json';
  if (responseFormat !== 'formData' && responseFormat !== 'json') {
    throw Error('Invalid response format specified');
  }
  // Strip local-only fields (discordId) that the API schema doesn't accept.
  const apiEntries = wheelConfig.entries.map(({ text, color }) =>
    color !== undefined ? { text, color } : { text }
  );

  const response = await fetch('https://wheelofnames.com/api/v2/wheels/animate', {
    method: 'POST',
    headers: {
      'x-api-key': WHEEL_OF_NAMES_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      wheelConfig: {
        // I recommend keeping `spinTime` low to guarantee that Discord doesn't reject it for being
        // too large. This also makes the animations render faster.
        spinTime: 3,
        // I recommend keeping `maxNames` low so that the texts are legible. There is also an
        // increasingly large risk the the animation fails to render the more entries are visible at
        // once. This setting can also impact render time.
        maxNames: 120,
        ...wheelConfig,
        entries: apiEntries
      },
      imageFormat,
      responseFormat,
      // Start the wheel at a random position. This doesn't affect the result.
      initialAngle: Math.random() * 2 * Math.PI
    })
  });

  const data =
    responseFormat === 'formData'
      ? await handleFormDataResponse(response)
      : responseFormat === 'json'
        ? await handleJsonResponse(response)
        : null;
  if (!data) throw Error('Invalid responseFormat specified');

  // Re-attach discordId from the original entries list by matching on text.
  const originalEntry = wheelConfig.entries.find((e) => e.text === data.winner.text);
  if (originalEntry?.discordId) data.winner.discordId = originalEntry.discordId;

  return {
    ...data,
    imageFormat
  };
}

async function handleFormDataResponse(response: Response): Promise<{
  animation: Buffer;
  winner: WheelEntry;
}> {
  if (!response.headers.get('Content-Type')?.startsWith('multipart/form-data')) {
    const contentType = response.headers.get('Content-Type') ?? '(none)';
    if (contentType.includes('application/json')) {
      const data = await response.json();
      if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
        throw Error(data.error);
      }
      throw Error(`The Wheel of Names API returned an unexpected JSON response (HTTP ${response.status}): ${JSON.stringify(data)}`);
    }
    const body = await response.text().catch(() => '(unreadable)');
    throw Error(`The Wheel of Names API returned an unexpected response (HTTP ${response.status}, Content-Type: ${contentType}): ${body.slice(0, 500)}`);
  }
  // This API is "deprecated", but the undici team have no intention of removing it. You can
  // probably ignore this warning, depending on how much memory your bot has and how much usage it
  // gets. Read more: https://github.com/nodejs/undici/issues/4388#issuecomment-3301932142
  const formData = await response.formData();
  const winner = JSON.parse(formData.get('winner')?.toString() ?? 'null') as WheelEntry;
  const file = formData.get('animation');
  if (!file || typeof file !== 'object') {
    throw Error('The Wheel of Names API returned an invalid response.');
  }
  const arrayBuffer = await file.arrayBuffer();
  return {
    animation: Buffer.from(arrayBuffer),
    winner
  };
}

async function handleJsonResponse(response: Response): Promise<{
  animation: Buffer;
  winner: WheelEntry;
}> {
  if (response.headers.get('Content-Type') !== 'application/json') {
    throw Error('The Wheel of Names API returned an invalid response.');
  }
  const data = (await response.json()) as
    | { error: string }
    | { animation: string; winner: WheelEntry };
  if ('error' in data) throw Error(data.error);
  return {
    animation: Buffer.from(data.animation, 'base64'),
    winner: data.winner
  };
}
