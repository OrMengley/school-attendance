// src/hooks/useFetchData.ts
import { useCallback, useEffect, useState } from "react";
import API from "../lib/axios";

export default function useFetchData<T>(url: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Don't fetch if url is empty
      if (!url) {
        setData([]);
        return;
      }
      
      const res = await API.get(url);
      console.log(res.data);
      
      // Ensure data is always an array, even if API returns null or an object
      let dataArray: T[] = [];
      if (Array.isArray(res.data)) {
        dataArray = res.data;
      } else if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
        // If it's an object but not an array, check if it has a data property that is an array
        if (Array.isArray((res.data as any).data)) {
          dataArray = (res.data as any).data;
        } else if (Array.isArray((res.data as any).items)) {
          dataArray = (res.data as any).items;
        }
        // If it's just a regular object, we'll keep dataArray as empty array
      }
      
      setData(dataArray);
    } catch (err) {
      console.error("Fetch error:", err);
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