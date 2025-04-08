package com.example.pdfmergeapi.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
public class PdfMergeController {

    @PostMapping("/merge")
    public ResponseEntity<byte[]> mergePDFs(@RequestParam("files") MultipartFile[] files, @RequestParam("fileOrder") String fileOrder) throws IOException {
        // Parse the file order
        List<Integer> order = new ObjectMapper().readValue(fileOrder, new TypeReference<List<Integer>>() {});
        List<MultipartFile> reorderedFiles = new ArrayList<>();
        for (Integer index : order) {
            reorderedFiles.add(files[index]);
        }

        PDFMergerUtility merger = new PDFMergerUtility();
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

        for (MultipartFile file : reorderedFiles) {
            merger.addSource(file.getInputStream());
        }

        merger.setDestinationStream(outputStream);
        merger.mergeDocuments();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=merged.pdf")
                .body(outputStream.toByteArray());
    }
}