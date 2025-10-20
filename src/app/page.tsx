import Header from "@/components/layout/header";
import VisionAlertDashboard from "@/components/vision-alert/vision-alert-dashboard";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <VisionAlertDashboard />
      </main>
    </div>
  );
}
