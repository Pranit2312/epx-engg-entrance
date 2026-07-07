# Question Import Guide

## CSV Format

The bulk upload endpoint (`POST /api/admin/questions/bulk-upload`) accepts CSV files with the following columns:

```csv
subject,chapter,topic,difficulty,question,optionA,optionB,optionC,optionD,correctAnswer,explanation,imagePath
```

### Column Reference

| Column | Required | Description | Example |
|--------|----------|-------------|---------|
| `subject` | Yes | Subject name | `Physics` |
| `chapter` | No | Chapter name | `Mechanics` |
| `topic` | No | Topic name | `Kinematics` |
| `difficulty` | Yes | Difficulty level | `EASY`, `MEDIUM`, or `HARD` |
| `question` | Yes | Question text (supports LaTeX and Unicode) | `A particle moves with uniform acceleration of 4 m/s²...` |
| `optionA` | Yes | First option | `18 m/s` |
| `optionB` | Yes | Second option | `22 m/s` |
| `optionC` | Yes | Third option | `20 m/s` |
| `optionD` | Yes | Fourth option | `24 m/s` |
| `correctAnswer` | Yes | Correct option text (must match exactly one of optionA-D) | `22 m/s` |
| `explanation` | No | Step-by-step solution or explanation | `Using v = u + at = 10 + 4×3 = 22 m/s` |
| `imagePath` | No | Path to question image | `/questions/physics-circuit-01.png` |

### Supported Values

**subject**: `Physics`, `Chemistry`, `Mathematics`

**difficulty**: `EASY`, `MEDIUM`, `HARD`

**exam** (mapped to `examType`): `JEE_MAIN`, `JEE_ADVANCED`, `MHT_CET`, `BITSAT`, `VITEEE`, `COMEDK`, `KCET`, `WBJEE`, `GUJCET`, `OTHER`

---

## Example CSV

```csv
subject,chapter,topic,difficulty,question,optionA,optionB,optionC,optionD,correctAnswer,explanation,imagePath
Physics,Mechanics,Kinematics,MEDIUM,"A car accelerates from rest at 2 m/s² for 5 seconds. Calculate the distance covered.",10 m,25 m,50 m,20 m,25 m,"s = ut + ½at² = 0 + ½ × 2 × 25 = 25 m",
Chemistry,Physical Chemistry,Mole Concept,EASY,"How many moles are present in 36 g of water? (H=1, O=16)",1 mol,2 mol,3 mol,0.5 mol,2 mol,"Molar mass H₂O = 18 g/mol. Moles = 36/18 = 2 mol",
Mathematics,Calculus,Differentiation,MEDIUM,"If f(x) = x³, find f'(x)",3x²,x²,3x,x⁴/4,3x²,"d/dx(xⁿ) = nxⁿ⁻¹, so d/dx(x³) = 3x²",
```

---

## JSON Format

Also supports JSON array format:

```json
[
  {
    "subject": "Physics",
    "chapter": "Mechanics",
    "topic": "Kinematics",
    "difficulty": "MEDIUM",
    "question": "A car accelerates from rest at 2 m/s² for 5 seconds. Calculate the distance covered.",
    "optionA": "10 m",
    "optionB": "25 m",
    "optionC": "50 m",
    "optionD": "20 m",
    "correctAnswer": "25 m",
    "explanation": "s = ut + ½at² = 0 + ½ × 2 × 25 = 25 m",
    "imagePath": ""
  }
]
```

---

## Import via Admin Panel

1. Navigate to **Admin → Question Bank**
2. Click the **Upload** button
3. Select your CSV or JSON file
4. Click **Import**
5. Review results (success count / error messages)

## Import via API

```bash
curl -X POST http://localhost:3000/api/admin/questions/bulk-upload \
  -H "Authorization: Bearer <session-token>" \
  -F "file=@questions.csv" \
  -F "type=csv"
```

## Import via `/admin/import`

Navigate to `/admin/import` for a dedicated bulk upload interface with file type selection and result feedback.

---

## Validation Rules

- All required fields must be non-empty
- `difficulty` must be `EASY`, `MEDIUM`, or `HARD` (case-insensitive)
- `correctAnswer` must match exactly one of `optionA`, `optionB`, `optionC`, or `optionD`
- `subject` should be a recognized subject name
- Duplicate `question` text is not automatically detected (all questions are imported)

---

## Image Support

Place question images in `public/questions/` directory. Reference them in the `imagePath` column as `/questions/filename.png`.

Supported formats: PNG, JPG, GIF, SVG.

Images are rendered in the test interface as inline elements between the question text and options.
