/**
 * JS Fetch API wrapper
 * Comes with default Content-Type: application/json
 */
export async function fetchData<T, A = void>(
  url: string,
  data?: A,
  init?: Partial<RequestInit>
): Promise<T> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json'
      },
      ...(data && { body: JSON.stringify(data) }),
      ...init
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(errorText);

      throw new Error(errorText);
    }

    return response.json() as Promise<T>;
  } catch (error) {
    throw new Error(JSON.stringify(error));
  }
}
