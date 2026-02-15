"use client";

import { ValidationError, useForm } from "@formspree/react";
import { type FormEvent, useEffect, useState } from "react";

const FORMSPREE_FORM_ID = process.env.NEXT_PUBLIC_FORMSPREE_FORM_ID;
const MIN_FILL_TIME_MS = 3000;
const SUBMIT_COOLDOWN_MS = 30000;
const CONTACT_COOLDOWN_STORAGE_KEY = "zonumi.contact.cooldown.until";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function ContactForm() {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID ?? "");
  const [startedAt] = useState(() => Date.now());
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(CONTACT_COOLDOWN_STORAGE_KEY);
    if (!stored) return;
    const parsed = Number(stored);
    if (Number.isFinite(parsed)) {
      setCooldownUntil(parsed);
    }
  }, []);

  if (!FORMSPREE_FORM_ID) {
    return (
      <p className="border border-black bg-white px-3 py-2 text-xs" role="alert">
        Contact form is unavailable. Missing NEXT_PUBLIC_FORMSPREE_FORM_ID.
      </p>
    );
  }

  const handleSafeSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setClientError(null);

    const now = Date.now();
    if (now < cooldownUntil) {
      const secondsRemaining = Math.ceil((cooldownUntil - now) / 1000);
      setClientError(`Please wait ${secondsRemaining}s before sending another message.`);
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const nameValue = String(formData.get("name") ?? "").trim();
    const emailValue = String(formData.get("email") ?? "").trim();
    const messageValue = String(formData.get("message") ?? "").trim();
    const honeypotValue = String(formData.get("_gotcha") ?? "").trim();

    if (nameValue.length < 2 || nameValue.length > 80) {
      setClientError("Name must be between 2 and 80 characters.");
      return;
    }

    if (!EMAIL_PATTERN.test(emailValue) || emailValue.length > 120) {
      setClientError("Please enter a valid email address.");
      return;
    }

    if (messageValue.length < 20 || messageValue.length > 2000) {
      setClientError("Message must be between 20 and 2000 characters.");
      return;
    }

    if (honeypotValue) {
      setClientError("Unable to submit this message.");
      return;
    }

    if (now - startedAt < MIN_FILL_TIME_MS) {
      setClientError("Please take a moment to complete the form before submitting.");
      return;
    }

    const nextCooldown = now + SUBMIT_COOLDOWN_MS;
    setCooldownUntil(nextCooldown);
    window.localStorage.setItem(CONTACT_COOLDOWN_STORAGE_KEY, String(nextCooldown));
    await handleSubmit(event);
  };

  if (state.succeeded) {
    return (
      <p className="border border-black bg-white px-3 py-2 text-xs">
        Message sent. Thanks for reaching out.
      </p>
    );
  }

  return (
    <form onSubmit={handleSafeSubmit} noValidate className="space-y-2">
      <div className="space-y-1">
        <label htmlFor="contact-name" className="block text-[11px] font-semibold uppercase">
          Name
        </label>
        <input
          id="contact-name"
          type="text"
          name="name"
          required
          minLength={2}
          maxLength={80}
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
          maxLength={120}
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
          minLength={20}
          maxLength={2000}
          rows={6}
          className="w-full resize-y border border-black bg-white px-2 py-1 text-xs"
          data-testid="contact-message"
        />
        <ValidationError prefix="Message" field="message" errors={state.errors} className="text-[11px]" />
      </div>

      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" type="text" name="_gotcha" tabIndex={-1} autoComplete="off" />
      </div>

      {clientError ? (
        <p className="border border-black bg-white px-2 py-1 text-[11px]" role="alert" data-testid="contact-error">
          {clientError}
        </p>
      ) : null}

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
