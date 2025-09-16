
"use client";

import { useState, useEffect } from "react";
import type { Village } from "@/types";
import { getReliefRequests } from "@/app/actions";

export function useReliefData() {
  const [data, setData] = useState<Village[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Always force a refresh to get the latest data
        const result = await getReliefRequests(true);
        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          // Sort by timestamp descending
          const sortedData = result.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setData(sortedData);
        }
      } catch (e) {
        setError("An unexpected error occurred while fetching data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { data, loading, error, setData };
}
