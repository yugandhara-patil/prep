package com.prep.backend.service;

import java.io.IOException;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.extractor.XWPFWordExtractor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ResumeTextExtractorService {

    public String extractText(MultipartFile file) throws IOException {

        String fileName = file.getOriginalFilename();

        if (fileName == null) {
            throw new IllegalArgumentException("Resume file name is missing");
        }

        String lowerFileName = fileName.toLowerCase();

        if (lowerFileName.endsWith(".pdf")) {
            return extractFromPdf(file);
        }

        if (lowerFileName.endsWith(".docx")) {
            return extractFromDocx(file);
        }

        throw new IllegalArgumentException(
                "Unsupported resume format. Only PDF and DOCX are allowed."
        );
    }

    private String extractFromPdf(MultipartFile file) throws IOException {

        try (PDDocument document = Loader.loadPDF(file.getBytes())) {

            PDFTextStripper stripper = new PDFTextStripper();

            return stripper.getText(document).trim();
        }
    }

    private String extractFromDocx(MultipartFile file) throws IOException {

        try (XWPFDocument document =
                     new XWPFDocument(file.getInputStream());
             XWPFWordExtractor extractor =
                     new XWPFWordExtractor(document)) {

            return extractor.getText().trim();
        }
    }
}