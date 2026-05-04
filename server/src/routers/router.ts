import Router from "express";
import PetsController from "../controllers/PetsController";

const router = Router();

router.get("/pets", PetsController.getAll);
router.post("/pet", PetsController.create);
router.put("/pet/:id", PetsController.update);
router.delete("/pet/:id", PetsController.delete);

export default router;