import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8787),
  WEB_ORIGIN: z.string().url().default("http://localhost:5173"),
  ARC_RPC_URL: z.string().url().default("https://rpc.testnet.arc.network"),
  SWAP_PROVIDER_BASE_URL: z.string().url().default("https://li.quest/v1"),
  SWAP_PROVIDER_TIMEOUT_MS: z.coerce.number().int().positive().default(12000),
  APP_INTEGRATOR_ID: z.string().trim().min(1).optional(),
});

export const env = envSchema.parse(process.env);
