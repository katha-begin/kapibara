
'use client';

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2, PlusCircle } from 'lucide-react';
import type { DepartmentAllocation } from '@/types/project';
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"; // Import Form components

// Zod schema for a single department allocation
const allocationSchema = z.object({
  department: z.string().min(1, "Department selection is required"),
  allocatedMandays: z.coerce.number().int().min(0, "Mandays must be non-negative"),
});

// Zod schema for the form (array of allocations)
const formSchema = z.object({
  allocations: z.array(allocationSchema)
    // Optional: Add refinement to check for duplicate departments
    .refine((items) => {
        const departments = items.map(item => item.department);
        return new Set(departments).size === departments.length;
      }, {
        message: "Departments must be unique.",
        // Path needs careful consideration for arrays, often handled via field-level error reporting
      })
});

type AllocationFormValues = z.infer<typeof formSchema>;

interface DepartmentAllocationTableProps {
  initialAllocations: DepartmentAllocation[];
  availableDepartments: string[];
  onSave: (updatedAllocations: DepartmentAllocation[]) => void;
}

const DepartmentAllocationTable: FC<DepartmentAllocationTableProps> = ({
  initialAllocations,
  availableDepartments,
  onSave,
}) => {
  const form = useForm<AllocationFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      allocations: initialAllocations || [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "allocations",
  });

  const [totalAllocated, setTotalAllocated] = useState(0);

  // Calculate total allocated mandays whenever the form values change
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      if (name?.startsWith('allocations')) {
        const currentAllocations = form.getValues('allocations');
        const sum = currentAllocations.reduce((acc, item) => acc + (item.allocatedMandays || 0), 0);
        setTotalAllocated(sum);
      }
    });
    // Calculate initial total
    const initialSum = form.getValues('allocations').reduce((acc, item) => acc + (item.allocatedMandays || 0), 0);
    setTotalAllocated(initialSum);

    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = (data: AllocationFormValues) => {
    onSave(data.allocations);
  };

  const handleAddRow = () => {
    // Add a new row with default values
    append({ department: "", allocatedMandays: 0 });
  };

  // Filter available departments to exclude those already selected
  const getRemainingDepartments = (currentIndex: number) => {
    const selectedDepartments = form.getValues('allocations')
        .map((alloc, index) => index !== currentIndex ? alloc.department : null)
        .filter(dept => dept !== null);
    return availableDepartments.filter(dept => !selectedDepartments.includes(dept));
  };


  return (
    <Card className="shadow-md">
        <CardHeader>
            <CardTitle>Department Manday Allocation</CardTitle>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-2/5">Department</TableHead>
                                <TableHead className="w-2/5 text-right">Allocated Mandays</TableHead>
                                <TableHead className="w-1/5 text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {fields.map((field, index) => {
                                const remainingDepartments = getRemainingDepartments(index);
                                return (
                                    <TableRow key={field.id}>
                                        <TableCell>
                                            <FormField
                                                control={form.control}
                                                name={`allocations.${index}.department`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <Select
                                                            onValueChange={field.onChange}
                                                            defaultValue={field.value}
                                                            value={field.value} // Ensure Select is controlled
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select Department" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                {/* Include the currently selected value if it exists */}
                                                                {field.value && !remainingDepartments.includes(field.value) && (
                                                                    <SelectItem value={field.value}>
                                                                        {field.value}
                                                                    </SelectItem>
                                                                )}
                                                                {remainingDepartments.map(dept => (
                                                                    <SelectItem key={dept} value={dept}>
                                                                        {dept}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell>
                                             <FormField
                                                control={form.control}
                                                name={`allocations.${index}.allocatedMandays`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormControl>
                                                            <Input
                                                                type="number"
                                                                className="text-right"
                                                                placeholder="Mandays"
                                                                {...field}
                                                                value={field.value ?? ''} // Handle potential undefined
                                                                onChange={e => field.onChange(e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0)}
                                                            />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => remove(index)}
                                                aria-label="Remove department"
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddRow}
                        className="mt-4"
                    >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Department
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-between items-center border-t pt-4">
                    <div className="text-sm text-muted-foreground">
                        Total Allocated: <span className="font-semibold text-primary">{totalAllocated} Mandays</span>
                    </div>
                    <Button type="submit">Save Allocations</Button>
                </CardFooter>
            </form>
        </Form>
    </Card>
  );
};

export default DepartmentAllocationTable;
