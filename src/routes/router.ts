import { Router } from "https://deno.land/x/oak/mod.ts";
import { getTasks } from "../controller/controller.ts";

const router = new Router();

router
    .get("/", getTasks)

export default router;