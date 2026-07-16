import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

// Temporary: discover outbound IP of this server instance.
router.get("/server-ip", async (_req, res) => {
  try {
    const r = await fetch("https://api.ipify.org?format=json");
    const json = await r.json() as { ip: string };
    res.json({ ip: json.ip });
  } catch {
    res.status(500).json({ error: "Could not determine IP" });
  }
});


export default router;
