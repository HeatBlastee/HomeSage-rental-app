import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const listApplications = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { userId, userType } = req.query;

        let whereClause = {};

        if (userId && userType) {
            if (userType === "tenant") {
                whereClause = { tenantCognitoId: String(userId) };
            } else if (userType === "manager") {
                whereClause = {
                    property: {
                        managerCognitoId: String(userId),
                    },
                };
            }
        }

        const applications = await prisma.application.findMany({
            where: whereClause,
            include: {
                property: {
                    include: {
                        location: true,
                        manager: true,
                    },
                },
                tenant: true,
            },
        });

        function calculateNextPaymentDate(startDate: Date): Date {
            const today = new Date();
            const nextPaymentDate = new Date(startDate);
            while (nextPaymentDate <= today) {
                nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
            }
            return nextPaymentDate;
        }

        const formattedApplications = await Promise.all(
            applications.map(async (app) => {
                const lease = await prisma.lease.findFirst({
                    where: {
                        tenant: {
                            cognitoId: app.tenantCognitoId,
                        },
                        propertyId: app.propertyId,
                    },
                    orderBy: { startDate: "desc" },
                });

                return {
                    ...app,
                    property: {
                        ...app.property,
                        address: app.property.location.address,
                    },
                    manager: app.property.manager,
                    lease: lease
                        ? {
                            ...lease,
                            nextPaymentDate: calculateNextPaymentDate(lease.startDate),
                        }
                        : null,
                };
            })
        );

        res.json(formattedApplications);
    } catch (error: any) {
        res
            .status(500)
            .json({ message: `Error retrieving applications: ${error.message}` });
    }
};

export const createApplication = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const {
            applicationDate,
            status,
            propertyId,
            tenantCognitoId,
            name,
            email,
            phoneNumber,
            message,
            // New fields
            firstName,
            lastName,
            phone,
            dateOfBirth,
            currentAddress,
            currentCity,
            currentState,
            currentZip,
            moveInDate,
            employmentStatus,
            employer,
            occupation,
            annualIncome,
            employmentLength,
            emergencyContactName,
            emergencyContactPhone,
            emergencyContactRelationship,
            previousLandlordName,
            previousLandlordPhone,
            numberOfOccupants,
            hasPets,
            petDetails,
            hasVehicles,
            vehicleDetails,
            hasEvictionHistory,
            evictionDetails,
            hasCriminalHistory,
            criminalDetails,
            additionalNotes,
        } = req.body;

        // Validate required fields
        if (!propertyId || !tenantCognitoId || !name || !email || !phoneNumber) {
            res.status(400).json({ message: "Missing required fields" });
            return;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            res.status(400).json({ message: "Invalid email format" });
            return;
        }

        // Check if property exists
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { 
                id: true,
                name: true,
                pricePerMonth: true, 
                securityDeposit: true 
            },
        });

        if (!property) {
            res.status(404).json({ message: "Property not found" });
            return;
        }

        // Check if tenant exists
        const tenant = await prisma.tenant.findUnique({
            where: { cognitoId: tenantCognitoId },
        });

        if (!tenant) {
            res.status(404).json({ message: "Tenant not found" });
            return;
        }

        // Check for duplicate applications - prevent tenant from applying to same property multiple times
        const existingApplication = await prisma.application.findFirst({
            where: {
                propertyId: propertyId,
                tenantCognitoId: tenantCognitoId,
                status: {
                    in: ["Pending", "Approved"], // Don't prevent re-application if previous was denied
                },
            },
        });

        if (existingApplication) {
            if (existingApplication.status === "Approved") {
                res.status(409).json({ 
                    message: "You have already been approved for this property" 
                });
            } else {
                res.status(409).json({ 
                    message: "You already have a pending application for this property" 
                });
            }
            return;
        }

        // Create application WITHOUT lease (lease is only created upon approval)
        const newApplication = await prisma.application.create({
            data: {
                applicationDate: new Date(applicationDate || new Date()),
                status: status || "Pending", // Default to Pending if not provided
                name,
                email,
                phoneNumber,
                message: message || null,
                // New comprehensive fields
                firstName: firstName || null,
                lastName: lastName || null,
                phone: phone || null,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
                currentAddress: currentAddress || null,
                currentCity: currentCity || null,
                currentState: currentState || null,
                currentZip: currentZip || null,
                moveInDate: moveInDate ? new Date(moveInDate) : null,
                employmentStatus: employmentStatus || null,
                employer: employer || null,
                occupation: occupation || null,
                annualIncome: annualIncome || null,
                employmentLength: employmentLength || null,
                emergencyContactName: emergencyContactName || null,
                emergencyContactPhone: emergencyContactPhone || null,
                emergencyContactRelationship: emergencyContactRelationship || null,
                previousLandlordName: previousLandlordName || null,
                previousLandlordPhone: previousLandlordPhone || null,
                numberOfOccupants: numberOfOccupants || null,
                hasPets: hasPets || false,
                petDetails: petDetails || null,
                hasVehicles: hasVehicles || false,
                vehicleDetails: vehicleDetails || null,
                hasEvictionHistory: hasEvictionHistory || false,
                evictionDetails: evictionDetails || null,
                hasCriminalHistory: hasCriminalHistory || false,
                criminalDetails: criminalDetails || null,
                additionalNotes: additionalNotes || null,
                property: {
                    connect: { id: propertyId },
                },
                tenant: {
                    connect: { cognitoId: tenantCognitoId },
                },
            },
            include: {
                property: {
                    include: {
                        location: true,
                        manager: true,
                    },
                },
                tenant: true,
            },
        });

        res.status(201).json(newApplication);
    } catch (error: any) {
        console.error("Error creating application:", error);
        res
            .status(500)
            .json({ message: `Error creating application: ${error.message}` });
    }
};

