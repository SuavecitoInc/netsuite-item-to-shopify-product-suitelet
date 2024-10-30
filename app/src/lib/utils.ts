export const fetchAPI = async <T>(action: string, payload: unknown) => {
  const response = await fetch(
    '/app/site/hosting/restlet.nl?script=2486&deploy=1',
    {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action,
        payload,
      }),
    }
  );
  const data = (await response.json()) as T;

  return data;
};
