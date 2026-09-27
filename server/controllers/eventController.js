const Event = require('../models/Events');

exports.getEvents = async (req, res, next) => {
    try {
        const filters = {};
        if (req.query.category) filters.category = req.query.category;
        if (req.query.search) filters.title = { $regex: req.query.search, $options: 'i' };

        const events = await Event.find(filters).populate('createdBy', 'name email');
        res.json(events);
    } catch (error) {
        next(error);
    }
};

exports.getEventById = async (req, res, next) => {
    try {
        const event = await Event.findById(req.params.id).populate('createdBy', 'name email');
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        next(error);
    }
};

exports.createEvent = async (req, res, next) => {
    try {
        const { title, description, date, location, category, totalSeats, ticketPrice, image } = req.body;
        if (!title?.trim() || !description?.trim() || !location?.trim() || !category?.trim() || !date) {
            return res.status(400).json({ message: 'Complete all required event details' });
        }
        const seats = Number(totalSeats);
        const price = Number(ticketPrice || 0);
        if (!Number.isInteger(seats) || seats < 1 || Number.isNaN(price) || price < 0) {
            return res.status(400).json({ message: 'Seats must be at least one and ticket price cannot be negative' });
        }
        const event = await Event.create({
            title: title.trim(),
            description: description.trim(),
            date,
            location: location.trim(),
            category: category.trim(),
            totalSeats: seats,
            availableSeats: seats,
            ticketPrice: price,
            image: image || '',
            createdBy: req.user.id
        });
        res.status(201).json(event);
    } catch (error) {
        next(error);
    }
};

exports.updateEvent = async (req, res, next) => {
    try {
        const event = await Event.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json(event);
    } catch (error) {
        next(error);
    }
};

exports.deleteEvent = async (req, res, next) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        next(error);
    }
};
