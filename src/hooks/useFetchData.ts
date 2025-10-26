// src/hooks/useFetchData.ts
import { useCallback, useEffect, useState } from "react";
import API from "../lib/axios";

export default function useFetchData<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(url);
      console.log(res.data);
      // Ensure data is always an array, even if API returns null
      setData(res.data || []);
    } catch (err) {
      // console.error("Fetch error:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, refetch: fetchData };
}