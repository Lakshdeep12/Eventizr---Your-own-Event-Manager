const Booking = require('../models/Booking');
const Event = require('../models/Events');
const OTP = require('../models/otp');
const { sendBookingEmail, sendOTPEmail } = require('../utils/email');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const confirmBookingAndReserveSeat = async (booking, paymentStatus = 'paid') => {
    if (booking.status === 'confirmed') {
        return { error: 'Booking is already confirmed', statusCode: 400 };
    }

    const event = await Event.findOneAndUpdate(
        { _id: booking.eventId, availableSeats: { $gt: 0 } },
        { $inc: { availableSeats: -1 } },
        { new: true }
    );
    if (!event) {
        return { error: 'No seats available to confirm this booking', statusCode: 400 };
    }

    booking.status = 'confirmed';
    booking.paymentStatus = paymentStatus;
    await booking.save();
    return { booking, event };
};

exports.sendBookingOTP = async (req, res, next) => {
    try {
        const otp = generateOTP();
        await OTP.findOneAndDelete({ email: req.user.email, action: 'event_booking' });
        await OTP.create({ email: req.user.email, otp, action: 'event_booking' });
        const delivery = await sendOTPEmail(req.user.email, otp, 'event_booking');
        res.json({
            message: 'OTP sent successfully',
            otpDelivery: delivery.delivery,
            ...(process.env.NODE_ENV !== 'production' && delivery.delivery !== 'email' && { developmentOtp: otp })
        });
    } catch (error) {
        next(error);
    }
};

exports.bookEvent = async (req, res, next) => {
    try {
        const { eventId } = req.body;
        const otp = req.body.otp?.trim();
        if (!eventId || !otp) {
            return res.status(400).json({ message: 'Event and OTP are required' });
        }

        // Verify OTP explicitly before proceeding
        const validOTP = await OTP.findOne({ email: req.user.email, otp, action: 'event_booking' });
        if (!validOTP) {
            return res.status(400).json({ message: 'Invalid or expired OTP for booking' });
        }

        const event = await Event.findById(eventId);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        if (event.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

        const existingBooking = await Booking.findOne({ userId: req.user.id, eventId });
        if (existingBooking && existingBooking.status !== 'cancelled') {
            return res.status(400).json({ message: 'Already booked or pending' });
        }

        const booking = await Booking.create({
            userId: req.user.id,
            eventId,
            status: 'pending',
            paymentStatus: 'not_paid',
            amount: event.ticketPrice
        });

        await OTP.deleteOne({ _id: validOTP._id }); // cleanup

        res.status(201).json({ message: 'Booking created. Complete payment to confirm your seat.', booking });
    } catch (error) {
        next(error);
    }
};

exports.confirmBooking = async (req, res, next) => {
    try {
        const { paymentStatus = 'paid' } = req.body;
        const booking = await Booking.findById(req.params.id).populate('userId').populate('eventId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });

        const result = await confirmBookingAndReserveSeat(booking, paymentStatus);
        if (result.error) return res.status(result.statusCode).json({ message: result.error });

        // Send email on admin confirmation
        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Booking confirmed successfully', booking: result.booking });
    } catch (error) {
        next(error);
    }
};

exports.processPayment = async (req, res, next) => {
    try {
        const { outcome } = req.body;
        if (!['success', 'failure'].includes(outcome)) {
            return res.status(400).json({ message: 'Payment outcome must be success or failure' });
        }

        const booking = await Booking.findById(req.params.id).populate('eventId').populate('userId');
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to pay for this booking' });
        }
        if (booking.status === 'cancelled') {
            return res.status(400).json({ message: 'Cancelled bookings cannot be paid' });
        }

        if (outcome === 'failure') {
            booking.paymentStatus = 'failed';
            await booking.save();
            return res.status(402).json({
                message: 'Payment could not be completed. You can retry from your dashboard.',
                booking,
            });
        }

        const result = await confirmBookingAndReserveSeat(booking, 'paid');
        if (result.error) return res.status(result.statusCode).json({ message: result.error });

        result.booking.paymentReference = `demo_${Date.now()}_${result.booking._id}`;
        await result.booking.save();
        await sendBookingEmail(booking.userId.email, booking.userId.name, booking.eventId.title);

        res.json({ message: 'Payment received and booking confirmed', booking: result.booking });
    } catch (error) {
        next(error);
    }
};

exports.getMyBookings = async (req, res, next) => {
    try {
        const bookings = req.user.role === 'admin'
            ? await Booking.find().populate('eventId').populate('userId', 'name email').sort({ createdAt: -1 })
            : await Booking.find({ userId: req.user.id }).populate('eventId').sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        next(error);
    }
};

exports.cancelBooking = async (req, res, next) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) return res.status(404).json({ message: 'Booking not found' });
        if (booking.userId.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }
        if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' });

        const wasConfirmed = booking.status === 'confirmed';

        booking.status = 'cancelled';
        await booking.save();

        // Only restore the seat if it was actually confirmed and deducted
        if (wasConfirmed) {
            const event = await Event.findById(booking.eventId);
            if (event) {
                event.availableSeats += 1;
                await event.save();
            }
        }

        res.json({ message: 'Booking cancelled successfully' });
    } catch (error) {
        next(error);
    }
};
