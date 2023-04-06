import { useBlockInfo } from "../../dys/hooks";

interface BlockDiffProps {
  block: string | number;
}

export default function BlockDiff({
  block,
}: BlockDiffProps): JSX.Element | null {
  const info = useBlockInfo();
  const height = info?.header.height;

  return height ? (
    <span>
      Diff with current block: {Number(block) - Number(height)} ({height})
    </span>
  ) : null;
}
