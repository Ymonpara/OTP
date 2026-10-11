import { Router, Response } from 'express';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { memoryStore } from '../store/memoryStore.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { SupportTicket, TicketCategory } from '../types/index.js';

export const ticketRouter = Router();

const createTicketSchema = z.object({
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  category: z.enum([
    'Wallet & Recharge',
    'OTP Delivery',
    'Order Refund',
    'API Integration',
    'Other',
  ]),
  message: z.string().min(5, 'Message must be at least 5 characters'),
});

const replyTicketSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

ticketRouter.use(authenticate);

ticketRouter.get('/', (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const tickets = Array.from(memoryStore.tickets.values())
    .filter((t) => t.userId === userId || req.user!.role === 'admin' || req.user!.role === 'superadmin')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  res.json({
    success: true,
    data: { tickets },
  });
});

ticketRouter.post('/', validate(createTicketSchema), (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const { subject, category, message } = req.body;

  const ticket: SupportTicket = {
    id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
    userId,
    subject,
    category: category as TicketCategory,
    message,
    status: 'open',
    priority: 'medium',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    replies: [],
  };

  memoryStore.tickets.set(ticket.id, ticket);

  res.status(201).json({
    success: true,
    message: 'Support ticket submitted successfully',
    data: { ticket },
  });
});

ticketRouter.post('/:id/reply', validate(replyTicketSchema), (req: AuthenticatedRequest, res: Response) => {
  const ticket = memoryStore.tickets.get(req.params.id as string);
  if (!ticket) {
    res.status(404).json({ success: false, error: 'Ticket not found' });
    return;
  }

  const { message } = req.body;
  const isAdmin = req.user!.role === 'admin' || req.user!.role === 'superadmin';

  ticket.replies.push({
    id: `REP-${uuidv4().slice(0, 8)}`,
    sender: isAdmin ? 'admin' : 'user',
    senderName: req.user!.name,
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
