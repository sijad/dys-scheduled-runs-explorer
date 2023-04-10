import { useEffect, useRef } from "react";
import { ScheduledRun } from "../../dys/types";
import { queryClient } from "../../queries";

interface ItemProps {
  item: ScheduledRun;
  blockHeight?: string;
}

const thStyle = {
  position: "relative",
  verticalAlign: "initial",
} as const;

const tdStyle = {
  whiteSpace: "normal",
  hyphens: "auto",
  wordBreak: "break-word",
  wordWrap: "break-word",
} as const;

export default function Item({ item, blockHeight }: ItemProps): JSX.Element {
  const diffRef = useRef<number | null>(null);
  const diff = Number(item.height) - Number(blockHeight);

  useEffect(() => {
    if (diffRef.current !== null) {
      if (diff < -1) {
        queryClient.invalidateQueries("scheduled-run-all");
        diffRef.current = null;
      }
    } else if (diff > 0) {
      diffRef.current = diff;
    }
  }, [diff]);

  const msg = item.msg;

  const message = msg && (
    <dl className="space-y-2">
      {[
        {
          title: "Address",
          value: msg.address,
        },
        {
          title: "Function",
          value: `${msg.function_name}`,
        },
        {
          title: "Keyword Args",
          value: msg.kwargs,
        },
        {
          title: "Args",
          value: msg.args,
        },
        {
          title: "Coins",
          value: msg.coins,
        },
        {
          title: "Extra Lines",
          value: msg.extra_lines && <code>{msg.extra_lines}</code>,
        },
      ].map(({ title, value }) =>
        value ? (
          <div key={title}>
            <dt className="text-xs">{title}:</dt>
            <dd>{value}</dd>
          </div>
        ) : null
      )}
    </dl>
  );

  return (
    <div className="p-4 my-6 shadow-sm card bg-base-100">
      <div className="flex items-center space-x-2">
        <div className={`badge badge-xs ${getStatus(item)}`}></div>
        <div className="overflow-x-auto">
          <code className="text-sm">{item.index}</code>
        </div>
      </div>
      <table className="table table-compact table-zebra">
        <tbody>
          {[
            {
              title: "Height",
              value: `${item.height} (diff: ${diff})`,
            },
            {
              title: "Message",
              value: message,
            },
            {
              title: "Response",
              value: item.resp?.response,
            },
            {
              title: "Error",
              value: item.error,
            },
            {
              title: "Gas",
              value: item.gas,
            },
            {
              title: "Gas Price",
              value: `${item.gasprice.amount}${item.gasprice.denom}`,
            },
            {
              title: "Fee",
              value: `${item.fee.amount}${item.fee.denom}`,
            },
          ].map(({ title, value }) =>
            value ? (
              <tr key={title}>
                <th style={thStyle}>{title}</th>
                <td style={tdStyle}>{value}</td>
              </tr>
            ) : null
          )}
        </tbody>
      </table>
    </div>
  );
}

function getStatus(item: ScheduledRun) {
  if (item.error) {
    return "badge-error";
  }

  if (item.resp) {
    return "badge-success";
  }

  return "badge-warning";
}
