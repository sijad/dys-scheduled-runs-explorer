/* eslint-disable react/jsx-no-undef */
import { Fragment, useEffect, useState } from "react";
import BlockStatus from "./components/BlockStatus";
import NewModal from "./components/NewModal";
import Item from "./components/Item";
import Spinner from "./components/Spinner";
import { useAccount, useBlockInfo, useInfiniteScheduledRun } from "./dys/hooks";

const params = new URLSearchParams(window.location.search);

function App(): JSX.Element {
  const info = useBlockInfo();
  const [account] = useAccount();
  const [reversed, setReversed] = useState(
    () => params.get("reversed") === "true"
  );
  const [isNewOpen, setIsNewOpen] = useState(false);
  const [initValues, setInitValues] = useState<Record<string, string>>({});

  const address = account?.bech32Address || "";

  const { data, status, fetchNextPage, isFetchingNextPage, hasNextPage } =
    useInfiniteScheduledRun(address, reversed);

  useEffect(() => {
    window.history.replaceState(
      {},
      "",
      `?${new URLSearchParams({
        reversed: reversed ? "true" : "false",
      })}`
    );
  }, [reversed]);

  const height = info?.header.height;

  const handleNew = () => {
    setInitValues({
      creator: address,
      msg_creator: address,
      msg_address: address,
      height: height || "",
    });

    setIsNewOpen(true);
  };

  const handleClose = () => {
    setIsNewOpen(false);
  };

  const pages = data?.pages || [];

  if (!address) {
    return (
      <div className={`relative mt-14`}>
        <div className={`p-6 mx-auto w-full max-w-2xl bg-base-200`}>
          <p>Connecting to Kepler</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={`relative mt-14`}>
        <div className={`py-6 mx-auto w-full max-w-2xl bg-base-200`}>
          <div className={`bg-base-200 px-4 flex mb-8 sticky inset-0 z-20`}>
            <div className="flex flex-col items-center py-1 space-y-2 w-full sm:flex-row sm:space-y-0 sm:space-x-2">
              <div className="w-full">
                <div className="text-xs">CONNECTED:</div>
                <code className="break-all">{address}</code>
              </div>
              <div className="flex py-1 space-x-2">
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
                {address ? (
                  <button
                    className="btn btn-primary btn-circle"
                    type="button"
                    title="Create new a Scheduled Run"
                    onClick={handleNew}
                  >
                    <i className="text-lg icon-calendar-plus" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>
          <div className="px-4">
            {status === "loading" || status === "idle" ? (
              <div className={`flex w-full justify-center`}>
                <span className={`sr-only`}>Loading...</span>
                <Spinner />
              </div>
            ) : null}
            {pages.map((page, i) => (
              <Fragment key={i}>
                {page.scheduled_run.map((s) => (
                  <Item key={s.index} item={s} blockHeight={height} />
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
