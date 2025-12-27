import { Metadata } from "next";
import { DocsContent } from "@/components/docs/docs-content";

export const metadata: Metadata = {
  title: "Documentation - Network Device Manager",
  description:
    "Complete guide to using the Network Device Manager with AI-powered diagnostics and MongoDB monitoring",
};

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-background">
      <DocsContent />
    </div>
  );
}
