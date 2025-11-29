"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { CustomFormField } from "@/components/FormField";
import { Card } from "@/components/ui/card";
import { useCreateApplicationMutation } from "@/state/api";
import { toast } from "sonner";

const applicationSchema = z.object({
  // Personal Information
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  
  // Current Address
  currentAddress: z.string().min(1, "Current address is required"),
  currentCity: z.string().min(1, "City is required"),
  currentState: z.string().min(1, "State is required"),
  currentZip: z.string().min(5, "ZIP code must be at least 5 digits"),
  moveInDate: z.string().min(1, "Desired move-in date is required"),
  
  // Employment Information
  employmentStatus: z.enum(["employed", "self-employed", "unemployed", "student", "retired"]),
  employer: z.string().optional(),
  occupation: z.string().optional(),
  annualIncome: z.string().min(1, "Annual income is required"),
  employmentLength: z.string().optional(),
  
  // References
  emergencyContactName: z.string().min(1, "Emergency contact name is required"),
  emergencyContactPhone: z.string().min(10, "Emergency contact phone is required"),
  emergencyContactRelationship: z.string().min(1, "Relationship is required"),
  
  previousLandlordName: z.string().optional(),
  previousLandlordPhone: z.string().optional(),
  
  // Additional Information
  numberOfOccupants: z.string().min(1, "Number of occupants is required"),
  hasPets: z.boolean().default(false),
  petDetails: z.string().optional(),
  hasVehicles: z.boolean().default(false),
  vehicleDetails: z.string().optional(),
  
  // Background
  hasEvictionHistory: z.boolean().default(false),
  evictionDetails: z.string().optional(),
  hasCriminalHistory: z.boolean().default(false),
  criminalDetails: z.string().optional(),
  
  // Additional Notes
  additionalNotes: z.string().optional(),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

interface ApplicationFormProps {
  propertyId: string;
  tenantId: string;
  onSuccess?: () => void;
}

export function ApplicationForm({ propertyId, tenantId, onSuccess }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [createApplication, { isLoading }] = useCreateApplicationMutation();

  const form = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      hasPets: false,
      hasVehicles: false,
      hasEvictionHistory: false,
      hasCriminalHistory: false,
    },
  });

  const steps = [
    { number: 1, title: "Personal Information", fields: ["firstName", "lastName", "email", "phone", "dateOfBirth"] },
    { number: 2, title: "Current Address", fields: ["currentAddress", "currentCity", "currentState", "currentZip", "moveInDate"] },
    { number: 3, title: "Employment", fields: ["employmentStatus", "employer", "occupation", "annualIncome", "employmentLength"] },
    { number: 4, title: "References", fields: ["emergencyContactName", "emergencyContactPhone", "emergencyContactRelationship", "previousLandlordName", "previousLandlordPhone"] },
    { number: 5, title: "Additional Info", fields: ["numberOfOccupants", "hasPets", "petDetails", "hasVehicles", "vehicleDetails"] },
    { number: 6, title: "Background", fields: ["hasEvictionHistory", "evictionDetails", "hasCriminalHistory", "criminalDetails", "additionalNotes"] },
  ];

  const currentStepFields = steps[currentStep - 1].fields;

  const validateCurrentStep = async () => {
    const result = await form.trigger(currentStepFields as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid && currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = async (data: ApplicationFormData) => {
    try {
      await createApplication({
        propertyId,
        tenantId,
        ...data,
        annualIncome: parseFloat(data.annualIncome),
        numberOfOccupants: parseInt(data.numberOfOccupants),
      }).unwrap();

      toast.success("Application Submitted", {
        description: "Your rental application has been submitted successfully!",
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      toast.error("Error", {
        description: error?.data?.message || "Failed to submit application",
      });
    }
  };

  const hasPets = form.watch("hasPets");
  const hasVehicles = form.watch("hasVehicles");
  const hasEvictionHistory = form.watch("hasEvictionHistory");
  const hasCriminalHistory = form.watch("hasCriminalHistory");
  const employmentStatus = form.watch("employmentStatus");

  return (
    <div className="max-w-3xl mx-auto p-6">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className={`flex items-center ${step.number < steps.length ? "flex-1" : ""}`}
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  step.number === currentStep
                    ? "bg-blue-600 text-white"
                    : step.number < currentStep
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                {step.number < currentStep ? "✓" : step.number}
              </div>
              {step.number < steps.length && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step.number < currentStep ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
        <div className="text-center mt-4">
          <h2 className="text-2xl font-bold">{steps[currentStep - 1].title}</h2>
          <p className="text-gray-600">Step {currentStep} of {steps.length}</p>
        </div>
      </div>

      {/* Form */}
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <CustomFormField
                    name="firstName"
                    label="First Name"
                    type="text"
                    placeholder="John"
                  />
                  <CustomFormField
                    name="lastName"
                    label="Last Name"
                    type="text"
                    placeholder="Doe"
                  />
                </div>
                <CustomFormField
                  name="email"
                  label="Email Address"
                  type="email"
                  placeholder="john.doe@example.com"
                />
                <CustomFormField
                  name="phone"
                  label="Phone Number"
                  type="text"
                  placeholder="(555) 123-4567"
                />
                <CustomFormField
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="text"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            )}

            {/* Step 2: Current Address */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <CustomFormField
                  name="currentAddress"
                  label="Current Address"
                  type="text"
                  placeholder="123 Main St, Apt 4B"
                />
                <div className="grid grid-cols-3 gap-4">
                  <CustomFormField
                    name="currentCity"
                    label="City"
                    type="text"
                    placeholder="New York"
                  />
                  <CustomFormField
                    name="currentState"
                    label="State"
                    type="text"
                    placeholder="NY"
                  />
                  <CustomFormField
                    name="currentZip"
                    label="ZIP Code"
                    type="text"
                    placeholder="10001"
                  />
                </div>
                <CustomFormField
                  name="moveInDate"
                  label="Desired Move-in Date"
                  type="text"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            )}

            {/* Step 3: Employment */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <CustomFormField
                  name="employmentStatus"
                  label="Employment Status"
                  type="select"
                  options={[
                    { value: "employed", label: "Employed" },
                    { value: "self-employed", label: "Self-Employed" },
                    { value: "unemployed", label: "Unemployed" },
                    { value: "student", label: "Student" },
                    { value: "retired", label: "Retired" },
                  ]}
                />
                {(employmentStatus === "employed" || employmentStatus === "self-employed") && (
                  <>
                    <CustomFormField
                      name="employer"
                      label="Employer Name"
                      type="text"
                      placeholder="Company Inc."
                    />
                    <CustomFormField
                      name="occupation"
                      label="Occupation/Job Title"
                      type="text"
                      placeholder="Software Engineer"
                    />
                    <CustomFormField
                      name="employmentLength"
                      label="Length of Employment"
                      type="text"
                      placeholder="2 years"
                    />
                  </>
                )}
                <CustomFormField
                  name="annualIncome"
                  label="Annual Income"
                  type="text"
                  placeholder="75000"
                />
              </div>
            )}

            {/* Step 4: References */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Emergency Contact</h3>
                  <CustomFormField
                    name="emergencyContactName"
                    label="Contact Name"
                    type="text"
                    placeholder="Jane Smith"
                  />
                  <CustomFormField
                    name="emergencyContactPhone"
                    label="Contact Phone"
                    type="text"
                    placeholder="(555) 987-6543"
                  />
                  <CustomFormField
                    name="emergencyContactRelationship"
                    label="Relationship"
                    type="text"
                    placeholder="Sister"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Previous Landlord (Optional)</h3>
                  <CustomFormField
                    name="previousLandlordName"
                    label="Landlord Name"
                    type="text"
                    placeholder="John Property Manager"
                  />
                  <CustomFormField
                    name="previousLandlordPhone"
                    label="Landlord Phone"
                    type="text"
                    placeholder="(555) 555-5555"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Additional Info */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <CustomFormField
                  name="numberOfOccupants"
                  label="Number of Occupants"
                  type="text"
                  placeholder="2"
                />
                <CustomFormField
                  name="hasPets"
                  label="Do you have pets?"
                  type="switch"
                />
                {hasPets && (
                  <CustomFormField
                    name="petDetails"
                    label="Pet Details"
                    type="textarea"
                    placeholder="1 dog (Golden Retriever, 3 years old)"
                  />
                )}
                <CustomFormField
                  name="hasVehicles"
                  label="Do you have vehicles?"
                  type="switch"
                />
                {hasVehicles && (
                  <CustomFormField
                    name="vehicleDetails"
                    label="Vehicle Details"
                    type="textarea"
                    placeholder="2018 Honda Accord, Blue"
                  />
                )}
              </div>
            )}

            {/* Step 6: Background */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <CustomFormField
                  name="hasEvictionHistory"
                  label="Have you ever been evicted?"
                  type="switch"
                />
                {hasEvictionHistory && (
                  <CustomFormField
                    name="evictionDetails"
                    label="Eviction Details"
                    type="textarea"
                    placeholder="Please explain..."
                  />
                )}
                <CustomFormField
                  name="hasCriminalHistory"
                  label="Do you have a criminal history?"
                  type="switch"
                />
                {hasCriminalHistory && (
                  <CustomFormField
                    name="criminalDetails"
                    label="Criminal History Details"
                    type="textarea"
                    placeholder="Please explain..."
                  />
                )}
                <CustomFormField
                  name="additionalNotes"
                  label="Additional Notes (Optional)"
                  type="textarea"
                  placeholder="Any additional information you'd like to provide..."
                />
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              {currentStep < steps.length ? (
                <Button type="button" onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
}
