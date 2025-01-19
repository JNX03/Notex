"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Plus, Clock, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { StudyPlan as StudyPlanType, Task, getStudyPlans, saveStudyPlan, updateTask } from "@/lib/study-plan"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"

export function StudyPlan() {
  const [plans, setPlans] = useState<StudyPlanType[]>([]);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<StudyPlanType>>({});

  useEffect(() => {
    setPlans(getStudyPlans());
  }, []);

  const handleAddPlan = () => {
    if (newPlan.subject && newPlan.startDate && newPlan.endDate) {
      const plan: StudyPlanType = {
        id: Date.now().toString(),
        subject: newPlan.subject,
        startDate: newPlan.startDate,
        endDate: newPlan.endDate,
        targetHours: newPlan.targetHours || 0,
        completedHours: 0,
        tasks: []
      };
      
      saveStudyPlan(plan);
      setPlans(getStudyPlans());
      setShowNewPlan(false);
      setNewPlan({});
    }
  };

  const toggleTask = (planId: string, taskId: string, completed: boolean) => {
    updateTask(planId, taskId, { completed });
    setPlans(getStudyPlans());
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Study Plans</h2>
        <Button onClick={() => setShowNewPlan(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader>
              <CardTitle>{plan.subject}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{Math.round((plan.completedHours / plan.targetHours) * 100)}%</span>
                  </div>
                  <Progress value={(plan.completedHours / plan.targetHours) * 100} />
                </div>

                {/* Tasks */}
                <div className="space-y-2">
                  {plan.tasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-2">
                      <CheckCircle 
                        className={cn(
                          "h-4 w-4 cursor-pointer",
                          task.completed ? "text-green-500 fill-green-500" : "text-muted-foreground"
                        )}
                        onClick={() => toggleTask(plan.id, task.id, !task.completed)}
                      />
                      <span className="text-sm">{task.title}</span>
                    </div>
                  ))}
                </div>

                {/* Due Date */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Due: {new Date(plan.endDate).toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* New Plan Dialog */}
      <Dialog open={showNewPlan} onOpenChange={setShowNewPlan}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Study Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                value={newPlan.subject || ''}
                onChange={(e) => setNewPlan({ ...newPlan, subject: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Target Study Hours</Label>
              <Input
                type="number"
                value={newPlan.targetHours || ''}
                onChange={(e) => setNewPlan({ ...newPlan, targetHours: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Calendar
                mode="range"
                selected={{
                  from: newPlan.startDate ? new Date(newPlan.startDate) : undefined,
                  to: newPlan.endDate ? new Date(newPlan.endDate) : undefined
                }}
                onSelect={(range) => {
                  if (range?.from) setNewPlan({ ...newPlan, startDate: range.from.toISOString() });
                  if (range?.to) setNewPlan({ ...newPlan, endDate: range.to.toISOString() });
                }}
              />
            </div>
            <Button onClick={handleAddPlan}>Create Plan</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 