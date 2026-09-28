import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  Check,
  Clipboard,
  Compass,
  Copy,
  Crosshair,
  Heart,
  Lightbulb,
  Menu,
  Mountain,
  Palette,
  Quote as QuoteIcon,
  RefreshCw,
  Search,
  Share2,
  Shield,
  Shuffle,
  Smile,
  Sparkles,
  Sprout,
  Trophy,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/DropdownMenu";
import { Input } from "../components/Input";
import { QuoteCard } from "../components/QuoteCard";
import { QuoteCardCreator } from "../components/QuoteCardCreator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/Select";
import { ThemeModeSwitch } from "../components/ThemeModeSwitch";
import { quoteData } from "../helpers/quoteData";
import { quotePrefs } from "../helpers/quotePrefs";
import { quoteUtils } from "../helpers/quoteUtils";
import styles from "./_index.module.css";

type Quote = (typeof quoteData)[number];
type View = "discover" | "favorites";

const categories = [
  { name: "Growth", icon: Sprout, blurb: "Practice, progress, becoming." },
  { name: "Life", icon: Compass, blurb: "Perspective for the ordinary days." },
  { name: "Creativity", icon: Palette, blurb: "Ideas, making, imagination." },
  { name: "Courage", icon: Shield, blurb: "Words for moving with fear." },
  { name: "Wisdom", icon: Lightbulb, blurb: "Clarity, humility, discernment." },
  { name: "Friendship", icon: Users, blurb: "Belonging, care, connection." },
  { name: "Love", icon: Heart, blurb: "Affection in its quieter forms." },
  { name: "Focus", icon: Crosshair, blurb: "Attention for what matters." },
  { name: "Success", icon: Trophy, blurb: "Work, process, steady progress." },
  { name: "Resilience", icon: Mountain, blurb: "Recovery, endurance, beginning again." },
  { name: "Happiness", icon: Smile, blurb: "Joy, contentment, small delights." },
  { name: "Change", icon: RefreshCw, blurb: "Seasons, endings, new directions." },
] as const;

const getQuoteById = (id: string) => quoteData.find((quote) => quote.id === id);

