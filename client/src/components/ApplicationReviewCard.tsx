"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useUpdateApplicationStatusMutation } from "@/state/api";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  Users, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Home,
  Car,
  PawPrint
} from "lucide-react";

interface Application {
  id: number;
  applicationDate: string;
  status: string;
  name: string;
  email: string;
  phoneNumber: string;
  message?: string;
  
  // Extended fields
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  currentAddress?: string;
  currentCity?: string;
  currentState?: string;
  currentZip?: string;
  moveInDate?: string;
  employmentStatus?: string;
  employer?: string;
  occupation?: string;
  annualIncome?: number;
  employmentLength?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  previousLandlordName?: string;
  previousLandlordPhone?: string;
  numberOfOccupants?: number;
  hasPets?: boolean;
  petDetails?: string;
  hasVehicles?: boolean;
  vehicleDetails?: string;
  hasEvictionHistory?: boolean;
  evictionDetails?: string;
  hasCriminalHistory?: boolean;
  criminalDetails?: string;
  additionalNotes?: string;
  
  property: {
    id: string;
    name: string;
    address: string;
    pricePerMonth: number;
  };
  tenant: {
    cognitoId: string;
    name: string;
    email: string;
  };
}

interface ApplicationReviewCardProps {
  application: Application;
  onUpdate?: () => void;
}

