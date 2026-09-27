import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCalendarDays, FaLocationDot, FaMagnifyingGlass } from 'react-icons/fa6';
import api from '../utils/axios';

const formatDate = (date) => new Intl.DateTimeFormat('en-IN', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
}).format(new Date(date));

const Home = () => {
    const [events, setEvents] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const delay = setTimeout(async () => {
            setLoading(true);
            try {
                const { data } = await api.get('/events', { params: { search }, signal: controller.signal });
                setEvents(data);
                setError('');
            } catch (err) {
                if (err.code !== 'ERR_CANCELED') setError('Events could not be loaded. Check that the API is running.');
            } finally {
                if (!controller.signal.aborted) setLoading(false);
            }
        }, 250);
        return () => {
            controller.abort();
            clearTimeout(delay);
        };
    }, [search]);

    return (
        <>
            <section className="home-hero" aria-labelledby="discover-heading">
                <div className="home-hero__content">
                    <div className="eyebrow">Jodhpur, Rajasthan</div>
                    <h1 id="discover-heading">Find a plan worth leaving home for.</h1>
                    <p>Music under the open sky, founder conversations, regional food, and more. Your next gathering is already on the calendar.</p>
                    <label className="searchbar" aria-label="Search events">
                        <FaMagnifyingGlass aria-hidden="true" />
                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search events, categories, or ideas"
                        />
                    </label>
                </div>
            </section>

            <section aria-labelledby="events-heading">
                <div className="section-heading">
                    <div>
                        <div className="eyebrow">What is on</div>
                        <h2 id="events-heading">{search ? 'Matching events' : 'Upcoming in Jodhpur'}</h2>
                    </div>
                    {!loading && <p>{events.length} event{events.length === 1 ? '' : 's'} available</p>}
                </div>

                {error && <div role="alert" className="notice notice--error">{error}</div>}
                {loading ? (
                    <div className="event-grid" aria-label="Loading events">
                        {[1, 2, 3].map((item) => <div className="event-card animate-pulse" key={item}><div className="event-card__image bg-gray-200" /><div className="event-card__body"><div className="h-4 w-20 bg-gray-200 rounded mb-4" /><div className="h-6 w-3/4 bg-gray-200 rounded" /></div></div>)}
                    </div>
                ) : events.length ? (
                    <div className="event-grid">
                        {events.map((event) => (
                            <article className="event-card" key={event._id}>
                                {event.image ? <img className="event-card__image" src={event.image} alt="" /> : <div className="event-card__image" />}
                                <div className="event-card__body">
                                    <span className="event-card__tag">{event.category}</span>
                                    <h3>{event.title}</h3>
                                    <div className="event-card__meta">
                                        <span><FaCalendarDays aria-hidden="true" /> {formatDate(event.date)}</span>
                                        <span><FaLocationDot aria-hidden="true" /> {event.location}</span>
                                    </div>
                                    <div className="event-card__footer">
                                        <span className="event-card__price">{event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}</span>
                                        <Link className="text-link" to={`/events/${event._id}`}>View event <FaArrowRight aria-hidden="true" /></Link>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                ) : (
                    <div className="empty-state">No events match that search. Try a different word.</div>
                )}
            </section>
        </>
    );
};

export default Home;
