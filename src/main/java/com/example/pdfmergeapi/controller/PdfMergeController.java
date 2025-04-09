package com.example.pdfmergeapi.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.multipdf.PDFMergerUtility;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@RestController
public class PdfMergeController {

    @PostMapping("/merge")
    public void mergePDFs(
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("fileOrder") String fileOrder,
            HttpServletResponse response
    ) throws IOException {

        // Set response headers for file download
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=merged.pdf");

        // Parse file order from JSON
        List<Integer> order = new ObjectMapper().readValue(fileOrder, new TypeReference<List<Integer>>() {});
        List<MultipartFile> reorderedFiles = new ArrayList<>();
        for (Integer index : order) {
            reorderedFiles.add(files[index]);
        }

        // Set up PDF merger utility
        PDFMergerUtility merger = new PDFMergerUtility();
        merger.setDestinationStream(response.getOutputStream());

        // Add sources
        for (MultipartFile file : reorderedFiles) {
            merger.addSource(file.getInputStream());
        }

        // Merge directly to response stream
        merger.mergeDocuments(null);

        // Flush and close the response stream
        response.flushBuffer();
    }
}
