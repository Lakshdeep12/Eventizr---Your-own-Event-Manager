import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { FaCalendarDays, FaChair, FaCircleCheck, FaLocationDot, FaMoneyBillWave } from 'react-icons/fa6';
import { AuthContext } from '../context/authContext';
import api from '../utils/axios';

const EventDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const [event, setEvent] = useState(null);
    const [booking, setBooking] = useState(null);
    const [otp, setOtp] = useState('');
    const [showOtp, setShowOtp] = useState(false);
    const [developmentOtp, setDevelopmentOtp] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const loadEvent = async () => {
            try {
                const { data } = await api.get(`/events/${id}`);
                setEvent(data);
            } catch {
                setError('This event could not be found.');
            } finally {
                setLoading(false);
            }
        };
        loadEvent();
    }, [id]);

    const sendOtp = async () => {
        if (!user) return navigate('/login');
        setSubmitting(true);
        setError('');
        try {
            const { data } = await api.post('/booking/send-otp');
            setShowOtp(true);
            setDevelopmentOtp(data.developmentOtp || '');
            setMessage('Your verification code is ready. Enter it below to create your booking.');
        } catch (err) {
            setError(err.response?.data?.message || 'Could not send the verification code.');
        } finally {
            setSubmitting(false);
        }
    };

    const createBooking = async () => {
        setSubmitting(true);
        setError('');
        try {
            const { data } = await api.post('/booking', { eventId: event._id, otp });
            setBooking(data.booking);
            setShowOtp(false);
            setMessage('Booking created. Complete the sandbox payment below to reserve your seat.');
        } catch (err) {
            setError(err.response?.data?.message || 'Booking could not be created.');
        } finally {
            setSubmitting(false);
        }
    };

    const processPayment = async (outcome) => {
        setSubmitting(true);
        setError('');
        try {
            await api.post(`/booking/${booking._id}/payment`, { outcome });
            navigate('/payment-success');
        } catch (err) {
            if (outcome === 'failure' && err.response?.status === 402) {
                navigate('/payment-failed');
            } else {
                setError(err.response?.data?.message || 'Payment could not be processed.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="empty-state">Loading event details...</div>;
    if (!event) return <div className="empty-state">{error} <Link className="text-link" to="/">Back to events</Link></div>;
    const soldOut = event.availableSeats <= 0;

    return (
        <article className="max-w-5xl mx-auto bg-white border border-[#dbe3de] rounded-lg overflow-hidden">
            {event.image ? <img className="w-full h-72 md:h-[410px] object-cover" src={event.image} alt={event.title} /> : <div className="h-72 bg-[#dce9e4]" />}
            <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
                <section>
                    <span className="event-card__tag">{event.category}</span>
                    <h1 className="mt-4 mb-4 font-serif text-4xl md:text-5xl font-bold text-[#16201d]">{event.title}</h1>
                    <p className="text-[#52635e] text-lg leading-8 max-w-2xl">{event.description}</p>
                    <dl className="mt-8 grid sm:grid-cols-2 gap-5 text-sm">
                        <div className="flex gap-3"><FaCalendarDays className="mt-1 text-[#087d73]" aria-hidden="true" /><div><dt className="font-bold">Date and time</dt><dd className="text-[#52635e]">{new Date(event.date).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}</dd></div></div>
                        <div className="flex gap-3"><FaLocationDot className="mt-1 text-[#087d73]" aria-hidden="true" /><div><dt className="font-bold">Venue</dt><dd className="text-[#52635e]">{event.location}</dd></div></div>
                    </dl>
                </section>
                <aside className="bg-[#f5f8f6] border border-[#dbe3de] rounded-lg p-6 h-fit">
                    <div className="flex items-start justify-between gap-4 pb-5 border-b border-[#dbe3de]">
                        <div><p className="text-xs uppercase font-bold tracking-wide text-[#52635e]">Entry</p><p className="font-bold text-2xl">{event.ticketPrice === 0 ? 'Free' : `₹${event.ticketPrice}`}</p></div>
                        <div className="text-right"><p className="text-xs uppercase font-bold tracking-wide text-[#52635e]">Available</p><p className={`font-bold text-xl ${soldOut ? 'text-red-700' : 'text-[#087d73]'}`}>{event.availableSeats} seats</p></div>
                    </div>
                    {error && <p role="alert" className="notice notice--error">{error}</p>}
                    {message && <p className="notice notice--success">{message}</p>}
                    {developmentOtp && <p className="text-xs text-[#52635e] mb-3">Development code: <strong>{developmentOtp}</strong></p>}

                    {!booking && (
                        <>
                            {showOtp && <label className="block mb-4 text-sm font-bold">Verification code<input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" className="mt-2 w-full border border-[#a3b8b1] rounded-md px-3 py-3 tracking-[.25em]" placeholder="000000" /></label>}
                            <button onClick={showOtp ? createBooking : sendOtp} disabled={soldOut || submitting || (showOtp && otp.length !== 6)} className="w-full min-h-12 rounded-md bg-[#087d73] text-white font-bold px-4 hover:bg-[#065f57] disabled:bg-[#b7c5c0] disabled:text-[#52635e] transition-colors">
                                {submitting ? 'Working...' : soldOut ? 'Sold out' : showOtp ? 'Create booking' : user ? 'Register for this event' : 'Sign in to register'}
                            </button>
                        </>
                    )}
                    {booking && (
                        <div>
                            <p className="mt-5 text-sm font-bold text-[#16201d]">Sandbox payment</p>
                            <p className="mt-1 text-sm text-[#52635e]">Use either result to test the complete booking flow. No money is charged.</p>
                            <button onClick={() => processPayment('success')} disabled={submitting} className="mt-4 w-full min-h-12 rounded-md bg-[#087d73] text-white font-bold px-4 hover:bg-[#065f57] disabled:opacity-60">Complete payment</button>
                            <button onClick={() => processPayment('failure')} disabled={submitting} className="mt-2 w-full min-h-11 rounded-md border border-[#bd5a49] text-[#9d3024] font-bold px-4 hover:bg-[#fff0ed] disabled:opacity-60">Test payment failure</button>
                        </div>
                    )}
                    <div className="mt-5 pt-5 border-t border-[#dbe3de] flex gap-2 text-xs text-[#52635e]"><FaCircleCheck className="mt-0.5 text-[#087d73]" aria-hidden="true" /> Your seat is reserved only after a successful payment.</div>
                </aside>
            </div>
        </article>
    );
};

export default EventDetail;
