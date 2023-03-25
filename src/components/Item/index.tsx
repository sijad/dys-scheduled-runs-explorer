import { useEffect, useState } from "react";
import { ScheduledRun } from "../../dys/types";
import { formatHighlightJSON, getJSON } from "../../utils";
import Path from "../Path";

interface ItemProps {
  item: ScheduledRun;
  onPathClick: (path: string) => void;
  prefix: string;
  blockHeight?: string;
}

const preStyle = {
  lineHeight: 1.5,
  backgroundImage: "linear-gradient(transparent 50%, rgba(0,0,0,0.1) 50%)",
  backgroundSize: "3em 3em",
};

export default function Item({
  item,
  onPathClick,
  prefix,
  blockHeight,
}: ItemProps): JSX.Element {
  const [itemHTML, setItemHTML] = useState<string | undefined>();

  useEffect(() => {
    const msg = { ...item.msg };
    const resp = { ...item.resp };

    msg.args = getJSON(msg.args) || msg.args;
    msg.kwargs = getJSON(msg.kwargs) || msg.kwargs;
    msg.kwargs = getJSON(msg.kwargs) || msg.kwargs;

    if (resp.response) {
      resp.response = getJSON(resp.response) || resp.response;
    }

    setItemHTML(formatHighlightJSON({ ...item, msg, resp }));
  }, [item]);

  return (
    <div className="p-4 my-6 shadow-sm card bg-base-100">
      <Path prefix={prefix} path={item.index} onClick={onPathClick} />
      <div className={`flex mt-2 text-sm space-x-1`}>
        {"Height Diff: "}
        <pre> {Number(item.height) - Number(blockHeight)}</pre>
      </div>
      {itemHTML ? (
        <div
          className={`my-2 bg-base-200 border-1 border-base-300 max-w-full overflow-x-auto`}
        >
          <pre
            className={`w-max min-w-full`}
            style={preStyle}
            dangerouslySetInnerHTML={{ __html: itemHTML }}
          />
        </div>
      ) : null}
    </div>
  );
}
