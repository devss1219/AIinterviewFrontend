# Software Requirements Specification (SRS)
## PrepAI — AI-Powered Resume Analyser

**Version:** 1.0  
**Date:** April 2026  
**Live URL:** https://galactusai.netlify.app/

---

## 1. Introduction

### 1.1 Purpose
PrepAI is an AI-powered web application that analyses a user's resume and provides detailed feedback including ATS score, strengths, weaknesses, missing keywords, and suitable job roles.

### 1.2 Scope
- Users can upload their resume (PDF format)
- The system extracts text from the PDF
- AI analyses the resume and returns a structured report
- Results are displayed in a visual dashboard

### 1.3 Intended Users
- Students and freshers preparing for job applications
- Working professionals looking to improve their resume
- Anyone who wants ATS-optimized resume feedback

---

## 2. System Overview

```
User (Browser)
     │
     │  Upload PDF
     ▼
Frontend (React + Vite)
Hosted on: Netlify
     │
     │  POST /upload (multipart/form-data)
     ▼
Backend (Python Flask + Groq AI)
Hosted on: Render
     │
     │  Extract text → Send to Groq LLM → Parse JSON
     ▼
AI Response → Sent back to Frontend → Displayed as Report
```

---

## 3. Functional Requirements

| ID | Requirement |
|----|-------------|
| FR-01 | User can upload a PDF resume (max 5MB) |
| FR-02 | System extracts text from the uploaded PDF using pdfplumber |
| FR-03 | System sends extracted text to Groq AI (LLaMA 3.3 70B model) |
| FR-04 | AI returns an Overall Score (0–100) |
| FR-05 | AI returns an ATS Compatibility Score (0–100) |
| FR-06 | AI returns Section-wise scores (Contact, Summary, Experience, Skills, Education, Formatting) |
| FR-07 | AI returns a list of Strengths found in the resume |
| FR-08 | AI returns a list of Improvements needed |
| FR-09 | AI returns Keywords found and Missing Keywords |
| FR-10 | AI returns 5 Suitable Job Roles based on the resume |
| FR-11 | AI returns a one-line Verdict about the resume |
| FR-12 | User can go back and upload another resume |
| FR-13 | System shows error if file is not a PDF or is unreadable |

---

## 4. Non-Functional Requirements

| ID | Requirement |
|----|-------------|
| NFR-01 | Response time should be under 30 seconds |
| NFR-02 | Application should work on both desktop and mobile browsers |
| NFR-03 | PDF file size limit is 5MB |
| NFR-04 | API keys must not be exposed on the frontend |
| NFR-05 | Application should be available 24/7 (Netlify + Render free tier) |
| NFR-06 | Canvas animation should be smooth — reduced particles on mobile devices |

---

## 5. Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS |
| **Backend** | Python 3, Flask, Flask-CORS |
| **PDF Parsing** | pdfplumber |
| **AI Model** | Groq API — LLaMA 3.3 70B Versatile |
| **Frontend Hosting** | Netlify |
| **Backend Hosting** | Render (Free Tier) |
| **Version Control** | GitHub |

---

## 6. API Reference

### POST `/upload`
Accepts a PDF resume file and returns AI analysis.

**Request:**
```
Content-Type: multipart/form-data
Body: resume = <PDF file>
```

**Response (Success):**
```json
{
  "success": true,
  "fileName": "my_resume.pdf",
  "analysis": {
    "overallScore": 62,
    "atsScore": 55,
    "sections": {
      "contactInfo": 7,
      "summary": 5,
      "experience": 20,
      "skills": 14,
      "education": 16,
      "formatting": 8
    },
    "strengths": ["..."],
    "improvements": ["..."],
    "keywords": ["..."],
    "missingKeywords": ["..."],
    "suitableRoles": ["..."],
    "verdict": "..."
  }
}
```

**Response (Error):**
```json
{
  "error": "Only PDF files are allowed"
}
```

---

## 7. Constraints & Limitations

- Render free tier **sleeps after 15 min of inactivity** — first request may take 30–50 seconds to wake up
- Only **PDF files** are supported (no Word/image resumes)
- **Scanned image PDFs** will fail — text must be selectable in the PDF
- AI scoring is **not 100% deterministic** — results may vary slightly between uploads
- Free tier Groq API has **rate limits** on heavy usage

---

## 8. Future Enhancements (Possible)

- Support for `.docx` (Word) resume format
- Side-by-side resume comparison
- Job description matching — paste a JD and get a match score
- Download report as PDF
- User login and resume history
- Cover letter generator

---

*Document prepared for PrepAI v1.0 — April 2026*
