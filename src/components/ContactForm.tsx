"use client";

import { ValidationError, useForm } from "@formspree/react";

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID ?? "<your-formspree-form-id>";

export function ContactForm() {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);

  if (state.succeeded) {
    return (
      <p className="border border-black bg-white px-3 py-2 text-xs">
        Message sent. Thanks for reaching out.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div className="space-y-1">
        <label htmlFor="contact-name" className="block text-[11px] font-semibold uppercase">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          className="w-full border border-black bg-white px-2 py-1 text-xs"
          data-testid="contact-name"
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-email" className="block text-[11px] font-semibold uppercase">
          Email
        </label>
        <input
          id="contact-email"
          type="email"
          name="email"
          required
          className="w-full border border-black bg-white px-2 py-1 text-xs"
          data-testid="contact-email"
        />
        <ValidationError prefix="Email" field="email" errors={state.errors} className="text-[11px]" />
      </div>

      <div className="space-y-1">
        <label htmlFor="contact-message" className="block text-[11px] font-semibold uppercase">
          Message
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          className="w-full resize-y border border-black bg-white px-2 py-1 text-xs"
          data-testid="contact-message"
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="text-[11px]" />
      </div>

      <input type="text" name="_gotcha" className="hidden" tabIndex={-1} autoComplete="off" />

      <button
        type="submit"
        disabled={state.submitting}
        className="desktop-action border border-black bg-white px-3 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-60"
        data-testid="contact-submit"
      >
        {state.submitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
