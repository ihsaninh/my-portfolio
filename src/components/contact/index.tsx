'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Social from './Social';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email format'),
  message: z.string().min(1, 'Message is required').max(500, 'Message cannot exceed 500 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function Contact() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    mode: 'onChange',
  });

  const onSubmit = (data: ContactFormData) => {
    const { name, email, message } = data;
    const mailtoURL = `mailto:ihsan.inh@gmail.com?subject=Message from ${name} - ${email}&body=${message}`;
    window.location.href = mailtoURL;
    reset();
  };

  return (
    <section className="container mt-12 lg:mt-24" id="contact">
      <h2 className="text-3xl lg:text-4xl font-bold relative inline-block after:content-[''] after:absolute after:left-0 after:-bottom-3 after:w-1/2 after:h-1 after:bg-accent after:rounded-lg">
        Contact
      </h2>

      <div className="flex flex-col lg:flex-row space-between mt-6">
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2 flex flex-col gap-6"
        >
          <p className="leading-9">
            Have an idea you&apos;d like me to work on? Feel free to reach out! <br />
            You can contact me through the form or connect with me on social media below.
          </p>
          <Social
            containerClass="flex gap-6"
            iconStyle="w-9 h-9 border border-accent rounded-full flex justify-center items-center text-accent text-base hover:bg-accent hover:text-primary transition-all duration-500"
          />
        </motion.div>

        <motion.form
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.2 }}
          viewport={{ once: true }}
          className="w-full lg:w-1/2 flex flex-col gap-6 mt-6 lg:mt-0"
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              placeholder="Enter your name"
              className="bg-secondary rounded-xl py-4 px-6"
              {...register('name')}
            />
            {errors.name && <span className="text-red-500 text-sm">{errors.name.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="email">Your Email</label>
            <input
              id="email"
              type="text"
              placeholder="Enter your email"
              className="bg-secondary rounded-xl py-4 px-6"
              {...register('email')}
            />
            {errors.email && <span className="text-red-500 text-sm">{errors.email.message}</span>}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="message">Write your message here</label>
            <textarea
              id="message"
              rows={6}
              placeholder="Enter your message"
              className="bg-secondary rounded-xl py-4 px-6 resize-none"
              {...register('message')}
            />
            {errors.message && (
              <span className="text-red-500 text-sm">{errors.message.message}</span>
            )}
          </div>

          <button
            type="submit"
            className="cursor-pointer bg-accent px-6 py-2 text-primary rounded-full shadow-md transform transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent/50 w-min disabled:cursor-not-allowed"
            disabled={!isValid}
          >
            Submit
          </button>
        </motion.form>
      </div>
    </section>
  );
}
