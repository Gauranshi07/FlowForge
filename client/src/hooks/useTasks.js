import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../services/api.js";
import { getTasks } from "../services/taskService.js";

export function useTasks() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshTasks = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setTasks(await getTasks());
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Tasks could not be loaded. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshTasks();
  }, [refreshTasks]);

  return { tasks, isLoading, error, refreshTasks };
}
