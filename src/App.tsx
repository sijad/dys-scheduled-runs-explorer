/* eslint-disable react/jsx-no-undef */
import { Fragment, useEffect, useState } from "react";
import BlockStatus from "./components/BlockStatus";
import NewModal from "./components/NewModal";
import Item from "./components/Item";
import Spinner from "./components/Spinner";
import { useAccount, useBlockInfo, useInfiniteScheduledRun } from "./dys/hooks";
import useDebounce from "./hooks/useDebounce";

const params = new URLSearchParams(window.location.search);

function App(): JSX.Element {
  const info = useBlockInfo();
  const account = useAccount();
  const [prefix, setPrefix] = useState(() => params.get("prefix") || "");
  const [reversed, setReversed] = useState(
    () => params.get("reversed") === "true"
  );
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [initValues, setInitValues] = useState<Record<string, string>>({});

  const handleChangePrefix = (path: string): void => {
    setPrefix(path);
  };

  const debouncedPrefix = useDebounce(prefix, 300);

  const { data, status, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteScheduledRun(debouncedPrefix, reversed);

  useEffect(() => {
    window.history.replaceState(
      {},
      "",
      `?${new URLSearchParams({
        prefix,
        reversed: reversed ? "true" : "false",
      })}`
    );
  }, [prefix, reversed]);

  const height = info?.header.height;

  const handleNew = () => {
    const address = account?.bech32Address || "";

    setInitValues({
      creator: address,
      "msg.creator": address,
      "msg.address": prefix.split("/")[0],
      height: height || "",
    });

    setIsNewOpen(true);
  };

  const handleClose = () => {
    setIsNewOpen(false);
  };

  return (
    <div>
      <div className={`relative mt-14`}>
        <div className={`py-6 mx-auto w-full max-w-2xl bg-base-200`}>
          <div className={`bg-base-200 px-4 flex mb-8 sticky inset-0 z-10`}>
            <div className="flex py-1 space-x-2 w-full">
              <div className="w-full">
                <div className="w-full form-control">
                  <label className={`w-full`}>
                    <span className={`sr-only`}>Index</span>
                    <input
                      className="w-full input input-bordered"
                      placeholder="Index..."
                      onChange={(e) => handleChangePrefix(e.target.value)}
                      value={prefix}
                    />
                  </label>
                </div>
              </div>
              <button
                className="btn btn-circle"
                type="button"
                title="Up One Level"
                onClick={() => {
                  setPrefix((prefix) => {
                    const p = prefix
                      .replace(/\/$/, "")
                      .split("/")
                      .map((i) => i + "/");
                    p.pop();
                    return p.join("");
                  });
                }}
              >
                <i className="text-lg icon-corner-right-up" />
              </button>
              <button
                className="btn btn-circle"
                type="button"
                title="Toggle Reversed"
                onClick={() => {
                  setReversed((r) => !r);
                }}
              >
                <i
                  className={`text-lg icon-sort-${reversed ? "desc" : "asc"}`}
                />
              </button>
              {account ? (
                <button
                  className="btn btn-primary btn-circle"
                  type="button"
                  title="Add new storage"
                  onClick={handleNew}
                >
                  <i className="text-lg icon-file-plus-2" />
                </button>
              ) : null}
            </div>
          </div>
          <div className="px-4">
            {status === "loading" || status === "idle" ? (
              <div className={`flex w-full justify-center`}>
                <span className={`sr-only`}>Loading...</span>
                <Spinner />
              </div>
            ) : null}
            {data?.pages.map((page, i) => (
              <Fragment key={i}>
                {page.scheduled_run.map((s) => (
                  <Item
                    key={s.index}
                    item={s}
                    prefix={prefix}
                    onPathClick={handleChangePrefix}
                    blockHeight={height}
                  />
                ))}
              </Fragment>
            ))}
          </div>
          {hasNextPage ? (
            <div className={`flex w-full justify-center mt-2`}>
              <button
                type="button"
                disabled={isFetchingNextPage}
                className={`btn`}
                onClick={() => {
                  fetchNextPage();
                }}
              >
                {isFetchingNextPage ? "Loading more..." : "Load More"}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <NewModal
        isOpen={isNewOpen}
        onClose={handleClose}
        initValues={initValues}
      />
      {height ? <BlockStatus height={height} /> : null}
    </div>
  );
}

export default App;
