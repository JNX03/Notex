"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Check, X } from "lucide-react"

interface Question {
  question: string
  options: string[]
  answer: string
  type: 'multiple-choice' | 'true-false'
}

interface QuestionsDialogProps {
  isOpen: boolean
  onClose: () => void
  questions: Question[]
  noteTitle: string
}

export function QuestionsDialog({ isOpen, onClose, questions, noteTitle }: QuestionsDialogProps) {
  const [currentQuestion, setCurrentQuestion] = React.useState(0)
  const [selectedAnswer, setSelectedAnswer] = React.useState<string>("")
  const [showResult, setShowResult] = React.useState(false)
  const [isCorrect, setIsCorrect] = React.useState(false)

  const handleAnswerSubmit = () => {
    const correct = selectedAnswer === questions[currentQuestion].answer
    setIsCorrect(correct)
    setShowResult(true)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
      setSelectedAnswer("")
      setShowResult(false)
    } else {
      onClose()
      setCurrentQuestion(0)
      setSelectedAnswer("")
      setShowResult(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{noteTitle} - Question {currentQuestion + 1}/{questions?.length}</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="mb-4">{questions?.[currentQuestion]?.question}</p>
          
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            className="gap-3"
          >
            {questions?.[currentQuestion]?.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`}>{option}</Label>
              </div>
            ))}
          </RadioGroup>

          {showResult && (
            <Alert className={`mt-4 ${isCorrect ? "border-green-500" : "border-red-500"}`}>
              <AlertDescription className="flex items-center gap-2">
                {isCorrect ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Correct!</span>
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 text-red-500" />
                    <span>Incorrect. The correct answer is: {questions[currentQuestion].answer}</span>
                  </>
                )}
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end gap-2">
          {!showResult ? (
            <Button onClick={handleAnswerSubmit} disabled={!selectedAnswer}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNext}>
              {currentQuestion < questions.length - 1 ? "Next Question" : "Finish"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 