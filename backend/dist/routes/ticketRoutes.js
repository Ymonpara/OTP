"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const memoryStore_js_1 = require("../store/memoryStore.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
exports.ticketRouter = (0, express_1.Router)();
const createTicketSchema = zod_1.z.object({
    subject: zod_1.z.string().min(3, 'Subject must be at least 3 characters'),
    category: zod_1.z.enum([
        'Wallet & Recharge',
        'OTP Delivery',
        'Order Refund',
        'API Integration',
        'Other',
    ]),
    message: zod_1.z.string().min(5, 'Message must be at least 5 characters'),
});
const replyTicketSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message cannot be empty'),
});
exports.ticketRouter.use(auth_js_1.authenticate);
exports.ticketRouter.get('/', (req, res) => {
    const userId = req.user.id;
    const tickets = Array.from(memoryStore_js_1.memoryStore.tickets.values())
        .filter((t) => t.userId === userId || req.user.role === 'admin' || req.user.role === 'superadmin')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({
        success: true,
        data: { tickets },
    });
});
exports.ticketRouter.post('/', (0, validate_js_1.validate)(createTicketSchema), (req, res) => {
    const userId = req.user.id;
    const { subject, category, message } = req.body;
    const ticket = {
        id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
        userId,
        subject,
        category: category,
        message,
        status: 'open',
        priority: 'medium',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        replies: [],
    };
    memoryStore_js_1.memoryStore.tickets.set(ticket.id, ticket);
    res.status(201).json({
        success: true,
        message: 'Support ticket submitted successfully',
        data: { ticket },
    });
});
exports.ticketRouter.post('/:id/reply', (0, validate_js_1.validate)(replyTicketSchema), (req, res) => {
    const ticket = memoryStore_js_1.memoryStore.tickets.get(req.params.id);
    if (!ticket) {
        res.status(404).json({ success: false, error: 'Ticket not found' });
        return;
    }
    const { message } = req.body;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'superadmin';
    ticket.replies.push({
        id: `REP-${(0, uuid_1.v4)().slice(0, 8)}`,
        sender: isAdmin ? 'admin' : 'user',
        senderName: req.user.name,
        message,
        createdAt: new Date().toISOString(),
    });
    ticket.updatedAt = new Date().toISOString();
    res.json({
        success: true,
        message: 'Reply posted',
        data: { ticket },
    });
});
