import type { Command } from "./command";

export class ContactCommand implements Command {
  static name: string = 'contact';
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private flowState: {
    active: boolean;
    step: 'name' | 'email' | 'subject' | 'message' | 'confirm' | 'complete';
    data: {
      name: string;
      email: string;
      subject: string;
      message: string;
    }
  } = {
    active: false,
    step: 'name',
    data: {
      name: '',
      email: '',
      subject: '',
      message: ''
    }
  };
  
  process(args: string[]): string {
    // If this is the initial command with no flow active yet
    if (!this.flowState.active) {
      this.flowState = {
        active: true,
        step: 'name',
        data: {
          name: '',
          email: '',
          subject: '',
          message: ''
        }
      };
      
      return `
        <p>Starting contact form...</p>
        <p>Please enter your name. Leave it blank and press Enter if you don't want to provide one:</p>
        <p class="hint">To cancel at any time, type 'cancel'</p>
      `;
    }
    
    // Handle cancellation
    if (args[0]?.toLowerCase() === 'cancel') {
      this.resetFlow();
      return '<p>Contact form cancelled.</p>';
    }
    
    // Process current step
    return this.processStep(args.join(' '));
  }
  
  private processStep(input: string): string {
    switch (this.flowState.step) {
      case 'name':
        return this.handleNameStep(input);
      case 'email':
        return this.handleEmailStep(input);
      case 'subject':
        return this.handleSubjectStep(input);
      case 'message':
        return this.handleMessageStep(input);
      case 'confirm':
        return this.handleConfirmStep(input);
      case 'complete':
        this.resetFlow();
        return '<p>Contact process already completed. Type "contact" to start again.</p>';
      default:
        this.resetFlow();
        return '<p class="error">An error occurred. Please try again.</p>';
    }
  }
  
  private handleNameStep(input: string): string {
    this.flowState.data.name = input.trim();  // If the user presses Enter, this will be ''

    this.flowState.step = 'email';
    return '<p>Please enter your email (required):</p>';
  }
  
  private handleEmailStep(input: string): string {
    if (!this.emailRegex.test(input)) {
      return '<p class="error">Please provide a valid email address:</p>';
    }
    
    this.flowState.data.email = input.trim();
    this.flowState.step = 'subject';
    return '<p>Please enter a subject. Leave it blank and press Enter if you don’t need one:</p>';
  }
  
  private handleSubjectStep(input: string): string {
    this.flowState.data.subject = input.trim();

    this.flowState.step = 'message';
    return '<p>Please enter your message (required, multi-line supported):</p><p class="hint">Type "done" on a new line when finished.</p>';
  }
  
  private handleMessageStep(input: string): string {
    if (input.toLowerCase() === 'done' && this.flowState.data.message) {
      this.flowState.step = 'confirm';
      
      // Format the confirmation display
      let subject = this.flowState.data.subject || '(No subject)';
      let name = this.flowState.data.name || 'Anonymous';
      
      return `
        <p>Please review your message:</p>
        <div class="message-preview">
          <p><strong>From:</strong> ${name} (${this.flowState.data.email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Message:</strong></p>
          <pre>${this.flowState.data.message}</pre>
        </div>
        <p>Type "send" to confirm or "edit" to make changes:</p>
      `;
    }
    
    // Check if this is the first input or if it's continuing
    if (!this.flowState.data.message) {
      this.flowState.data.message = input;
    } else {
      // Append to existing message
      this.flowState.data.message += '\n' + input;
    }
    
    return '<p class="hint">Continue typing or type "done" on a new line when finished.</p>';
  }
  
  private handleConfirmStep(input: string): string {
    if (input.toLowerCase() === 'send') {
      return this.sendEmail();
    } else if (input.toLowerCase() === 'edit') {
      // Reset to message step to edit
      this.flowState.step = 'message';
      return '<p>Edit your message:</p><p class="hint">Type "done" on a new line when finished.</p>';
    } else {
      return '<p class="error">Please type "send" to confirm or "edit" to make changes:</p>';
    }
  }
  
  private sendEmail(): string {
    this.flowState.step = 'complete';
    
    // Create form data for the API
    const formData = new FormData();
    formData.append('name', this.flowState.data.name);
    formData.append('email', this.flowState.data.email);
    formData.append('subject', this.flowState.data.subject);
    formData.append('message', this.flowState.data.message);
    
    // Show loading message
    const loadingElement = document.createElement('div');
    loadingElement.className = 'loading-indicator';
    loadingElement.innerHTML = 'Sending message...';
    document.getElementById('command-history')?.appendChild(loadingElement);
    
    // Send the email using the Astro API endpoint
    fetch('/api/send-email', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json())
    .then(data => {
      loadingElement.remove();
      const resultElement = document.createElement('div');
      
      if (data.success) {
        resultElement.innerHTML = '<p class="success">Your message has been sent successfully! I will get back to you soon.</p>';
      } else {
        resultElement.innerHTML = `<p class="error">Failed to send message: ${data.error || 'Unknown error'}</p>`;
      }
      
      document.getElementById('command-history')?.appendChild(resultElement);
      // Reset the flow for future use
      this.resetFlow();
    })
    .catch(error => {
      loadingElement.remove();
      const resultElement = document.createElement('div');
      resultElement.innerHTML = `<p class="error">An error occurred: ${error.message}</p>`;
      document.getElementById('command-history')?.appendChild(resultElement);
      this.resetFlow();
    });
    
    return '<p>Processing your request...</p>';
  }
  
  private resetFlow(): void {
    this.flowState = {
      active: false,
      step: 'name',
      data: {
        name: '',
        email: '',
        subject: '',
        message: ''
      }
    };
  }
}
