import { useCallback, useEffect, useState } from "react";
import { getApiErrorMessage } from "../services/api.js";
import { getProjects } from "../services/projectService.js";

export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const refreshProjects = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      setProjects(await getProjects());
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Projects could not be loaded. Please try again.",
        ),
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProjects();
  }, [refreshProjects]);

  return { projects, isLoading, error, refreshProjects };
}
