# Contact Form Component with Postmark Integration

This component provides a ready-to-use contact form that sends emails using the Postmark API.

## Setup

1. Install the required dependencies:
```bash
npm install postmark
```

2. Create a `.env.local` file in your project root with the following variables:
```
POSTMARK_API_TOKEN=your_postmark_api_token_here
FROM_EMAIL=your-verified-sender@example.com
TO_EMAIL=recipient@example.com
```

Note: You need to have a Postmark account and a verified sender signature for the FROM_EMAIL address.

## Usage

Import and use the ContactForm component in any of your pages:

```jsx
import ContactForm from '@/app/components/ContactForm';

export default function ContactPage() {
  return (
    <main className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <ContactForm />
    </main>
  );
}
```

## Features

- Form validation (client and server side)
- Success and error states
- Responsive design with Tailwind CSS
- Graceful handling when Postmark token is not configured

## API

The component handles form submission to the `/api/contact` endpoint, which processes the data and sends it via Postmark.

## Customization

You can customize the form styling by modifying the classes in the ContactForm component. 