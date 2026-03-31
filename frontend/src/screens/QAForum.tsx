import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { questionService, type Question, type QuestionDetail } from '../services/community.service';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const categories = ['all', 'health', 'legal', 'career', 'safety'] as const;

const categoryColors: Record<string, string> = {
  health: 'bg-green-100 text-green-800',
  legal: 'bg-blue-100 text-blue-800',
  career: 'bg-purple-100 text-purple-800',
  safety: 'bg-red-100 text-red-800',
};

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function QAForum() {
  const qc = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [showAskForm, setShowAskForm] = useState(false);
  const [askForm, setAskForm] = useState({ title: '', body: '', category: 'health' });
  const [answerInput, setAnswerInput] = useState('');

  // Questions list
  const { data: questions, isLoading } = useQuery({
    queryKey: ['questions', activeCategory],
    queryFn: () => questionService.getAll(activeCategory === 'all' ? undefined : activeCategory),
    staleTime: 5 * 60 * 1000,
  });

  // Question detail
  const { data: questionDetail } = useQuery({
    queryKey: ['questions', selectedQuestionId],
    queryFn: () => questionService.getById(selectedQuestionId!),
    enabled: !!selectedQuestionId,
    staleTime: 2 * 60 * 1000,
  });

  const createQuestion = useMutation({
    mutationFn: questionService.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions'] });
      setShowAskForm(false);
      setAskForm({ title: '', body: '', category: 'health' });
    },
  });

  const addAnswer = useMutation({
    mutationFn: ({ questionId, body }: { questionId: string; body: string }) =>
      questionService.addAnswer(questionId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['questions', selectedQuestionId] });
      setAnswerInput('');
    },
  });

  const upvote = useMutation({
    mutationFn: ({ answerId, hasUpvoted }: { answerId: string; hasUpvoted: boolean }) =>
      hasUpvoted ? questionService.removeUpvote(answerId) : questionService.upvote(answerId),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['questions', selectedQuestionId] }); },
  });

  // Detail view
  if (selectedQuestionId && questionDetail) {
    return (
      <div>
        <button
          onClick={() => setSelectedQuestionId(null)}
          className="mb-4 flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to questions
        </button>

        <Card>
          <div className="flex items-start gap-2">
            <h2 className="text-xl font-bold">{questionDetail.title}</h2>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[questionDetail.category] || ''}`}>
              {questionDetail.category}
            </span>
          </div>
          <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">{questionDetail.body}</p>
          <p className="mt-2 text-xs text-[hsl(var(--muted-foreground))]">
            Asked by {questionDetail.authorName} on {new Date(questionDetail.createdAt).toLocaleDateString()}
          </p>
        </Card>

        <h3 className="mb-3 mt-6 text-lg font-semibold">
          {questionDetail.answers?.length || 0} Answers
        </h3>

        <AnimatePresence>
          <div className="space-y-3">
            {questionDetail.answers?.map((answer) => (
              <motion.div key={answer.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Card>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center gap-1">
                      <button
                        onClick={() => upvote.mutate({ answerId: answer.id, hasUpvoted: answer.hasUpvoted })}
                        className={`rounded p-1 transition-colors ${
                          answer.hasUpvoted
                            ? 'text-[hsl(var(--primary))]'
                            : 'text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))]'
                        }`}
                      >
                        <svg className="h-5 w-5" fill={answer.hasUpvoted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium">{answer.upvotes}</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">{answer.body}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">{answer.authorName}</span>
                        {answer.isExpert && (
                          <span className="rounded-full bg-[hsl(var(--primary))] px-2 py-0.5 text-xs font-medium text-[hsl(var(--primary-foreground))]">
                            Expert
                          </span>
                        )}
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                          {new Date(answer.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>

        {/* Answer form */}
        <Card className="mt-4">
          <h4 className="mb-2 font-medium">Your Answer</h4>
          <textarea
            value={answerInput}
            onChange={(e) => setAnswerInput(e.target.value)}
            rows={3}
            placeholder="Share your knowledge or experience..."
            className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
          />
          <div className="mt-2 flex justify-end">
            <Button
              onClick={() => addAnswer.mutate({ questionId: selectedQuestionId, body: answerInput })}
              isLoading={addAnswer.isPending}
              disabled={!answerInput.trim()}
            >
              Post Answer
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // List view
  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Q&A Forum</h1>
          <p className="text-[hsl(var(--muted-foreground))]">Ask questions, share knowledge, support each other</p>
        </div>
        <Button onClick={() => setShowAskForm(true)}>Ask Question</Button>
      </div>

      {/* Category filter */}
      <div className="mb-6 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeCategory === cat
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
        </div>
      ) : (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          {questions?.map((q: Question) => (
            <motion.div key={q.id} variants={item}>
              <Card className="cursor-pointer" onClick={() => setSelectedQuestionId(q.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{q.title}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${categoryColors[q.category] || ''}`}>
                        {q.category}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-[hsl(var(--muted-foreground))]">{q.body}</p>
                    <div className="mt-2 flex items-center gap-3 text-xs text-[hsl(var(--muted-foreground))]">
                      <span>{q.authorName}</span>
                      <span>{new Date(q.createdAt).toLocaleDateString()}</span>
                      <span>{q.answersCount} answers</span>
                    </div>
                  </div>
                  <svg className="h-5 w-5 shrink-0 text-[hsl(var(--muted-foreground))]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            </motion.div>
          ))}
          {questions?.length === 0 && (
            <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No questions yet. Be the first to ask!</p>
          )}
        </motion.div>
      )}

      <Modal isOpen={showAskForm} onClose={() => setShowAskForm(false)} title="Ask a Question">
        <div className="space-y-3">
          <Input label="Title" value={askForm.title} onChange={(e) => setAskForm({ ...askForm, title: e.target.value })} placeholder="What do you want to know?" required />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Details</label>
            <textarea
              value={askForm.body}
              onChange={(e) => setAskForm({ ...askForm, body: e.target.value })}
              rows={4}
              placeholder="Provide context and details..."
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Category</label>
            <select
              value={askForm.category}
              onChange={(e) => setAskForm({ ...askForm, category: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm"
            >
              <option value="health">Health</option>
              <option value="legal">Legal</option>
              <option value="career">Career</option>
              <option value="safety">Safety</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowAskForm(false)}>Cancel</Button>
            <Button onClick={() => createQuestion.mutate(askForm)} isLoading={createQuestion.isPending} disabled={!askForm.title || !askForm.body}>
              Post Question
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
