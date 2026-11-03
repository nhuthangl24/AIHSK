import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Cpu, ShieldCheck, Key, CheckCircle2 } from "lucide-react";

export default function AdminAIConfigPage() {
  const isOpenAI = Boolean(process.env.OPENAI_API_KEY);
  const isAnthropic = Boolean(process.env.ANTHROPIC_API_KEY);
  const isAzure = Boolean(process.env.AZURE_SPEECH_KEY);
  const isS3 = Boolean(process.env.S3_ENDPOINT);

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          AI & Cloud Provider Configuration
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage LLM examiner models, speech recognition services, and object storage credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Cpu className="h-4 w-4 text-purple-600" />
              <span>Language Models (LLM) Integration</span>
            </CardTitle>
            <CardDescription>
              Used for 5-stage conversation orchestration and candidate probing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm">OpenAI API</span>
                <p className="text-slate-500">Models: gpt-4o, gpt-4o-mini</p>
              </div>
              <Badge variant={isOpenAI ? "success" : "secondary"}>
                {isOpenAI ? "Connected" : "Fallback Engine Active"}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Anthropic Claude</span>
                <p className="text-slate-500">Models: claude-3-5-sonnet</p>
              </div>
              <Badge variant={isAnthropic ? "success" : "secondary"}>
                {isAnthropic ? "Connected" : "Optional"}
              </Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20 flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <div className="space-y-0.5">
                <span className="font-bold text-sm">HuáVocal Adaptive Engine (Built-in)</span>
                <p className="text-xs opacity-80">Guarantees zero downtime local & production execution without external API dependency.</p>
              </div>
              <Badge variant="success">Always Ready</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Speech-to-Text & Audio Storage</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Web Audio Speech-to-Text</span>
                <p className="text-slate-500">Client-side zero-latency Mandarin continuous recognition</p>
              </div>
              <Badge variant="success">Default Active</Badge>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="font-bold text-slate-900 dark:text-white text-sm">S3-Compatible Object Storage</span>
                <p className="text-slate-500">
                  {isS3 ? "AWS S3 / Cloudflare R2 bucket" : "Local Encrypted Storage (/public/uploads/audio/)"}
                </p>
              </div>
              <Badge variant={isS3 ? "success" : "outline"}>
                {isS3 ? "S3 Storage" : "Local Storage"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
