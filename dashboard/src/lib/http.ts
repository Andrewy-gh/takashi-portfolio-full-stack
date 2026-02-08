export async function readErrorMessage(res: Response) {
  const fallback = `${res.status} ${res.statusText}`.trim();
  const text = await res.text();
  if (!text) return fallback;

  try {
    const json = JSON.parse(text) as unknown;
    if (json && typeof json === 'object') {
      const record = json as Record<string, unknown>;
      if (typeof record.error === 'string' && record.error) return record.error;
      if (typeof record.message === 'string' && record.message)
        return record.message;
    }
  } catch {
    // not json
  }

  return text;
}

export async function assertOk(res: Response) {
  if (res.ok) return;
  throw new Error(await readErrorMessage(res));
}

