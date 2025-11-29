-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "Highlight" AS ENUM ('HighSpeedInternetAccess', 'WasherDryer', 'AirConditioning', 'Heating', 'SmokeFree', 'CableReady', 'SatelliteTV', 'DoubleVanities', 'TubShower', 'Intercom', 'SprinklerSystem', 'RecentlyRenovated', 'CloseToTransit', 'GreatView', 'QuietNeighborhood');

-- CreateEnum
CREATE TYPE "Amenity" AS ENUM ('WasherDryer', 'AirConditioning', 'Dishwasher', 'HighSpeedInternet', 'HardwoodFloors', 'WalkInClosets', 'Microwave', 'Refrigerator', 'Pool', 'Gym', 'Parking', 'PetsAllowed', 'WiFi');

-- CreateEnum
CREATE TYPE "PropertyType" AS ENUM ('Rooms', 'Tinyhouse', 'Apartment', 'Villa', 'Townhouse', 'Cottage');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('Pending', 'Denied', 'Approved');

-- CreateEnum
CREATE TYPE "EmploymentStatus" AS ENUM ('FullTime', 'PartTime', 'SelfEmployed', 'Contract', 'Unemployed', 'Retired', 'Student');

-- CreateEnum
CREATE TYPE "BackgroundCheckStatus" AS ENUM ('NotStarted', 'InProgress', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Paid', 'PartiallyPaid', 'Overdue');

-- CreateTable
CREATE TABLE "Property" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "pricePerMonth" DOUBLE PRECISION NOT NULL,
    "securityDeposit" DOUBLE PRECISION NOT NULL,
    "applicationFee" DOUBLE PRECISION NOT NULL,
    "photoUrls" TEXT[],
    "amenities" "Amenity"[],
    "highlights" "Highlight"[],
    "isPetsAllowed" BOOLEAN NOT NULL DEFAULT false,
    "isParkingIncluded" BOOLEAN NOT NULL DEFAULT false,
    "beds" INTEGER NOT NULL,
    "baths" DOUBLE PRECISION NOT NULL,
    "squareFeet" INTEGER NOT NULL,
    "propertyType" "PropertyType" NOT NULL,
    "postedDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "averageRating" DOUBLE PRECISION DEFAULT 0,
    "numberOfReviews" INTEGER DEFAULT 0,
    "locationId" INTEGER NOT NULL,
    "managerCognitoId" TEXT NOT NULL,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" SERIAL NOT NULL,
    "cognitoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" SERIAL NOT NULL,
    "cognitoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Location" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "coordinates" geography(Point, 4326) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" SERIAL NOT NULL,
    "applicationDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'Pending',
    "propertyId" INTEGER NOT NULL,
    "tenantCognitoId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "message" TEXT,
    "employmentStatus" "EmploymentStatus",
    "employerName" TEXT,
    "employerPhone" TEXT,
    "jobTitle" TEXT,
    "employmentStartDate" TIMESTAMP(3),
    "monthlyIncome" DOUBLE PRECISION,
    "additionalIncome" DOUBLE PRECISION,
    "additionalIncomeSource" TEXT,
    "currentAddress" TEXT,
    "currentLandlordName" TEXT,
    "currentLandlordPhone" TEXT,
    "currentRentAmount" DOUBLE PRECISION,
    "reasonForLeaving" TEXT,
    "yearsAtCurrentAddress" DOUBLE PRECISION,
    "emergencyContactName" TEXT,
    "emergencyContactPhone" TEXT,
    "emergencyContactRelation" TEXT,
    "reference1Name" TEXT,
    "reference1Phone" TEXT,
    "reference1Relation" TEXT,
    "reference2Name" TEXT,
    "reference2Phone" TEXT,
    "reference2Relation" TEXT,
    "numberOfOccupants" INTEGER,
    "hasPets" BOOLEAN DEFAULT false,
    "petDetails" TEXT,
    "hasVehicle" BOOLEAN DEFAULT false,
    "vehicleDetails" TEXT,
    "backgroundCheckStatus" "BackgroundCheckStatus" NOT NULL DEFAULT 'NotStarted',
    "backgroundCheckDate" TIMESTAMP(3),
    "creditScore" INTEGER,
    "documentUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "reviewNotes" TEXT,
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectionReason" TEXT,
    "leaseId" INTEGER,

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lease" (
    "id" SERIAL NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "rent" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL,
    "propertyId" INTEGER NOT NULL,
    "tenantCognitoId" TEXT NOT NULL,

    CONSTRAINT "Lease_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" SERIAL NOT NULL,
    "amountDue" DOUBLE PRECISION NOT NULL,
    "amountPaid" DOUBLE PRECISION NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paymentDate" TIMESTAMP(3) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL,
    "leaseId" INTEGER NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TenantFavorites" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TenantFavorites_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TenantProperties" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_TenantProperties_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Manager_cognitoId_key" ON "Manager"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_cognitoId_key" ON "Tenant"("cognitoId");

-- CreateIndex
CREATE UNIQUE INDEX "Application_leaseId_key" ON "Application"("leaseId");

-- CreateIndex
CREATE INDEX "Application_propertyId_idx" ON "Application"("propertyId");

-- CreateIndex
CREATE INDEX "Application_tenantCognitoId_idx" ON "Application"("tenantCognitoId");

-- CreateIndex
CREATE INDEX "Application_status_idx" ON "Application"("status");

-- CreateIndex
CREATE INDEX "_TenantFavorites_B_index" ON "_TenantFavorites"("B");

-- CreateIndex
CREATE INDEX "_TenantProperties_B_index" ON "_TenantProperties"("B");

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Property" ADD CONSTRAINT "Property_managerCognitoId_fkey" FOREIGN KEY ("managerCognitoId") REFERENCES "Manager"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_tenantCognitoId_fkey" FOREIGN KEY ("tenantCognitoId") REFERENCES "Tenant"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lease" ADD CONSTRAINT "Lease_tenantCognitoId_fkey" FOREIGN KEY ("tenantCognitoId") REFERENCES "Tenant"("cognitoId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_leaseId_fkey" FOREIGN KEY ("leaseId") REFERENCES "Lease"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TenantFavorites" ADD CONSTRAINT "_TenantFavorites_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TenantFavorites" ADD CONSTRAINT "_TenantFavorites_B_fkey" FOREIGN KEY ("B") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TenantProperties" ADD CONSTRAINT "_TenantProperties_A_fkey" FOREIGN KEY ("A") REFERENCES "Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TenantProperties" ADD CONSTRAINT "_TenantProperties_B_fkey" FOREIGN KEY ("B") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
