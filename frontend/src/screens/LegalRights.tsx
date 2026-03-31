import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { legalService, type LegalArticle } from '../services/legal.service';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { key: 'workplace_harassment', label: 'Workplace Harassment' },
  { key: 'maternity_leave', label: 'Maternity Leave' },
  { key: 'divorce', label: 'Divorce' },
  { key: 'domestic_violence', label: 'Domestic Violence' },
];

const countries = ['United States', 'United Kingdom', 'India', 'Canada', 'Australia', 'Germany', 'France', 'Brazil', 'Nigeria', 'South Africa'];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function LegalRights() {
  const { user } = useAuth();
  const [country, setCountry] = useState(user?.country || 'United States');
  const [activeCategory, setActiveCategory] = useState(categories[0].key);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showDivorce, setShowDivorce] = useState(false);

  const { data: articles, isLoading } = useQuery({
    queryKey: ['legal', 'content', country, activeCategory],
    queryFn: () => legalService.getContent(country, activeCategory),
    staleTime: 10 * 60 * 1000,
  });

  const { data: searchResults } = useQuery({
    queryKey: ['legal', 'search', searchQuery, country],
    queryFn: () => legalService.search(searchQuery, country),
    enabled: searchQuery.length >= 3,
    staleTime: 5 * 60 * 1000,
  });

  const { data: divorceRules } = useQuery({
    queryKey: ['legal', 'divorce-rules', country],
    queryFn: () => legalService.getDivorceRules(country),
    enabled: showDivorce,
    staleTime: 10 * 60 * 1000,
  });

  const displayArticles = searchQuery.length >= 3 ? searchResults : articles;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Legal Rights</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Know your rights and legal protections</p>
      </div>

      {/* Country selector and search */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm"
          >
            {countries.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <Input
            label="Search legal content"
            placeholder="Search articles, laws, rights..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Category tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => { setActiveCategory(cat.key); setSearchQuery(''); }}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === cat.key
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
            }`}
          >
            {cat.label}
          </button>
        ))}
        <button
          onClick={() => setShowDivorce(!showDivorce)}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            showDivorce
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
          }`}
        >
          Divorce Rules
        </button>
      </div>

      {/* Divorce Rules Section */}
      <AnimatePresence>
        {showDivorce && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <Card title={`Divorce Rules - ${country}`}>
              {divorceRules && divorceRules.length > 0 ? (
                <div className="space-y-4">
                  {divorceRules.map((rule) => (
                    <div key={rule.id} className="border-b border-[hsl(var(--border))] pb-4 last:border-0 last:pb-0">
                      <h4 className="font-medium">{rule.title}</h4>
                      <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{rule.content}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                          Waiting: {rule.waitingPeriod}
                        </span>
                        {rule.grounds.map((g) => (
                          <span key={g} className="rounded-full bg-[hsl(var(--muted))] px-2 py-0.5 text-xs">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">Loading divorce rules...</p>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Articles list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {displayArticles?.map((article: LegalArticle) => (
            <motion.div key={article.id} variants={item}>
              <Card className="cursor-pointer" onClick={() => toggleExpand(article.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{article.title}</h3>
                      <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                        {article.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{article.summary}</p>
                  </div>
                  <svg
                    className={`h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))] transition-transform ${expandedId === article.id ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                <AnimatePresence>
                  {expandedId === article.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-4 border-t border-[hsl(var(--border))] pt-4 text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                        {article.content}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          ))}
          {displayArticles?.length === 0 && (
            <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No articles found</p>
          )}
        </motion.div>
      )}
    </div>
  );
}
