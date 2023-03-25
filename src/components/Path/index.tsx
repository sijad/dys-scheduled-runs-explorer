import { useEffect, useState } from "react";

interface PathProps {
  path: string;
  prefix: string;
  onClick: (path: string) => void;
}

export default function Path({ path, onClick }: PathProps): JSX.Element {
  const [paths, setPaths] = useState<{ path: string; name: string }[]>(
    () => []
  );

  useEffect(() => {
    let p = "";
    const newPaths = path.split("/").map((s) => {
      p += `${s}/`;
      return {
        path: p,
        name: s,
      };
    });

    // newPaths.unshift({ path: "", name: "ROOT" });

    setPaths(newPaths);
  }, [path]);

  return (
    <div className="text-sm breadcrumbs">
      <ul>
        {paths.map(({ path, name }, i) => {
          return (
            <li key={i}>
              <button
                type="button"
                className={`hover:underline`}
                onClick={() => {
                  onClick(path);
                }}
              >
                <span className={`sr-only`}>Go to Root</span>
                {name}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
