import { useState, useCallback } from 'react';
import { useSOSHistory, useTriggerSOS, useTrustedContacts, useCreateContact, useUpdateContact, useDeleteContact } from '../hooks/useSafetyData';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export function SOSButton() {
  const { data: history, isLoading: historyLoading } = useSOSHistory();
  const { data: contacts, isLoading: contactsLoading } = useTrustedContacts();
  const triggerSOS = useTriggerSOS();
  const createContact = useCreateContact();
  const updateContact = useUpdateContact();
  const deleteContact = useDeleteContact();

  const [sosResult, setSOSResult] = useState<{ contactsNotified: number } | null>(null);
  const [showContactForm, setShowContactForm] = useState(false);
  const [editingContact, setEditingContact] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', phone: '', email: '', relationship: '' });

  const handleSOS = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      const result = await triggerSOS.mutateAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });
      setSOSResult({ contactsNotified: result.contactsNotified });
    } catch {
      // If geolocation fails, send with 0,0 - server should handle
      const result = await triggerSOS.mutateAsync({ latitude: 0, longitude: 0 });
      setSOSResult({ contactsNotified: result.contactsNotified });
    }
  }, [triggerSOS]);

  const handleSaveContact = async () => {
    if (editingContact) {
      await updateContact.mutateAsync({ id: editingContact, data: contactForm });
    } else {
      await createContact.mutateAsync(contactForm);
    }
    setShowContactForm(false);
    setEditingContact(null);
    setContactForm({ name: '', phone: '', email: '', relationship: '' });
  };

  const handleEditContact = (contact: { id: string; name: string; phone: string; email?: string; relationship: string }) => {
    setEditingContact(contact.id);
    setContactForm({ name: contact.name, phone: contact.phone, email: contact.email || '', relationship: contact.relationship });
    setShowContactForm(true);
  };

  const handleCloseForm = () => {
    setShowContactForm(false);
    setEditingContact(null);
    setContactForm({ name: '', phone: '', email: '', relationship: '' });
  };

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">Emergency SOS</h1>
      <p className="mb-8 text-[hsl(var(--muted-foreground))]">Press the button to alert your trusted contacts</p>

      {/* SOS Button */}
      <div className="mb-8 flex justify-center">
        {sosResult ? (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex w-full max-w-md flex-col items-center rounded-2xl border-2 border-green-500 bg-green-500/10 p-10"
          >
            <svg className="mb-4 h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="mb-2 text-2xl font-bold text-green-500">SOS SENT</h2>
            <p className="mb-4 text-[hsl(var(--muted-foreground))]">
              {sosResult.contactsNotified} contact{sosResult.contactsNotified !== 1 ? 's' : ''} notified
            </p>
            <Button variant="secondary" onClick={() => setSOSResult(null)}>Dismiss</Button>
          </motion.div>
        ) : (
          <motion.button
            onClick={handleSOS}
            disabled={triggerSOS.isPending}
            whileTap={{ scale: 0.95 }}
            className="relative flex h-48 w-full max-w-md items-center justify-center rounded-2xl bg-[hsl(var(--destructive))] text-white shadow-lg disabled:opacity-70"
          >
            {/* Pulsing ring animation */}
            <motion.div
              className="absolute inset-0 rounded-2xl border-4 border-[hsl(var(--destructive))]"
              animate={{ scale: [1, 1.05, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="flex flex-col items-center gap-2">
              {triggerSOS.isPending ? (
                <svg className="h-12 w-12 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-3xl font-black tracking-wider">SOS</span>
              <span className="text-sm font-medium opacity-80">Tap to send emergency alert</span>
            </div>
          </motion.button>
        )}
      </div>

      <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
        {/* Trusted Contacts */}
        <motion.div variants={item}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Trusted Contacts</h2>
            <Button onClick={() => setShowContactForm(true)}>Add Contact</Button>
          </div>

          {contactsLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {contacts?.map((contact) => (
                  <motion.div key={contact.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Card>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{contact.name}</h3>
                            <span className="rounded-full bg-[hsl(var(--accent))] px-2 py-0.5 text-xs text-[hsl(var(--accent-foreground))]">
                              {contact.relationship}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{contact.phone}</p>
                          {contact.email && <p className="text-xs text-[hsl(var(--muted-foreground))]">{contact.email}</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="secondary" onClick={() => handleEditContact(contact)} className="text-xs px-2 py-1">
                            Edit
                          </Button>
                          <Button variant="danger" onClick={() => deleteContact.mutate(contact.id)} className="text-xs px-2 py-1">
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
                {contacts?.length === 0 && (
                  <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">
                    No trusted contacts yet. Add contacts to receive SOS alerts.
                  </p>
                )}
              </div>
            </AnimatePresence>
          )}
        </motion.div>

        {/* SOS History */}
        <motion.div variants={item}>
          <h2 className="mb-4 text-xl font-semibold">SOS History</h2>
          {historyLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => <div key={i} className="h-16 animate-pulse rounded-xl bg-[hsl(var(--muted))]" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {history?.map((alert) => (
                <Card key={alert.id}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">
                        SOS Alert - {alert.contactsNotified} contact{alert.contactsNotified !== 1 ? 's' : ''} notified
                      </p>
                      <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {new Date(alert.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      alert.status === 'resolved'
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-[hsl(var(--destructive))]/10 text-[hsl(var(--destructive))]'
                    }`}>
                      {alert.status}
                    </span>
                  </div>
                </Card>
              ))}
              {history?.length === 0 && <p className="py-8 text-center text-[hsl(var(--muted-foreground))]">No SOS alerts sent</p>}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Add/Edit Contact Modal */}
      <Modal isOpen={showContactForm} onClose={handleCloseForm} title={editingContact ? 'Edit Contact' : 'Add Trusted Contact'}>
        <div className="space-y-3">
          <Input label="Name" value={contactForm.name} onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })} required />
          <Input label="Phone" type="tel" value={contactForm.phone} onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })} required />
          <Input label="Email" type="email" value={contactForm.email} onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })} />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Relationship</label>
            <select
              value={contactForm.relationship}
              onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
              className="w-full rounded-lg border border-[hsl(var(--input))] bg-transparent px-3 py-2.5 text-sm"
            >
              <option value="">Select...</option>
              <option value="partner">Partner</option>
              <option value="parent">Parent</option>
              <option value="sibling">Sibling</option>
              <option value="friend">Friend</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={handleCloseForm}>Cancel</Button>
            <Button onClick={handleSaveContact} isLoading={createContact.isPending || updateContact.isPending}>
              {editingContact ? 'Update' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
