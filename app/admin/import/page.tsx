"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, CheckCircle2, AlertCircle } from "lucide-react"

export default function AdminImportPage() {
  const [fileType, setFileType] = useState("csv")
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return

    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", fileType)

    try {
      const res = await fetch("/api/admin/questions/bulk-upload", {
        method: "POST",
        body: formData,
      })
      const result = await res.json()
      if (result.success) {
        setResult({ success: true, message: `Uploaded ${result.data.uploaded} questions successfully.${result.data.skipped > 0 ? ` ${result.data.skipped} skipped.` : ""}` })
        if (fileRef.current) fileRef.current.value = ""
      } else {
        setResult({ success: false, message: result.error?.message || "Upload failed" })
      }
    } catch {
      setResult({ success: false, message: "Upload failed - check server connection" })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-2">Import Questions</h2>
        <p className="text-muted-foreground">Bulk import questions from CSV or JSON files</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>
            CSV format: subject, chapter, topic, difficulty, question, optionA, optionB, optionC, optionD, correctAnswer, explanation, imagePath
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>File Type</Label>
            <Select value={fileType} onValueChange={(v) => setFileType(v || "csv")}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="file">Choose File</Label>
            <input
              ref={fileRef}
              id="file"
              type="file"
              accept={fileType === "csv" ? ".csv" : ".json"}
              className="mt-1 block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
            />
          </div>

          <Button onClick={handleUpload} disabled={uploading} className="w-full">
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? "Uploading..." : "Upload"}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              {result.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
              <AlertDescription>{result.message}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
