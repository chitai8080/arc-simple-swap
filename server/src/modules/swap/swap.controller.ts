import type { RequestHandler } from "express";
import type { BuildSwapTxInput, QuoteSwapInput, SwapStatusParams } from "./swap.schemas.js";
import type { SwapService } from "./swap.service.js";

export class SwapController {
  constructor(private readonly swapService: SwapService) {}

  quote: RequestHandler = async (req, res) => {
    const result = await this.swapService.quote(req.body as QuoteSwapInput);
    res.json(result);
  };

  buildTx: RequestHandler = async (req, res) => {
    const result = await this.swapService.buildTx(req.body as BuildSwapTxInput);
    res.json(result);
  };

  status: RequestHandler = async (req, res) => {
    const params = req.params as SwapStatusParams;
    const result = await this.swapService.getStatus(params.txHash);
    res.json(result);
  };
}
