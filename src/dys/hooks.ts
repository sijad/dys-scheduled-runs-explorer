import { Key } from "@keplr-wallet/types";
import { useEffect, useState, useReducer } from "react";
import { useInfiniteQuery } from "react-query";
import { dispatch, get, initKeplr } from ".";
import { Block, ScheduledRunAllResponse } from "./types";

export function useInfiniteScheduledRun(index: string, reversed = false) {
  const api = get("common/env/apiCosmos");

  return useInfiniteQuery<ScheduledRunAllResponse>(
    ["scheduled-run-all", index, reversed],
    async ({ pageParam = "" }) => {
      return dispatch("dyson/QueryScheduledRunAll", {
        query: {
          index,
          "pagination.key": pageParam,
          "pagination.reverse": !reversed,
          "pagination.limit": "15",
        },
      });
    },
    {
      getNextPageParam: (lastPage) => lastPage.pagination.next_key,
      enabled: !!api && !!index,
    }
  );
}

export function useAccount(): [Key | null, () => void] {
  const [key, setKey] = useState<Key | null>(null);
  const [force, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    initKeplr((key: Key) => {
      setKey(key);
    });
  }, [force]);

  return [key, () => forceUpdate()];
}

export async function getBlockInfo(): Promise<Block | null> {
  const info = await dispatch<{ block: Block }>(
    "cosmos.base.tendermint.v1beta1/ServiceGetLatestBlock",
    {}
  );

  return info.block;
}

export function useBlockInfo() {
  const [info, setInfo] = useState<Block | null>(null);

  useEffect(() => {
    let id: number;
    let mounted = true;

    const cb = async () => {
      try {
        const info = await getBlockInfo();

        setInfo(info);
      } catch (e) {
        console.log(e);
      }

      if (mounted) {
        id = window.setTimeout(cb, 5000);
      }
    };

    cb();

    return () => {
      mounted = false;
      id && clearTimeout(id);
    };
  }, []);

  return info;
}
