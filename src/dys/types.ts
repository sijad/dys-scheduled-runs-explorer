import { Coin, Key } from "@keplr-wallet/types";
import type { Store } from "vuex";

export interface ScheduledRun {
  index: string;
  creator: string;
  height: string;
  gas: string;
  msg: Msg;
  resp?: {
    response: string;
  };
  error: string;
  gasprice: Coin;
  fee: Coin;
}

export interface Msg {
  creator: string;
  address: string;
  extra_lines: string;
  function_name: string;
  args: string;
  kwargs: string;
  coins: string;
}

export interface ScheduledRunAllResponse {
  scheduled_run: ScheduledRun[];
  pagination: {
    next_key: string;
    total: string;
  };
}

export interface Window {
  dysonUseKeplr?: (onAccountChange?: (params: Key) => void) => Promise<Key>;
  dysonVueStore?: Store<unknown>;
}

export interface Block {
  header: {
    chain_id: string;
    height: string;
    time: string;
  };
}
