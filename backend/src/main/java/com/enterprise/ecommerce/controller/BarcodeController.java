package com.enterprise.ecommerce.controller;

import com.enterprise.ecommerce.service.BarcodeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/util")
public class BarcodeController {

    @Autowired
    private BarcodeService barcodeService;

    @GetMapping("/barcode")
    public ResponseEntity<Map<String, String>> getBarcode(@RequestParam String text) {
        String base64 = barcodeService.generateBarcodeBase64(text, 300, 80);
        Map<String, String> response = new HashMap<>();
        response.put("image", "data:image/png;base64," + base64);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/qrcode")
    public ResponseEntity<Map<String, String>> getQRCode(@RequestParam String text) {
        String base64 = barcodeService.generateQRCodeBase64(text, 200, 200);
        Map<String, String> response = new HashMap<>();
        response.put("image", "data:image/png;base64," + base64);
        return ResponseEntity.ok(response);
    }
}
