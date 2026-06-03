import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/shared/ui/button";
import { Card } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { toast } from "sonner";

import { resultApi } from "../api/result-api";

type IndicatorInput = {
    label: string;
    value: string;
    unit: string;
};

export default function DoctorEnterResultsPage() {
    const navigate = useNavigate();

    const [appointmentId, setAppointmentId] = useState<string>("");
    const [diagnosis, setDiagnosis] = useState<string>("");
    const [conclusion, setConclusion] = useState<string>("");

    const [indicators, setIndicators] = useState<IndicatorInput[]>([
        { label: "", value: "", unit: "" },
    ]);

    const canSubmit = useMemo(() => {
        return Boolean(appointmentId.trim() && diagnosis.trim() && conclusion.trim());
    }, [appointmentId, diagnosis, conclusion]);

    const submit = async () => {
        if (!canSubmit) return;

        try {
            await resultApi.create({
                appointment_id: appointmentId,
                diagnosis,
                indicators: indicators.map((i) => ({
                    label: i.label ?? "",
                    value: i.value ?? "",
                    unit: i.unit ?? "",
                })),
                conclusion,
            } as any);
            toast.success("Đã lưu kết quả xét nghiệm");
            navigate("/results");
        } catch (e: any) {
            toast.error(e?.response?.data?.message || "Không thể lưu kết quả");
        }
    };

    return (
        <div className="mx-auto max-w-3xl p-4">
            <h1 className="mb-4 text-xl font-semibold">Nhập kết quả xét nghiệm</h1>

            <Card className="p-4">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label>Appointment ID</Label>
                        <Input
                            value={appointmentId}
                            placeholder="Ví dụ: UUID..."
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAppointmentId(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Chẩn đoán</Label>
                        <textarea
                            value={diagnosis}
                            placeholder="Nhập chẩn đoán..."
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiagnosis(e.target.value)}
                            rows={4}
                            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Chỉ số</Label>
                        <div className="space-y-3">
                            {indicators.map((it, idx) => (
                                <div key={idx} className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                                    <Input
                                        value={it.label}
                                        placeholder="Label"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const next = [...indicators];
                                            next[idx] = { ...next[idx], label: e.target.value ?? "" };
                                            setIndicators(next);
                                        }}
                                    />
                                    <Input
                                        value={it.value}
                                        placeholder="Value"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const next = [...indicators];
                                            next[idx] = { ...next[idx], value: e.target.value ?? "" };
                                            setIndicators(next);
                                        }}
                                    />
                                    <Input
                                        value={it.unit}
                                        placeholder="Unit"
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            const next = [...indicators];
                                            next[idx] = { ...next[idx], unit: e.target.value ?? "" };
                                            setIndicators(next);
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <Button
                            variant="secondary"
                            className="mt-2"
                            onClick={() => setIndicators((prev) => [...prev, { label: "", value: "", unit: "" }])}
                        >
                            + Thêm chỉ số
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <Label>Kết luận</Label>
                        <textarea
                            value={conclusion}
                            placeholder="Nhập kết luận..."
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConclusion(e.target.value)}
                            rows={4}
                            className="w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" onClick={() => navigate("/results")}>Hủy</Button>
                        <Button onClick={submit} disabled={!canSubmit}>Lưu kết quả</Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}