export function ApplicationReviewCard({ application, onUpdate }: ApplicationReviewCardProps) {
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [updateStatus, { isLoading }] = useUpdateApplicationStatusMutation();

  const handleApprove = async () => {
    try {
      await updateStatus({ id: application.id, status: "Approved" }).unwrap();
      toast.success("Application Approved", {
        description: "The application has been approved and a lease has been created.",
      });
      setShowApproveDialog(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error("Error", {
        description: error?.data?.message || "Failed to approve application",
      });
    }
  };

  const handleDeny = async () => {
    try {
      await updateStatus({ id: application.id, status: "Denied" }).unwrap();
      toast.success("Application Denied", {
        description: "The application has been denied.",
      });
      setShowDenyDialog(false);
      if (onUpdate) onUpdate();
    } catch (error: any) {
      toast.error("Error", {
        description: error?.data?.message || "Failed to deny application",
      });
    }
  };

  const getStatusBadge = () => {
    switch (application.status) {
      case "Approved":
        return <Badge className="bg-green-600"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case "Denied":
        return <Badge className="bg-red-600"><XCircle className="w-3 h-3 mr-1" />Denied</Badge>;
      default:
        return <Badge className="bg-yellow-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const InfoItem = ({ icon: Icon, label, value }: { icon: any; label: string; value?: string | number | null }) => {
    if (!value) return null;
    return (
      <div className="flex items-start gap-2 text-sm">
        <Icon className="w-4 h-4 mt-0.5 text-gray-500" />
        <div>
          <p className="font-medium text-gray-700">{label}</p>
          <p className="text-gray-600">{value}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{application.name}</CardTitle>
              <CardDescription>Applied for {application.property.name}</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <InfoItem icon={Mail} label="Email" value={application.email} />
            <InfoItem icon={Phone} label="Phone" value={application.phoneNumber || application.phone} />
            <InfoItem icon={Calendar} label="Applied" value={new Date(application.applicationDate).toLocaleDateString()} />
            <InfoItem icon={Calendar} label="Move-in Date" value={application.moveInDate ? new Date(application.moveInDate).toLocaleDateString() : null} />
            <InfoItem icon={DollarSign} label="Annual Income" value={application.annualIncome ? `$${application.annualIncome.toLocaleString()}` : null} />
            <InfoItem icon={Briefcase} label="Employment" value={application.employmentStatus} />
          </div>

          {application.message && (
            <div className="mt-4 p-3 bg-gray-50 rounded">
              <p className="text-sm font-medium text-gray-700 mb-1">Message</p>
              <p className="text-sm text-gray-600">{application.message}</p>
            </div>
          )}

          {/* Warning indicators */}
          <div className="flex flex-wrap gap-2 mt-2">
            {application.hasPets && (
              <Badge variant="outline" className="text-xs">
                <PawPrint className="w-3 h-3 mr-1" />
                Has Pets
              </Badge>
            )}
            {application.hasVehicles && (
              <Badge variant="outline" className="text-xs">
                <Car className="w-3 h-3 mr-1" />
                Has Vehicles
              </Badge>
            )}
            {application.hasEvictionHistory && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Eviction History
              </Badge>
            )}
            {application.hasCriminalHistory && (
              <Badge variant="destructive" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Criminal History
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setShowDetailsDialog(true)}>
            View Full Details
          </Button>
          {application.status === "Pending" && (
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={() => setShowDenyDialog(true)}
                disabled={isLoading}
              >
                Deny
              </Button>
              <Button 
                onClick={() => setShowApproveDialog(true)}
                disabled={isLoading}
              >
                Approve
              </Button>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Full Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Application Details - {application.name}</DialogTitle>
            <DialogDescription>Complete application information</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={User} label="First Name" value={application.firstName} />
                <InfoItem icon={User} label="Last Name" value={application.lastName} />
                <InfoItem icon={Mail} label="Email" value={application.email} />
                <InfoItem icon={Phone} label="Phone" value={application.phoneNumber || application.phone} />
                <InfoItem icon={Calendar} label="Date of Birth" value={application.dateOfBirth ? new Date(application.dateOfBirth).toLocaleDateString() : null} />
              </div>
            </div>

            <Separator />

            {/* Current Address */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Home className="w-5 h-5" />
                Current Address
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={MapPin} label="Address" value={application.currentAddress} />
                <InfoItem icon={MapPin} label="City" value={application.currentCity} />
                <InfoItem icon={MapPin} label="State" value={application.currentState} />
                <InfoItem icon={MapPin} label="ZIP" value={application.currentZip} />
                <InfoItem icon={Calendar} label="Desired Move-in Date" value={application.moveInDate ? new Date(application.moveInDate).toLocaleDateString() : null} />
              </div>
            </div>

            <Separator />

            {/* Employment */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Employment Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={Briefcase} label="Employment Status" value={application.employmentStatus} />
                <InfoItem icon={Briefcase} label="Employer" value={application.employer} />
                <InfoItem icon={Briefcase} label="Occupation" value={application.occupation} />
                <InfoItem icon={DollarSign} label="Annual Income" value={application.annualIncome ? `$${application.annualIncome.toLocaleString()}` : null} />
                <InfoItem icon={Calendar} label="Length of Employment" value={application.employmentLength} />
              </div>
            </div>

            <Separator />

            {/* References */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Phone className="w-5 h-5" />
                References
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-sm mb-2">Emergency Contact</p>
                  <div className="grid grid-cols-2 gap-4">
                    <InfoItem icon={User} label="Name" value={application.emergencyContactName} />
                    <InfoItem icon={Phone} label="Phone" value={application.emergencyContactPhone} />
                    <InfoItem icon={User} label="Relationship" value={application.emergencyContactRelationship} />
                  </div>
                </div>
                {application.previousLandlordName && (
                  <div>
                    <p className="font-medium text-sm mb-2">Previous Landlord</p>
                    <div className="grid grid-cols-2 gap-4">
                      <InfoItem icon={User} label="Name" value={application.previousLandlordName} />
                      <InfoItem icon={Phone} label="Phone" value={application.previousLandlordPhone} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div>
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Additional Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <InfoItem icon={Users} label="Number of Occupants" value={application.numberOfOccupants} />
                {application.hasPets && (
                  <div className="col-span-2">
                    <div className="flex items-start gap-2 text-sm">
                      <PawPrint className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-700">Pet Details</p>
                        <p className="text-gray-600">{application.petDetails || "Has pets"}</p>
                      </div>
                    </div>
                  </div>
                )}
                {application.hasVehicles && (
                  <div className="col-span-2">
                    <div className="flex items-start gap-2 text-sm">
                      <Car className="w-4 h-4 mt-0.5 text-gray-500" />
                      <div>
                        <p className="font-medium text-gray-700">Vehicle Details</p>
                        <p className="text-gray-600">{application.vehicleDetails || "Has vehicles"}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Background Check */}
            {(application.hasEvictionHistory || application.hasCriminalHistory) && (
              <>
                <div>
                  <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    Background Information
                  </h3>
                  <div className="space-y-3">
                    {application.hasEvictionHistory && (
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p className="font-medium text-sm text-red-800 mb-1">Eviction History</p>
                        <p className="text-sm text-red-700">{application.evictionDetails || "Yes"}</p>
                      </div>
                    )}
                    {application.hasCriminalHistory && (
                      <div className="p-3 bg-red-50 rounded border border-red-200">
                        <p className="font-medium text-sm text-red-800 mb-1">Criminal History</p>
                        <p className="text-sm text-red-700">{application.criminalDetails || "Yes"}</p>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Additional Notes */}
            {application.additionalNotes && (
              <div>
                <h3 className="font-semibold text-lg mb-3">Additional Notes</h3>
                <div className="p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-700">{application.additionalNotes}</p>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this application? This will create a lease and deny all other pending applications for this property.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={isLoading}>
              {isLoading ? "Processing..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deny Dialog */}
      <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny Application</DialogTitle>
            <DialogDescription>
              Are you sure you want to deny this application? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDenyDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeny} disabled={isLoading}>
              {isLoading ? "Processing..." : "Deny"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
