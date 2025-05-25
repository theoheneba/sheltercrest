import { jsPDF } from 'jspdf';
import { formatDate } from './formatDate';

/**
 * Generates a PDF agreement document with the provided signature and application data
 * @param signature - Base64 encoded signature image
 * @param applicationData - Application data to include in the agreement
 * @returns Promise resolving to a data URI string of the PDF
 */
export const generateAgreementPdf = async (signature: string, applicationData: any): Promise<string> => {
  try {
    const doc = new jsPDF();
    
    // Add header with logo
    doc.setFontSize(22);
    doc.setTextColor(41, 98, 255); // Primary color
    doc.text('ShelterCrest', 105, 20, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Rental Assistance Agreement', 105, 30, { align: 'center' });
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // Add content
    doc.setFontSize(12);
    doc.text('This agreement is made between ShelterCrest ("the Company") and', 20, 45);
    doc.setFont(undefined, 'bold');
    doc.text(`${applicationData.firstName || ''} ${applicationData.lastName || ''} ("the Tenant")`, 20, 52);
    doc.setFont(undefined, 'normal');
    
    // Add agreement details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('1. Assistance Details', 20, 65);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    
    const details = [
      `Monthly Rent Amount: GH₵ ${applicationData.monthlyRent || 0}`,
      `Deposit Amount: GH₵ ${applicationData.depositAmount || 0}`,
      `Interest Amount: GH₵ ${applicationData.interestAmount || 0}`,
      `Total Initial Payment: GH₵ ${applicationData.totalInitialPayment || 0}`,
      `Lease Period: ${formatDate(applicationData.leaseStartDate)} to ${formatDate(applicationData.leaseEndDate)}`
    ];
    
    let yPos = 75;
    details.forEach(detail => {
      doc.text(detail, 30, yPos);
      yPos += 8;
    });
    
    // Payment Terms
    yPos += 5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('2. Payment Terms', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    
    yPos += 10;
    const paymentTerms = [
      'The Tenant agrees to make monthly payments according to the established payment schedule.',
      'Payments are due on the 28th of each month.',
      'Late payment penalties:',
      '   • 4th-10th: 10% penalty',
      '   • 11th-18th: 15% penalty',
      '   • 19th-25th: 25% penalty'
    ];
    
    paymentTerms.forEach(term => {
      doc.text(term, 30, yPos);
      yPos += 8;
    });
    
    // Tenant Responsibilities
    yPos += 5;
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('3. Tenant Responsibilities', 20, yPos);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    
    yPos += 10;
    const responsibilities = [
      'The Tenant agrees to:',
      '   • Maintain timely payments',
      '   • Notify the Company of any changes in employment or income',
      '   • Comply with all lease terms and conditions'
    ];
    
    responsibilities.forEach(resp => {
      doc.text(resp, 30, yPos);
      yPos += 8;
    });
    
    // Add signature
    yPos += 15;
    doc.text('Tenant Signature:', 20, yPos);
    
    // Add the signature image if provided
    if (signature && signature.startsWith('data:image')) {
      try {
        yPos += 5;
        doc.addImage(signature, 'PNG', 20, yPos, 50, 30);
        yPos += 35;
      } catch (err) {
        console.error('Error adding signature to PDF:', err);
        yPos += 10;
        doc.text('(Signature could not be displayed)', 20, yPos);
        yPos += 10;
      }
    } else {
      yPos += 10;
      doc.text('(Signature not provided)', 20, yPos);
      yPos += 10;
    }
    
    // Add date
    yPos += 5;
    doc.text(`Date: ${formatDate(new Date().toISOString())}`, 20, yPos);
    
    // Add company signature
    yPos += 15;
    doc.text('For ShelterCrest:', 120, yPos);
    yPos += 10;
    doc.text('_______________________', 120, yPos);
    yPos += 10;
    doc.text('Authorized Signature', 120, yPos);
    
    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount} | ShelterCrest Rental Assistance Agreement | Generated on ${formatDate(new Date().toISOString())}`,
        105, 
        285, 
        { align: 'center' }
      );
    }
    
    return doc.output('datauristring');
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate agreement PDF');
  }
};

/**
 * Generates a payment receipt PDF
 * @param paymentData - Payment data to include in the receipt
 * @returns Promise resolving to a data URI string of the PDF
 */
export const generatePaymentReceiptPdf = async (paymentData: any): Promise<string> => {
  try {
    const doc = new jsPDF();
    
    // Add header with logo
    doc.setFontSize(22);
    doc.setTextColor(41, 98, 255); // Primary color
    doc.text('ShelterCrest', 105, 20, { align: 'center' });
    
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('Payment Receipt', 105, 30, { align: 'center' });
    
    // Add horizontal line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, 35, 190, 35);
    
    // Add receipt details
    doc.setFontSize(12);
    doc.text(`Receipt Number: ${paymentData.transactionId || 'N/A'}`, 20, 45);
    doc.text(`Date: ${formatDate(paymentData.paidDate || new Date().toISOString())}`, 20, 55);
    doc.text(`Payment Method: ${paymentData.paymentMethod || 'N/A'}`, 20, 65);
    
    // Add payment details
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('Payment Details', 20, 80);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(12);
    
    // Create a table-like structure
    doc.line(20, 85, 190, 85);
    doc.text('Description', 25, 95);
    doc.text('Amount (GH₵)', 150, 95);
    doc.line(20, 100, 190, 100);
    
    // Payment line item
    doc.text('Monthly Rent Payment', 25, 110);
    doc.text(`${paymentData.amount?.toLocaleString() || '0'}`, 150, 110);
    
    // If there's a late fee
    let yPos = 110;
    if (paymentData.lateFee && paymentData.lateFee > 0) {
      yPos += 10;
      doc.text('Late Payment Fee', 25, yPos);
      doc.text(`${paymentData.lateFee.toLocaleString() || '0'}`, 150, yPos);
    }
    
    // Total
    yPos += 10;
    doc.line(20, yPos + 5, 190, yPos + 5);
    yPos += 15;
    doc.setFont(undefined, 'bold');
    doc.text('Total', 25, yPos);
    const total = (paymentData.amount || 0) + (paymentData.lateFee || 0);
    doc.text(`${total.toLocaleString()}`, 150, yPos);
    doc.setFont(undefined, 'normal');
    
    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This is an official receipt from ShelterCrest. Thank you for your payment.',
      105, 
      250, 
      { align: 'center' }
    );
    
    doc.text(
      'For any inquiries, please contact support@sheltercrest.org or call +233 55 123 4567',
      105, 
      260, 
      { align: 'center' }
    );
    
    return doc.output('datauristring');
  } catch (error) {
    console.error('Error generating payment receipt:', error);
    throw new Error('Failed to generate payment receipt');
  }
};