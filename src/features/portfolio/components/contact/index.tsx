"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { PrimaryMagneticButton } from "@/src/shared/components/MagneticButton";
import ScrollReveal, {
  StaggerContainer,
  StaggerItem,
} from "@/src/shared/components/ScrollReveal";

import Social from "./Social";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(80, "Max 80 characters"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  message: z
    .string()
    .min(1, "Message is required")
    .max(500, "Max 500 characters"),
  company: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isValid, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: "onChange",
  });

  const messageValue = useWatch({ control, name: "message", defaultValue: "" });
  const charCount = messageValue?.length ?? 0;

  const onSubmit = (data: ContactFormData) => {
    if (data.company) return;
    const { name, email, message } = data;
    const body = encodeURIComponent(message);
    const subject = encodeURIComponent(`Message from ${name} - ${email}`);
    window.location.href = `mailto:ihsan.inh@gmail.com?subject=${subject}&body=${body}`;
    reset();
  };

  const inputClasses = `
    w-full rounded-xl py-4 px-5 outline-none
    bg-white/50 dark:bg-white/5
    text-slate-900 dark:text-white
    placeholder:text-slate-500 dark:placeholder:text-white/40
    border border-slate-200 dark:border-white/10
    transition-all duration-300
    focus:border-[rgb(var(--accent))]
    focus:ring-2 focus:ring-[rgb(var(--accent)/0.2)]
    focus:shadow-[0_0_20px_rgb(var(--accent)/0.15)]
  `;

  return (
    <section
      className="container mt-12 lg:mt-24"
      id="contact"
      aria-labelledby="contact-title"
    >
      <ScrollReveal animation="slide-up">
        <h2 id="contact-title" className="section-title">
          Contact
        </h2>
      </ScrollReveal>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Left side - Info */}
        <ScrollReveal animation="slide-right" className="flex flex-col gap-6">
          <div className="glass holo-border rounded-2xl p-6 flex flex-col gap-5">
            <p className="leading-8 text-slate-700 dark:text-white/80">
              Have an idea you&apos;d like me to work on? Reach out via the
              form, or use social links below.
            </p>

            {/* Stats */}
            <StaggerContainer
              staggerDelay={0.1}
              className="mt-4 grid grid-cols-3 gap-3 text-center"
            >
              {[
                { value: "5+", label: "Years" },
                { value: "10+", label: "Projects" },
                { value: "3", label: "Enterprise" },
              ].map((stat) => (
                <StaggerItem key={stat.label} animation="scale">
                  <div className="glass rounded-xl px-4 py-3">
                    <p className="text-xl font-bold gradient-text">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-slate-600 dark:text-white/60">
                      {stat.label}
                    </p>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>

          <Social variant="pill" containerClass="flex flex-wrap gap-3" />
        </ScrollReveal>

        {/* Right side - Form */}
        <ScrollReveal animation="slide-left" delay={0.2}>
          <motion.form
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="glass holo-border rounded-2xl p-6 flex flex-col gap-5"
          >
            {/* Honeypot */}
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              {...register("company")}
            />

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="name"
                className="text-sm font-medium text-slate-700 dark:text-white/80"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className={`${inputClasses} ${
                  errors.name ? "border-red-500/60 ring-red-500/20" : ""
                }`}
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? "name-error" : undefined}
                {...register("name")}
              />
              {errors.name && (
                <span id="name-error" className="text-red-500 text-xs">
                  {errors.name.message}
                </span>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-slate-700 dark:text-white/80"
              >
                Your Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                placeholder="Enter your email"
                className={`${inputClasses} ${
                  errors.email ? "border-red-500/60 ring-red-500/20" : ""
                }`}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                {...register("email")}
              />
              {errors.email && (
                <span id="email-error" className="text-red-500 text-xs">
                  {errors.email.message}
                </span>
              )}
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="message"
                  className="text-sm font-medium text-slate-700 dark:text-white/80"
                >
                  Write your message
                </label>
                <span className="text-[11px] text-slate-500 dark:text-white/50">
                  {charCount}/500
                </span>
              </div>
              <textarea
                id="message"
                rows={5}
                placeholder="Tell me about your idea, timeline, and goals…"
                className={`${inputClasses} resize-none ${
                  errors.message ? "border-red-500/60 ring-red-500/20" : ""
                }`}
                aria-invalid={!!errors.message}
                aria-describedby={errors.message ? "message-error" : undefined}
                {...register("message")}
              />
              {errors.message && (
                <span id="message-error" className="text-red-500 text-xs">
                  {errors.message.message}
                </span>
              )}
            </div>

            {/* Submit */}
            <div className="flex items-center gap-4 pt-2">
              <PrimaryMagneticButton
                type="submit"
                disabled={!isValid || isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? "Sending…" : "Submit"}
              </PrimaryMagneticButton>

              <a
                href="mailto:ihsan.inh@gmail.com"
                className="text-sm text-slate-600 dark:text-white/70 hover:text-[rgb(var(--accent))] transition-colors duration-300 underline underline-offset-4 decoration-slate-400 dark:decoration-white/30"
              >
                Or email me directly →
              </a>
            </div>
          </motion.form>
        </ScrollReveal>
      </div>
    </section>
  );
}
