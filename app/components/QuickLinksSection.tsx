import Link from "next/link";
import { Card } from "./Card";

interface QuickLink {
  label: string;
  href: string;
  description: string;
  icon: string;
}

interface QuickLinksSectionProps {
  title?: string;
  links: QuickLink[];
}

export function QuickLinksSection({
  title = "Quick Actions",
  links,
}: QuickLinksSectionProps) {
  return (
    <Card title={title}>
      <div className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{link.icon}</span>
              <div>
                <p className="font-semibold text-gray-900">{link.label}</p>
                <p className="text-sm text-gray-600">{link.description}</p>
              </div>
            </div>
            <span className="text-gray-400">→</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
