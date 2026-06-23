import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useEvents } from '../hooks/useEvents';
import { Button } from '../components/common/ui';
import CalendarView from '../components/calendar/CalendarView';
import EventModal from '../components/calendar/EventModal';

export default function CalendarPage() {
  const { data: events = [] } = useEvents();
  const [editingEvent, setEditingEvent] = useState(null);
  const [creatingAt, setCreatingAt] = useState(null);

  return (
    <div className="flex h-full flex-col px-6 py-5">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="font-display text-ink-100 text-2xl">Calendar</h1>
        <Button onClick={() => setCreatingAt(new Date())}>
          <Plus size={14} /> New event
        </Button>
      </div>

      <CalendarView
        events={events}
        onSlotClick={setCreatingAt}
        onEventClick={setEditingEvent}
      />

      {creatingAt && (
        <EventModal
          defaultStart={creatingAt}
          onClose={() => setCreatingAt(null)}
        />
      )}
      {editingEvent && (
        <EventModal
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
        />
      )}
    </div>
  );
}
