package com.example.pdfmergeapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class PdfMergeApiApplication {
	public static void main(String[] args) {
		SpringApplication.run(PdfMergeApiApplication.class, args);
	}
}


