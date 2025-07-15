import { Card, CardContent } from "@/components/Card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{minHeight: "100vh", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-secondary)"}}>
      <Card style={{width: "100%", maxWidth: "28rem", margin: "0 1rem"}}>
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 style={{fontSize: "1.5rem", fontWeight: "bold", color: "var(--text-primary)"}}>404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
