import Router from "express";
import PetsController from "../controllers/PetsController";
import CalendarController from "../controllers/CalendarController";
import LoginController from "../controllers/LoginController";

const router = Router();

router.get("/pets", PetsController.getAll);
router.post("/pet", PetsController.create);
router.put("/pet/:id", PetsController.update);
router.delete("/pet/:id", PetsController.delete);

router.get("/calendar", CalendarController.getByMonth);
router.post("/calendar", CalendarController.upsert);

router.post("/login", LoginController.enter)
router.post("/login/verify", LoginController.verify);

export default router;