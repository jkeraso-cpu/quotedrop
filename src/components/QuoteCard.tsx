import { Check, Copy, Heart, Maximize2 } from "lucide-react";
import { Button } from "./Button";
import { quoteData } from "../helpers/quoteData";
import styles from "./QuoteCard.module.css";

type Quote = (typeof quoteData)[number];

interface QuoteCardProps {
  quote: Quote;
  favorite: boolean;
  copied: boolean;
  variation?: number;
  onFavorite: (quote: Quote) => void;
  onCopy: (quote: Quote) => void;
  onOpen: (quote: Quote) => void;
}

export const QuoteCard = ({
  quote,
  favorite,
  copied,
  variation = 0,
  onFavorite,
  onCopy,
  onOpen,
}: QuoteCardProps) => (
  <article className={`${styles.card} ${styles[`variation${variation % 3}`]}`}>
    <div className={styles.topline}>
      <span>{quote.category}</span>
      <Button
        variant="ghost"
        size="icon-sm"
        className={favorite ? styles.favorite : ""}
        onClick={() => onFavorite(quote)}
        aria-label={favorite ? `Remove ${quote.author} quote from favorites` : `Save ${quote.author} quote to favorites`}
      >
        <Heart size={17} fill={favorite ? "currentColor" : "none"} />
      </Button>
    </div>

    <button className={styles.quoteButton} onClick={() => onOpen(quote)}>
      <blockquote>“{quote.text}”</blockquote>
      <cite>— {quote.author}</cite>
    </button>

    <div className={styles.footer}>
      <div className={styles.tags}>
        {quote.tags.slice(0, 2).map((tag) => <span key={tag}>#{tag}</span>)}
      </div>
      <div className={styles.actions}>
        <Button variant="ghost" size="icon-sm" onClick={() => onCopy(quote)} aria-label={`Copy quote by ${quote.author}`}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </Button>
        <Button variant="ghost" size="icon-sm" onClick={() => onOpen(quote)} aria-label={`Open quote by ${quote.author}`}>
          <Maximize2 size={16} />
        </Button>
      </div>
    </div>
  </article>
);