export const fetcher = async <T>(input: RequestInfo, init?: RequestInit) => {
  const res = await fetch(input, init);
  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.message ?? "Permintaan gagal");
  }

  return data as T;
};

