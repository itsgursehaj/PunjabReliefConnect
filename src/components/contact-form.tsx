
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from './ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { saveContactMessage } from '@/app/actions';
import { ContactFormSchema } from '@/types';


export default function ContactForm() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof ContactFormSchema>>({
    resolver: zodResolver(ContactFormSchema),
    defaultValues: {
      name: user?.displayName || '',
      email: user?.email || '',
      subject: '',
      message: '',
    },
  });

  useEffect(() => {
    // If the user logs in after the form has loaded, update the fields.
    if (user) {
      if (!form.getValues('email')) {
        form.setValue('email', user.email || '');
      }
      if (!form.getValues('name')) {
        form.setValue('name', user.displayName || '');
      }
    }
  }, [user, form]);
  
  const onSubmit = (data: z.infer<typeof ContactFormSchema>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        formData.append(key, value);
    });

    startTransition(async () => {
        const result = await saveContactMessage({ message: '' }, formData);
        if (result.message === 'success') {
            toast({
                title: 'Message Sent! / ਸੁਨੇਹਾ ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ!',
                description: 'Thank you for your message. We will get back to you soon.',
            });
            form.reset();
            // After reset, re-populate the user data if they are logged in
            if (user) {
                form.setValue('email', user.email || '');
                form.setValue('name', user.displayName || '');
            }
        } else if (result.message) {
            toast({
                title: 'Error / ਗਲਤੀ',
                description: result.message,
                variant: 'destructive',
            });
        }
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name / ਨਾਮ</FormLabel>
              <FormControl>
                <Input placeholder="Your Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email / ਈ - ਮੇਲ</FormLabel>
              <FormControl>
                <Input type="email" placeholder="your@email.com" {...field} disabled={!!user?.email} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject / ਵਿਸ਼ਾ</FormLabel>
              <FormControl>
                <Input placeholder="Subject of your message" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message / ਸੁਨੇਹਾ</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your message..."
                  className="min-h-[120px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-center">
            <Button type="submit" disabled={isPending} size="lg">
                {isPending ? 'Sending...' : 'Send Message / ਸੁਨੇਹਾ ਭੇਜੋ'}
            </Button>
        </div>
      </form>
    </Form>
  );
}
