
'use server';
/**
 * @fileOverview A flow for handling user feedback submissions.
 * 
 * - submitFeedback - Saves feedback to Firestore and sends an email notification.
 * - FeedbackInput - The input type for the submitFeedback function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { saveFeedback, sendEmail } from '@/lib/firestore';

const ADMIN_EMAIL = 'cristianmupe2021@gmail.com';

const FeedbackInputSchema = z.object({
  rating: z.number().min(1).max(5).describe('The star rating from 1 to 5.'),
  comment: z.string().optional().describe('The user\'s written feedback.'),
  userEmail: z.string().email().describe('The email of the user submitting feedback.'),
});
export type FeedbackInput = z.infer<typeof FeedbackInputSchema>;

export async function submitFeedback(input: FeedbackInput): Promise<void> {
  await sendFeedbackFlow(input);
}

const sendFeedbackFlow = ai.defineFlow(
  {
    name: 'sendFeedbackFlow',
    inputSchema: FeedbackInputSchema,
    outputSchema: z.void(),
  },
  async (input) => {
    // Save the feedback to the database first
    await saveFeedback({
        ...input,
        createdAt: new Date(),
    });

    // Then, send an email notification to the admin
    const subject = `New App Feedback: ${'★'.repeat(input.rating)}${'☆'.repeat(5 - input.rating)}`;
    const htmlBody = `
      <h1>New Application Feedback</h1>
      <p><strong>From:</strong> ${input.userEmail}</p>
      <p><strong>Rating:</strong> ${input.rating} out of 5 stars</p>
      <p><strong>Comment:</strong></p>
      <p>${input.comment || 'No comment provided.'}</p>
    `;

    await sendEmail(ADMIN_EMAIL, subject, htmlBody);
  }
);
