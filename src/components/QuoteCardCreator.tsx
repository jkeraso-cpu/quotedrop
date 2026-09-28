import { useMemo, useState } from "react";
import { Download, Quote as QuoteIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./Button";
import { Input } from "./Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Slider } from "./Slider";
import { Switch } from "./Switch";
import { quoteData } from "../helpers/quoteData";
import { quoteUtils } from "../helpers/quoteUtils";
import { cardExport } from "../helpers/cardExport";
import styles from "./QuoteCardCreator.module.css";

type Quote = (typeof quoteData)[number];
type Format = "square" | "portrait" | "landscape";
type Align = "left" | "center";
type FontStyle = "serif" | "sans";

const presets = {
  Paper: { background: "#f4ead8", secondary: "#fbf7ef", text: "#302720", accent: "#b65b43" },
  Midnight: { background: "#171519", secondary: "#282129", text: "#f4eadf", accent: "#da8069" },
  Sunset: { background: "#b95845", secondary: "#dc9567", text: "#fff6ed", accent: "#52251e" },
  Ocean: { background: "#203b46", secondary: "#4e7580", text: "#f1f5f2", accent: "#cfa76c" },
  Rose: { background: "#dbc0bc", secondary: "#f0ddda", text: "#472c2d", accent: "#9e5260" },
  Forest: { background: "#25372d", secondary: "#586e55", text: "#f4f0df", accent: "#d4b46f" },
} as const;

interface QuoteCardCreatorProps {
  quote: Quote;
}

export const QuoteCardCreator = ({ quote }: QuoteCardCreatorProps) => {
  const [preset, setPreset] = useState<keyof typeof presets>("Paper");
  const [background, setBackground] = useState<string>(presets.Paper.background);
  const [secondary, setSecondary] = useState<string>(presets.Paper.secondary);
  const [textColor, setTextColor] = useState<string>(presets.Paper.text);
  const [accentColor, setAccentColor] = useState<string>(presets.Paper.accent);
  const [format, setFormat] = useState<Format>("square");
  const [align, setAlign] = useState<Align>("left");
  const [font, setFont] = useState<FontStyle>("serif");
  const [size, setSize] = useState(1);
  const [showMarks, setShowMarks] = useState(true);
  const [showAuthor, setShowAuthor] = useState(true);
  const [showBranding, setShowBranding] = useState(true);
  const [exporting, setExporting] = useState(false);

  const effectiveSize = useMemo(
    () => size * quoteUtils.fontScale(quote.text),
    [size, quote.text],
  );

  const applyPreset = (name: keyof typeof presets) => {
    const next = presets[name];
    setPreset(name);
    setBackground(next.background);
    setSecondary(next.secondary);
    setTextColor(next.text);
    setAccentColor(next.accent);
  };

  const exportPng = async () => {
    setExporting(true);
    try {
      await cardExport.download({
        quote: quote.text,
        author: quote.author,
        background,
        backgroundSecondary: secondary,
        textColor,
        accentColor,
        format,
        align,
        font,
        size: effectiveSize,
        showMarks,
        showAuthor,
        showBranding,
        filename: quoteUtils.sanitizeFilename(quote.author),
      });
      toast.success("Quote card downloaded");
    } catch {
      toast.error("Couldn’t create your quote card. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const ratioClass = format === "square" ? styles.square : format === "portrait" ? styles.portrait : styles.landscape;

  return (
    <div className={styles.creator}>
      <div className={styles.controls}>
        <div>
          <p className={styles.kicker}>Card studio</p>
          <h3>Make it yours.</h3>
          <p className={styles.intro}>Adjust a few thoughtful details, then export a crisp PNG.</p>
        </div>

        <div className={styles.controlGroup}>
          <label>Preset</label>
          <div className={styles.presets}>
            {(Object.keys(presets) as Array<keyof typeof presets>).map((name) => (
              <button
                key={name}
                className={preset === name ? styles.activePreset : ""}
                onClick={() => applyPreset(name)}
                aria-label={`Use ${name} preset`}
              >
                <span style={{ background: presets[name].background }} />
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.controlGroup}>
            <label>Format</label>
            <Select value={format} onValueChange={(value) => setFormat(value as Format)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="square">Square · 1080×1080</SelectItem>
                <SelectItem value="portrait">Portrait · 1080×1350</SelectItem>
                <SelectItem value="landscape">Landscape · 1200×675</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.controlGroup}>
            <label>Alignment</label>
            <Select value={align} onValueChange={(value) => setAlign(value as Align)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Centered</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.controlGroup}>
            <label>Font</label>
            <Select value={font} onValueChange={(value) => setFont(value as FontStyle)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">Editorial serif</SelectItem>
                <SelectItem value="sans">Clean sans</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className={styles.controlGroup}>
            <label>Quote size · {Math.round(size * 100)}%</label>
            <Slider min={0.75} max={1.15} step={0.05} value={[size]} onValueChange={(value) => setSize(value[0])} />
          </div>
        </div>

        <div className={styles.colorRow}>
          <label>Background <Input type="color" value={background} onChange={(event) => setBackground(event.target.value)} /></label>
          <label>Blend <Input type="color" value={secondary} onChange={(event) => setSecondary(event.target.value)} /></label>
          <label>Text <Input type="color" value={textColor} onChange={(event) => setTextColor(event.target.value)} /></label>
          <label>Accent <Input type="color" value={accentColor} onChange={(event) => setAccentColor(event.target.value)} /></label>
        </div>

        <div className={styles.switches}>
          <label><Switch checked={showMarks} onCheckedChange={setShowMarks} /> Quotation marks</label>
          <label><Switch checked={showAuthor} onCheckedChange={setShowAuthor} /> Author</label>
          <label><Switch checked={showBranding} onCheckedChange={setShowBranding} /> QuoteDrop mark</label>
        </div>

        {quote.text.length > 170 && (
          <p className={styles.longNote}>Long quote detected. The export will reduce the type size automatically to prevent clipping.</p>
        )}

        <Button size="lg" onClick={exportPng} disabled={exporting}>
          <Download size={18} /> {exporting ? "Creating PNG…" : "Download PNG"}
        </Button>
      </div>

      <div className={styles.previewWrap}>
        <div
          className={`${styles.preview} ${ratioClass} ${align === "center" ? styles.center : styles.left} ${font === "sans" ? styles.sans : styles.serif}`}
          style={{
            color: textColor,
            background: `linear-gradient(145deg, ${background}, ${secondary})`,
            fontSize: `${effectiveSize}em`,
          }}
        >
          <span className={styles.previewAccent} style={{ background: accentColor }} />
          {showMarks && <QuoteIcon className={styles.previewMark} aria-hidden="true" />}
          <blockquote>{quote.text}</blockquote>
          {showAuthor && <cite>— {quote.author}</cite>}
          {showBranding && <small>QuoteDrop · Words worth keeping.</small>}
        </div>
      </div>
    </div>
  );
};