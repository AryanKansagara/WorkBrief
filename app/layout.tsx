import "./style.css";
export const metadata = {
  title: "WorkBrief | AI workflow sandbox",
  description: "Human-reviewed enterprise briefing prototype",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
