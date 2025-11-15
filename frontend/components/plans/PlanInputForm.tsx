'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { plansApi } from '@/lib/api/plans';
import { PlanGenerateRequest } from '@/types/plan';

const formSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  timeline: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export function PlanInputForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });

  const generateMutation = useMutation({
    mutationFn: (data: PlanGenerateRequest) => plansApi.generatePlan(data),
    onSuccess: (plan) => {
      toast.success('Plan generated successfully!', {
        description: 'Redirecting to your new plan...',
      });
      
      // Small delay for toast to show
      setTimeout(() => {
        window.location.href = `/plans/${plan.id}`;
      }, 500);
    },
    onError: (error: Error) => {
      console.error('Error creating plan:', error);
      setError(error.message);
      toast.error('Failed to generate plan', {
        description: error.message,
      });
    },
  });

  const onSubmit = (data: FormData) => {
    setError(null);
    toast.loading('Generating your plan with AI...', {
      id: 'generate-plan',
    });
    
    generateMutation.mutate(data, {
      onSettled: () => {
        toast.dismiss('generate-plan');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">What do you want to achieve?</Label>
        <Input
          id="title"
          placeholder="e.g., Learn Python, Launch a startup, Get fit"
          {...register('title')}
          disabled={generateMutation.isPending}
        />
        {errors.title && (
          <p className="text-sm text-red-500">{errors.title.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Tell us more about your goal</Label>
        <Textarea
          id="description"
          placeholder="Describe what you want to accomplish, why it matters to you, and any specific requirements..."
          rows={5}
          {...register('description')}
          disabled={generateMutation.isPending}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description.message}</p>
        )}
      </div>

      {/* Timeline */}
      <div className="space-y-2">
        <Label htmlFor="timeline">Timeline (optional)</Label>
        <Input
          id="timeline"
          placeholder="e.g., 2 weeks, 1 month, 3 months"
          {...register('timeline')}
          disabled={generateMutation.isPending}
        />
        {errors.timeline && (
          <p className="text-sm text-red-500">{errors.timeline.message}</p>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={generateMutation.isPending}
      >
        {generateMutation.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating your plan...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Plan with AI
          </>
        )}
      </Button>
    </form>
  );
}
