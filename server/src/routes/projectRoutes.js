import { Router } from "express";
import {
  createProject,
  deleteProject,
  getProject,
  getProjects,
  updateProject,
} from "../controllers/projectController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.route("/").post(createProject).get(getProjects);
router
  .route("/:id")
  .get(getProject)
  .put(updateProject)
  .delete(deleteProject);

export default router;
