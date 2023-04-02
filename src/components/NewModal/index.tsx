import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Option } from "../Select";
import NewForm from "../NewForm";
import { dispatch } from "../../dys";
import TextInput from "../TextInput";

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

interface NewModalProps {
  initValues: Partial<Values>;
  isOpen?: boolean;
  onClose: () => void;
}

export default function NewModal({
  onClose,
  isOpen,
  initValues,
}: NewModalProps) {
  const id = useId();
  const [address, setAddress] = useState<string>("");
  const [functions, setFunctions] = useState<Option[] | null>(null);

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

  const {
    register: addressRegister,
    handleSubmit: addressHandleSubmit,
    formState: addressFormState,
  } = useForm<{
    msg_address: string;
  }>();

  const handleGetFunctionNames = async (values: { msg_address: string }) => {
    const index = values.msg_address;

    if (!index) {
      alert("Address filed is required");
      return;
    }

    try {
      const resp = await dispatch("dyson/QuerySchema", {
        query: {
          index,
        },
      });

      const functions = JSON.parse((resp as { schema: string }).schema).map(
        (i: Record<string, string>) => i.function
      );

      if (!functions.length) {
        throw new Error("something went wrong");
      }

      const options = functions.map((f: string) => ({ label: f, value: f }));
      options.unshift({ label: "[None]", value: "" });

      setFunctions(options);
      setAddress(index);
    } catch (e) {
      if (e instanceof Error) {
        alert(e.message);
      }
      console.error(e);
    }
  };

  const handleOnBack = () => {
    setFunctions(null);
    setAddress("");
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
          {isOpen ? (
            <>
              {!address ? (
                <form
                  className="w-full"
                  onSubmit={addressHandleSubmit(handleGetFunctionNames)}
                >
                  <div className="form-control">
                    <TextInput
                      label="Address"
                      help="Dys address of the script to call"
                      disabled={!!address}
                      {...addressRegister("msg_address")}
                    />
                  </div>
                  <div className="modal-action">
                    <button
                      className={`btn btn-primary ${
                        addressFormState.isSubmitting ? "loading" : ""
                      }`}
                    >
                      Next
                    </button>
                  </div>
                </form>
              ) : null}
              {address ? (
                <NewForm
                  initValues={{ ...initValues, msg_address: address }}
                  onBack={handleOnBack}
                  functions={functions}
                />
              ) : null}
            </>
          ) : null}
        </div>
      </div>
    </>
  );
}
