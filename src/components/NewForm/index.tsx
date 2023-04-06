import { useEffect, useState } from "react";
import TextArea from "../TextArea";
import TextInput from "../TextInput";
import Select, { Option } from "../Select";
import { dispatch, tryDispatch } from "../../dys";
import AsyncButton from "../AsyncButton";
import { formatHighlightJSON, getJSON } from "../../utils";
import { queryClient } from "../../queries";
import { getBlockInfo } from "../../dys/hooks";
import KWArgsInput from "../KWArgsInput";
import { Schema } from "react-schema-based-json-editor";
import { useForm, Controller } from "react-hook-form";
import Spinner from "../Spinner";
import BlockDiff from "../BlockDiff";

export interface Values {
  creator: string;
  height: string;
  gas: string;
  msg_creator: string;
  msg_address: string;
  msg_extra_lines: string;
  msg_function_name: string;
  msg_args: string;
  msg_kwargs: string;
  msg_coins: string;
}

interface NewFormProps {
  initValues: Partial<Values>;
  functions?: Option[] | null;
  onBack: () => void;
}

export default function NewForm({
  initValues,
  functions,
  onBack,
}: NewFormProps) {
  const {
    control,
    watch,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useForm<Values>({
    defaultValues: initValues,
  });

  const [schema, setSchema] = useState<Schema | null>(null);
  const [queryResponse, setQueryResponse] = useState<string>("");

  const onSubmit = async (values: Values) => {
    const msg = Object.fromEntries(
      Object.entries(values)
        .filter(([k]) => k.startsWith("msg_"))
        .map(([k, v]) => [k.substring(4), v])
    );

    const data = Object.fromEntries(
      Object.entries(values).filter(([k]) => !k.startsWith("msg_"))
    );

    data.msg = msg;

    const resp = await tryDispatch<Record<string, unknown>>(
      `dyson/sendMsgCreateScheduledRun`,
      data
    );

    if (!resp) {
      return;
    }

    if (resp.rawLog) {
      resp.rawLog = getJSON(resp.rawLog as string) || resp.rawLog;
    }

    setQueryResponse(formatHighlightJSON(resp));

    await queryClient.invalidateQueries("scheduled-run-all");
  };

  const handleEstimateGas = async () => {
    const resp = await handleQuery();

    let consumed = Number(
      (resp?.response as Record<string, unknown>)?.script_gas_consumed
    );

    consumed *= 1.2;
    consumed = Math.round(consumed);

    if (consumed) {
      setValue("gas", `${consumed}`);
    }
  };

  const handleQuery = async () => {
    const data = getValues();

    const msg = Object.fromEntries(
      Object.entries(data)
        .filter(([k]) => k.startsWith("msg_"))
        .map(([k, v]) => [k.substring(4), v])
    );

    const resp = await dispatch<Record<string, unknown>>(
      "dyson/QueryQueryScript",
      {
        query: msg,
      }
    );

    if (resp.response) {
      resp.response = getJSON(resp.response as string) || resp.response;
    }

    setQueryResponse(formatHighlightJSON(resp));

    return resp;
  };

  const func = watch("msg_function_name");

  useEffect(() => {
    setSchema(null);
    setValue("msg_kwargs", "");

    if (func) {
      handleGetSchema();
    }
  }, [func]);

  const handleGetSchema = async () => {
    const index = getValues("msg_address");
    const func = getValues("msg_function_name");

    if (!index || !func) {
      return;
    }

    try {
      const resp = await dispatch("dyson/QuerySchema", {
        query: {
          index: index,
        },
      });

      const schema = JSON.parse((resp as { schema: string }).schema).find(
        (i: Record<string, string>) => i.function === func
      )?.schema;

      if (!schema) {
        throw new Error("Function not found");
      }

      setSchema(schema);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
      console.error(e);
    }
  };

  const handleSetCurrentHeight = async () => {
    const info = await getBlockInfo();

    setValue("height", info?.header.height || "");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <h3 className="mt-3 text-xl">Message</h3>
      <div className="px-3 mt-2 card bg-base-300">
        <div className="form-control">
          <TextInput
            label="Address"
            help="Dys address of the script to call"
            disabled
            after={
              <button type="button" onClick={onBack} className="btn btn-square">
                <i className="icon-pencil" />
              </button>
            }
            {...register("msg_address")}
          />
        </div>
        <div className="form-control">
          <Select
            label="Function Name"
            options={functions || []}
            help="Optional function to call"
            {...register("msg_function_name")}
          />
        </div>
        <div className="form-control">
          {schema ? (
            <Controller
              name="msg_kwargs"
              control={control}
              render={({ field }) => (
                <KWArgsInput
                  schema={schema}
                  label="Keyword Arguments"
                  onChange={field.onChange}
                />
              )}
            />
          ) : func ? (
            <Spinner />
          ) : null}
        </div>
        {/*
        <div className="form-control">
          <TextArea
            label="Arguments"
            help="Optional args to call the function with"
            {...register("msg_args")}
          />
        </div>
        */}
        <div className="relative form-control">
          <TextInput
            label="Creator"
            help="The account sending the transaction"
            {...register("msg_creator")}
          />
        </div>
        <div className="form-control">
          <TextArea
            label="Extra Lines"
            help="Optional extra source code to append to the end of the script before running"
            {...register("msg_extra_lines")}
          />
        </div>
        <div className="form-control">
          <TextInput
            label="Coins"
            help={
              'Optional comma seperated list of coins to send the script (for example "123dys,456token")'
            }
            {...register("msg_coins")}
          />
        </div>
      </div>
      <div className="form-control">
        <TextInput label="Creator" {...register("creator")} />
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
        <TextInput
          label="Height"
          {...register("height")}
          help={<BlockDiff block={watch("height")} />}
        />
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
        <TextInput label="Gas" {...register("gas")} />
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
        <button className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}>
          Save
        </button>
      </div>
    </form>
  );
}
