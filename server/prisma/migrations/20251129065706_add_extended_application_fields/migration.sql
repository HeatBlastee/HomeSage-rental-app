/*
  Warnings:

  - The `employmentStatus` column on the `Application` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Application" ADD COLUMN     "additionalNotes" TEXT,
ADD COLUMN     "annualIncome" DOUBLE PRECISION,
ADD COLUMN     "criminalDetails" TEXT,
ADD COLUMN     "currentCity" TEXT,
ADD COLUMN     "currentState" TEXT,
ADD COLUMN     "currentZip" TEXT,
ADD COLUMN     "dateOfBirth" TIMESTAMP(3),
ADD COLUMN     "emergencyContactRelationship" TEXT,
ADD COLUMN     "employer" TEXT,
ADD COLUMN     "employmentLength" TEXT,
ADD COLUMN     "evictionDetails" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "hasCriminalHistory" BOOLEAN DEFAULT false,
ADD COLUMN     "hasEvictionHistory" BOOLEAN DEFAULT false,
ADD COLUMN     "hasVehicles" BOOLEAN DEFAULT false,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "moveInDate" TIMESTAMP(3),
ADD COLUMN     "occupation" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "previousLandlordName" TEXT,
ADD COLUMN     "previousLandlordPhone" TEXT,
DROP COLUMN "employmentStatus",
ADD COLUMN     "employmentStatus" TEXT;
