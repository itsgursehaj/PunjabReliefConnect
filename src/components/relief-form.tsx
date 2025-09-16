
'use client';

import {zodResolver} from '@hookform/resolvers/zod';
import {useForm} from 'react-hook-form';
import {z} from 'zod';
import {useActionState, useEffect, useRef} from 'react';

import {Button} from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Checkbox} from '@/components/ui/checkbox';
import {useToast} from '@/hooks/use-toast';
import {createReliefRequest} from '@/app/actions';
import {reliefNeeds, districts, FormSchema} from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Textarea } from './ui/textarea';
import Link from 'next/link';

const initialState = {
  message: '',
};

export default function ReliefForm() {
  const {toast} = useToast();
  const [state, formAction, pending] = useActionState(
    createReliefRequest,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      contactNumber: '',
      villageName: '',
      district: '',
pincode: '',
      needs: [],
      otherNeed: '',
      privacyPolicy: false,
    },
  });

  const watchedNeeds = form.watch('needs');

  useEffect(() => {
    if (state.message === 'success') {
      toast({
        title: 'Request Submitted! / ਬੇਨਤੀ ਦਰਜ ਹੋ ਗਈ ਹੈ!',
        description:
          'Your request has been saved successfully. It will appear on the dashboard shortly.',
      });
      form.reset();
      // Also reset the form element itself to clear the native state
      formRef.current?.reset();
    } else if (state.message && !state.message.startsWith('Invalid form data')) {
      toast({
        title: 'Error / ਗਲਤੀ',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, form]);
  
  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    const formData = new FormData();
    Object.entries(data).forEach(([key, value]) => {
      if (key === 'needs' && Array.isArray(value)) {
        value.forEach(need => formData.append(key, need));
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    formAction(formData);
  };


  return (
    <Card className="shadow-xl">
      <CardHeader>
        <CardTitle>
          <span>Submit a Request</span>
          <span className="block text-xl font-normal text-muted-foreground mt-1">ਇੱਕ ਬੇਨਤੀ ਦਰਜ ਕਰੋ</span>
        </CardTitle>
        <CardDescription>
          <span>Your details will be shared with verified volunteers.</span>
          <span className="block text-sm text-muted-foreground/80 mt-1">ਤੁਹਾਡੇ ਵੇਰਵੇ ਪ੍ਰਮਾਣਿਤ ਵਲੰਟੀਅਰਾਂ ਨਾਲ ਸਾਂਝੇ ਕੀਤੇ ਜਾਣਗੇ।</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="villageName"
              render={({field}) => (
                <FormItem>
                  <FormLabel>ਪਿੰਡ ਦਾ ਨਾਮ / Village Name (English only)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jodhpur Bagga Singh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="district"
              render={({field}) => (
                <FormItem>
                  <FormLabel>ਜ਼ਿਲ੍ਹਾ / District</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    name={field.name}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a district" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {districts.map(district => (
                        <SelectItem key={district} value={district}>
                          {district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pincode"
              render={({field}) => (
                <FormItem>
                  <FormLabel>ਪਿੰਨ ਕੋਡ / Pin Code (6 digits only)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 151301" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({field}) => (
                <FormItem>
                  <FormLabel>
                    ਪਿੰਡ ਦੇ ਸਰਪੰਚ ਜਾਂ ਆਗੂ ਦਾ ਨਾਮ / Name of the village sarpanch or
                    leader (English only)
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Harpreet Singh" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactNumber"
              render={({field}) => (
                <FormItem>
                  <FormLabel>ਸੰਪਰਕ ਨੰਬਰ / Contact Number (10 digits only)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 9876543210" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="needs"
              render={() => (
                <FormItem>
                  <FormLabel>
                    ਤੁਹਾਨੂੰ ਸਭ ਤੋਂ ਵੱਧ ਕਿਸ ਚੀਜ਼ ਦੀ ਲੋੜ ਹੈ? / What do you need most?
                  </FormLabel>
                  <div className="grid grid-cols-2 gap-4">
                    {reliefNeeds.map(item => (
                      <FormField
                        key={item}
                        control={form.control}
                        name="needs"
                        render={({field}) => {
                          return (
                            <FormItem
                              key={item}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  name={field.name}
                                  value={item}
                                  checked={field.value?.includes(item)}
                                  onCheckedChange={checked => {
                                    return checked
                                      ? field.onChange([...(field.value || []), item])
                                      : field.onChange(
                                          (field.value || []).filter(
                                            (value: string) => value !== item
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            {watchedNeeds?.includes('Other') && (
              <FormField
                control={form.control}
                name="otherNeed"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please specify other need / ਕਿਰਪਾ ਕਰਕੇ ਹੋਰ ਲੋੜ ਦੱਸੋ</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Tarps for covering roofs, baby food, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="privacyPolicy"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the <Link href="/privacy-policy" className="text-primary underline" target="_blank">Privacy Policy</Link>.
                       / ਮੈਂ <Link href="/privacy-policy" className="text-primary underline" target="_blank">ਗੋਪਨੀਯਤਾ ਨੀਤੀ</Link> ਨਾਲ ਸਹਿਮਤ ਹਾਂ।
                    </FormLabel>
                    <FormDescription>
                     By submitting, you agree to have your information shared with verified volunteers. / ਜਮ੍ਹਾਂ ਕਰਕੇ, ਤੁਸੀਂ ਆਪਣੀ ਜਾਣਕਾਰੀ ਪ੍ਰਮਾਣਿਤ ਵਲੰਟੀਅਰਾਂ ਨਾਲ ਸਾਂਝੀ ਕਰਨ ਲਈ ਸਹਿਮਤ ਹੋ।
                    </FormDescription>
                     <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              <Button
                type="submit"
                disabled={pending}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg"
              >
                {pending ? 'Submitting...' : 'Submit Request / ਬੇਨਤੀ ਦਰਜ ਕਰੋ'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
