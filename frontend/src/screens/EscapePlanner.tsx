import { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { motion, AnimatePresence } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

interface Category {
  name: string;
  icon: string;
  items: ChecklistItem[];
}

const STORAGE_KEY = 'escape-planner-checklist';

const defaultCategories: Category[] = [
  {
    name: 'Documents',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    items: [
      { id: 'doc-1', label: 'ID / Passport', checked: false },
      { id: 'doc-2', label: 'Birth certificate', checked: false },
      { id: 'doc-3', label: 'Social security card', checked: false },
      { id: 'doc-4', label: 'Marriage / divorce papers', checked: false },
      { id: 'doc-5', label: 'Protection / restraining order copies', checked: false },
      { id: 'doc-6', label: 'Lease / mortgage papers', checked: false },
      { id: 'doc-7', label: 'Insurance documents', checked: false },
      { id: 'doc-8', label: 'Children\'s school records', checked: false },
    ],
  },
  {
    name: 'Money',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    items: [
      { id: 'mon-1', label: 'Cash (emergency fund)', checked: false },
      { id: 'mon-2', label: 'Bank cards / checkbook', checked: false },
      { id: 'mon-3', label: 'Bank account numbers', checked: false },
      { id: 'mon-4', label: 'Credit cards in your name', checked: false },
    ],
  },
  {
    name: 'Clothing',
    icon: 'M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z',
    items: [
      { id: 'clo-1', label: 'Change of clothes for you', checked: false },
      { id: 'clo-2', label: 'Change of clothes for children', checked: false },
      { id: 'clo-3', label: 'Comfortable shoes', checked: false },
      { id: 'clo-4', label: 'Warm coat / jacket', checked: false },
    ],
  },
  {
    name: 'Contacts',
    icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z',
    items: [
      { id: 'con-1', label: 'Domestic violence hotline number', checked: false },
      { id: 'con-2', label: 'Trusted friend / family contacts', checked: false },
      { id: 'con-3', label: 'Shelter contact information', checked: false },
      { id: 'con-4', label: 'Lawyer / legal aid contact', checked: false },
      { id: 'con-5', label: 'Counselor / therapist number', checked: false },
    ],
  },
  {
    name: 'Medical',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    items: [
      { id: 'med-1', label: 'Prescription medications', checked: false },
      { id: 'med-2', label: 'Medical records', checked: false },
      { id: 'med-3', label: 'Health insurance cards', checked: false },
      { id: 'med-4', label: 'Children\'s vaccination records', checked: false },
      { id: 'med-5', label: 'First aid supplies', checked: false },
    ],
  },
];

function loadChecklist(): Category[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore parse errors */ }
  return defaultCategories;
}

function saveChecklist(categories: Category[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

// Fake recipe overlay for decoy mode
function RecipeDecoy({ onExit }: { onExit: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] overflow-auto bg-white p-8 text-gray-800"
    >
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-4 text-3xl font-bold text-gray-900">Classic Banana Bread</h1>
        <p className="mb-6 text-gray-600">Prep: 15 min | Cook: 60 min | Servings: 8</p>

        <div className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Ingredients</h2>
          <ul className="list-disc space-y-1 pl-5 text-gray-700">
            <li>3 ripe bananas, mashed</li>
            <li>1/3 cup melted butter</li>
            <li>3/4 cup sugar</li>
            <li>1 egg, beaten</li>
            <li>1 tsp vanilla extract</li>
            <li>1 tsp baking soda</li>
            <li>Pinch of salt</li>
            <li>1 1/2 cups all-purpose flour</li>
          </ul>
        </div>

        <div className="mb-8">
          <h2 className="mb-3 text-xl font-semibold">Instructions</h2>
          <ol className="list-decimal space-y-2 pl-5 text-gray-700">
            <li>Preheat oven to 350F (175C). Grease a 4x8 inch loaf pan.</li>
            <li>In a mixing bowl, mash the ripe bananas with a fork until smooth.</li>
            <li>Stir the melted butter into the mashed bananas.</li>
            <li>Mix in the baking soda and salt. Stir in the sugar, beaten egg, and vanilla extract.</li>
            <li>Mix in the flour until just combined. Do not overmix.</li>
            <li>Pour batter into prepared loaf pan. Bake for 60-65 minutes.</li>
            <li>Remove from oven. Let cool in pan for 10 minutes, then turn out onto a wire rack.</li>
          </ol>
        </div>

        <p className="mb-4 text-sm text-gray-500">Tip: For extra flavor, add 1/2 cup chocolate chips or walnuts.</p>

        {/* Hidden exit - triple tap on the period at the end */}
        <button
          onClick={onExit}
          className="mt-12 text-xs text-gray-300 hover:text-gray-400"
          aria-label="Exit recipe view"
        >
          Back to recipes
        </button>
      </div>
    </motion.div>
  );
}

export function EscapePlanner() {
  const [categories, setCategories] = useState<Category[]>(loadChecklist);
  const [decoyMode, setDecoyMode] = useState(false);

  useEffect(() => {
    saveChecklist(categories);
  }, [categories]);

  const toggleItem = useCallback((categoryIdx: number, itemId: string) => {
    setCategories((prev) =>
      prev.map((cat, i) =>
        i === categoryIdx
          ? {
              ...cat,
              items: cat.items.map((it) =>
                it.id === itemId ? { ...it, checked: !it.checked } : it
              ),
            }
          : cat
      )
    );
  }, []);

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const checkedItems = categories.reduce((sum, cat) => sum + cat.items.filter((it) => it.checked).length, 0);
  const progress = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

  return (
    <>
      <AnimatePresence>
        {decoyMode && <RecipeDecoy onExit={() => setDecoyMode(false)} />}
      </AnimatePresence>

      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Escape Planner</h1>
            <p className="text-[hsl(var(--muted-foreground))]">Prepare your safety essentials</p>
          </div>
          <Button variant="secondary" onClick={() => setDecoyMode(true)}>
            Decoy Mode
          </Button>
        </div>

        {/* Privacy banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
        >
          <div className="flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-sm font-medium text-green-700">
              This data never leaves your device. Everything is stored locally only.
            </p>
          </div>
        </motion.div>

        {/* Progress */}
        <Card className="mb-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Overall Progress</p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">{checkedItems} / {totalItems} items</p>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
              <motion.div
                className="h-full rounded-full bg-[hsl(var(--primary))]"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </Card>

        {/* Categories */}
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-4">
          {categories.map((category, catIdx) => {
            const catChecked = category.items.filter((it) => it.checked).length;
            return (
              <motion.div key={category.name} variants={item}>
                <Card>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--accent))]">
                      <svg className="h-5 w-5 text-[hsl(var(--accent-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={category.icon} />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">{catChecked} / {category.items.length} ready</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {category.items.map((checkItem) => (
                      <label
                        key={checkItem.id}
                        className="flex cursor-pointer items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[hsl(var(--muted))]"
                      >
                        <input
                          type="checkbox"
                          checked={checkItem.checked}
                          onChange={() => toggleItem(catIdx, checkItem.id)}
                          className="h-4 w-4 rounded border-[hsl(var(--input))] text-[hsl(var(--primary))] accent-[hsl(var(--primary))]"
                        />
                        <span className={`text-sm ${checkItem.checked ? 'text-[hsl(var(--muted-foreground))] line-through' : ''}`}>
                          {checkItem.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
