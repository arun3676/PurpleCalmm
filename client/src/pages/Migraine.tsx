import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { format } from "date-fns";

const commonTriggers = ["Stress", "Lack of sleep", "Bright lights", "Loud noises", "Weather changes", "Certain foods", "Dehydration", "Screen time"];
const commonSymptoms = ["Throbbing pain", "Nausea", "Light sensitivity", "Sound sensitivity", "Visual disturbances", "Dizziness", "Fatigue"];

export default function Migraine() {
  const [severity, setSeverity] = useState([5]);
  const [duration, setDuration] = useState("");
  const [medication, setMedication] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [startTime, setStartTime] = useState(new Date().toISOString().slice(0, 16));

  const { data: logs, refetch } = trpc.migraine.list.useQuery();
  const createLog = trpc.migraine.create.useMutation();
  const deleteLog = trpc.migraine.delete.useMutation();

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger) ? prev.filter((t) => t !== trigger) : [...prev, trigger]
    );
  };

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom) ? prev.filter((s) => s !== symptom) : [...prev, symptom]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createLog.mutateAsync({
        severity: severity[0],
        duration: duration ? parseInt(duration) : undefined,
        triggers: selectedTriggers.length > 0 ? selectedTriggers : undefined,
        symptoms: selectedSymptoms.length > 0 ? selectedSymptoms : undefined,
        medication: medication || undefined,
        notes: notes || undefined,
        startTime: new Date(startTime),
      });

      toast.success("Migraine log saved");
      
      // Reset form
      setSeverity([5]);
      setDuration("");
      setMedication("");
      setNotes("");
      setSelectedTriggers([]);
      setSelectedSymptoms([]);
      setStartTime(new Date().toISOString().slice(0, 16));
      
      refetch();
    } catch (error) {
      toast.error("Failed to save log");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteLog.mutateAsync({ id });
      toast.success("Log deleted");
      refetch();
    } catch (error) {
      toast.error("Failed to delete log");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50 dark:from-rose-950 dark:via-pink-950 dark:to-purple-950">
      <header className="border-b bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Migraine Tracker</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Log a Migraine</CardTitle>
            <CardDescription>Track your migraines to identify patterns and triggers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="startTime">When did it start?</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div>
                <Label>Severity (1-10)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <Slider value={severity} onValueChange={setSeverity} min={1} max={10} step={1} className="flex-1" />
                  <span className="text-2xl font-bold w-12 text-center">{severity[0]}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  1 = Mild discomfort, 10 = Worst pain imaginable
                </p>
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="e.g., 120"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                />
              </div>

              <div>
                <Label>Triggers</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonTriggers.map((trigger) => (
                    <Badge
                      key={trigger}
                      variant={selectedTriggers.includes(trigger) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleTrigger(trigger)}
                    >
                      {trigger}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Symptoms</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {commonSymptoms.map((symptom) => (
                    <Badge
                      key={symptom}
                      variant={selectedSymptoms.includes(symptom) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSymptom(symptom)}
                    >
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="medication">Medication Taken</Label>
                <Input
                  id="medication"
                  placeholder="e.g., Ibuprofen 400mg"
                  value={medication}
                  onChange={(e) => setMedication(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any other details you want to remember..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={createLog.isPending}>
                <Plus className="mr-2 h-4 w-4" />
                Save Migraine Log
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Logs</CardTitle>
            <CardDescription>Your migraine history</CardDescription>
          </CardHeader>
          <CardContent>
            {!logs || logs.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No logs yet. Start tracking your migraines above.</p>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div key={log.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">
                          {format(new Date(log.startTime), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Severity: <span className="font-bold text-foreground">{log.severity}/10</span>
                          {log.duration && ` • Duration: ${log.duration} min`}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(log.id)}
                        disabled={deleteLog.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {log.triggers && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Triggers:</p>
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(log.triggers).map((trigger: string) => (
                            <Badge key={trigger} variant="secondary" className="text-xs">
                              {trigger}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {log.symptoms && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Symptoms:</p>
                        <div className="flex flex-wrap gap-1">
                          {JSON.parse(log.symptoms).map((symptom: string) => (
                            <Badge key={symptom} variant="secondary" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {log.medication && (
                      <p className="text-sm">
                        <span className="text-muted-foreground">Medication:</span> {log.medication}
                      </p>
                    )}
                    
                    {log.notes && (
                      <p className="text-sm text-muted-foreground italic">{log.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
