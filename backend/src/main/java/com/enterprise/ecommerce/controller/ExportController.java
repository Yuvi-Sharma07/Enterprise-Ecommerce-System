package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.service.ExportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/export")
@PreAuthorize("hasRole('ADMIN') or hasRole('WAREHOUSE_MANAGER')")
public class ExportController {

    @Autowired
    private ExportService exportService;

    @GetMapping("/excel")
    public ResponseEntity<byte[]> exportExcel() {
        byte[] data = exportService.exportOrdersToExcel();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders.xlsx")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(data);
    }

    @GetMapping("/pdf")
    public ResponseEntity<byte[]> exportPdf() {
        byte[] data = exportService.exportOrdersToPdf();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=orders.pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(data);
    }
}
