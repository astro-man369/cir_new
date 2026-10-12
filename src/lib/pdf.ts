import { jsPDF } from 'jspdf';

export function generateVolunteerCertificate(
  userName: string,
  eventTitle: string,
  ngoName: string,
  eventDate: string
) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // Decorative Border
  doc.setLineWidth(2);
  doc.setDrawColor(24, 119, 242); // Civic Blue
  doc.rect(8, 8, width - 16, height - 16);

  doc.setLineWidth(0.5);
  doc.setDrawColor(230, 81, 0); // Saffron Accent
  doc.rect(12, 12, width - 24, height - 24);

  // Title / Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(24, 119, 242);
  doc.text('CIR VOLUNTEER CERTIFICATE', width / 2, 35, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(14);
  doc.setTextColor(100, 100, 100);
  doc.text('CERTIFICATE OF COMMENDATION & CIVIC IMPACT', width / 2, 45, { align: 'center' });

  // Body
  doc.setFontSize(14);
  doc.setTextColor(50, 50, 50);
  doc.text('This is proudly presented to', width / 2, 65, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  doc.setTextColor(230, 81, 0);
  doc.text(userName.toUpperCase(), width / 2, 80, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(13);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `For outstanding volunteer service in the community civic action drive:`,
    width / 2,
    98,
    { align: 'center' }
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(24, 119, 242);
  doc.text(`"${eventTitle}"`, width / 2, 110, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(80, 80, 80);
  const formattedDate = new Date(eventDate).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  doc.text(`Organized by ${ngoName} on ${formattedDate} in Greater Hyderabad.`, width / 2, 122, { align: 'center' });

  doc.setFontSize(11);
  doc.setTextColor(120, 120, 120);
  doc.text(
    'Your dedication helps build cleaner, safer, and more accountable Indian cities.',
    width / 2,
    135,
    { align: 'center' }
  );

  // Signatures Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(180, 180, 180);
  doc.line(40, 165, 110, 165);
  doc.line(180, 165, 250, 165);

  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  doc.text('Authorized NGO Lead', 75, 172, { align: 'center' });
  doc.text(ngoName, 75, 178, { align: 'center' });

  doc.text('CIR Verification Officer', 215, 172, { align: 'center' });
  doc.text('Public Accountability Board', 215, 178, { align: 'center' });

  // Verification Code Footer
  const verifyCode = `CERT-CIR-${Math.floor(100000 + Math.random() * 900000)}`;
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text(`Verification Code: ${verifyCode} | Issued via CIR Open Platform`, width / 2, 192, { align: 'center' });

  // Trigger download
  doc.save(`CIR_Certificate_${userName.replace(/\s+/g, '_')}.pdf`);
  return verifyCode;
}
