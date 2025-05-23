
'use client';

import type { FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label'; // Import the Label component
import { toast } from '@/hooks/use-toast';
import type { Project } from '@/types/project';

// Zod Schema for Validation - Removed 'mandays' field
const projectFormSchema = z.object({
  name: z.string().min(1, { message: "Project name is required." }), // Keep name for context, but likely read-only in form
  allocatedMandays: z.coerce.number().int().positive({ message: "Allocated Mandays must be a positive number." }).nullable().optional(), // Added allocated mandays
  startDate: z.date().nullable().optional(),
  endDate: z.date().nullable().optional(),
  inhousePortion: z.coerce.number().min(0).max(100, { message: "Percentage must be between 0 and 100." }).nullable().optional(),
  outsourcePortion: z.coerce.number().min(0).max(100, { message: "Percentage must be between 0 and 100." }).nullable().optional(),
}).refine(data => {
    // Custom validation: Ensure sum of portions does not exceed 100
    const inhouse = data.inhousePortion ?? 0;
    const outsource = data.outsourcePortion ?? 0;
    return inhouse + outsource <= 100;
}, {
    message: "The sum of Inhouse and Outsource portions cannot exceed 100%.",
    path: ["inhousePortion"], // Attach error to one field or create a general form error
}).refine(data => {
    // Custom validation: Ensure end date is after start date if both are set
    if (data.startDate && data.endDate) {
        return data.endDate >= data.startDate;
    }
    return true;
}, {
    message: "End date must be on or after the start date.",
    path: ["endDate"],
});


type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectEditFormProps {
  project: Project;
  onSubmit: (data: Omit<Project, 'mandays' | 'department' | 'kpiScore' | 'completion' | 'departmentAllocations' | 'id'> & { id: string }) => void; // Adjust onSubmit type
  onCancel: () => void;
}

const ProjectEditForm: FC<ProjectEditFormProps> = ({ project, onSubmit, onCancel }) => {
  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project.name,
      // mandays: project.mandays ?? 0, // Actual mandays consumed - REMOVED
      allocatedMandays: project.allocatedMandays ?? null, // Allocated mandays
      startDate: project.startDate ?? null,
      endDate: project.endDate ?? null,
      inhousePortion: project.inhousePortion ?? null,
      outsourcePortion: project.outsourcePortion ?? null,
    },
    mode: 'onChange', // Validate on change
  });

  function handleFormSubmit(data: ProjectFormValues) {
     // Create a partial project object with only the editable fields
     const updatedProjectData = {
        id: project.id, // Keep the ID
        // name: data.name, // Name is read-only, don't update it here
        allocatedMandays: data.allocatedMandays,
        startDate: data.startDate,
        endDate: data.endDate,
        inhousePortion: data.inhousePortion,
        outsourcePortion: data.outsourcePortion,
     };

    // We need to merge this partial data back in the parent component
    // Let's adjust onSubmit to pass only the updated fields
    // onSubmit needs to be adapted in the parent to handle this partial update
    onSubmit(updatedProjectData);

    toast({
      title: "Project Updated",
      description: `Details for ${project.name} have been saved.`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Display Project Name (Read-only) */}
         <div className="space-y-2">
            <Label>Project Name</Label>
            <Input value={project.name} readOnly disabled className="bg-muted/50" />
        </div>

         {/* Allocated Mandays */}
         <FormField
          control={form.control}
          name="allocatedMandays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Overall Allocated Mandays</FormLabel>
              <FormControl>
                 <Input
                    type="number"
                    placeholder="Enter originally allocated mandays"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)} // Set to null if empty
                 />
              </FormControl>
              <FormDescription>
                Total mandays originally planned for the project. This can be the sum of department allocations.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />


        {/* Actual Mandays Consumed - REMOVED */}
        {/*
        <FormField
          control={form.control}
          name="mandays"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Actual Mandays Consumed</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter actual mandays used" {...field} />
              </FormControl>
              <FormDescription>
                Total mandays actually spent on the project so far.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        */}

        {/* Start Date */}
        <FormField
          control={form.control}
          name="startDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Start Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined} // Handle null
                    onSelect={(date) => field.onChange(date ?? null)} // Ensure null is passed if undefined
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The planned start date of the project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* End Date */}
         <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>End Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ?? undefined}
                    onSelect={(date) => field.onChange(date ?? null)}
                    // Optionally disable dates before startDate
                    disabled={(date) =>
                      form.getValues('startDate') ? date < form.getValues('startDate')! : false
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormDescription>
                The planned end date of the project.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Inhouse Portion */}
        <FormField
          control={form.control}
          name="inhousePortion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inhouse Portion (%)</FormLabel>
              <FormControl>
                 <Input
                    type="number"
                    placeholder="e.g., 70"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
                 />
              </FormControl>
              <FormDescription>
                Percentage of work done inhouse (0-100).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Outsource Portion */}
        <FormField
          control={form.control}
          name="outsourcePortion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Outsource Portion (%)</FormLabel>
              <FormControl>
                <Input
                    type="number"
                    placeholder="e.g., 30"
                    {...field}
                    value={field.value ?? ''}
                    onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
                 />
              </FormControl>
              <FormDescription>
                Percentage of work outsourced (0-100).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-4">
           <Button type="button" variant="outline" onClick={onCancel}>
             Cancel
           </Button>
           <Button type="submit">Save Changes</Button>
        </div>
      </form>
    </Form>
  );
};

export default ProjectEditForm;
