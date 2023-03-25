import type { Window as KeplrWindow } from "@keplr-wallet/types";
import type { Window as DysWindow } from "./dys/types";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends DysWindow {}
}