export default function QuoteDropPage() {
  const [view, setView] = useState<View>("discover");
  const [featured, setFeatured] = useState<Quote>(() => quoteUtils.daily(new Date()) ?? quoteData[0]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(12);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [creatorQuote, setCreatorQuote] = useState<Quote | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [favoriteQuery, setFavoriteQuery] = useState("");
  const [favoriteCategory, setFavoriteCategory] = useState("All");
  const searchRef = useRef<HTMLInputElement>(null);
  const categoriesRef = useRef<HTMLElement>(null);
  const resultsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setFavorites(quotePrefs.loadFavorites());
    setRecentIds(quotePrefs.loadRecent());
  }, []);

  useEffect(() => {
    setVisibleCount(12);
  }, [query, selectedCategory]);

  const filteredQuotes = useMemo(() => {
    const searched = quoteUtils.search(query);
    return quoteUtils.filterByCategory(selectedCategory, searched);
  }, [query, selectedCategory]);

  const favoriteQuotes = useMemo(() => {
    const saved = quoteData.filter((quote) => favorites.includes(quote.id));
    const searched = quoteUtils.search(favoriteQuery, saved);
    return quoteUtils.filterByCategory(favoriteCategory, searched);
  }, [favorites, favoriteQuery, favoriteCategory]);

  const recentQuotes = useMemo(
    () => recentIds.map(getQuoteById).filter((quote): quote is Quote => Boolean(quote)).slice(0, 6),
    [recentIds],
  );

  const categoryCounts = useMemo(
    () =>
      Object.fromEntries(
        categories.map((category) => [
          category.name,
          quoteData.filter((quote) => quote.category === category.name).length,
        ]),
      ),
    [],
  );

  const rememberQuote = (quote: Quote) => {
    const next = quotePrefs.addRecent(quote.id);
    setRecentIds(next);
  };

  const openQuote = (quote: Quote) => {
    rememberQuote(quote);
    setSelectedQuote(quote);
  };

  const surpriseMe = () => {
    const next = quoteUtils.random(featured.id);
    if (!next) return;
    setFeatured(next);
    rememberQuote(next);
  };

  const toggleFavorite = (quote: Quote) => {
    setFavorites((current) => {
      const next = current.includes(quote.id)
        ? current.filter((id) => id !== quote.id)
        : [quote.id, ...current];
      quotePrefs.saveFavorites(next);
      toast.success(current.includes(quote.id) ? "Removed from saved words" : "Saved for another look");
      return next;
    });
  };

  const copyQuote = async (quote: Quote) => {
    try {
      await navigator.clipboard.writeText(quoteUtils.formatCopy(quote));
      setCopiedId(quote.id);
      toast.success("Copied");
      window.setTimeout(() => setCopiedId((current) => current === quote.id ? null : current), 1600);
    } catch {
      toast.error("Copy isn’t available in this browser.");
    }
  };

  const shareQuote = async (quote: Quote) => {
    const text = quoteUtils.formatCopy(quote);
    if (navigator.share) {
      try {
        await navigator.share({ title: "QuoteDrop", text });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      toast.success("Quote copied for sharing");
    } catch {
      toast.error("Copy isn’t available in this browser.");
    }
  };

  const browseCategory = (category: string) => {
    setView("discover");
    setSelectedCategory(category);
    window.setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const showCategories = () => {
    setView("discover");
    window.setTimeout(() => categoriesRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
  };

  const focusSearch = () => {
    setView("discover");
    window.setTimeout(() => searchRef.current?.focus(), 0);
  };

  const startCreator = (quote: Quote) => {
    setSelectedQuote(null);
    setCreatorQuote(quote);
  };

  return (
    <main className={styles.page}>      <header className={styles.header}>
        <div className={styles.headerInner}>
          <button className={styles.brand} onClick={() => setView("discover")} aria-label="QuoteDrop home">
            <span className={styles.brandMark}><QuoteIcon size={19} /></span>
            <span>
              <strong>QuoteDrop</strong>
              <small>Words worth keeping.</small>
            </span>
          </button>

          <nav className={styles.desktopNav} aria-label="Primary navigation">
            <button className={view === "discover" ? styles.navActive : ""} onClick={() => setView("discover")}>Discover</button>
            <button onClick={showCategories}>Categories</button>
            <button className={view === "favorites" ? styles.navActive : ""} onClick={() => setView("favorites")}>
              Favorites <span>{favorites.length}</span>
            </button>
          </nav>

          <div className={styles.headerActions}>
            <Button variant="ghost" size="icon-md" onClick={focusSearch} aria-label="Search quotes">
              <Search size={18} />
            </Button>
            <ThemeModeSwitch />
            <div className={styles.mobileMenu}>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-md" aria-label="Open navigation">
                    <Menu size={19} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setView("discover")}>Discover</DropdownMenuItem>
                  <DropdownMenuItem onClick={showCategories}>Categories</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setView("favorites")}>Favorites · {favorites.length}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {view === "discover" ? (
        <>
          <section className={styles.hero}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>A little something for today</p>
              <h1>Find words worth keeping.</h1>
              <p>Discover ideas, reflections, and reminders from voices across literature, philosophy, creativity, life, and more.</p>
              <div className={styles.heroActions}>
                <Button size="lg" onClick={surpriseMe}><Shuffle size={18} /> Discover a quote</Button>
                <Button size="lg" variant="outline" onClick={showCategories}>Browse categories</Button>
              </div>
            </div>

            <article className={styles.featured}>
              <div className={styles.featuredTop}>
                <span>Quote of the moment</span>
                <span className={styles.todayBadge}>Today’s quote</span>
              </div>
              <QuoteIcon className={styles.featuredMark} aria-hidden="true" />
              <blockquote key={featured.id} className={styles.quoteTransition}>“{featured.text}”</blockquote>
              <cite key={`${featured.id}-author`} className={styles.quoteTransition}>— {featured.author}</cite>
              <div className={styles.featuredBottom}>
                <span className={styles.categoryTag}>{featured.category}</span>
                <div className={styles.featuredActions}>
                  <Button
                    variant="ghost"
                    size="icon-md"
                    onClick={() => toggleFavorite(featured)}
                    aria-label={favorites.includes(featured.id) ? "Remove featured quote from favorites" : "Save featured quote"}
                  >
                    <Heart size={18} fill={favorites.includes(featured.id) ? "currentColor" : "none"} />
                  </Button>
                  <Button variant="ghost" size="icon-md" onClick={() => copyQuote(featured)} aria-label="Copy featured quote">
                    {copiedId === featured.id ? <Check size={18} /> : <Copy size={18} />}
                  </Button>
                  <Button variant="ghost" size="icon-md" onClick={() => shareQuote(featured)} aria-label="Share featured quote">
                    <Share2 size={18} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={surpriseMe}><Shuffle size={16} /> New quote</Button>
                </div>
              </div>
            </article>
          </section>

          <section className={styles.searchSection} aria-labelledby="search-heading">
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>Search the collection</p>
              <h2 id="search-heading">What kind of words are you looking for?</h2>
            </div>
            <div className={styles.searchBox}>
              <Search size={19} />
              <Input
                ref={searchRef}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search quotes, authors, or ideas..."
                aria-label="Search quotes, authors, or ideas"
              />
              {query && (
                <Button variant="ghost" size="icon-sm" onClick={() => setQuery("")} aria-label="Clear search">
                  <X size={16} />
                </Button>
              )}
            </div>
          </section>

          <section className={styles.categoriesSection} ref={categoriesRef} aria-labelledby="categories-heading">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>Browse by mood</p>
                <h2 id="categories-heading">A shelf for every kind of day.</h2>
              </div>
              <span>{quoteData.length} curated quotes</span>
            </div>
            <div className={styles.categoryGrid}>
              {categories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.name}
                    className={selectedCategory === category.name ? styles.categoryActive : ""}
                    onClick={() => browseCategory(category.name)}
                  >
                    <span className={styles.categoryIcon}><Icon size={19} /></span>
                    <strong>{category.name}</strong>
                    <small>{category.blurb}</small>
                    <em>{categoryCounts[category.name]} quotes</em>
                  </button>
                );
              })}
            </div>
          </section>

          <section className={styles.resultsSection} ref={resultsRef} aria-labelledby="results-heading">
            <div className={styles.sectionHeading}>
              <div>
                <p className={styles.kicker}>Discover</p>
                <h2 id="results-heading">
                  {query
                    ? `Results for “${query}”`
                    : selectedCategory === "All"
                      ? "A few words to wander through."
                      : `${selectedCategory} quotes`}
                </h2>
              </div>
              {(query || selectedCategory !== "All") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setQuery("");
                    setSelectedCategory("All");
                  }}
                >
                  Clear filters
                </Button>
              )}
            </div>

            {filteredQuotes.length > 0 ? (
              <>
                <div className={styles.quoteGrid}>
                  {filteredQuotes.slice(0, visibleCount).map((quote, index) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      favorite={favorites.includes(quote.id)}
                      copied={copiedId === quote.id}
                      variation={index}
                      onFavorite={toggleFavorite}
                      onCopy={copyQuote}
                      onOpen={openQuote}
                    />
                  ))}
                </div>
                {visibleCount < filteredQuotes.length && (
                  <div className={styles.moreWrap}>
                    <Button variant="outline" onClick={() => setVisibleCount((count) => count + 12)}>
                      Show more · {filteredQuotes.length - visibleCount} remaining
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className={styles.emptyState}>
                <Search size={26} />
                <h3>No matching words found.</h3>
                <p>Try searching for another author, phrase, or category.</p>
                <Button variant="outline" onClick={() => { setQuery(""); setSelectedCategory("All"); }}>Clear search</Button>
              </div>
            )}
          </section>

          {recentQuotes.length > 0 && (
            <section className={styles.recentSection}>
              <div className={styles.sectionHeading}>
                <div>
                  <p className={styles.kicker}>Recently explored</p>
                  <h2>Words you passed by.</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    quotePrefs.clearRecent();
                    setRecentIds([]);
                  }}
                >
                  Clear recent
                </Button>
              </div>
              <div className={styles.recentRail}>
                {recentQuotes.map((quote) => (
                  <button key={quote.id} onClick={() => openQuote(quote)}>
                    <span>“{quote.text}”</span>
                    <small>— {quote.author}</small>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className={styles.howSection}>
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>How QuoteDrop works</p>
              <h2>Find it. Keep it. Make it yours.</h2>
            </div>
            <div className={styles.howGrid}>
              <article><span>01</span><BookOpen size={22} /><h3>Discover</h3><p>Find words for where you are.</p></article>
              <article><span>02</span><Heart size={22} /><h3>Keep</h3><p>Save the quotes that stay with you.</p></article>
              <article><span>03</span><Sparkles size={22} /><h3>Share</h3><p>Turn them into beautiful cards or share them directly.</p></article>
            </div>
          </section>
        </>
      ) : (
        <section className={styles.favoritesView}>
          <div className={styles.favoritesHero}>
            <p className={styles.kicker}>Favorites</p>
            <h1>Your saved words</h1>
            <p>Quotes you decided were worth another look.</p>
          </div>

          {favorites.length > 0 ? (
            <>
              <div className={styles.favoriteFilters}>
                <div className={styles.searchBox}>
                  <Search size={18} />
                  <Input
                    value={favoriteQuery}
                    onChange={(event) => setFavoriteQuery(event.target.value)}
                    placeholder="Search your saved quotes..."
                    aria-label="Search favorite quotes"
                  />
                </div>
                <Select value={favoriteCategory} onValueChange={setFavoriteCategory}>
                  <SelectTrigger className={styles.favoriteSelect} aria-label="Filter favorites by category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.name} value={category.name}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {favoriteQuotes.length > 0 ? (
                <div className={styles.quoteGrid}>
                  {favoriteQuotes.map((quote, index) => (
                    <QuoteCard
                      key={quote.id}
                      quote={quote}
                      favorite
                      copied={copiedId === quote.id}
                      variation={index}
                      onFavorite={toggleFavorite}
                      onCopy={copyQuote}
                      onOpen={openQuote}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Search size={26} />
                  <h3>No matching saved words.</h3>
                  <p>Try a different phrase or category.</p>
                  <Button variant="outline" onClick={() => { setFavoriteQuery(""); setFavoriteCategory("All"); }}>Clear filters</Button>
                </div>
              )}
            </>
          ) : (
            <div className={styles.emptyFavorites}>
              <span><Heart size={28} /></span>
              <h2>Nothing saved yet</h2>
              <p>When something speaks to you, tap the heart and it’ll show up here.</p>
              <Button onClick={() => setView("discover")}>Discover quotes</Button>
            </div>
          )}
        </section>
      )}

      <footer className={styles.footer}>
        <div>
          <strong>QuoteDrop</strong>
          <span>Words worth keeping.</span>
        </div>
        <p>Save the ones that stay with you.</p>
      </footer>

      <Dialog open={Boolean(selectedQuote)} onOpenChange={(open) => !open && setSelectedQuote(null)}>
        <DialogContent className={styles.detailDialog}>
          {selectedQuote && (
            <>
              <DialogHeader>
                <DialogTitle className={styles.detailCategory}>{selectedQuote.category}</DialogTitle>
                <DialogDescription className={styles.detailTags}>
                  {selectedQuote.tags.map((tag) => <span key={tag}>#{tag}</span>)}
                </DialogDescription>
              </DialogHeader>
              <QuoteIcon className={styles.detailMark} aria-hidden="true" />
              <blockquote className={styles.detailQuote}>“{selectedQuote.text}”</blockquote>
              <cite className={styles.detailAuthor}>— {selectedQuote.author}</cite>
              <div className={styles.detailActions}>
                <Button
                  variant={favorites.includes(selectedQuote.id) ? "secondary" : "outline"}
                  onClick={() => toggleFavorite(selectedQuote)}
                >
                  <Heart size={17} fill={favorites.includes(selectedQuote.id) ? "currentColor" : "none"} />
                  {favorites.includes(selectedQuote.id) ? "Saved" : "Favorite"}
                </Button>
                <Button variant="outline" onClick={() => copyQuote(selectedQuote)}>
                  {copiedId === selectedQuote.id ? <Check size={17} /> : <Clipboard size={17} />}
                  {copiedId === selectedQuote.id ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" onClick={() => shareQuote(selectedQuote)}><Share2 size={17} /> Share</Button>
                <Button onClick={() => startCreator(selectedQuote)}><Sparkles size={17} /> Create card</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(creatorQuote)} onOpenChange={(open) => !open && setCreatorQuote(null)}>
        <DialogContent className={styles.creatorDialog}>
          <DialogHeader>
            <DialogTitle>Create quote card</DialogTitle>
            <DialogDescription>Turn a saved thought into something worth sharing.</DialogDescription>
          </DialogHeader>
          {creatorQuote && <QuoteCardCreator quote={creatorQuote} />}
        </DialogContent>
      </Dialog>
    </main>
  );
}