"use client"

import { Component, type ReactNode } from "react"
import { Button } from "./button"

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean; error?: Error }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-red-400 font-medium mb-2">Something went wrong</p>
          <p className="text-sm text-muted-foreground mb-4">{this.state.error?.message ?? "An unexpected error occurred"}</p>
          <Button onClick={() => this.setState({ hasError: false, error: undefined })}>Try again</Button>
        </div>
      )
    }
    return this.props.children
  }
}
