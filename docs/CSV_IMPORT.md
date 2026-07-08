# CSV Import Guide

This guide explains how to bulk import questions into the EPX platform using CSV files.

## Overview

The CSV import system allows administrators to add multiple questions to the database at once. This is the recommended way to populate the question bank with real questions.

## CSV Format

### Required Fields

- **questionText**: The question text
- **optionA**: First option
- **optionB**: Second option
- **optionC**: Third option
- **optionD**: Fourth option
- **correctOption**: Index of correct answer (0, 1, 2, or 3)
- **subject**: Subject (Physics, Chemistry, Mathematics)
- **chapter**: Chapter name
- **difficulty**: Difficulty level (EASY, MEDIUM, HARD)
- **examType**: Exam type (JEE_MAIN, JEE_ADVANCED, MHT_CET, BITSAT, etc.)

### Optional Fields

- **topic**: Topic within the chapter
- **explanation**: Explanation for the answer
- **imagePath**: Path to question image (e.g., /questions/image-name.jpg)
- **marks**: Marks for the question (default: 1)
- **negativeMarks**: Negative marks for wrong answer (default: 0)

## CSV Example

```csv
questionText,optionA,optionB,optionC,optionD,correctOption,subject,chapter,topic,difficulty,examType,explanation
"A particle moves with uniform acceleration of 4 m/s². If its initial velocity is 10 m/s, what is its velocity after 3 seconds?","18 m/s","22 m/s","20 m/s","24 m/s",1,Physics,Mechanics,Kinematics,MEDIUM,JEE_MAIN,"Using v = u + at = 10 + 4×3 = 22 m/s"
"The force between two charges separated by distance r is F. If the distance is halved, the new force is:","4F","2F","F/2","F/4",0,Physics,Electrostatics,Coulomb's Law,MEDIUM,JEE_MAIN,"F ∝ 1/r², so halving distance quadruples force."
"What is the pH of 0.001 M HCl solution?","3","11","1","7",0,Chemistry,Acids and Bases,pH Calculation,EASY,JEE_MAIN,"[H⁺] = 10⁻³ M, pH = -log(10⁻³) = 3"
"The derivative of x³ with respect to x is:","3x²","x²","3x","x⁴/4",0,Mathematics,Calculus,Differentiation,MEDIUM,JEE_MAIN,"d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x²"
```

## How to Import

### Via Admin Panel

1. Login as admin
2. Navigate to `/admin/questions`
3. Click "CSV Upload" button
4. Select your CSV file
5. Click upload

The system will:
- Parse the CSV file
- Validate each question
- Skip invalid questions with error details
- Create valid questions in the database
- Return a summary of uploaded questions

### Via API

```bash
curl -X POST http://localhost:3000/api/admin/questions/bulk-upload \
  -F "file=@questions.csv" \
  -F "type=csv"
```

Response:
```json
{
  "uploaded": 25,
  "skipped": 2,
  "errors": [
    {
      "row": 3,
      "error": "Missing required field: correctOption"
    }
  ]
}
```

## Validation Rules

The CSV parser validates each question:

1. **Required fields must be present**
2. **correctOption must be 0, 1, 2, or 3**
3. **difficulty must be EASY, MEDIUM, or HARD**
4. **examType must be a valid exam type**
5. **questionText must not be empty**
6. **All 4 options must be provided**

## Question Images

To add images to questions:

1. Upload images to `public/questions/` directory
2. Reference them in the CSV using the `imagePath` field
3. Use relative paths: `/questions/image-name.jpg`

Example:
```csv
questionText,optionA,optionB,optionC,optionD,correctOption,subject,chapter,topic,difficulty,examType,explanation,imagePath
"Refer to the diagram below. What is the value of x?","10","20","30","40",1,Physics,Optics,Ray Diagrams,MEDIUM,JEE_MAIN,"Using Snell's law...","/questions/optics-diagram-1.jpg"
```

## Supported Exam Types

- JEE_MAIN
- JEE_ADVANCED
- MHT_CET
- BITSAT
- VITEEE
- COMEDK
- KCET
- WBJEE
- GUJCET

## Supported Subjects

- Physics
- Chemistry
- Mathematics

## Supported Difficulties

- EASY
- MEDIUM
- HARD

## Tips for Successful Import

1. **Use UTF-8 encoding** for CSV files
2. **Quote fields with commas** in the text
3. **Use consistent formatting** for subjects, chapters, and topics
4. **Test with small batches** first (5-10 questions)
5. **Review error messages** for skipped questions
6. **Back up your database** before large imports

## Troubleshooting

### Import fails with "Invalid CSV format"
- Ensure the file is properly formatted CSV
- Check that headers match required field names
- Verify UTF-8 encoding

### Questions skipped due to validation errors
- Check the error messages in the response
- Verify correctOption is 0-3 (not A-D)
- Ensure all required fields are present
- Check difficulty and examType values

### Images not displaying
- Verify images are in `public/questions/` directory
- Check imagePath matches actual filename
- Ensure paths start with `/questions/`

## Large Imports

For importing thousands of questions:

1. Split into smaller batches (500-1000 questions per file)
2. Import one batch at a time
3. Monitor for errors between batches
4. Verify database after each batch

## Example CSV Template

Download this template and fill in your questions:

```csv
questionText,optionA,optionB,optionC,optionD,correctOption,subject,chapter,topic,difficulty,examType,explanation,imagePath,marks,negativeMarks
"Your question here","Option A","Option B","Option C","Option D",0,Physics,Chapter Name,Topic Name,MEDIUM,JEE_MAIN,"Explanation here","",1,0
```
