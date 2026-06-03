import { Router } from "express";
import { validateBody, validateParams } from "../../middleware/validate.js";
import { LifiProvider } from "./providers/lifiProvider.js";
import { buildSwapTxSchema, quoteSwapSchema, swapStatusParamsSchema } from "./swap.schemas.js";
import { SwapController } from "./swap.controller.js";
import { SwapService } from "./swap.service.js";

export function createSwapRouter() {
  const router = Router();
  const swapService = new SwapService(new LifiProvider());
  const swapController = new SwapController(swapService);

  router.post("/quote", validateBody(quoteSwapSchema), swapController.quote);
  router.post("/build-tx", validateBody(buildSwapTxSchema), swapController.buildTx);
  router.get("/status/:txHash", validateParams(swapStatusParamsSchema), swapController.status);

  return router;
}
