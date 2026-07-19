package com.enterprise.ecommerce.service;

import com.enterprise.ecommerce.model.Order;
import com.enterprise.ecommerce.repository.OrderRepository;
import com.lowagie.text.Document;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.io.ByteArrayOutputStream;
import java.util.List;

@Service
public class ExportService {

    @Autowired
    private OrderRepository orderRepository;

    public byte[] exportOrdersToExcel() {
        List<Order> orders = orderRepository.findAll();
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Orders");

            Row headerRow = sheet.createRow(0);
            String[] headers = {"Order ID", "Customer", "Total Amount", "Status", "Tracking Number", "Created At"};
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                CellStyle style = workbook.createCellStyle();
                Font font = workbook.createFont();
                font.setBold(true);
                style.setFont(font);
                cell.setCellStyle(style);
            }

            int rowIdx = 1;
            for (Order order : orders) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(order.getId());
                row.createCell(1).setCellValue(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName());
                row.createCell(2).setCellValue(order.getTotalAmount().doubleValue());
                row.createCell(3).setCellValue(order.getStatus().name());
                row.createCell(4).setCellValue(order.getTrackingNumber() != null ? order.getTrackingNumber() : "N/A");
                row.createCell(5).setCellValue(order.getCreatedAt().toString());
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export Excel: " + e.getMessage());
        }
    }

    public byte[] exportOrdersToPdf() {
        List<Order> orders = orderRepository.findAll();
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4);
            PdfWriter.getInstance(document, out);
            document.open();

            document.add(new Paragraph("Enterprise E-Commerce Orders Log"));
            document.add(new Paragraph("Generated At: " + java.time.LocalDateTime.now().toString()));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(6);
            table.setWidthPercentage(100);
            table.addCell("Order ID");
            table.addCell("Customer");
            table.addCell("Total Amount");
            table.addCell("Status");
            table.addCell("Tracking Number");
            table.addCell("Created At");

            for (Order order : orders) {
                table.addCell(order.getId().toString());
                table.addCell(order.getCustomer().getFirstName() + " " + order.getCustomer().getLastName());
                table.addCell("$" + order.getTotalAmount().toString());
                table.addCell(order.getStatus().name());
                table.addCell(order.getTrackingNumber() != null ? order.getTrackingNumber() : "N/A");
                table.addCell(order.getCreatedAt().toString().substring(0, 10));
            }

            document.add(table);
            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Failed to export PDF: " + e.getMessage());
        }
    }
}
