import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mentorService, type MentorProfile, type MentorMatch } from '../services/community.service';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const popularTags = ['survived_ivf', 'left_abuse', 'single_parent', 'career_change', 'postpartum', 'divorce_survivor', 'entrepreneur', 'tech_leader', 'immigrant', 'disability_advocate'];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function MentorHub() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'find' | 'become' | 'messages'>('find');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  // Profile creation
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileForm, setProfileForm] = useState({ bio: '', tags: [] as string[] });

  const createProfile = useMutation({
    mutationFn: mentorService.createProfile,
    onSuccess: () => {
      setShowProfileForm(false);
      setProfileForm({ bio: '', tags: [] });
    },
  });

  // Search
  const { data: mentors, isLoading: searchLoading } = useQuery({
    queryKey: ['mentors', 'search', selectedTags],
    queryFn: () => mentorService.search(selectedTags.length > 0 ? selectedTags : undefined),
    enabled: activeTab === 'find',
    staleTime: 5 * 60 * 1000,
  });

  // Match
  const requestMatch = useMutation({
    mutationFn: mentorService.requestMatch,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentors'] }); },
  });

  const respondMatch = useMutation({
    mutationFn: ({ matchId, status }: { matchId: string; status: 'accepted' | 'rejected' }) =>
      mentorService.respondMatch(matchId, status),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['mentors'] }); },
  });

  // Messages
  const { data: messages, refetch: refetchMessages } = useQuery({
    queryKey: ['mentors', 'messages', activeMatchId],
    queryFn: () => mentorService.getMessages(activeMatchId!),
    enabled: !!activeMatchId,
    refetchInterval: 10000,
  });

  const sendMessage = useMutation({
    mutationFn: ({ matchId, content }: { matchId: string; content: string }) =>
      mentorService.sendMessage(matchId, content),
    onSuccess: () => {
      setMessageInput('');
      refetchMessages();
    },
  });

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const toggleProfileTag = (tag: string) => {
    setProfileForm((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
    }));
  };

  const tabs = [
    { key: 'find' as const, label: 'Find a Mentor' },
    { key: 'become' as const, label: 'Become a Mentor' },
    { key: 'messages' as const, label: 'Messages' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mentor Hub</h1>
        <p className="text-[hsl(var(--muted-foreground))]">Connect with mentors who understand your journey</p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Find Mentors */}
      {activeTab === 'find' && (
        <div>
          <Card title="Search by Experience" className="mb-6">
            <div className="flex flex-wrap gap-2">
              {popularTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                  }`}
                >
                  {tag.replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </Card>

          {searchLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
            </div>
          ) : (
            <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
              {mentors?.map((mentor: MentorProfile) => (
                <motion.div key={mentor.id} variants={item}>
                  <Card>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{mentor.name}</h3>
                        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{mentor.bio}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {mentor.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                              {tag.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={() => requestMatch.mutate(mentor.id)}
                        isLoading={requestMatch.isPending}
                        className="shrink-0"
                      >
                        Request Match
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ))}
              {mentors?.length === 0 && (
                <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No mentors found. Try different tags.</p>
              )}
            </motion.div>
          )}
        </div>
      )}

      {/* Become a Mentor */}
      {activeTab === 'become' && (
        <div>
          <Card title="Create Your Mentor Profile">
            <p className="mb-4 text-sm text-[hsl(var(--muted-foreground))]">
              Share your experiences to help others on similar journeys.
            </p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Your Bio</label>
                <textarea
                  value={profileForm.bio}
                  onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                  placeholder="Tell mentees about your background and what you can help with..."
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium">Experience Tags</label>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleProfileTag(tag)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        profileForm.tags.includes(tag)
                          ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                          : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--accent))]'
                      }`}
                    >
                      {tag.replace(/_/g, ' ')}
                    </button>
                  ))}
                </div>
              </div>
              <Button
                onClick={() => createProfile.mutate(profileForm)}
                isLoading={createProfile.isPending}
                disabled={!profileForm.bio || profileForm.tags.length === 0}
              >
                Create Profile
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Messages */}
      {activeTab === 'messages' && (
        <div>
          {!activeMatchId ? (
            <Card>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                Select a matched mentor or mentee to start messaging. Your matches will appear here once accepted.
              </p>
            </Card>
          ) : (
            <Card title="Conversation">
              <div className="mb-4 h-64 space-y-2 overflow-y-auto rounded-lg bg-[hsl(var(--muted))] p-3">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`max-w-[75%] rounded-lg p-2.5 text-sm ${
                      msg.senderId === user?.id
                        ? 'ml-auto bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                        : 'bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))]'
                    }`}
                  >
                    <p>{msg.content}</p>
                    <p className="mt-1 text-xs opacity-60">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                ))}
                {(!messages || messages.length === 0) && (
                  <p className="py-8 text-center text-sm text-[hsl(var(--muted-foreground))]">No messages yet. Start the conversation.</p>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && messageInput.trim() && activeMatchId) {
                      sendMessage.mutate({ matchId: activeMatchId, content: messageInput.trim() });
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-[hsl(var(--ring))] focus:ring-2 focus:ring-[hsl(var(--ring))]/20"
                />
                <Button
                  onClick={() => {
                    if (messageInput.trim() && activeMatchId) {
                      sendMessage.mutate({ matchId: activeMatchId, content: messageInput.trim() });
                    }
                  }}
                  isLoading={sendMessage.isPending}
                  disabled={!messageInput.trim()}
                >
                  Send
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
