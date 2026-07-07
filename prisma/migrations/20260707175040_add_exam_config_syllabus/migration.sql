-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "imagePath" TEXT,
ADD COLUMN     "marks" INTEGER NOT NULL DEFAULT 4,
ADD COLUMN     "negativeMarks" DOUBLE PRECISION NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "ExamConfig" (
    "id" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "totalQuestions" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "marksPerQuestion" INTEGER NOT NULL DEFAULT 4,
    "negativeMarking" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "subjects" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "questionsPerSubject" INTEGER[] DEFAULT ARRAY[]::INTEGER[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExamConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SyllabusChapter" (
    "id" TEXT NOT NULL,
    "examType" "ExamType" NOT NULL,
    "subject" TEXT NOT NULL,
    "chapter" TEXT NOT NULL,
    "topics" TEXT[],

    CONSTRAINT "SyllabusChapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ExamConfig_examType_key" ON "ExamConfig"("examType");

-- CreateIndex
CREATE INDEX "SyllabusChapter_examType_subject_idx" ON "SyllabusChapter"("examType", "subject");

-- CreateIndex
CREATE UNIQUE INDEX "SyllabusChapter_examType_subject_chapter_key" ON "SyllabusChapter"("examType", "subject", "chapter");

-- CreateIndex
CREATE INDEX "Question_examType_subject_difficulty_idx" ON "Question"("examType", "subject", "difficulty");
