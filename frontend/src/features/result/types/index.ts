export interface MedicalIndicator {
    label: string;
    value: string;
    unit?: string;
}

export interface MedicalResult {
    id: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    specialty: string;
    appointmentDate: string;
    diagnosis: string;
    indicators: MedicalIndicator[];
    conclusion: string;
    createdAt: string;
}

export type CreateResultInput = Omit<MedicalResult, "id" | "createdAt">;