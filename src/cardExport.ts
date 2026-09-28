type ExportFormat = "square" | "portrait" | "landscape";
type ExportAlign = "left" | "center";
type ExportFont = "serif" | "sans";

type CardExportInput = {
  quote: string;
  author: string;
  background: string;
  backgroundSecondary?: string;
  textColor: string;
  accentColor: string;
  format: ExportFormat;
  align: ExportAlign;
  font: ExportFont;
  size: number;
  showMarks: boolean;
  showAuthor: boolean;
  showBranding: boolean;
  filename: string;
};

const dimensions: Record<ExportFormat, [number, number]> = {
  square: [1080, 1080],
  portrait: [1080, 1350],
  landscape: [1200, 675],
};

function wrapText(
  context: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (context.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word);
    }
  });

  if (current) lines.push(current);
  return lines;
}

export const cardExport = {
  async download(input: CardExportInput) {
    await document.fonts?.ready;

    const [width, height] = dimensions[input.format];
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is unavailable.");

    if (input.backgroundSecondary) {
      const gradient = context.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, input.background);
      gradient.addColorStop(1, input.backgroundSecondary);
      context.fillStyle = gradient;
    } else {
      context.fillStyle = input.background;
    }
    context.fillRect(0, 0, width, height);

    const minSide = Math.min(width, height);
    const padding = Math.round(minSide * 0.095);
    const maxTextWidth = width - padding * 2;
    const baseSize = Math.round(minSide * 0.061 * input.size);
    const fontFamily =
      input.font === "serif"
        ? '"Newsreader", Georgia, serif'
        : '"DM Sans", Arial, sans-serif';

    context.fillStyle = input.accentColor;
    context.fillRect(padding, padding, Math.round(minSide * 0.09), Math.max(5, Math.round(minSide * 0.006)));

    let fontSize = baseSize;
    let lines: string[] = [];
    const maxQuoteHeight = height * 0.56;
    const lineHeightRatio = 1.14;

    while (fontSize > minSide * 0.032) {
      context.font = `600 ${fontSize}px ${fontFamily}`;
      lines = wrapText(context, input.quote, maxTextWidth);
      if (lines.length * fontSize * lineHeightRatio <= maxQuoteHeight) break;
      fontSize -= 4;
    }

    const lineHeight = fontSize * lineHeightRatio;
    const authorHeight = input.showAuthor ? Math.round(minSide * 0.047) + 42 : 0;
    const brandingHeight = input.showBranding ? 36 : 0;
    const quoteHeight = lines.length * lineHeight;
    const contentHeight = quoteHeight + authorHeight + brandingHeight + 36;
    let y = Math.max(padding * 1.35, (height - contentHeight) / 2);

    context.textAlign = input.align;
    context.textBaseline = "top";
    context.fillStyle = input.textColor;
    const x = input.align === "center" ? width / 2 : padding;

    if (input.showMarks) {
      context.font = `600 ${Math.round(fontSize * 1.25)}px ${fontFamily}`;
      context.globalAlpha = 0.24;
      context.fillText("“", x, y - fontSize * 0.74);
      context.globalAlpha = 1;
    }

    context.font = `600 ${fontSize}px ${fontFamily}`;
    lines.forEach((line) => {
      context.fillText(line, x, y);
      y += lineHeight;
    });

    if (input.showAuthor) {
      y += Math.round(minSide * 0.035);
      context.font = `600 ${Math.round(minSide * 0.026)}px "DM Sans", Arial, sans-serif`;
      context.globalAlpha = 0.78;
      context.fillText(`— ${input.author}`, x, y);
      context.globalAlpha = 1;
    }

    if (input.showBranding) {
      context.textAlign = "left";
      context.font = `600 ${Math.round(minSide * 0.018)}px "DM Sans", Arial, sans-serif`;
      context.globalAlpha = 0.58;
      context.fillText("QuoteDrop · Words worth keeping.", padding, height - padding * 0.68);
      context.globalAlpha = 1;
    }

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png", 1),
    );
    if (!blob) throw new Error("PNG export failed.");

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = input.filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  },
};