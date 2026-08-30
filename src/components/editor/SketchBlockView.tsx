import { useEffect, useRef, useState, type PointerEvent } from "react";
import { NodeViewWrapper, type ReactNodeViewProps } from "@tiptap/react";
import { Eraser, Undo2 } from "lucide-react";
import { cn } from "@/lib/cn";

const COLORS = ["#1a1e22", "#c0362c", "#2954a5", "#2f7a4f", "#b3711c", "#7a4fae"];
const WIDTH = 640;
const HEIGHT = 320;

export function SketchBlockView({ node, updateAttributes }: ReactNodeViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [color, setColor] = useState(COLORS[0]);
  const historyRef = useRef<string[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    if (node.attrs.imageData) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
      img.src = node.attrs.imageData;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pos = (e: PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * WIDTH, y: ((e.clientY - rect.top) / rect.height) * HEIGHT };
  };

  const startStroke = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    historyRef.current.push(canvas.toDataURL());
    if (historyRef.current.length > 20) historyRef.current.shift();
    drawing.current = true;
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  };

  const continueStroke = (e: PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const endStroke = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const canvas = canvasRef.current;
    if (canvas) updateAttributes({ imageData: canvas.toDataURL() });
  };

  const undo = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    const prev = historyRef.current.pop();
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    if (prev) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, WIDTH, HEIGHT);
        updateAttributes({ imageData: canvas.toDataURL() });
      };
      img.src = prev;
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, WIDTH, HEIGHT);
      updateAttributes({ imageData: null });
    }
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    historyRef.current.push(canvas.toDataURL());
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    updateAttributes({ imageData: null });
  };

  return (
    <NodeViewWrapper data-type="sketch-block" className="my-2 rounded-lg border border-line bg-surface p-3">
      <div className="mb-2 flex items-center gap-2">
        {COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => setColor(c)}
            className={cn(
              "h-5 w-5 rounded-full border-2 transition-transform hover:scale-110",
              color === c ? "border-ink" : "border-transparent",
            )}
            style={{ background: c }}
          />
        ))}
        <div className="mx-1 h-4 w-px bg-line" />
        <button
          type="button"
          onClick={undo}
          title="Undo last stroke"
          className="flex h-6 w-6 items-center justify-center rounded-md text-faint hover:bg-surface-2 hover:text-ink"
        >
          <Undo2 size={13} />
        </button>
        <button
          type="button"
          onClick={clear}
          title="Clear"
          className="flex h-6 w-6 items-center justify-center rounded-md text-faint hover:bg-surface-2 hover:text-danger"
        >
          <Eraser size={13} />
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={WIDTH}
        height={HEIGHT}
        onPointerDown={startStroke}
        onPointerMove={continueStroke}
        onPointerUp={endStroke}
        onPointerLeave={endStroke}
        className="w-full touch-none rounded-md border border-line"
        style={{ aspectRatio: `${WIDTH} / ${HEIGHT}` }}
      />
    </NodeViewWrapper>
  );
}
