export type DoctorAvailability = {
  id: string;
  fullName: string;
  specialty: string;
  yearsOfExperience: number;
  clinicName: string;
  avatarUrl?: string | null;
  nextAvailableAt?: string | null;
  bio?: string;
};
