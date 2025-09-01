"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { easeOut, motion } from "framer-motion";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

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

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
};
const fadeRight = {
  hidden: { opacity: 0, x: 32 },
  show: { opacity: 1, x: 0, transition: { duration: 0.6, ease: easeOut } },
};

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

  return (
    <section
      className="container mt-12 lg:mt-24"
      id="contact"
      aria-labelledby="contact-title"
    >
      <motion.div
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.2 }}
      >
        <motion.h2
          id="contact-title"
          className="section-title"
          variants={fadeLeft}
        >
          Contact
        </motion.h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-2">
          <motion.div variants={fadeLeft} className="flex flex-col gap-6">
            <div className="rounded-2xl border border-slate-300 bg-slate-50 p-6 shadow-xl backdrop-blur flex flex-col gap-5 dark:border-white/5 dark:bg-white/5">
              <p className="leading-8 text-slate-800 dark:text-white/80">
                Have an idea you&apos;d like me to work on? Reach out via the
                form, or use social links below.
              </p>

              <ul className="mt-6 grid grid-cols-3 gap-3 text-center text-slate-800 dark:text-white/80">
                <li className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xl font-semibold">5+</p>
                  <p className="text-[11px] opacity-80">Years</p>
                </li>
                <li className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xl font-semibold">10+</p>
                  <p className="text-[11px] opacity-80">Projects</p>
                </li>
                <li className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
                  <p className="text-xl font-semibold">3</p>
                  <p className="text-[11px] opacity-80">Enterprise</p>
                </li>
              </ul>
            </div>

            <Social variant="pill" containerClass="flex flex-wrap gap-3" />
          </motion.div>

          <motion.form
            variants={fadeRight}
            noValidate
            onSubmit={handleSubmit(onSubmit)}
            className="rounded-2xl border border-slate-300 bg-slate-50 p-6 shadow-xl backdrop-blur flex flex-col gap-5 dark:border-white/5 dark:bg-white/5"
          >
            <input
              type="text"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
              {...register("company")}
            />

            <div className="flex flex-col gap-1">
              <label
                htmlFor="name"
                className="text-sm text-slate-800 dark:text-white/80"
              >
                Your Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your name"
                className={`rounded-xl py-4 px-5 outline-none ring-1 ring-inset
                            bg-slate-50 text-slate-900 placeholder:text-slate-500 ring-slate-300
                            dark:bg-secondary/90 dark:text-white dark:placeholder:text-white/40 dark:ring-white/5
                            ${errors.name ? "ring-red-500/60" : ""}
                            focus:ring-2 focus:ring-accent/70`}
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

            <div className="flex flex-col gap-1">
              <label
                htmlFor="email"
                className="text-sm text-slate-800 dark:text-white/80"
              >
                Your Email
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                placeholder="Enter your email"
                className={`rounded-xl py-4 px-5 outline-none ring-1 ring-inset
                            bg-slate-50 text-slate-900 placeholder:text-slate-500 ring-slate-300
                            dark:bg-secondary/90 dark:text-white dark:placeholder:text-white/40 dark:ring-white/5
                            ${errors.email ? "ring-red-500/60" : ""}
                            focus:ring-2 focus:ring-accent/70`}
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

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="message"
                  className="text-sm text-slate-800 dark:text-white/80"
                >
                  Write your message
                </label>
                <span className="text-[11px] text-slate-600 dark:text-white/50">
                  {charCount}/500
                </span>
              </div>
              <textarea
                id="message"
                rows={6}
                placeholder="Tell me about your idea, timeline, and goals…"
                className={`rounded-xl py-4 px-5 resize-none outline-none ring-1 ring-inset
                            bg-slate-50 text-slate-900 placeholder:text-slate-500 ring-slate-300
                            dark:bg-secondary/90 dark:text-white dark:placeholder:text-white/40 dark:ring-white/5
                            ${errors.message ? "ring-red-500/60" : ""}
                            focus:ring-2 focus:ring-accent/70`}
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

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={!isValid || isSubmitting}
                className="cursor-pointer bg-accent px-6 py-2 text-primary rounded-full shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/50 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Sending…" : "Submit"}
              </button>

              <a
                href="mailto:ihsan.inh@gmail.com"
                className="text-sm text-slate-700 underline decoration-slate-400 underline-offset-4 hover:text-slate-900 dark:text-white/70 dark:decoration-white/30 dark:hover:text-white"
              >
                Or email me directly →
              </a>
            </div>
          </motion.form>
        </div>
      </motion.div>
    </section>
  );
}
