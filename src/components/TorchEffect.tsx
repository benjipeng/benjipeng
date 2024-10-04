"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";

const useMousePosition = (ref: React.RefObject<HTMLDivElement>) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        setMousePosition({
          x: ev.clientX - rect.left,
          y: ev.clientY - rect.top,
        });
      }
    };

    const currentRef = ref.current;
    currentRef?.addEventListener("mousemove", updateMousePosition);
    return () =>
      currentRef?.removeEventListener("mousemove", updateMousePosition);
  }, [ref]);

  return mousePosition;
};

const TORCH_SIZE = {
  MIN: 10,
  MAX: 200, // Increased max torch size
};

const TEXT = {
  VISIBLE: { first: "Benji", second: "Peng" },
  HIDDEN: { first: "Scientist", second: "Entrepreneur" },
};

const RIBBON_COUNT = 5;
const RIBBON_COLORS = [
  "#52606D", // secondary-600
  "#616E7C", // secondary-500
  "#7B8794", // secondary-400
  "#9AA5B1", // secondary-300
  "#CBD2D9", // secondary-200
];

export default function TorchEffectWithRibbons() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ribbonCanvasRef = useRef<HTMLCanvasElement>(null);
  const torchSizeRef = useRef(TORCH_SIZE.MIN);
  const { x, y } = useMousePosition(containerRef);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [scrollY, setScrollY] = useState(0);

  const updateDimensions = useCallback(() => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      setDimensions({ width, height });
    }
  }, []);

  useEffect(() => {
    updateDimensions();
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [updateDimensions]);

  const drawText = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      text: { first: string; second: string },
      color: string
    ) => {
      const { width, height } = dimensions;
      const fontSize = Math.min(width, height) * 0.1; // Adjust font size based on screen size
      ctx.font = `bold ${fontSize}px Fredoka, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text.first, width / 2, height / 2 - fontSize * 0.6);
      ctx.fillText(text.second, width / 2, height / 2 + fontSize * 0.6);
    },
    [dimensions]
  );

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);

    const isNearCenter =
      Math.abs(x - width / 2) < width * 0.2 &&
      Math.abs(y - height / 2) < height * 0.2;
    const targetSize = isNearCenter ? TORCH_SIZE.MAX : TORCH_SIZE.MIN;
    torchSizeRef.current += (targetSize - torchSizeRef.current) * 0.1;

    ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    ctx.fillRect(0, 0, width, height);

    drawText(ctx, TEXT.VISIBLE, "#E4DED7");

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, torchSizeRef.current, 0, Math.PI * 2);
    ctx.clip();

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);
    drawText(ctx, TEXT.HIDDEN, "black");

    ctx.restore();

    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
  }, [x, y, dimensions, drawText]);

  const drawRibbons = useCallback(() => {
    const canvas = ribbonCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const { width, height } = dimensions;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < RIBBON_COUNT; i++) {
      ctx.beginPath();
      ctx.moveTo(
        0,
        (height / RIBBON_COUNT) * i + (scrollY % (height / RIBBON_COUNT))
      );

      for (let x = 0; x < width; x += 20) {
        const y =
          Math.sin((x + scrollY) / 100) * 50 +
          (height / RIBBON_COUNT) * i +
          (scrollY % (height / RIBBON_COUNT));
        ctx.lineTo(x, y);
      }

      ctx.strokeStyle = RIBBON_COLORS[i % RIBBON_COLORS.length];
      ctx.lineWidth = 16; // Reduced line width for a more subtle effect
      ctx.stroke();
    }
  }, [dimensions, scrollY]);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      drawRibbons();
      drawScene();
      animationFrameId = requestAnimationFrame(animate);
    };

    if (canvasRef.current && ribbonCanvasRef.current) {
      canvasRef.current.width = dimensions.width;
      canvasRef.current.height = dimensions.height;
      ribbonCanvasRef.current.width = dimensions.width;
      ribbonCanvasRef.current.height = dimensions.height;
      animate();
    }

    return () => cancelAnimationFrame(animationFrameId);
  }, [drawScene, drawRibbons, dimensions]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen bg-secondary-900 dark:bg-black overflow-hidden flex items-center justify-center cursor-none rounded-none relative"
    >
      <canvas
        ref={ribbonCanvasRef}
        className="absolute top-0 left-0 w-full h-full opacity-30" // Added opacity for a more subtle effect
      />
      <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />
    </div>
  );
}
