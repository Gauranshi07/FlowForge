import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../services/api.js";
import { getDashboardSummary } from "../services/dashboardService.js";

export function useDashboardSummary() {
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshDashboard = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setSummary(await getDashboardSummary());
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Dashboard analytics could not be loaded. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshDashboard();
  }, [refreshDashboard]);

  return { summary, isLoading, error, refreshDashboard };
}
