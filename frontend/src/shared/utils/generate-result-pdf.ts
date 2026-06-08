import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import dayjs from "dayjs";
import type { BackendResult } from "@/features/result/api/result-api";

export async function generateResultPdf(result: BackendResult): Promise<void> {
  const patientName = escapeHtml(result.appointments?.profiles?.fullname ?? "—");
  const patientPhone = escapeHtml(result.appointments?.profiles?.phone ?? "—");
  const date = result.appointments?.appointment_date
    ? escapeHtml(dayjs(result.appointments.appointment_date).format("DD/MM/YYYY"))
    : "—";
  const counterName = escapeHtml(result.appointments?.counters?.name ?? "—");
  const counterRoom = escapeHtml(result.appointments?.counters?.room ?? "—");
  const resultCode = escapeHtml(result.appointment_id.substring(0, 8).toUpperCase());
  const now = dayjs();

  // ── Dựng container ẩn ──────────────────────────────────────
  const container = document.createElement("div");
  container.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 794px;
    background: #fff;
    font-family: 'Segoe UI', 'Roboto', 'Arial', sans-serif;
    color: #1a1a2e;
    z-index: -1;
  `;

  container.innerHTML = `
    <div style="padding: 48px 52px 36px; min-height: 1100px; display: flex; flex-direction: column;">

      <!-- ======= HEADER ======= -->
      <div style="display: flex; align-items: center; gap: 18px; margin-bottom: 6px;">
        <img
          src="/logo-bvub.png"
          crossorigin="anonymous"
          style="width: 80px; height: 80px; object-fit: contain;"
        />
        <div>
          <div style="font-size: 22px; font-weight: 800; color: #0d47a1; letter-spacing: 0.5px;">
            BỆNH VIỆN UNG BƯỚU ĐÀ NẴNG
          </div>
          <div style="font-size: 12px; color: #546e7a; margin-top: 2px;">
            DA NANG ONCOLOGY HOSPITAL
          </div>
          <div style="font-size: 11px; color: #78909c; margin-top: 3px;">
            Hoàng Trung Thông, Hòa Khánh, Đà Nẵng &nbsp;·&nbsp; ĐT: 0236 3717 347
          </div>
        </div>
      </div>

      <!-- Separator -->
      <div style="height: 3px; background: linear-gradient(90deg, #0d47a1 0%, #42a5f5 50%, #e3f2fd 100%); border-radius: 2px; margin-bottom: 28px;"></div>

      <!-- ======= TITLE ======= -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="font-size: 24px; font-weight: 800; color: #0d47a1; letter-spacing: 1px;">
          PHIẾU KẾT QUẢ KHÁM BỆNH
        </div>
        <div style="font-size: 12px; color: #90a4ae; margin-top: 4px;">
          MEDICAL EXAMINATION RESULT
        </div>
        <div style="font-size: 12px; color: #78909c; margin-top: 6px;">
          Mã phiếu: <span style="font-weight: 700; color: #0d47a1;">#${resultCode}</span>
        </div>
      </div>

      <!-- ======= PATIENT INFO ======= -->
      <div style="background: #f5f9ff; border: 1px solid #dce8f5; border-radius: 10px; padding: 18px 22px; margin-bottom: 24px;">
        <div style="font-size: 13px; font-weight: 700; color: #0d47a1; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
          ▸ Thông tin bệnh nhân
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
          <tr>
            <td style="padding: 5px 0; width: 50%;">
              <span style="color: #78909c;">Họ và tên:</span>&nbsp;
              <span style="font-weight: 700; color: #1a1a2e;">${patientName}</span>
            </td>
            <td style="padding: 5px 0;">
              <span style="color: #78909c;">Số điện thoại:</span>&nbsp;
              <span style="font-weight: 700; color: #1a1a2e;">${patientPhone}</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 5px 0;">
              <span style="color: #78909c;">Ngày khám:</span>&nbsp;
              <span style="font-weight: 700; color: #1a1a2e;">${date}</span>
            </td>
            <td style="padding: 5px 0;">
              <span style="color: #78909c;">Phòng khám:</span>&nbsp;
              <span style="font-weight: 700; color: #1a1a2e;">${counterName} (${counterRoom})</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- ======= DIAGNOSIS ======= -->
      <div style="margin-bottom: 22px;">
        <div style="font-size: 13px; font-weight: 700; color: #0d47a1; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
          ▸ Chẩn đoán
        </div>
        <div style="background: #e8f5e9; border-left: 4px solid #43a047; border-radius: 8px; padding: 16px 20px; font-size: 14px; line-height: 1.7; color: #1b5e20; white-space: pre-wrap;">
${escapeHtml(result.diagnosis ?? "Chưa có chẩn đoán")}
        </div>
      </div>

      <!-- ======= RESULT / CONCLUSION ======= -->
      <div style="margin-bottom: 28px; flex: 1;">
        <div style="font-size: 13px; font-weight: 700; color: #0d47a1; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.5px;">
          ▸ Kết luận và Hướng điều trị
        </div>
        <div style="border: 1px solid #e0e0e0; border-radius: 8px; padding: 16px 20px; font-size: 14px; line-height: 1.7; color: #37474f; min-height: 120px; white-space: pre-wrap;">
${escapeHtml(result.result ?? "Chưa có kết luận")}
        </div>
      </div>

      <!-- ======= SIGNATURE AREA ======= -->
      <div style="display: flex; justify-content: flex-end; margin-bottom: 32px;">
        <div style="text-align: center; min-width: 260px;">
          <div style="font-size: 13px; color: #546e7a;">
            Đà Nẵng, ngày ${now.format("DD")} tháng ${now.format("MM")} năm ${now.format("YYYY")}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: #0d47a1; margin-top: 4px;">
            Bác sĩ phụ trách
          </div>
          <div style="font-size: 11px; color: #90a4ae; font-style: italic; margin-top: 2px;">
            (Ký và ghi rõ họ tên)
          </div>
          <div style="height: 80px;"></div>
        </div>
      </div>

      <!-- ======= FOOTER ======= -->
      <div style="border-top: 2px solid #e3f2fd; padding-top: 12px; text-align: center;">
        <div style="font-size: 11px; color: #90a4ae;">
          ⚕ Bệnh viện Ung bướu Đà Nẵng &nbsp;·&nbsp; benhvienungbuoudanang.com.vn
        </div>
        <div style="font-size: 10px; color: #b0bec5; margin-top: 3px;">
          Tài liệu được tạo tự động bởi hệ thống quản lý bệnh viện &nbsp;·&nbsp; Ngày in: ${now.format("DD/MM/YYYY HH:mm")}
        </div>
      </div>

    </div>
  `;

  document.body.appendChild(container);

  try {
    // ── Render HTML → Canvas → PDF ─────────────────────────
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    // Nếu nội dung dài hơn 1 trang → chia nhiều trang
    if (imgHeight <= pdfHeight) {
      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    } else {
      let remainingHeight = imgHeight;
      let position = 0;

      while (remainingHeight > 0) {
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        remainingHeight -= pdfHeight;
        position -= pdfHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
        }
      }
    }

    const fileName = `KetQuaKham_${patientName.replace(/\s+/g, "_")}_${dayjs(result.appointments?.appointment_date).format("YYYYMMDD")}.pdf`;
    pdf.save(fileName);
  } finally {
    document.body.removeChild(container);
  }
}

/** Escape HTML special characters to prevent injection */
function escapeHtml(text: string): string {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}
