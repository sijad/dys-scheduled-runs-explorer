import { useEffect, useId, useState, FormEvent, useRef } from "react";
import TextArea from "../TextArea";
import TextInput from "../TextInput";
import { dispatch, tryDispatch } from "../../dys";
import AsyncButton from "../AsyncButton";
import { formatHighlightJSON, getJSON } from "../../utils";
import { queryClient } from "../../queries";
import { getBlockInfo } from "../../dys/hooks";

export interface Values {
  creator: string;
  index: string;
  data: string;
  force?: boolean;
}

interface NewModalProps {
  initValues?: Record<string, string>;
  isOpen?: boolean;
  onClose: () => void;
}

export type JSONSchemaType =
  | "string"
  | "number"
  | "integer"
  | "boolean"
  | "object";

interface Schema {
  type: JSONSchemaType;
  properties?: {
    type: JSONSchemaType;
    description: string;
  }[];
}

export default function NewModal({
  onClose,
  isOpen,
  initValues,
}: NewModalProps) {
  const id = useId();

  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [queryResponse, setQueryResponse] = useState<string>("");

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.code === "Escape") {
        onCloseRef.current();
      }
    };

    document.addEventListener("keydown", handleEscapeKey);

    return () => document.removeEventListener("keydown", handleEscapeKey);
  }, []);

  useEffect(() => {
    const form = formRef.current;

    if (!form || !initValues) {
      return;
    }

    Object.entries(initValues).forEach(([key, val]) => {
      const el = getFormElement(form, key);
      if (el) {
        el.value = val;
      }
    });
  }, [initValues, isOpen]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = formRef.current;

    if (!form) {
      return;
    }

    setIsSubmitting(true);

    const values = getFormValues(form);

    try {
      const resp = await tryDispatch<Record<string, unknown>>(
        `dyson/sendMsgCreateScheduledRun`,
        values
      );

      if (!resp) {
        return;
      }

      if (resp.rawLog) {
        resp.rawLog = getJSON(resp.rawLog as string) || resp.rawLog;
      }

      setQueryResponse(formatHighlightJSON(resp));

      await queryClient.invalidateQueries("scheduled-run-all");
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEstimateGas = async () => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const resp = await handleQuery();

    let consumed = Number(
      (resp?.response as Record<string, unknown>)?.script_gas_consumed
    );

    consumed *= 1.2;
    consumed = Math.round(consumed);

    if (consumed) {
      const gas = getFormElement(form, "gas");
      gas.value = `${consumed}`;
    }
  };

  const handleQuery = async () => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const data = getFormValues(form);

    const resp = await dispatch<Record<string, unknown>>(
      "dyson/QueryQueryScript",
      {
        query: data.msg,
      }
    );

    if (resp.response) {
      resp.response = getJSON(resp.response as string) || resp.response;
    }

    setQueryResponse(formatHighlightJSON(resp));

    return resp;
  };

  const handleSetDefaultValue = async () => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const index = getFormElement(form, "msg.address");
    const func = getFormElement(form, "msg.function_name");
    const kwargs = getFormElement(form, "msg.kwargs");

    if (!index?.value) {
      alert("Address filed is required");
      return;
    }

    if (!func?.value) {
      alert("Function Name filed is required");
      return;
    }

    try {
      const resp = await dispatch("dyson/QuerySchema", {
        query: {
          index: index.value,
        },
      });

      const schema = JSON.parse((resp as { schema: string }).schema).find(
        (i: Record<string, string>) => i.function === func.value
      )?.schema;

      if (!schema) {
        throw new Error("Function not found, make sure it's correct");
      }

      const data = getDefaultValues(schema);

      if (data && kwargs) {
        kwargs.value = JSON.stringify(data, null, 2);
      }
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
      console.error(e);
    }
  };

  const handleGetFunctionNames = async () => {
    const form = formRef.current;

    if (!form) {
      return;
    }

    const index = getFormElement(form, "msg.address");
    const func = getFormElement(form, "msg.function_name");

    if (!index?.value) {
      alert("Address filed is required");
      return;
    }

    try {
      const resp = await dispatch("dyson/QuerySchema", {
        query: {
          index: index.value,
        },
      });

      const functions = JSON.parse((resp as { schema: string }).schema).map(
        (i: Record<string, string>) => i.function
      );

      if (!functions.length) {
        throw new Error("something went wrong");
      }

      const name = prompt(`Available functions: ${functions.join(", ")}`);

      if (name && func) {
        func.value = name;
      }
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
      console.error(e);
    }
  };

  const handleSetCurrentHeight = async () => {
    const form = formRef.current;
    if (!form) {
      return;
    }

    const height = getFormElement(form, "height");

    const info = await getBlockInfo();

    if (height) {
      height.value = info?.header.height || "";
    }
  };

  return (
    <>
      <input
        type="checkbox"
        id={id}
        checked={isOpen}
        className="modal-toggle"
        readOnly
      />
      <div className="modal">
        <div className="space-y-2 modal-box">
          <button
            className="absolute top-2 right-2 z-20 btn btn-sm btn-circle"
            onClick={onClose}
          >
            <span className="sr-only">Close Modal</span>✕
          </button>
          <form
            key={isOpen ? "open" : "closed"}
            onSubmit={handleSubmit}
            ref={formRef}
          >
            <h3 className="mt-3 text-xl">Message</h3>
            <div className="px-3 mt-2 card bg-base-200">
              <div className="relative form-control">
                <div className="absolute right-0 top-2">
                  <button
                    type="button"
                    title="Set Current Wallet"
                    onClick={handleGetFunctionNames}
                    className={`btn btn-ghost btn-xs`}
                  >
                    <i className="text-sm icon-wallet" />
                  </button>
                </div>
                <TextInput
                  label="Creator"
                  name="msg.creator"
                  help="The account sending the transaction"
                />
              </div>
              <div className="form-control">
                <TextInput
                  label="Address"
                  name="msg.address"
                  help="Dys address of the script to call"
                />
              </div>
              <div className="form-control">
                <TextArea
                  label="Extra Lines"
                  name="msg.extra_lines"
                  help="Optional extra source code to append to the end of the script before running"
                />
              </div>
              <div className="relative form-control">
                <TextInput
                  label="Function Name"
                  name="msg.function_name"
                  help="Optional function to call"
                />
                <div className="absolute right-0 top-2">
                  <AsyncButton
                    title="Get Function Names"
                    onClick={handleGetFunctionNames}
                    className={`btn-ghost btn-xs`}
                  >
                    <i className="text-sm icon-download" />
                  </AsyncButton>
                </div>
              </div>
              <div className="form-control">
                <TextArea
                  label="Arguments"
                  name="msg.args"
                  help="Optional args to call the function with"
                />
              </div>
              <div className="relative form-control">
                <TextArea
                  label="Keyword Arguments"
                  name="msg.kwargs"
                  help="Optional kwargs to run"
                />
                <div className="absolute right-0 top-2">
                  <AsyncButton
                    title="Get Default Values"
                    onClick={handleSetDefaultValue}
                    className={`btn-ghost btn-xs`}
                  >
                    <i className="text-sm icon-download" />
                  </AsyncButton>
                </div>
              </div>
              <div className="form-control">
                <TextInput
                  label="Coins"
                  name="msg.coins"
                  help={
                    'Optional comma seperated list of coins to send the script (for example "123dys,456token")'
                  }
                />
              </div>
            </div>
            <div className="form-control">
              <TextInput label="Creator" name="creator" />
            </div>
            <div className="relative form-control">
              <div className="absolute right-0 top-2">
                <AsyncButton
                  title="Set Current Height"
                  onClick={handleSetCurrentHeight}
                  className={`btn-ghost btn-xs`}
                >
                  <i className="text-sm icon-arrow-up" />
                </AsyncButton>
              </div>
              <TextInput label="Height" name="height" />
            </div>
            <div className="relative form-control">
              <div className="absolute right-0 top-2">
                <AsyncButton
                  title="Estimate Gas"
                  onClick={handleEstimateGas}
                  className={`btn-ghost btn-xs`}
                >
                  <i className="text-sm icon-refresh-ccw" />
                </AsyncButton>
              </div>
              <TextInput label="Gas" name="gas" />
            </div>
            {queryResponse ? (
              <div>
                <div
                  className={`mt-6 bg-base-200 border-1 border-base-300 max-w-full overflow-x-auto`}
                >
                  <pre
                    className={`w-max min-w-full`}
                    dangerouslySetInnerHTML={{ __html: queryResponse }}
                  />
                </div>
              </div>
            ) : null}
            <div className="modal-action">
              <AsyncButton
                className={`btn-primary btn-ghost`}
                onClick={async () => {
                  await handleQuery();
                }}
              >
                Query
              </AsyncButton>
              <button
                className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

function getDefaultValues(schema: Schema) {
  switch (schema.type) {
    case "string":
      return "";
    case "number":
    case "integer":
      return 0;
    case "boolean":
      return false;
    case "object":
      if (!schema.properties) {
        return {};
      }

      return Object.entries(schema.properties).reduce((o, [key, val]) => {
        o[key] = getDefaultValues(val);
        return o;
      }, {} as Record<string, unknown>);
    default:
      return "";
  }
}

function getFormElement<T = HTMLInputElement>(
  ref: HTMLElement,
  name: string
): T {
  return ref.querySelector(`[name="${name}"]`) as T;
}

function getFormValues(form: HTMLFormElement) {
  const formData = new FormData(form);

  const data = [...formData].reduce((o, [key, value]) => {
    const [_key, __key] = key.split(".");

    if (__key) {
      o[_key] = o[_key] || {};
      (o[_key] as Record<string, unknown>)[__key] = value;
    } else {
      o[key] = value;
    }

    return o;
  }, {} as Record<string, unknown>);

  return data;
}
