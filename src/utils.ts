import formatHighlight from "json-format-highlight";

export function getJSON(txt: string) {
  try {
    return JSON.parse(txt);
  } catch {
    return false;
  }
}

const colors = {
  keyColor: "#9876AA",
  numberColor: "#6897BB",
  stringColor: "#6A8759",
  trueColor: "#CC7832",
  falseColor: "#CC7832",
  nullColor: "#CC7832",
};

export function formatHighlightJSON(obj: unknown) {
  return formatHighlight(obj, colors);
}
