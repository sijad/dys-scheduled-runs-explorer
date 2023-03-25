interface BlockStatusProps {
  height: string;
}

const animStyle = {
  animationIterationCount: 1,
};

const style = {
  zIndex: 999,
};

export default function BlockStatus({ height }: BlockStatusProps) {
  return (
    <span
      className="inline-flex fixed bottom-5 left-5 items-center rounded-md shadow-sm"
      style={style}
    >
      <span className="flex relative mr-2 w-3 h-3">
        <span
          style={animStyle}
          key={height}
          className="inline-flex absolute w-full h-full rounded-full opacity-75 animate-ping bg-success"
        />
        <span className="inline-flex relative w-3 h-3 rounded-full bg-success" />
      </span>
      <pre className="text-sm">{height}</pre>
    </span>
  );
}
