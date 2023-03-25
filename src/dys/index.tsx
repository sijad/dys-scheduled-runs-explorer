import type { Key } from "@keplr-wallet/types";

declare const DysonLoader: () => Promise<void>;

export function init() {
  return DysonLoader();
}

export function initKeplr(onAccountChange?: (key: Key) => void) {
  const { dysonUseKeplr } = window;

  if (!dysonUseKeplr) {
    throw new NoDysError();
  }

  return dysonUseKeplr(onAccountChange);
}

export function get(key: string) {
  return getStore().getters[key];
}

export function dispatch<T = unknown>(
  command: string,
  value: Record<string, unknown>
): Promise<T> {
  return getStore().dispatch(command, value);
}

class NoDysError extends Error {
  constructor() {
    super("dys not available");
  }
}

function getStore() {
  const { dysonVueStore } = window;

  if (!dysonVueStore) {
    throw new NoDysError();
  }

  return dysonVueStore;
}

export async function tryDispatch<T = unknown>(
  command: string,
  value: unknown,
  fee = 200,
  tryAgain = false
): Promise<T | null> {
  fee = parseInt(
    prompt(
      `Please Enter Fee${tryAgain ? " (trying again with more gas)" : ""}`,
      (fee || "200").toString()
    ) || ""
  );

  if (!fee) {
    return null;
  }

  try {
    return await dispatch<T>(command, {
      value,
      fee: [
        {
          amount: fee.toString(),
          denom: "dys",
        },
      ],
      gas: (Number(fee) * 10000).toString(),
    });
  } catch (e) {
    const message = (e as Error).message;

    alert(message);

    if (message.endsWith("out of gas")) {
      return await tryDispatch(command, value, fee * 2, true);
    }

    return null;
  }
}
