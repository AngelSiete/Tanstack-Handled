import LoadingIndicator from '../UI/LoadingIndicator.jsx';
import ErrorBlock from '../UI/ErrorBlock.jsx';
import EventItem from './EventItem.jsx';
import { fetchEvents } from '../../util/http.js';
import { useQuery } from '@tanstack/react-query';

export default function NewEventsSection() {
  const {data, isPending, error} = useQuery({
    queryKey: ['events'],
    queryFn: fetchEvents,
    staleTime: 5000,
    // gcTime: 30000
  });
  let content;

  if (isPending) {
    content = <LoadingIndicator />;
  }

  if (error) {
    content = (
      <ErrorBlock title="An error occurred" message={error.info?.message || 'Failed to fetch'}/>
    );
  }

  if (data) {
    content = (
      <ul className="events-list">
        {data.map((event) => (
          <li key={event.id}>
            <EventItem event={event} />
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="content-section" id="new-events-section">
      <header>
        <h2>Recently added events</h2>
      </header>
      {content}
    </section>
  );
}
