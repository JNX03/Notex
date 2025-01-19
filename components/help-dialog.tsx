"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface HelpDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function HelpDialog({ open, onOpenChange }: HelpDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Help & FAQ</DialogTitle>
        </DialogHeader>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="item-1">
            <AccordionTrigger>How do I use the study notes?</AccordionTrigger>
            <AccordionContent>
              Click on any note card to open the PDF viewer. You can bookmark notes by clicking the star icon, and track your progress in the Study Plans section.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>How do study streaks work?</AccordionTrigger>
            <AccordionContent>
              Your study streak increases each day you view at least one note. Keep your streak going by studying daily!
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>How can I track my progress?</AccordionTrigger>
            <AccordionContent>
              Use the Study Plans section to create and track your study goals. Mark tasks as complete and monitor your progress over time.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  )
} 