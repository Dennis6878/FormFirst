"use client";

const MOCK_PATIENTS = [
  { name: "Sarah Johnson", exercises: 4, compliance: 85, lastActive: "2 hours ago" },
  { name: "Mike Chen", exercises: 3, compliance: 72, lastActive: "1 day ago" },
  { name: "Emma Wilson", exercises: 5, compliance: 91, lastActive: "3 hours ago" },
  { name: "James Brown", exercises: 2, compliance: 65, lastActive: "3 days ago" },
];

const MOCK_CODES = [
  { code: "SQUAT-RX-2024", exercise: "Squat", patient: "Sarah Johnson", status: "Active" },
  { code: "LUNGE-RX-2024", exercise: "Lunge", patient: "Mike Chen", status: "Active" },
  { code: "PLANK-RX-2024", exercise: "Plank", patient: "Emma Wilson", status: "Expired" },
];

export default function DashboardPage() {
  return (
    <div className="flex flex-col h-full px-5 pt-14 pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Physio Dashboard</h1>
          <p className="text-xs text-muted mt-0.5">Manage patients and exercise prescriptions</p>
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-accent/20 text-accent">Beta</span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-5">
        <div className="bg-card border border-card-border rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-foreground">4</div>
          <div className="text-[9px] text-muted uppercase tracking-wider">Patients</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-success">78%</div>
          <div className="text-[9px] text-muted uppercase tracking-wider">Compliance</div>
        </div>
        <div className="bg-card border border-card-border rounded-xl p-3 text-center">
          <div className="text-lg font-bold text-primary">14</div>
          <div className="text-[9px] text-muted uppercase tracking-wider">Exercises</div>
        </div>
      </div>

      <div className="mb-5">
        <h2 className="text-sm font-semibold text-foreground mb-3">Patients</h2>
        <div className="space-y-2">
          {MOCK_PATIENTS.map((patient) => (
            <div key={patient.name} className="bg-card border border-card-border rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{patient.name[0]}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{patient.name}</div>
                  <div className="text-[10px] text-muted">{patient.exercises} exercises · {patient.lastActive}</div>
                </div>
              </div>
              <div className={`text-xs font-semibold ${patient.compliance >= 80 ? "text-success" : patient.compliance >= 70 ? "text-warning" : "text-danger"}`}>
                {patient.compliance}%
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-foreground mb-3">Unlock Codes</h2>
        <div className="space-y-2">
          {MOCK_CODES.map((code) => (
            <div key={code.code} className="bg-card border border-card-border rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-mono text-primary">{code.code}</span>
                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                  code.status === "Active" ? "bg-success/10 text-success" : "bg-muted/20 text-muted"
                }`}>
                  {code.status}
                </span>
              </div>
              <div className="text-[10px] text-muted">{code.exercise} · {code.patient}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