export const updateApplicationStatus = async (
    req: Request,
    res: Response
): Promise<void> => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        // Validate status value
        const validStatuses = ["Pending", "Approved", "Denied"];
        if (!status || !validStatuses.includes(status)) {
            res.status(400).json({ 
                message: "Invalid status. Must be one of: Pending, Approved, Denied" 
            });
            return;
        }

        const application = await prisma.application.findUnique({
            where: { id: Number(id) },
            include: {
                property: true,
                tenant: true,
                lease: true,
            },
        });

        if (!application) {
            res.status(404).json({ message: "Application not found." });
            return;
        }

        // Prevent updating an already approved application
        if (application.status === "Approved" && status !== "Approved") {
            res.status(400).json({ 
                message: "Cannot change status of an already approved application" 
            });
            return;
        }

        // Check if lease already exists for this application
        if (application.lease && status === "Approved") {
            res.status(409).json({ 
                message: "A lease already exists for this application" 
            });
            return;
        }

        if (status === "Approved") {
            // Check if tenant already has an active lease for this property
            const existingLease = await prisma.lease.findFirst({
                where: {
                    propertyId: application.propertyId,
                    tenantCognitoId: application.tenantCognitoId,
                    endDate: {
                        gte: new Date(), // Check for active/future leases
                    },
                },
            });

            if (existingLease) {
                res.status(409).json({ 
                    message: "Tenant already has an active lease for this property" 
                });
                return;
            }

            // Use transaction to ensure atomic operations with increased timeout
            await prisma.$transaction(async (prisma) => {
                // Create the lease
                const newLease = await prisma.lease.create({
                    data: {
                        startDate: new Date(),
                        endDate: new Date(
                            new Date().setFullYear(new Date().getFullYear() + 1)
                        ),
                        rent: application.property.pricePerMonth,
                        deposit: application.property.securityDeposit,
                        propertyId: application.propertyId,
                        tenantCognitoId: application.tenantCognitoId,
                    },
                });

                // Update the property to connect the tenant
                await prisma.property.update({
                    where: { id: application.propertyId },
                    data: {
                        tenants: {
                            connect: { cognitoId: application.tenantCognitoId },
                        },
                    },
                });

                // Update the application with the new lease ID and status
                await prisma.application.update({
                    where: { id: Number(id) },
                    data: { 
                        status, 
                        leaseId: newLease.id 
                    },
                });

                // Deny all other pending applications for this property
                await prisma.application.updateMany({
                    where: {
                        propertyId: application.propertyId,
                        id: { not: Number(id) },
                        status: "Pending",
                    },
                    data: {
                        status: "Denied",
                    },
                });
            }, {
                maxWait: 10000, // Wait up to 10 seconds to start transaction
                timeout: 15000, // Allow up to 15 seconds for transaction to complete
            });
        } else {
            // Update the application status (for Denied or back to Pending)
            await prisma.application.update({
                where: { id: Number(id) },
                data: { status },
            });
        }

        // Respond with the updated application details
        const updatedApplication = await prisma.application.findUnique({
            where: { id: Number(id) },
            include: {
                property: {
                    include: {
                        location: true,
                        manager: true,
                    },
                },
                tenant: true,
                lease: true,
            },
        });

        res.json(updatedApplication);
    } catch (error: any) {
        console.error("Error updating application status:", error);
        res
            .status(500)
            .json({ message: `Error updating application status: ${error.message}` });
    }
};
