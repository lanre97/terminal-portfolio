export const prerender = false;

import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const POST: APIRoute = async ({ request }) => {
  try {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    const message = formData.get('message')?.toString();

    if (!email || !message) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email and message are required' 
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    // Setup SendGrid
    const API_KEY = import.meta.env.PUBLIC_RESEND_API_KET;
    const resend = new Resend(API_KEY);
    
    // Create the email
    const msg = {
      to: import.meta.env.PUBLIC_CONTACT_EMAIL,
      from: import.meta.env.PUBLIC_FROM_EMAIL,
      subject: 'New contact from your portfolio website',
      text: `Message from: ${email}\n\n${message}`,
      html: `<p><strong>Message from:</strong> ${email}</p><p>${message.replace(/\n/g, '<br>')}</p>`,
      replyTo: email
    };
    
    await resend.emails.send(msg);
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error sending email:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}